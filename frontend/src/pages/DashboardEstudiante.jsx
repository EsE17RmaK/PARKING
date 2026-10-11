import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const initialSpaces = [
  { id: 'A-01', status: 'occupied' },
  { id: 'A-02', status: 'available' },
  { id: 'A-03', status: 'available' },
  { id: 'A-04', status: 'available' },
  { id: 'A-05', status: 'available' },
  { id: 'A-06', status: 'available' },
  { id: 'A-07', status: 'occupied' },
  { id: 'A-08', status: 'available' },
];

export default function DashboardEstudiante({ onLogout }) {
  const [estudiante, setEstudiante] = useState({
    nombre_completo: 'María Valdez',
    codigo_estudiante: '20241028',
    promedio_academico: 17,
    porcentaje_asistencia: 92,
    condicion_pensiones: 'Al día',
    penalidades: 0,
    nivel_prioridad: 'Prioridad Alta',
  });

  const [selectedSpace, setSelectedSpace] = useState('A-03');
  const [fechaReserva, setFechaReserva] = useState('12/10/2026');
  const [horario, setHorario] = useState('08:00 – 12:00');
  const [vehiculo, setVehiculo] = useState('ABC-123');
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState('');

  useEffect(() => {
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
        console.error('Error al leer sesión:', err);
      }
    }
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    if (onLogout) onLogout();
  };

  const handleConfirmReservation = (e) => {
    e.preventDefault();
    setMensajeToast(`¡Reserva confirmada en ${selectedSpace} para el vehículo ${vehiculo}!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <div className="dash-container">
      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-header">
          <div className="dash-brand-icon">P</div>
          <div>
            <div className="dash-brand-title">Universidad</div>
            <div className="dash-brand-name">ParkingU</div>
          </div>
        </div>

        <hr className="dash-divider" />
        <div className="dash-menu-title">PORTAL DE ESTUDIANTE</div>

        <nav className="dash-nav">
          <button type="button" className="dash-nav-btn active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Inicio
          </button>
          <button type="button" className="dash-nav-btn">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Mis reservas
          </button>
          <button type="button" className="dash-nav-btn">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="8" rx="2" />
              <path d="M5 11l2-5h10l2 5" />
              <circle cx="7.5" cy="15.5" r="1.5" />
              <circle cx="16.5" cy="15.5" r="1.5" />
            </svg>
            Mi vehículo
          </button>
          <button type="button" className="dash-nav-btn">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Reglamento
          </button>
        </nav>

        <div className="dash-sidebar-bottom">
          <div className="dash-help-card">
            <h4>¿Estamos para ayudarte?</h4>
            <p>Resuelve tus dudas sobre el estacionamiento del campus.</p>
            <a href="#ayuda">Ir al centro de ayuda →</a>
          </div>

          <button type="button" onClick={handleCerrarSesion} className="dash-logout-btn">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="dash-main">
        {/* HEADER */}
        <header className="dash-header">
          <div className="dash-breadcrumbs">
            Portal de estudiante &gt; <b>Inicio</b>
          </div>
          <div className="dash-header-user">
            <button type="button" className="dash-bell-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h24s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <div className="dash-header-divider" />
            <div className="dash-profile">
              <div className="dash-avatar">MV</div>
              <div className="dash-profile-meta">
                <span>{estudiante.nombre_completo}</span>
                <small>Estudiante · {estudiante.codigo_estudiante}</small>
              </div>
            </div>
          </div>
        </header>

        {/* BODY */}
        <main className="dash-body">
          <div className="dash-banner">
            <div>
              <h1>Tu espacio en el campus</h1>
              <p>Consulta tu prioridad y reserva un lugar para tu próxima clase.</p>
            </div>
            <div className="dash-pill-semester">Semestre 2026-II</div>
          </div>

          {/* TARJETA PRIORIDAD */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="dash-card-header-left">
                <h3>Mi Prioridad</h3>
                <span className="dash-badge-high">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {estudiante.nivel_prioridad}
                </span>
              </div>
              <div className="dash-updated-time">Actualizado hoy · 07:30</div>
            </div>

            <div className="dash-metrics-grid">
              <div className="dash-metric-item">
                <div className="dash-metric-header">
                  <span>Mérito académico</span>
                  <strong>{estudiante.promedio_academico}/20</strong>
                </div>
                <div className="dash-progress-bg">
                  <div
                    className="dash-progress-bar"
                    style={{ width: `${(estudiante.promedio_academico / 20) * 100}%` }}
                  />
                </div>
                <span className="dash-metric-sub">Promedio del último semestre</span>
              </div>

              <div className="dash-metric-item">
                <div className="dash-metric-header">
                  <span>Asistencia</span>
                  <strong>{estudiante.porcentaje_asistencia}%</strong>
                </div>
                <div className="dash-progress-bg">
                  <div
                    className="dash-progress-bar"
                    style={{ width: `${estudiante.porcentaje_asistencia}%` }}
                  />
                </div>
                <span className="dash-metric-sub">Asistencia acumulada del ciclo</span>
              </div>

              <div className="dash-grid-line" />

              <div className="dash-metric-item">
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Condición de pensiones</span>
                <span className="dash-badge-high" style={{ width: 'fit-content' }}>
                  ✓ {estudiante.condicion_pensiones}
                </span>
                <span className="dash-metric-sub">Sin pagos pendientes</span>
              </div>

              <div className="dash-metric-item">
                <strong style={{ fontSize: '15px' }}>Penalidades: {estudiante.penalidades}</strong>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6b7280' }}>
                  <svg width="14" height="14" fill="none" stroke="#21805b" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 12 15 16 10" />
                  </svg>
                  Sin infracciones
                </span>
              </div>
            </div>

            <div className="dash-info-row">
              <svg width="15" height="15" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Tu prioridad te permite acceder de forma preferente a los espacios disponibles.</span>
            </div>
          </div>

          {/* SOLICITAR RESERVA & MAPA ZONA A */}
          <div className="dash-reservation-row">
            {/* Formulario */}
            <div className="dash-card">
              <h3 style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>Solicitar Reserva</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                Elige la fecha y el horario de tu visita al campus.
              </p>

              <form onSubmit={handleConfirmReservation}>
                <div className="dash-form-grid">
                  <div className="dash-input-wrap">
                    <label>Fecha</label>
                    <div className="dash-field-box">
                      <input
                        type="text"
                        value={fechaReserva}
                        onChange={(e) => setFechaReserva(e.target.value)}
                      />
                      <svg width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                      </svg>
                    </div>
                  </div>

                  <div className="dash-input-wrap">
                    <label>Horario académico</label>
                    <div className="dash-field-box">
                      <select value={horario} onChange={(e) => setHorario(e.target.value)}>
                        <option>08:00 – 12:00</option>
                        <option>13:00 – 17:00</option>
                        <option>18:00 – 22:00</option>
                      </select>
                    </div>
                  </div>

                  <div className="dash-input-wrap">
                    <label>Espacio seleccionado</label>
                    <div className="dash-field-box">
                      <span>{selectedSpace} · Zona A</span>
                      <svg width="14" height="14" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  <div className="dash-input-wrap">
                    <label>Vehículo</label>
                    <div className="dash-field-box">
                      <select value={vehiculo} onChange={(e) => setVehiculo(e.target.value)}>
                        <option>ABC-123</option>
                        <option>XYZ-742</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="dash-banner-summary">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Lunes 12 de octubre · 4 horas de estacionamiento</span>
                </div>

                <button type="submit" className="dash-btn-confirm">
                  Confirmar reserva →
                </button>
                <p className="dash-subtext-note">
                  La reserva está sujeta a disponibilidad al momento de confirmar.
                </p>
              </form>
            </div>

            {/* Mapa Zona A */}
            <div className="dash-card">
              <div className="dash-map-header">
                <h3 style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>Zona A</h3>
                <span className="dash-badge-high">6 disponibles</span>
              </div>
              <div className="dash-map-location">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Campus central · Acceso norte</span>
              </div>

              <div className="dash-parking-bay">
                <div className="dash-parking-row">
                  {initialSpaces.slice(0, 4).map((space) => {
                    const isOccupied = space.status === 'occupied';
                    const isSelected = space.id === selectedSpace;
                    return (
                      <button
                        key={space.id}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setSelectedSpace(space.id)}
                        className={`dash-space-slot ${
                          isSelected ? 'selected' : isOccupied ? 'occupied' : 'available'
                        }`}
                      >
                        {isSelected ? '✓' : isOccupied ? '🚗' : 'P'}
                        <span>{space.id}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="dash-lane-indicator">
                  <span>ACCESO</span>
                  <hr />
                  <span>→</span>
                </div>

                <div className="dash-parking-row">
                  {initialSpaces.slice(4).map((space) => {
                    const isOccupied = space.status === 'occupied';
                    const isSelected = space.id === selectedSpace;
                    return (
                      <button
                        key={space.id}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setSelectedSpace(space.id)}
                        className={`dash-space-slot ${
                          isSelected ? 'selected' : isOccupied ? 'occupied' : 'available'
                        }`}
                      >
                        {isSelected ? '✓' : isOccupied ? '🚗' : 'P'}
                        <span>{space.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="dash-map-legend">
                <span><i className="legend-dot" style={{ background: '#a9cdbb' }} /> Disponible</span>
                <span><i className="legend-dot" style={{ background: '#d9dfe9' }} /> Ocupado</span>
                <span><i className="legend-dot" style={{ background: '#173473' }} /> Seleccionado</span>
              </div>

              <div className="dash-selected-highlight">
                <div className="dash-selected-badge">{selectedSpace}</div>
                <div className="dash-selected-info">
                  <strong>Espacio seleccionado</strong>
                  <span>A 2 min del pabellón académico</span>
                </div>
              </div>
            </div>
          </div>

          <footer className="dash-footer">
            <span>Universidad · ParkingU</span>
            <span>¿Necesitas ayuda? Contacta a Servicios Universitarios</span>
          </footer>
        </main>
      </div>

      {showToast && <div className="dash-toast">{mensajeToast}</div>}
    </div>
  );
}