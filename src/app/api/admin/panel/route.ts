import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Panel de administracion
export async function GET() {
  return NextResponse.json({
    success: true,
    panel: 'Admin Dashboard',
    flag: db.admin_panel.secreto,
    stats: {
      estudiantes: 3,
      profesores: 1,
      cursos_activos: 9,
    },
  });
}
