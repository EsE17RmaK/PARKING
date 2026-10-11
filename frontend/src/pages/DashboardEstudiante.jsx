import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

export default function DashboardEstudiante({ onLogout }) {
  // Datos del estudiante (provenientes del login o de la API)
  const [estudiante, setEstudiante] = useState({
    nombre_completo: 'María Valdez',
    codigo_estudiante: '20241028',
    promedio_academico: 17,
    porcentaje_asistencia: 92,
    condicion_pensiones: 'AL DIA',
    penalidades: 0,
    nivel_prioridad: 'Prioridad Alta',
  });

  useEffect(() => {
    // Si guardaste el usuario en localStorage en el login:
    const sesion = localStorage.getItem('usuario');
    if (sesion) {
      try {
        const parsed = JSON.parse(sesion);
        setEstudiante((prev) => ({
          ...prev,
          nombre_completo: parsed.nombre_completo || prev.nombre_completo,
          codigo_estudiante: parsed.codigo_estudiante || prev.codigo_estudiante,
        }));
      } catch (err) {
        console.error('Error parseando sesión', err);
      }
    }
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    if (onLogout) onLogout();
  };

  return (
    <div className="dashboard-layout">
      {/* 1. Barra Lateral de Navegación */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">P</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-sub">Universidad</span>
            <h2 className="sidebar-brand-title">ParkingU</h2>
          </div>
        </div>

        <hr className="sidebar-divider" />
        <span className="sidebar-section-title">PORTAL DE ESTUDIANTE</span>

        <nav className="sidebar-nav">
          <button type="button" className="sidebar-nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Inicio
          </button>
          <button type="button" className="sidebar-nav-item">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Mis reservas
          </button>
          <button type="button" className="sidebar-nav-item">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="8" rx="2" />
              <path d="M5 11l2-5h10l2 5" />
              <circle cx="7.5" cy="15.5" r="1.5" />
              <circle cx="16.5" cy="15.5" r="1.5" />
            </svg>
            Mi vehículo
          </button>
          <button type="button" className="sidebar-nav-item">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Reglamento
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-help-box">
            <h4 className="sidebar-help-title">¿Estamos para ayudarte?</h4>
            <p className="sidebar-help-desc">
              Resuelve tus dudas sobre el estacionamiento del campus.
            </p>
            <a href="#ayuda" className="sidebar-help-link">
              Ir al centro de ayuda →
            </a>
          </div>

          <button
            type="button"
            onClick={handleCerrarSesion}
            className="sidebar-logout-btn"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* 2. Área Central */}
      <div className="dashboard-main-wrapper">
        {/* Cabecera superior */}
        <header className="dashboard-topbar">
          <div className="breadcrumb">
            <span>Portal de estudiante</span>
            <span>›</span>
            <span className="breadcrumb-current">Inicio</span>
          </div>

          <div className="topbar-right">
            <button type="button" className="icon-button" aria-label="Notificaciones">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h24s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <div className="topbar-divider" />
            <button type="button" className="user-profile-btn">
              <div className="user-avatar">MV</div>
              <div className="user-info">
                <span className="user-name">{estudiante.nombre_completo}</span>
                <span className="user-role">
                  Estudiante · {estudiante.codigo_estudiante}
                </span>
              </div>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Contenido */}
        <main className="dashboard-content">
          <div className="dashboard-hero">
            <div>
              <h1 className="hero-title">Tu espacio en el campus</h1>
              <p className="hero-subtitle">
                Consulta tu prioridad y reserva un lugar para tu próxima clase.
              </p>
            </div>
            <div className="badge-semester">Semestre 2026-II</div>
          </div>

          {/* HISTORIA 1: Mi Prioridad (HU-02) */}
          <section className="card-panel">
            <div className="priority-header">
              <div className="priority-title-wrap">
                <h3 className="priority-title">Mi Prioridad</h3>
                <span className="status-pill-success">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {estudiante.nivel_prioridad}
                </span>
              </div>
              <span className="updated-text">Actualizado hoy · 07:30</span>
            </div>

            <div className="priority-grid">
              {/* Mérito Académico */}
              <div className="metric-col">
                <div className="metric-top">
                  <span>Mérito académico</span>
                  <strong>{estudiante.promedio_academico}/20</strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(estudiante.promedio_academico / 20) * 100}%`,
                    }}
                  />
                </div>
                <span className="metric-sub">Promedio del último semestre</span>
              </div>

              {/* Asistencia */}
              <div className="metric-col">
                <div className="metric-top">
                  <span>Asistencia</span>
                  <strong>{estudiante.porcentaje_asistencia}%</strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${estudiante.porcentaje_asistencia}%` }}
                  />
                </div>
                <span className="metric-sub">Asistencia acumulada del ciclo</span>
              </div>

              <div className="metric-divider" />

              {/* Condición de pensiones */}
              <div className="metric-col">
                <span className="metric-sub" style={{ fontSize: '13px' }}>
                  Condición de pensiones
                </span>
                <span className="status-pill-success" style={{ width: 'fit-content' }}>
                  ✓ Al día
                </span>
                <span className="metric-sub">Sin pagos pendientes</span>
              </div>

              {/* Penalidades */}
              <div className="metric-col">
                <div className="metric-top">
                  <strong style={{ fontSize: '15px' }}>
                    Penalidades: {estudiante.penalidades}
                  </strong>
                </div>
                <span className="metric-sub" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="14" height="14" fill="none" stroke="#21805b" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 12 15 16 10" />
                  </svg>
                  Sin infracciones
                </span>
              </div>
            </div>

            <div className="priority-info-footer">
              <svg width="15" height="15" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                Tu prioridad te permite acceder de forma preferente a los espacios disponibles.
              </span>
            </div>
          </section>

          <footer className="dashboard-footer">
            <span>Universidad · ParkingU</span>
            <span>¿Necesitas ayuda? Contacta a Servicios Universitarios</span>
          </footer>
        </main>
      </div>
    </div>
  );
}