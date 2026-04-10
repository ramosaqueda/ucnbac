import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// VULNERABILIDAD INTENCIONAL - SOLO PARA TALLER CTF ACADEMICO
// OWASP A02:2025 - Security Misconfiguration
// Sirve cualquier archivo del directorio expuesto sin control de acceso.

const CONTENIDOS: Record<string, { tipo: string; contenido: string }> = {
  'syllabus_programacion_2024.pdf': {
    tipo: 'text/plain',
    contenido: 'Syllabus del curso Programacion Avanzada 2024-1\nDocente: Dr. Roberto Mendez\nCreditos: 5\nHorario: Lunes y Miercoles 10:00-12:00',
  },
  'horarios_2024_1.xlsx': {
    tipo: 'text/plain',
    contenido: 'Horarios Semestre 2024-1\nIngenieria Informatica - Sede Coquimbo\n[Archivo binario - no previsualizable]',
  },
  'listado_alumnos.csv': {
    tipo: 'text/csv',
    contenido: 'nombre,rut,carrera,semestre\nMaria Gonzalez,12.345.678-9,Ing. Informatica,5\nCarlos Perez,11.222.333-4,Ing. Civil,3\nAna Martinez,13.444.555-6,Medicina,7',
  },
  'notas_parcial1_secreto.csv': {
    tipo: 'text/csv',
    contenido: 'nombre,rut,nota_parcial1\nMaria Gonzalez,12.345.678-9,6.5\nCarlos Perez,11.222.333-4,4.5\nAna Martinez,13.444.555-6,6.8\nJuan Soto,14.555.666-7,3.2\nValeria Ruiz,15.666.777-8,5.9',
  },
  'backup_config_sistema.bak': {
    tipo: 'text/plain',
    contenido: `# =============================================================
# Backup de configuracion del Sistema UCN
# Generado: 2024-01-05 03:00:00 (tarea cron automatica)
# ATENCION: Este archivo NO deberia ser accesible publicamente
# =============================================================

[base_de_datos]
DB_HOST=db-prod.ucn.local
DB_PORT=5432
DB_NAME=ucn_academico
DB_USER=ucnadmin
DB_PASS=Ucn#2024$Prod!

[correo]
SMTP_HOST=mail.ucn.cl
SMTP_PORT=587
SMTP_USER=sistema@ucn.cl
SMTP_PASS=smtp_S3cr3t_2024

[aplicacion]
APP_SECRET=UCN_Coquimbo2024
JWT_SECRET=coquimbo2024
AES_KEY=UCN_Coquimbo2024

# --- CTF FLAG (solo para ejercicio academico) ---
CTF_FLAG=${db.flags.directory_listing}
# ------------------------------------------------

[mantenimiento]
MANTENEDOR=soporte@ucn.cl
ULTIMA_REVISION=2024-01-05`,
  },
  '.env.backup': {
    tipo: 'text/plain',
    contenido: `# Variables de entorno - copia de seguridad antigua
# Para configuracion actualizada ver: backup_config_sistema.bak
NODE_ENV=production
APP_SECRET=ucn_legacy_key_2023
LEGACY_API_KEY=eyJhbGciOiJub25lIn0.dGVzdA.`,
  },
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  const archivo = CONTENIDOS[filename];

  if (!archivo) {
    return NextResponse.json(
      {
        error: 'Archivo no encontrado',
        path: `/uploads/${filename}`,
        hint: 'Consulta el listado en /api/archivos para ver los archivos disponibles',
      },
      { status: 404 }
    );
  }

  // Misconfiguration: sin autenticacion, sin restriccion por tipo de archivo
  return new NextResponse(archivo.contenido, {
    headers: {
      'Content-Type': `${archivo.tipo}; charset=utf-8`,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Server': 'UCN-FileServer/2.4.18 (Ubuntu)',
      'X-Powered-By': 'PHP/7.4.33',
    },
  });
}
