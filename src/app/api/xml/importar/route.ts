import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// VULNERABILIDAD INTENCIONAL - SOLO PARA TALLER CTF ACADEMICO
// OWASP A02:2025 - Security Misconfiguration
// CWE-611: Improper Restriction of XML External Entity Reference (XXE)
//
// Este endpoint acepta XML para importar perfiles de estudiantes.
// El parser procesa declaraciones de entidades externas (<!ENTITY ... SYSTEM "file://...">)
// permitiendo leer archivos del servidor e incluir su contenido en la respuesta.
//
// Payload de ataque de ejemplo:
// <?xml version="1.0" encoding="UTF-8"?>
// <!DOCTYPE perfil [
//   <!ENTITY xxe SYSTEM "file:///etc/ucn/credenciales.txt">
// ]>
// <perfil>
//   <nombre>test</nombre>
//   <datos>&xxe;</datos>
// </perfil>

// Sistema de archivos virtual del servidor (simulado)
const ARCHIVOS_SERVIDOR: Record<string, string> = {
  '/etc/ucn/credenciales.txt': `# Sistema UCN - Credenciales Internas
# CLASIFICADO: Solo personal de TI
# =====================================
db_host=db-prod.ucn.local
db_user=ucnadmin
db_pass=Ucn#2024$Prod!
app_key=UCN_Coquimbo2024
smtp_pass=smtp_S3cr3t_2024
ctf_flag=${db.flags.xxe_injection}
# =====================================`,

  '/etc/passwd': `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
ucnapp:x:1000:1000:UCN WebApp:/home/ucnapp:/bin/bash
postgres:x:1001:1001:PostgreSQL:/var/lib/postgresql:/bin/bash`,

  '/etc/hostname': 'ucn-webapp-prod-01',

  '/proc/version': 'Linux version 5.15.0-91-generic (buildd@lcy02-amd64-059) (gcc version 11.4.0)',
};

/**
 * Simula el comportamiento de un parser XML vulnerable a XXE.
 * Detecta declaraciones <!ENTITY name SYSTEM "file://..."> y resuelve
 * las referencias &name; sustituyendo el contenido del archivo indicado.
 */
function resolverEntidadesXXE(xml: string): Record<string, string> {
  const entityRegex = /<!ENTITY\s+(\w+)\s+SYSTEM\s+["']([^"']+)["']\s*>/gi;
  const entidades: Record<string, string> = {};

  let match;
  while ((match = entityRegex.exec(xml)) !== null) {
    const [, nombre, url] = match;
    if (url.startsWith('file://')) {
      const ruta = url.replace('file://', '');
      entidades[nombre] = ARCHIVOS_SERVIDOR[ruta] ?? `[XXE] Archivo no encontrado: ${ruta}`;
    } else {
      // URL remota (SSRF via XXE) - bloqueada en este entorno simulado
      entidades[nombre] = `[XXE] Conexiones remotas bloqueadas por firewall: ${url}`;
    }
  }

  return entidades;
}

function extraerElemento(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
  return xml.match(re)?.[1] ?? null;
}

export async function POST(request: NextRequest) {
  let xmlRaw: string;

  try {
    xmlRaw = await request.text();
  } catch {
    return NextResponse.json(
      { error: 'No se pudo leer el cuerpo de la solicitud' },
      { status: 400 }
    );
  }

  if (!xmlRaw.trim().startsWith('<') && !xmlRaw.includes('<perfil>')) {
    return NextResponse.json(
      {
        error: 'Se esperaba contenido XML',
        formato_esperado: '<?xml version="1.0"?><perfil><nombre>...</nombre><datos>...</datos></perfil>',
      },
      { status: 400 }
    );
  }

  // --- Parser XXE vulnerable ---
  const entidades = resolverEntidadesXXE(xmlRaw);
  const hayXXE = Object.keys(entidades).length > 0;

  // Sustituir referencias &entidad; en el XML con el contenido resuelto
  let xmlProcesado = xmlRaw;
  if (hayXXE) {
    for (const [nombre, contenido] of Object.entries(entidades)) {
      xmlProcesado = xmlProcesado.replace(new RegExp(`&${nombre};`, 'g'), contenido);
    }
  }

  const nombre = extraerElemento(xmlProcesado, 'nombre');
  const datos = extraerElemento(xmlProcesado, 'datos');

  if (!nombre) {
    return NextResponse.json(
      {
        error: 'XML invalido: falta el elemento <nombre>',
        formato_esperado: '<perfil><nombre>Juan</nombre><datos>info</datos></perfil>',
      },
      { status: 400 }
    );
  }

  if (hayXXE) {
    return NextResponse.json({
      success: true,
      mensaje: 'Perfil importado correctamente',
      nombre,
      datos_procesados: datos,
      _debug: {
        advertencia: 'El parser proceso entidades externas (XXE)',
        entidades_resueltas: Object.keys(entidades),
      },
    });
  }

  return NextResponse.json({
    success: true,
    mensaje: 'Perfil importado correctamente',
    nombre,
    datos: datos ?? '',
  });
}

// GET: documentacion del endpoint
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/xml/importar',
    metodo: 'POST',
    descripcion: 'Importa un perfil de estudiante desde un documento XML',
    content_type: 'application/xml o text/plain',
    ejemplo: [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<perfil>',
      '  <nombre>Juan Perez</nombre>',
      '  <datos>Ingenieria Informatica, semestre 5</datos>',
      '</perfil>',
    ].join('\n'),
  });
}
