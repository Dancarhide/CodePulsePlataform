import { NextResponse } from 'next/server';
import { neonQuery } from '../_db';

export async function POST(request: Request) {
  try {
    const { correo } = await request.json();
    const { rows } = await neonQuery(`SELECT id FROM usuarios WHERE correo = $1 LIMIT 1;`, [correo]);

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Si el correo está registrado, se enviará un enlace de recuperación.',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Se enviaron instrucciones de recuperación a ${correo}.`,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ detail: 'Error al verificar correo.' }, { status: 500 });
  }
}

