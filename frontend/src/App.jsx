// frontend/src/App.jsx
import React, { useState } from 'react';
import Login from './pages/Login';
import DashboardEstudiante from './pages/DashboardEstudiante';

export default function App() {
  // 1. Recupera la sesión guardada si el navegador se refresca
  const [usuario, setUsuario] = useState(() => {
    try {
      const sesion = localStorage.getItem('usuario');
      return sesion ? JSON.parse(sesion) : null;
    } catch {
      return null;
    }
  });

  // 2. Callback invocado por Login.jsx tras recibir 200 OK del backend
  const handleLoginSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  };

  // 3. Cierre de sesión (limpia token y vuelve al login)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  // Si no está logueado, muestra la pantalla de inicio de sesión
  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Por ahora, todos los usuarios autenticados van al DashboardEstudiante
  return <DashboardEstudiante onLogout={handleLogout} />;
}