import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// VULNERABILIDAD INTENCIONAL - SOLO PARA TALLER CTF ACADEMICO
// OWASP A02:2025 - Security Misconfiguration
// CWE-1392: Use of Default Credentials
//
// Panel de gestion del servidor UCN instalado con credenciales por defecto
// que nunca fueron cambiadas tras la puesta en produccion.
//
// Similar a: curl -u admin:admin http://target:8080/manager/
//            (Apache Tomcat Manager con credenciales por defecto)
//
// Ataque: curl -u admin:admin http://localhost:3000/api/manager

const CREDENCIALES_DEFECTO = {
  username: 'admin',
  password: 'admin',
};

const HEADERS_SERVIDOR = {
  'Server': 'Apache-Coyote/1.1',
  'X-Powered-By': 'UCN-Manager/2.4 (Apache Tomcat/9.0.82)',
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  // Sin header Authorization -> responder con 401 y solicitar Basic Auth
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse(
      JSON.stringify({
        error: 'Autenticacion requerida',
        realm: 'UCN Management Console',
        hint: 'Este panel de gestion usa HTTP Basic Authentication.',
        ejemplo: 'curl -u <usuario>:<password> http://localhost:3000/api/manager',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Basic realm="UCN Management Console"',
          ...HEADERS_SERVIDOR,
        },
      }
    );
  }

  // Decodificar credenciales desde Base64
  let username: string;
  let password: string;
  try {
    const base64 = authHeader.slice(6); // remover "Basic "
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const separador = decoded.indexOf(':');
    username = decoded.slice(0, separador);
    password = decoded.slice(separador + 1);
  } catch {
    return new NextResponse(
      JSON.stringify({ error: 'Header de autorizacion malformado' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...HEADERS_SERVIDOR },
      }
    );
  }

  // VULNERABILIDAD: comparar contra credenciales por defecto que nunca fueron cambiadas
  if (
    username === CREDENCIALES_DEFECTO.username &&
    password === CREDENCIALES_DEFECTO.password
  ) {
    return NextResponse.json(
      {
        success: true,
        sistema: 'UCN Management Console v2.4',
        servidor: 'ucn-webapp-prod-01',
        usuario_autenticado: username,
        flag: db.flags.default_credentials,
        estado_servicios: {
          base_datos: 'ACTIVO',
          smtp: 'ACTIVO',
          backup: 'ACTIVO',
          ldap: 'INACTIVO - pendiente configuracion',
        },
        aplicaciones_desplegadas: [
          { nombre: 'ucn-academico', estado: 'running', puerto: 3000 },
          { nombre: 'ucn-biblioteca', estado: 'running', puerto: 3001 },
          { nombre: 'ucn-rrhh', estado: 'stopped', puerto: 3002 },
        ],
        _nota: 'Credenciales por defecto nunca cambiadas desde la instalacion inicial. OWASP A02:2025 - Security Misconfiguration.',
      },
      {
        headers: HEADERS_SERVIDOR,
      }
    );
  }

  // Credenciales incorrectas
  return new NextResponse(
    JSON.stringify({
      error: '401 Unauthorized - Credenciales invalidas',
      intentos_restantes: 3,
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Basic realm="UCN Management Console"',
        ...HEADERS_SERVIDOR,
      },
    }
  );
}
