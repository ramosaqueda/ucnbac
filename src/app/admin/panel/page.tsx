'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AdminData {
  success: boolean;
  panel: string;
  flag: string;
  stats: {
    estudiantes: number;
    profesores: number;
    cursos_activos: number;
  };
}

export default function AdminPanel() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/panel')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Panel de Administracion</h1>
          <p className="text-gray-400">UCN Coquimbo - Control Interno</p>
        </header>

        {data?.success && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <p className="text-3xl font-bold text-blue-400">{data.stats.estudiantes}</p>
              <p className="text-gray-400">Estudiantes</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <p className="text-3xl font-bold text-green-400">{data.stats.profesores}</p>
              <p className="text-gray-400">Profesores</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <p className="text-3xl font-bold text-purple-400">{data.stats.cursos_activos}</p>
              <p className="text-gray-400">Cursos Activos</p>
            </div>
          </div>
        )}

        {data?.flag && (
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">Configuracion del Sistema</h2>
            <div className="p-4 bg-black/30 rounded font-mono text-sm">
              <p className="text-gray-400">admin_key: {data.flag}</p>
            </div>
          </div>
        )}

        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
