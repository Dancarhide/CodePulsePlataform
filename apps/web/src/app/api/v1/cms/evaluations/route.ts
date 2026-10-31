import { NextResponse } from 'next/server';
import { neonQuery } from '../../auth/_db';

let evalTableReady = false;

async function ensureEvalSchema() {
  if (evalTableReady) return;
  try {
    await neonQuery(`
      CREATE TABLE IF NOT EXISTS entregas_evaluaciones_cms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        curso_slug VARCHAR(150) NOT NULL,
        curso_titulo VARCHAR(200),
        unidad_clave VARCHAR(120) NOT NULL,
        unidad_titulo VARCHAR(200) NOT NULL,
        tipo_unidad VARCHAR(30) NOT NULL DEFAULT 'leccion',
        usuario_correo VARCHAR(255) NOT NULL,
        usuario_nombre VARCHAR(150),
        estado VARCHAR(35) NOT NULL DEFAULT 'completado',
        calificacion FLOAT DEFAULT 100,
        puntos_peso INT DEFAULT 10,
        puntos_obtenidos FLOAT DEFAULT 10,
        intentos INT DEFAULT 1,
        payload_entrega JSONB DEFAULT '{}'::jsonb,
        retroalimentacion TEXT,
        creado_en TIMESTAMPTZ DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(curso_slug, unidad_clave, usuario_correo)
      );
    `);
    evalTableReady = true;
  } catch (err) {
    console.warn('Eval schema init warning:', err);
  }
}

export async function GET(request: Request) {
  try {
    await ensureEvalSchema();
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const cursoSlug = searchParams.get('cursoSlug');
    const correo = searchParams.get('correo');

    if (isAdmin) {
      const { rows } = await neonQuery(
        `SELECT *
           FROM entregas_evaluaciones_cms
          WHERE tipo_unidad IN ('laboratorio', 'examen')
          ORDER BY
            CASE WHEN estado = 'pendiente_revision' THEN 0 ELSE 1 END ASC,
            actualizado_en DESC
          LIMIT 200;`
      );
      return NextResponse.json({ submissions: rows });
    }

    if (!cursoSlug || !correo) {
      return NextResponse.json({ records: [] });
    }

    const { rows } = await neonQuery(
      `SELECT *
         FROM entregas_evaluaciones_cms
        WHERE curso_slug = $1 AND LOWER(usuario_correo) = LOWER($2);`,
      [cursoSlug, correo]
    );

    return NextResponse.json({ records: rows });
  } catch (error: any) {
    console.error('Evaluations GET error:', error);
    return NextResponse.json(
      { detail: error.message || 'Error al consultar progreso.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureEvalSchema();
    const body = await request.json();
    const {
      curso_slug,
      curso_titulo = '',
      unidad_clave,
      unidad_titulo = 'Unidad',
      tipo_unidad = 'leccion',
      usuario_correo,
      usuario_nombre = '',
      estado = 'completado', // 'completado' | 'aprobado' | 'reprobado' | 'pendiente_revision' | 'no_completado'
      calificacion = 100,
      puntos_peso = 10,
      payload_entrega = {},
    } = body;

    if (!curso_slug || !unidad_clave || !usuario_correo) {
      return NextResponse.json(
        { detail: 'Faltan identificadores de curso, unidad o usuario.' },
        { status: 400 }
      );
    }

    // Si desmarca una lección normal
    if (estado === 'no_completado' && tipo_unidad === 'leccion') {
      await neonQuery(
        `DELETE FROM entregas_evaluaciones_cms
          WHERE curso_slug = $1 AND unidad_clave = $2 AND LOWER(usuario_correo) = LOWER($3);`,
        [curso_slug, unidad_clave, usuario_correo]
      );
      return NextResponse.json({ success: true, removed: true });
    }

    const pesoNum = Math.max(1, Number(puntos_peso) || 10);
    const califNum = Math.max(0, Math.min(100, Number(calificacion) || 0));
    const accredited = estado === 'completado' || estado === 'aprobado';
    const puntosObtenidos = accredited ? pesoNum : 0;

    const { rows: existing } = await neonQuery(
      `SELECT id, intentos, puntos_obtenidos, estado, calificacion
         FROM entregas_evaluaciones_cms
        WHERE curso_slug = $1 AND unidad_clave = $2 AND LOWER(usuario_correo) = LOWER($3)
        LIMIT 1;`,
      [curso_slug, unidad_clave, usuario_correo]
    );

    const prev = existing[0];
    const nextAttempts = prev ? Number(prev.intentos || 1) + 1 : 1;

    // Si ya había aprobado un examen con mayor calificación, conservamos su estado aprobado y mejor nota
    const keepBestExam =
      prev &&
      tipo_unidad === 'examen' &&
      prev.estado === 'aprobado' &&
      Number(prev.calificacion || 0) >= califNum;

    const finalEstado = keepBestExam ? 'aprobado' : estado;
    const finalCalif = keepBestExam ? Number(prev.calificacion) : califNum;
    const finalPuntos = keepBestExam ? pesoNum : puntosObtenidos;

    const { rows: saved } = await neonQuery(
      `INSERT INTO entregas_evaluaciones_cms (
         curso_slug, curso_titulo, unidad_clave, unidad_titulo, tipo_unidad,
         usuario_correo, usuario_nombre, estado, calificacion,
         puntos_peso, puntos_obtenidos, intentos, payload_entrega, actualizado_en
       )
       VALUES ($1, $2, $3, $4, $5, LOWER($6), $7, $8, $9, $10, $11, $12, $13::jsonb, NOW())
       ON CONFLICT (curso_slug, unidad_clave, usuario_correo)
       DO UPDATE SET
         curso_titulo = EXCLUDED.curso_titulo,
         unidad_titulo = EXCLUDED.unidad_titulo,
         tipo_unidad = EXCLUDED.tipo_unidad,
         usuario_nombre = EXCLUDED.usuario_nombre,
         estado = EXCLUDED.estado,
         calificacion = EXCLUDED.calificacion,
         puntos_peso = EXCLUDED.puntos_peso,
         puntos_obtenidos = EXCLUDED.puntos_obtenidos,
         intentos = $12,
         payload_entrega = EXCLUDED.payload_entrega,
         actualizado_en = NOW()
       RETURNING *;`,
      [
        curso_slug,
        curso_titulo,
        unidad_clave,
        unidad_titulo,
        tipo_unidad,
        usuario_correo,
        usuario_nombre,
        finalEstado,
        finalCalif,
        pesoNum,
        finalPuntos,
        nextAttempts,
        JSON.stringify(payload_entrega || {}),
      ]
    );

    // Bonificación de XP cuando acredita por primera vez
    if (accredited && (!prev || Number(prev.puntos_obtenidos || 0) === 0)) {
      await neonQuery(
        `UPDATE usuarios SET xp = COALESCE(xp, 0) + $1 WHERE LOWER(correo) = LOWER($2);`,
        [pesoNum, usuario_correo]
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      record: saved[0],
    });
  } catch (error: any) {
    console.error('Evaluations POST error:', error);
    return NextResponse.json(
      { detail: error.message || 'Error al guardar entrega/progreso.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureEvalSchema();
    const body = await request.json();
    const { id, estado, calificacion, retroalimentacion } = body;

    if (!id || !['aprobado', 'rechazado', 'pendiente_revision'].includes(estado)) {
      return NextResponse.json(
        { detail: 'ID y estado válido requeridos.' },
        { status: 400 }
      );
    }

    const { rows: found } = await neonQuery(
      `SELECT * FROM entregas_evaluaciones_cms WHERE id = $1::uuid LIMIT 1;`,
      [id]
    );
    if (found.length === 0) {
      return NextResponse.json({ detail: 'Entrega no encontrada.' }, { status: 404 });
    }

    const current = found[0];
    const peso = Number(current.puntos_peso) || 30;
    const califNum = Math.max(0, Math.min(100, Number(calificacion ?? current.calificacion ?? 100)));
    const puntosObtenidos = estado === 'aprobado' ? peso : 0;

    const { rows: updated } = await neonQuery(
      `UPDATE entregas_evaluaciones_cms
          SET estado = $1,
              calificacion = $2,
              puntos_obtenidos = $3,
              retroalimentacion = $4,
              actualizado_en = NOW()
        WHERE id = $5::uuid
        RETURNING *;`,
      [estado, califNum, puntosObtenidos, retroalimentacion || '', id]
    );

    if (estado === 'aprobado' && Number(current.puntos_obtenidos || 0) === 0) {
      await neonQuery(
        `UPDATE usuarios SET xp = COALESCE(xp, 0) + $1 WHERE LOWER(correo) = LOWER($2);`,
        [peso, current.usuario_correo]
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, record: updated[0] });
  } catch (error: any) {
    console.error('Evaluations PATCH error:', error);
    return NextResponse.json(
      { detail: error.message || 'Error al calificar entrega.' },
      { status: 500 }
    );
  }
}

