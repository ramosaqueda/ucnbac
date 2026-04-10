'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Configuracion del sistema - NO MODIFICAR
const CONFIG = {
  version: '1.0.0',
  api_url: '/api',
  // Parametros de seguridad legacy - pendiente migracion
  _legacy_crypto_key: 'UCN_Coquimbo2024',
  _debug_mode: false,
};

interface EncryptedCredential {
  usuario: string;
  password: string;
  rol: string;
}

export default function Home() {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [encryptedCreds, setEncryptedCreds] = useState<EncryptedCredential[]>([]);

  // Debug: exponer config en consola para desarrollo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-expect-error - debug only
      window.__APP_CONFIG__ = CONFIG;
    }

    // Cargar credenciales de demo
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.usuarios) {
          setEncryptedCreds(data.usuarios);
        }
      })
      .catch(() => { });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (data.success) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setMessage('Login exitoso!');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage('Error de conexion');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">UCN Coquimbo</h1>
          <h2 className="text-xl text-blue-200">Sistema de Gestion Academica</h2>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Iniciar Sesion</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Usuario</label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) =>
                    setLoginData({ ...loginData, username: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded bg-white/20 border border-white/30 focus:outline-none focus:border-blue-400"
                  placeholder="Ingresa tu usuario"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Contrasena</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded bg-white/20 border border-white/30 focus:outline-none focus:border-blue-400"
                  placeholder="Ingresa tu contrasena"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold transition"
              >
                Ingresar
              </button>
            </form>

            {message && (
              <div className="mt-4 p-3 bg-black/30 rounded font-mono text-sm whitespace-pre-wrap">
                {message}
              </div>
            )}

            {token && (
              <div className="mt-4">
                <Link
                  href="/dashboard"
                  className="block text-center py-2 bg-green-600 hover:bg-green-700 rounded"
                >
                  Ir al Dashboard
                </Link>
              </div>
            )}

            {/* Credenciales de demo cifradas */}
            {encryptedCreds.length > 0 && (
              <div className="mt-6 p-4 bg-black/30 rounded">
                <h4 className="text-sm font-bold text-gray-300 mb-3">Cuentas de prueba (cifradas):</h4>
                <div className="space-y-3 text-xs">
                  {encryptedCreds.map((cred, i) => (
                    <div key={i} className="p-2 bg-black/30 rounded">
                      <p className="text-gray-400 mb-1">[{cred.rol}]</p>
                      <p className="font-mono text-gray-500 break-all">
                        <span className="text-gray-400">usr:</span> {cred.usuario}
                      </p>
                      <p className="font-mono text-gray-500 break-all">
                        <span className="text-gray-400">pwd:</span> {cred.password}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">* Datos protegidos con AES-128-CBC</p>
              </div>
            )}
          </div>

          {/* CTF Info */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Desafio CTF</h3>
            <h4 className="text-sm text-blue-200 mb-3">Esta página ha sido desarrollada de manera intencionalmente vulnerable, solo con fines Academicos</h4>
            <p className="text-gray-300 mb-4 text-sm">
              Este sistema contiene <strong>8 banderas (FLAGS)</strong> ocultas.
              Explotando vulnerabilidades de control de acceso y mala configuracion de seguridad.
            </p>

            <div className="space-y-1 text-xs">
              <p className="text-gray-400 font-bold uppercase mb-1">A01 - Broken Access Control</p>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-red-500/30 rounded flex items-center justify-center text-xs">1</span>
                <span className="text-gray-300">FLAG de acceso no autorizado a datos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-orange-500/30 rounded flex items-center justify-center text-xs">2</span>
                <span className="text-gray-300">FLAG de informacion confidencial</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-yellow-500/30 rounded flex items-center justify-center text-xs">3</span>
                <span className="text-gray-300">FLAG de documentos restringidos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-500/30 rounded flex items-center justify-center text-xs">4</span>
                <span className="text-gray-300">FLAG de escalada de privilegios JWT</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-pink-500/30 rounded flex items-center justify-center text-xs">5</span>
                <span className="text-gray-300">FLAG de acceso administrativo</span>
              </div>

              <p className="text-gray-400 font-bold uppercase mt-3 mb-1">A02 - Security Misconfiguration</p>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-cyan-500/30 rounded flex items-center justify-center text-xs">6</span>
                <span className="text-gray-300">FLAG en servidor de archivos expuesto</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500/30 rounded flex items-center justify-center text-xs">7</span>
                <span className="text-gray-300">FLAG via inyeccion de entidades XML</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-rose-500/30 rounded flex items-center justify-center text-xs">8</span>
                <span className="text-gray-300">FLAG en panel de gestion con credenciales por defecto</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-black/30 rounded text-sm">
              <p className="text-yellow-400 font-mono">Formato: FLAG{`{...}`}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>UCN Coquimbo - Sistema Academico v{CONFIG.version}</p>
        </footer>
      </div>

      {/* Hidden debug info - visible in page source */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Sistema de configuracion UCN Coquimbo
            // Mantenimiento: soporte@ucn.cl
            var UCN_CONFIG = {
              appName: "Sistema Academico",
              encryptionKey: "UCN_Coquimbo2024",
              apiVersion: "v1"
            };
          `,
        }}
      />
    </div >
  );
}
