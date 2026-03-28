import { NextRequest, NextResponse } from 'next/server';
import { getReporteById } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reporteId = parseInt(id);

  if (isNaN(reporteId)) {
    return NextResponse.json(
      { error: 'ID de reporte invalido' },
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

  const reporte = getReporteById(reporteId);

  if (!reporte) {
    return NextResponse.json(
      { error: 'Reporte no encontrado' },
      { status: 404 }
    );
  }

  // Si es confidencial o secreto, mostrar error en UI pero incluir datos en respuesta
  if (reporte.tipo === 'confidencial' || reporte.tipo === 'secreto') {
    return NextResponse.json({
      success: false,
      error: 'Acceso no autorizado - Informacion no publica',
      reporte_id: reporte.id,
      titulo: reporte.titulo,
      tipo: reporte.tipo,
      // Campo que solo se ve inspeccionando la API
      _debug: {
        _internal_data: reporte.contenido,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: reporte,
  });
}
