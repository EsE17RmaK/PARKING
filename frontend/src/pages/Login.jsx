import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { Car, Lock, Mail, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [correo, setCorreo] = useState('u22000001@utp.edu.pe');
  const [contrasena, setContrasena] = useState('Utp2026*');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);
    setError(false);

    try {
      const response = await api.post('/auth/login', {
        correo_institucional: correo,
        contrasena: contrasena,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.usuario) {
          localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        }
        setMensaje('¡Inicio de sesión exitoso! Conectado a Render Cloud.');
        setError(false);
        if (onLoginSuccess) onLoginSuccess(response.data);
      }
    } catch (err) {
      setError(true);
      if (err.response && err.response.data && err.response.data.mensaje) {
        setMensaje(err.response.data.mensaje);
      } else {
        setMensaje('Error de conexión con el servidor en Render Cloud.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      {/* Contenedor principal dividido estilo Figma E01 */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Panel Izquierdo: Branding UTP / ParkingU */}
        <div className="md:w-1/2 bg-blue-900 bg-gradient-to-br from-blue-900 to-indigo-950 p-8 flex flex-col justify-between text-white relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
              UTP
            </div>
            <span className="font-bold text-xl tracking-wide">PrioriParking</span>
          </div>

          <div className="my-auto py-8">
            <div className="inline-flex items-center space-x-2 bg-blue-800/60 px-3 py-1.5 rounded-full text-xs font-medium text-blue-200 mb-4 border border-blue-700/50">
              <Car className="w-4 h-4 text-sky-400" />
              <span>Gestión de Estacionamiento por Mérito</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
              Universidad UTP <br />
              <span className="text-sky-400">Campus Lima Centro</span>
            </h1>
            <p className="text-blue-200 text-sm mt-3 leading-relaxed">
              Reserva tu plaza de parqueo según tu horario académico, porcentaje de asistencia y promedio ponderado.
            </p>
          </div>

          <div className="text-xs text-blue-300 border-t border-blue-800/60 pt-4 flex justify-between items-center">
            <span>Servicio Cloud Activo</span>
            <span className="font-mono text-emerald-400">Render + Supabase</span>
          </div>
        </div>

        {/* Panel Derecho: Formulario Login E01 */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Iniciar sesión</h2>
            <p className="text-xs text-slate-500 mt-1">Ingresa con tu correo institucional UTP</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Correo institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="u22000001@utp.edu.pe"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full mt-2 py-3 px-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Ingresar</span>
              )}
            </button>
          </form>

          {mensaje && (
            <div className={`mt-4 p-3 rounded-lg border flex items-center space-x-2 text-xs ${
              error 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              {error ? (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{mensaje}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}