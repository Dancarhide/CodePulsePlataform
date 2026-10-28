import { NextResponse } from 'next/server';
import { neonQuery } from '../_db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nombres,
      apellido1,
      apellido2,
      correo,
      password,
      nombre_usuario,
      avatar_url,
      avatar_style = 'avataaars',
      avatar_config,
    } = body;

    await neonQuery('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    const { rows: existing } = await neonQuery(
      `SELECT correo, nombre_usuario FROM usuarios WHERE correo = $1 OR nombre_usuario = $2 LIMIT 1;`,
      [correo, nombre_usuario]
    );

    if (existing.length > 0) {
      if (existing[0].correo === correo) {
        return NextResponse.json({ detail: 'El correo ya está registrado.' }, { status: 400 });
      }
      return NextResponse.json({ detail: 'El nombre de usuario ya está en uso.' }, { status: 400 });
    }

    await neonQuery(
      `INSERT INTO usuarios (nombres, apellido1, apellido2, correo, nombre_usuario, password_hash, avatar_url, avatar_style, avatar_config)
       VALUES ($1, $2, $3, $4, $5, crypt($6, gen_salt('bf')), $7, $8, $9::jsonb);`,
      [
        nombres,
        apellido1,
        apellido2 || null,
        correo,
        nombre_usuario,
        password,
        avatar_url || null,
        avatar_style,
        avatar_config ? JSON.stringify(avatar_config) : null,
      ]
    );

    return NextResponse.json(
      { success: true, message: 'Usuario registrado exitosamente.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { detail: 'Error al registrar el usuario en la base de datos.' },
      { status: 500 }
    );
  }
}
