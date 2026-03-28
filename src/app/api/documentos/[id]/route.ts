import { NextRequest, NextResponse } from 'next/server';
import { getDocumentoById } from '@/lib/db';

// Endpoint de documentos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const documento = getDocumentoById(id);

  if (!documento) {
    return NextResponse.json(
      { error: 'Documento no encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: documento,
  });
}
