import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getAdminFlag } from '@/lib/auth';

// Endpoint de configuracion admin
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Autenticacion requerida' },
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

  if (payload.role !== 'admin') {
    return NextResponse.json(
      { error: 'Acceso denegado' },
      { status: 403 }
    );
  }

  const flag = getAdminFlag(payload.role);

  return NextResponse.json({
    success: true,
    admin_config: {
      flag,
      permissions: ['read', 'write', 'delete', 'manage_users'],
    },
  });
}
