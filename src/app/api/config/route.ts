import { NextResponse } from 'next/server';
import { encryptAES } from '@/lib/crypto';

// Endpoint que devuelve credenciales de demo cifradas
export async function GET() {
  const credentials = [
    { usuario: 'estudiante1', password: 'est123', rol: 'estudiante' },
    { usuario: 'estudiante2', password: 'est456', rol: 'estudiante' },
    { usuario: 'profesor', password: 'prof2024', rol: 'profesor' },
  ];

  const encryptedCredentials = credentials.map(cred => ({
    usuario: encryptAES(cred.usuario),
    password: encryptAES(cred.password),
    rol: cred.rol,
  }));

  return NextResponse.json({
    mensaje: 'Credenciales de acceso para usuarios de prueba',
    nota: 'Los datos estan protegidos con cifrado AES-256-CBC',
    usuarios: encryptedCredentials,
  });
}
