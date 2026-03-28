import data from '@/data/database.json';

export const db = {
  usuarios: data.usuarios,
  estudiantes: data.estudiantes,
  reportes: data.reportes,
  documentos: data.documentos,
  flags: data.flags,
  admin_panel: data.admin_panel,
  jwt_secret: data.jwt_secret,
  jwt_flag: data.jwt_flag,
};

export function getUsuarioByUsername(username: string) {
  return db.usuarios.find(u => u.username === username);
}

export function getUsuarioById(id: number) {
  return db.usuarios.find(u => u.id === id);
}

export function getEstudianteById(id: number) {
  return db.estudiantes.find(e => e.id === id);
}

export function getReporteById(id: number) {
  return db.reportes.find(r => r.id === id);
}

export function getDocumentoById(id: string) {
  return db.documentos.find(d => d.id === id);
}

export function getAllEstudiantes() {
  return db.estudiantes;
}

export function getAllReportes() {
  return db.reportes;
}
