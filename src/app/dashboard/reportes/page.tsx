'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Reporte {
  id: number;
  titulo: string;
  tipo: string;
  contenido: string;
}

interface ApiResponse {
  success: boolean;
  data?: Reporte;
  error?: string;
  tipo?: string;
  titulo?: string;
  encrypted_data?: string;
  encryption?: string;
}

export default function ReportesPage() {
  const [token, setToken] = useState('');
  const [reporteId, setReporteId] = useState('1');
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [encryptedInfo, setEncryptedInfo] = useState<{
    titulo: string;
    tipo: string;
    encrypted_data: string;
    encryption: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const buscarReporte = async () => {
    if (!token) {
      setError('Sesion no valida');
      return;
    }

    setLoading(true);
    setError('');
    setReporte(null);
    setEncryptedInfo(null);

    try {
      const res = await fetch(`/api/reportes/${reporteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ApiResponse = await res.json();

      if (data.success && data.data) {
        setReporte(data.data);
      } else if (data.encrypted_data) {
        // Reporte confidencial - mostrar info cifrada
        setEncryptedInfo({
          titulo: data.titulo || 'Sin titulo',
          tipo: data.tipo || 'desconocido',
          encrypted_data: data.encrypted_data,
          encryption: data.encryption || 'AES',
        });
        setError(data.error || 'Contenido cifrado');
      } else {
        setError(data.error || 'Error al obtener el reporte');
      }
    } catch {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Debes iniciar sesion</p>
          <Link href="/" className="px-4 py-2 bg-blue-600 rounded">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
          <div>
            <h1 className="text-2xl font-bold">Reportes Academicos</h1>
            <p className="text-gray-400 text-sm">UCN Coquimbo</p>
          </div>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">
            Volver
          </Link>
        </header>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Consultar Reporte</h2>
            <div className="flex gap-4">
              <input
                type="number"
                value={reporteId}
                onChange={(e) => setReporteId(e.target.value)}
                className="flex-1 px-4 py-2 bg-black/30 rounded border border-gray-600"
                placeholder="ID del reporte"
                min="1"
              />
              <button
                onClick={buscarReporte}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {error && !encryptedInfo && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="font-bold text-red-400">Error</p>
              <p>{error}</p>
            </div>
          )}

          {encryptedInfo && (
            <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">{encryptedInfo.titulo}</h3>
                <span className="px-2 py-1 rounded text-xs bg-red-500/30">
                  {encryptedInfo.tipo}
                </span>
              </div>
              <p className="text-orange-400 mb-4">{error}</p>
              <div className="p-4 bg-black/30 rounded">
                <p className="text-xs text-gray-400 mb-2">Contenido cifrado ({encryptedInfo.encryption}):</p>
                <p className="font-mono text-xs break-all text-gray-300">
                  {encryptedInfo.encrypted_data}
                </p>
              </div>
            </div>
          )}

          {reporte && (
            <div className="bg-white/10 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">{reporte.titulo}</h3>
                <span className="px-2 py-1 rounded text-xs bg-green-500/30">
                  {reporte.tipo}
                </span>
              </div>
              <div className="p-4 bg-black/30 rounded">
                <p className="text-sm whitespace-pre-wrap">{reporte.contenido}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
