import { NextRequest, NextResponse } from 'next/server';
import { getEstudianteById } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Endpoint para consultar datos de estudiante
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const estudianteId = parseInt(id);

  if (isNaN(estudianteId)) {
    return NextResponse.json(
      { error: 'ID de estudiante invalido' },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Token de autorizacion requerido' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: 'Token invalido' },
      { status: 401 }
    );
  }

  const estudiante = getEstudianteById(estudianteId);

  if (!estudiante) {
    return NextResponse.json(
      { error: 'Estudiante no encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: estudiante,
  });
}
