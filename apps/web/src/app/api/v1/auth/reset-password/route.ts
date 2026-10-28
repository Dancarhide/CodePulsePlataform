import { NextResponse } from 'next/server';
import { neonQuery } from '../_db';

export async function POST(request: Request) {
  try {
    const { correo, new_password } = await request.json();

    await neonQuery('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    const { rows } = await neonQuery(`SELECT id FROM usuarios WHERE correo = $1 LIMIT 1;`, [correo]);

    if (rows.length === 0) {
      return NextResponse.json({ detail: 'Usuario no encontrado.' }, { status: 400 });
    }

    await neonQuery(
      `UPDATE usuarios SET password_hash = crypt($2, gen_salt('bf')) WHERE id = $1;`,
      [rows[0].id, new_password]
    );

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ detail: 'Error al actualizar contraseña.' }, { status: 500 });
  }
}

