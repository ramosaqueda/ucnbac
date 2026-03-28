'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Nota {
  asignatura: string;
  nota: number;
  semestre: string;
}

interface Estudiante {
  id: number;
  nombre: string;
  rut: string;
  carrera: string;
  semestre: number;
  notas: Nota[];
  promedio: number;
  flag_secreto?: string;
  flag_admin?: string;
}

export default function Dashboard() {
  const [token, setToken] = useState('');
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<{ estudianteId?: number; username?: string; role?: string } | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // Decodificar el token para obtener info del usuario
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        setUserInfo(payload);
        // Cargar datos del estudiante automáticamente
        if (payload.estudianteId) {
          cargarMisDatos(savedToken, payload.estudianteId);
        }
      } catch {
        // Token inválido
      }
    }
  }, []);

  const cargarMisDatos = async (authToken: string, id: number) => {
    try {
      const res = await fetch(`/api/estudiantes/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();

      if (data.success) {
        setEstudiante(data.data);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Error de conexion');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Debes iniciar sesion para acceder</p>
          <Link href="/" className="px-4 py-2 bg-blue-600 rounded">
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
          <div>
            <h1 className="text-2xl font-bold">Portal Academico</h1>
            <p className="text-gray-400 text-sm">UCN Coquimbo</p>
          </div>
          <div className="flex items-center gap-4">
            {userInfo && (
              <span className="text-sm text-gray-400">
                {userInfo.username} ({userInfo.role})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
            >
              Cerrar Sesion
            </button>
          </div>
        </header>

        {/* Navegación */}
        <nav className="mb-8">
          <ul className="flex gap-4 text-sm">
            <li>
              <Link href="/dashboard" className="px-4 py-2 bg-blue-600 rounded">
                Mis Notas
              </Link>
            </li>
            <li>
              <Link href="/dashboard/reportes" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
                Reportes
              </Link>
            </li>
            <li>
              <Link href="/dashboard/documentos" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
                Documentos
              </Link>
            </li>
          </ul>
        </nav>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded">
            {error}
          </div>
        )}

        {/* Datos del estudiante */}
        {estudiante ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Info Personal */}
            <div className="bg-white/10 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Informacion Personal</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Nombre:</span> {estudiante.nombre}</p>
                <p><span className="text-gray-400">RUT:</span> {estudiante.rut}</p>
                <p><span className="text-gray-400">Carrera:</span> {estudiante.carrera}</p>
                <p><span className="text-gray-400">Semestre:</span> {estudiante.semestre}</p>
                <p><span className="text-gray-400">ID Estudiante:</span> {estudiante.id}</p>
              </div>
            </div>

            {/* Notas */}
            <div className="bg-white/10 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Mis Notas</h2>
              {estudiante.notas.length > 0 ? (
                <div className="space-y-2">
                  {estudiante.notas.map((nota, i) => (
                    <div key={i} className="flex justify-between text-sm p-2 bg-black/20 rounded">
                      <span>{nota.asignatura}</span>
                      <span className={nota.nota >= 4.0 ? 'text-green-400' : 'text-red-400'}>
                        {nota.nota.toFixed(1)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm p-2 bg-blue-500/20 rounded font-bold">
                    <span>Promedio General</span>
                    <span>{estudiante.promedio.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No hay notas registradas</p>
              )}
            </div>

            {/* Flag secreto si existe */}
            {(estudiante.flag_secreto || estudiante.flag_admin) && (
              <div className="md:col-span-2 bg-green-500/20 border border-green-500 rounded-lg p-6">
                <h2 className="text-lg font-bold text-green-400 mb-2">FLAG Encontrado!</h2>
                <p className="font-mono text-sm">{estudiante.flag_secreto || estudiante.flag_admin}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/10 rounded-lg p-6 text-center">
            <p className="text-gray-400">Cargando datos...</p>
          </div>
        )}

        {/* Info de sesión (visible en consola del navegador) */}
        <div className="mt-8 text-xs text-gray-600">
          {/* Debug info - check browser console */}
        </div>
      </div>
    </div>
  );
}
