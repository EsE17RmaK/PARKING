import React, { useState } from 'react';
import api from '../api/axiosConfig';
import '../styles/Login.css';

export default function Login({ onLoginSuccess }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
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
        setMensaje('¡Inicio de sesión exitoso!');
        setError(false);
        if (onLoginSuccess) onLoginSuccess(response.data);
      }
    } catch (err) {
      setError(true);
      if (err.response && err.response.data && err.response.data.mensaje) {
        setMensaje(err.response.data.mensaje);
      } else {
        setMensaje('Credenciales inválidas. Verifique sus datos.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page-background">
      <div className="login-card-container">
        
        {/* Lado Izquierdo: Azul Marino + Logo "P" */}
        <div className="login-left-panel">
          <div className="login-brand-icon">P</div>
          <h1 className="login-brand-title">
            Universidad · ParkingU
          </h1>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="login-right-panel">
          <h2 className="login-form-title">Iniciar sesión</h2>
          <p className="login-form-subtitle">Ingresa con tu correo institucional</p>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Campo Correo */}
            <div className="login-input-group">
              <label className="login-label">Correo institucional</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="nombre@universidad.edu"
                required
                className="login-input"
              />
            </div>

            {/* Campo Contraseña */}
            <div className="login-input-group">
              <label className="login-label">Contraseña</label>
              <div className="login-password-wrapper">
                <input
                  type={mostrarContrasena ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  className="login-input"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="login-eye-button"
                  aria-label="Mostrar u ocultar contraseña"
                >
                  {/* Icono SVG de ojo */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Olvidaste tu contraseña */}
            <div className="login-forgot-container">
              <a
                href="#recuperar"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Comuníquese con soporte TI.');
                }}
                className="login-forgot-link"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón Ingresar */}
            <button
              type="submit"
              disabled={cargando}
              className="login-submit-button"
            >
              {cargando ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          {/* Mensajes de respuesta */}
          {mensaje && (
            <div
              className={`login-box-message ${
                error ? 'login-error-box' : 'login-success-box'
              }`}
            >
              {mensaje}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}