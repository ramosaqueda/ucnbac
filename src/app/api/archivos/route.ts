import { NextResponse } from 'next/server';

// VULNERABILIDAD INTENCIONAL - SOLO PARA TALLER CTF ACADEMICO
// OWASP A02:2025 - Security Misconfiguration
// CWE-548: Exposure of Information Through Directory Listing
//
// El servidor de archivos tiene el listado de directorios habilitado.
// Cualquier visitante puede ver todos los archivos almacenados en /uploads/
// sin necesidad de autenticacion.

const ARCHIVOS_SERVIDOR = [
  {
    nombre: 'syllabus_programacion_2024.pdf',
    tamanio: '245 KB',
    modificado: '2024-03-15 09:12:00',
    tipo: 'application/pdf',
    acceso: 'publico',
  },
  {
    nombre: 'horarios_2024_1.xlsx',
    tamanio: '87 KB',
    modificado: '2024-03-10 14:30:00',
    tipo: 'application/vnd.ms-excel',
    acceso: 'publico',
  },
  {
    nombre: 'listado_alumnos.csv',
    tamanio: '12 KB',
    modificado: '2024-03-20 11:00:00',
    tipo: 'text/csv',
    acceso: 'publico',
  },
  {
    nombre: 'notas_parcial1_secreto.csv',
    tamanio: '9 KB',
    modificado: '2024-04-02 08:45:00',
    tipo: 'text/csv',
    acceso: 'publico',
  },
  {
    nombre: 'backup_config_sistema.bak',
    tamanio: '3 KB',
    modificado: '2024-01-05 03:00:00',
    tipo: 'application/octet-stream',
    acceso: 'publico',
  },
  {
    nombre: '.env.backup',
    tamanio: '1 KB',
    modificado: '2024-01-01 00:01:00',
    tipo: 'text/plain',
    acceso: 'publico',
  },
];

export async function GET() {
  // Misconfiguration: devuelve el listado completo del directorio sin autenticacion.
  // En un servidor Apache/Nginx mal configurado esto equivale a tener Options +Indexes.
  return NextResponse.json(
    {
      directorio: '/var/www/ucn/uploads/',
      total_archivos: ARCHIVOS_SERVIDOR.length,
      archivos: ARCHIVOS_SERVIDOR,
      _meta: {
        servidor: 'UCN-FileServer/2.4.18 (Ubuntu)',
        hint: 'Accede al contenido de cada archivo en /api/archivos/{nombre}',
      },
    },
    {
      headers: {
        'Server': 'UCN-FileServer/2.4.18 (Ubuntu)',
        'X-Powered-By': 'PHP/7.4.33',
      },
    }
  );
}
