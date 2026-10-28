import { NextResponse } from 'next/server';
import { neonQuery, createSimpleToken } from '../_db';

export async function POST(request: Request) {
  try {
    const { correo, password } = await request.json();

    if (!correo || !password) {
      return NextResponse.json({ detail: 'Credenciales inválidas' }, { status: 400 });
    }

    // Asegurar extensión pgcrypto para validar bcrypt ($2b$ / $2a$) directamente en PostgreSQL
    await neonQuery('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    const { rows } = await neonQuery(
      `SELECT id, nombres, correo, nombre_usuario, avatar_url, rol, password_hash,
              (password_hash = crypt($2, password_hash)) AS valid_bcrypt
         FROM usuarios
        WHERE correo = $1
        LIMIT 1;`,
      [correo, password]
    );

    const user = rows[0];

    // Respaldo para la cuenta admin por defecto si coincide con admin@codepulse.com / admin123
    const isDefaultAdmin = correo === 'admin@codepulse.com' && password === 'admin123';

    if (!user && isDefaultAdmin) {
      const token = createSimpleToken({
        sub: 'admin-default',
        email: 'admin@codepulse.com',
        username: 'admin',
        role: 'admin',
      });
      return NextResponse.json({
        success: true,
        access_token: token,
        token_type: 'bearer',
        user: {
          id: 'admin-default',
          nombre: 'Admin',
          correo: 'admin@codepulse.com',
          username: 'admin',
          avatar_url: null,
          rol: 'admin',
        },
      });
    }

    if (!user || (!user.valid_bcrypt && user.password_hash !== password && !isDefaultAdmin)) {
      return NextResponse.json({ detail: 'Credenciales inválidas' }, { status: 401 });
    }

    const effectiveRole = user.correo === 'admin@codepulse.com' ? 'admin' : user.rol;
    const accessToken = createSimpleToken({
      sub: String(user.id),
      email: user.correo,
      username: user.nombre_usuario,
      role: effectiveRole,
    });

    return NextResponse.json({
      success: true,
      access_token: accessToken,
      token_type: 'bearer',
      user: {
        id: String(user.id),
        nombre: user.nombres,
        correo: user.correo,
        username: user.nombre_usuario,
        avatar_url: user.avatar_url,
        rol: effectiveRole,
      },
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { detail: 'Error al procesar el inicio de sesión.' },
      { status: 500 }
    );
  }
}

