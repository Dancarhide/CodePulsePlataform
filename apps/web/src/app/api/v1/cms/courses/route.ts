import { NextResponse } from 'next/server';
import { neonQuery } from '../../auth/_db';

let schemaInitialized = false;

async function ensureCmsSchema() {
  if (schemaInitialized) return;
  try {
    await neonQuery(`ALTER TABLE cursos ADD COLUMN IF NOT EXISTS categoria VARCHAR(100) DEFAULT 'Desarrollo de Software';`);
    await neonQuery(`ALTER TABLE cursos ALTER COLUMN imagen_portada_url TYPE TEXT;`);
    await neonQuery(`ALTER TABLE lecciones ADD COLUMN IF NOT EXISTS contenido_bloques JSONB DEFAULT '[]'::jsonb;`);
    await neonQuery(`ALTER TABLE lecciones ADD COLUMN IF NOT EXISTS configuracion_pagina JSONB DEFAULT '{}'::jsonb;`);
    await neonQuery(`ALTER TABLE lecciones ADD COLUMN IF NOT EXISTS formato_unidad VARCHAR(30) DEFAULT 'leccion';`);
    await neonQuery(`ALTER TABLE lecciones ADD COLUMN IF NOT EXISTS peso_puntos INT DEFAULT 10;`);
    await neonQuery(`ALTER TABLE lecciones ADD COLUMN IF NOT EXISTS clave_estable VARCHAR(120);`);
    await neonQuery(`ALTER TABLE lecciones ADD COLUMN IF NOT EXISTS configuracion_actividad JSONB DEFAULT '{}'::jsonb;`);
    schemaInitialized = true;
  } catch (err) {
    console.warn('Schema check warning:', err);
  }
}

async function getOrCreateAdminAuthorId(): Promise<string> {
  const { rows } = await neonQuery(
    `SELECT id FROM usuarios WHERE correo = 'admin@codepulse.com' OR rol = 'admin' LIMIT 1;`
  );
  if (rows.length > 0) return String(rows[0].id);

  const { rows: anyUser } = await neonQuery(`SELECT id FROM usuarios LIMIT 1;`);
  if (anyUser.length > 0) return String(anyUser[0].id);

  await neonQuery('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  const { rows: created } = await neonQuery(
    `INSERT INTO usuarios (nombres, apellido1, nombre_usuario, correo, password_hash, rol)
     VALUES ('Admin', 'CodePulse', 'admin', 'admin@codepulse.com', crypt('admin123', gen_salt('bf')), 'admin')
     RETURNING id;`
  );
  return String(created[0].id);
}

export async function GET(request: Request) {
  try {
    await ensureCmsSchema();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const publishedOnly = searchParams.get('publishedOnly') === 'true';

    // Obtener un curso completo con módulos y lecciones (por id o slug)
    if (id || slug) {
      const { rows: courseRows } = id
        ? await neonQuery(`SELECT * FROM cursos WHERE id = $1 AND eliminado_en IS NULL LIMIT 1;`, [id])
        : await neonQuery(`SELECT * FROM cursos WHERE slug = $1 AND eliminado_en IS NULL LIMIT 1;`, [slug]);

      if (courseRows.length === 0) {
        return NextResponse.json({ detail: 'Curso no encontrado.' }, { status: 404 });
      }

      const course = courseRows[0];

      const { rows: modules } = await neonQuery(
        `SELECT * FROM modulos WHERE id_curso = $1 ORDER BY orden ASC;`,
        [course.id]
      );

      const { rows: lessons } = await neonQuery(
        `SELECT l.* FROM lecciones l
         INNER JOIN modulos m ON m.id = l.id_modulo
         WHERE m.id_curso = $1
         ORDER BY l.orden ASC;`,
        [course.id]
      );

      const structuredModules = modules.map((mod) => ({
        id: mod.id,
        titulo: mod.titulo,
        orden: mod.orden,
        lecciones: lessons
          .filter((l) => l.id_modulo === mod.id)
          .map((l) => ({
            id: l.id,
            clave_estable: l.clave_estable || l.id,
            titulo: l.titulo,
            orden: l.orden,
            tipo: l.tipo,
            formato_unidad: l.formato_unidad || (l.tipo === 'examen' ? 'examen' : 'leccion'),
            peso_puntos: Number(l.peso_puntos) || (l.formato_unidad === 'examen' ? 50 : l.formato_unidad === 'laboratorio' ? 30 : 10),
            duracion_estimada_minutos: l.duracion_estimada_minutos || 10,
            contenido_bloques: Array.isArray(l.contenido_bloques)
              ? l.contenido_bloques
              : typeof l.contenido_bloques === 'string'
              ? JSON.parse(l.contenido_bloques)
              : [],
            configuracion_pagina:
              l.configuracion_pagina && typeof l.configuracion_pagina === 'object'
                ? l.configuracion_pagina
                : typeof l.configuracion_pagina === 'string'
                ? JSON.parse(l.configuracion_pagina)
                : {},
            configuracion_actividad:
              l.configuracion_actividad && typeof l.configuracion_actividad === 'object'
                ? l.configuracion_actividad
                : typeof l.configuracion_actividad === 'string'
                ? JSON.parse(l.configuracion_actividad)
                : {},
          })),
      }));

      return NextResponse.json({
        course: {
          ...course,
          modulos: structuredModules,
        },
      });
    }

    // Listar todos los cursos (con conteo de módulos y lecciones)
    const whereClause = publishedOnly
      ? `WHERE c.eliminado_en IS NULL AND c.publicado = true`
      : `WHERE c.eliminado_en IS NULL`;

    const { rows: courses } = await neonQuery(
      `SELECT c.*,
              (SELECT COUNT(*)::int FROM modulos m WHERE m.id_curso = c.id) AS total_modulos,
              (SELECT COUNT(*)::int FROM lecciones l INNER JOIN modulos m ON m.id = l.id_modulo WHERE m.id_curso = c.id) AS total_lecciones
         FROM cursos c
         ${whereClause}
        ORDER BY c.creado_en DESC;`
    );

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error('CMS GET error:', error);
    return NextResponse.json(
      { detail: error.message || 'Error al obtener cursos.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureCmsSchema();
    const body = await request.json();
    const {
      id,
      titulo,
      slug,
      descripcion,
      categoria = 'Desarrollo de Software',
      nivel = 'principiante',
      imagen_portada_url = null,
      publicado = false,
      modulos = [],
    } = body;

    if (!titulo || !slug) {
      return NextResponse.json(
        { detail: 'El título y el slug del curso son obligatorios.' },
        { status: 400 }
      );
    }

    const validNivel = ['principiante', 'intermedio', 'avanzado'].includes(nivel)
      ? nivel
      : 'principiante';

    let courseId = id as string | undefined;

    if (courseId) {
      // Actualizar curso existente
      await neonQuery(
        `UPDATE cursos
            SET titulo = $1,
                slug = $2,
                descripcion = $3,
                categoria = $4,
                nivel = $5::"EnumNivel",
                imagen_portada_url = $6,
                publicado = $7
          WHERE id = $8;`,
        [
          titulo,
          slug,
          descripcion || '',
          categoria,
          validNivel,
          imagen_portada_url,
          Boolean(publicado),
          courseId,
        ]
      );

      // Reemplazar estructura de módulos y lecciones para mantener sincronía exacta con el lienzo
      await neonQuery(
        `DELETE FROM progreso_lecciones WHERE id_leccion IN (
           SELECT l.id FROM lecciones l INNER JOIN modulos m ON m.id = l.id_modulo WHERE m.id_curso = $1
         );`,
        [courseId]
      );
      await neonQuery(
        `DELETE FROM lecciones WHERE id_modulo IN (SELECT id FROM modulos WHERE id_curso = $1);`,
        [courseId]
      );
      await neonQuery(`DELETE FROM modulos WHERE id_curso = $1;`, [courseId]);
    } else {
      // Verificar que el slug sea único
      const { rows: existingSlug } = await neonQuery(
        `SELECT id FROM cursos WHERE slug = $1 LIMIT 1;`,
        [slug]
      );
      const finalSlug =
        existingSlug.length > 0 ? `${slug}-${Math.floor(100 + Math.random() * 900)}` : slug;

      const authorId = await getOrCreateAdminAuthorId();
      const { rows: inserted } = await neonQuery(
        `INSERT INTO cursos (titulo, slug, descripcion, categoria, nivel, imagen_portada_url, publicado, id_instructor_autor)
         VALUES ($1, $2, $3, $4, $5::"EnumNivel", $6, $7, $8::uuid)
         RETURNING id;`,
        [
          titulo,
          finalSlug,
          descripcion || '',
          categoria,
          validNivel,
          imagen_portada_url,
          Boolean(publicado),
          authorId,
        ]
      );
      courseId = String(inserted[0].id);
    }

    // Insertar módulos y sus lecciones con bloques JSONB
    for (let mIdx = 0; mIdx < modulos.length; mIdx++) {
      const mod = modulos[mIdx];
      const { rows: modInserted } = await neonQuery(
        `INSERT INTO modulos (id_curso, orden, titulo)
         VALUES ($1::uuid, $2, $3)
         RETURNING id;`,
        [courseId, mIdx + 1, mod.titulo || `Módulo ${mIdx + 1}`]
      );
      const modId = String(modInserted[0].id);

      const lecciones = Array.isArray(mod.lecciones) ? mod.lecciones : [];
      for (let lIdx = 0; lIdx < lecciones.length; lIdx++) {
        const lec = lecciones[lIdx];
        const formatoUnidad = ['leccion', 'examen', 'laboratorio'].includes(lec.formato_unidad)
          ? lec.formato_unidad
          : 'leccion';
        const validTipo =
          formatoUnidad === 'examen'
            ? 'examen'
            : ['video', 'lectura', 'quiz', 'examen'].includes(lec.tipo)
            ? lec.tipo
            : 'lectura';
        const defaultPeso =
          formatoUnidad === 'examen' ? 50 : formatoUnidad === 'laboratorio' ? 30 : 10;
        const pesoPuntos = Math.max(1, Number(lec.peso_puntos) || defaultPeso);
        const claveEstable = String(lec.clave_estable || lec.id || `unit_${mIdx + 1}_${lIdx + 1}`).slice(0, 115);
        const bloquesJson = JSON.stringify(lec.contenido_bloques || []);
        const pageConfigJson = JSON.stringify(lec.configuracion_pagina || {});
        const activityConfigJson = JSON.stringify(lec.configuracion_actividad || {});

        await neonQuery(
          `INSERT INTO lecciones (id_modulo, orden, titulo, tipo, duracion_estimada_minutos, contenido_bloques, configuracion_pagina, formato_unidad, peso_puntos, clave_estable, configuracion_actividad)
           VALUES ($1::uuid, $2, $3, $4::"EnumLeccion", $5, $6::jsonb, $7::jsonb, $8, $9, $10, $11::jsonb);`,
          [
            modId,
            lIdx + 1,
            lec.titulo || `Unidad ${lIdx + 1}`,
            validTipo,
            Number(lec.duracion_estimada_minutos) || 10,
            bloquesJson,
            pageConfigJson,
            formatoUnidad,
            pesoPuntos,
            claveEstable,
            activityConfigJson,
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      id: courseId,
      message: 'Curso guardado exitosamente.',
    });
  } catch (error: any) {
    console.error('CMS POST error:', error);
    return NextResponse.json(
      { detail: error.message || 'Error al guardar el curso.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureCmsSchema();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ detail: 'ID de curso requerido.' }, { status: 400 });
    }

    await neonQuery(`UPDATE cursos SET eliminado_en = NOW() WHERE id = $1::uuid;`, [id]);

    return NextResponse.json({ success: true, message: 'Curso eliminado.' });
  } catch (error: any) {
    console.error('CMS DELETE error:', error);
    return NextResponse.json(
      { detail: error.message || 'Error al eliminar el curso.' },
      { status: 500 }
    );
  }
}

