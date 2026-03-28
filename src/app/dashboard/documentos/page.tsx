'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Documento {
  id: string;
  nombre: string;
  tipo: string;
  contenido: string;
}

export default function DocumentosPage() {
  const [token, setToken] = useState('');
  const [documentoId, setDocumentoId] = useState('DOC001');
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const buscarDocumento = async () => {
    setLoading(true);
    setError('');
    setDocumento(null);

    try {
      const res = await fetch(`/api/documentos/${documentoId}`);
      const data = await res.json();

      if (data.success) {
        setDocumento(data.data);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
          <div>
            <h1 className="text-2xl font-bold">Documentos</h1>
            <p className="text-gray-400 text-sm">UCN Coquimbo</p>
          </div>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">
            Volver
          </Link>
        </header>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Buscar Documento</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={documentoId}
                onChange={(e) => setDocumentoId(e.target.value)}
                className="flex-1 px-4 py-2 bg-black/30 rounded border border-gray-600"
                placeholder="ID del documento"
              />
              <button
                onClick={buscarDocumento}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Lista de documentos públicos */}
          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Documentos Disponibles</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between p-2 bg-black/20 rounded">
                <span>DOC001 - Syllabus Programacion 2024</span>
                <span className="text-green-400 text-xs">publico</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          {documento && (
            <div className="bg-white/10 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">{documento.nombre}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  documento.tipo === 'publico' ? 'bg-green-500/30' :
                  documento.tipo === 'confidencial' ? 'bg-orange-500/30' :
                  'bg-red-500/30'
                }`}>
                  {documento.tipo}
                </span>
              </div>
              <div className="p-4 bg-black/30 rounded">
                <p className="text-sm whitespace-pre-wrap">{documento.contenido}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
