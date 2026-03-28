import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username y password son requeridos' },
        { status: 400 }
      );
    }

    const token = login(username, password);

    if (token) {
      return NextResponse.json({
        success: true,
        token,
        message: 'Login exitoso',
      });
    }

    return NextResponse.json(
      { error: 'Credenciales invalidas' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

// GET - Info del sistema
export async function GET() {
  return NextResponse.json({
    sistema: 'UCN Coquimbo - API de Autenticacion',
    version: '1.0.0',
    endpoints: {
      login: 'POST /api/auth/login',
    },
  });
}
