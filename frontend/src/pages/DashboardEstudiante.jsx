import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MisReservas from './MisReservas';
import '../styles/Dashboard.css';

export default function DashboardEstudiante({ onLogout }) {
  // Control de navegación interna entre 'inicio' y 'mis-reservas'
  const [vistaActual, setVistaActual] = useState('inicio');

  // Restricción de fechas: únicamente mañana o pasado mañana
  const obtenerRangoFechas = () => {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);

    const pasadoManana = new Date(hoy);
    pasadoManana.setDate(hoy.getDate() + 2);

    const pad = (n) => String(n).padStart(2, '0');
    const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    return {
      fechaMin: toISO(manana),
      fechaMax: toISO(pasadoManana),
    };
  };

  const { fechaMin, fechaMax } = obtenerRangoFechas();

  // Lista de horas entre 07:00 AM y 07:00 PM
  const listaHoras = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  // Datos del perfil y prioridad académica (HU-02)
  const [estudiante, setEstudiante] = useState({
    nombre_completo: 'Cargando...',
    codigo_estudiante: '---',
    promedio_academico: 0,
    porcentaje_asistencia: 0,
    condicion_pensiones: 'AL DIA',
    penalidades: 0,
    nivel_prioridad: 'Calculando...',
  });

  // Campos del formulario
  const [fechaReserva, setFechaReserva] = useState(fechaMin);
  const [horaIngreso, setHoraIngreso] = useState('08:00');
  const [duracionHoras, setDuracionHoras] = useState(4); // 3 o 4 horas
  const [zonaSeleccionada, setZonaSeleccionada] = useState('ZONA_LATERAL');

  // Aforos interactivos en forma de "D"
  const [aforos, setAforos] = useState({
    ZONA_NORTE: { nombre: 'Zona Norte (Arriba)', total: 7, disponibles: 7 },
    ZONA_LATERAL: { nombre: 'Zona Lateral (Principal)', total: 20, disponibles: 20 },
    ZONA_SUR: { nombre: 'Zona Sur (Abajo)', total: 8, disponibles: 8 }
  });

  const [miReservaActiva, setMiReservaActiva] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Validación HU-03: Solvencia financiera
  const esSolvente =
    estudiante.condicion_pensiones?.toUpperCase() === 'AL DIA' ||
    estudiante.condicion_pensiones?.toLowerCase() === 'al día';

  useEffect(() => {
    // 1. Cargar datos locales de la sesión
    const sesion = localStorage.getItem('usuario');
    if (sesion) {
      try {
        const u = JSON.parse(sesion);
        setEstudiante((prev) => ({
          ...prev,
          nombre_completo: u.nombre_completo || u.nombre || prev.nombre_completo,
          codigo_estudiante: u.codigo_estudiante || prev.codigo_estudiante,
          promedio_academico: Number(u.promedio_academico || u.promedio || 0),
          porcentaje_asistencia: Number(u.porcentaje_asistencia || u.asistencia || 0),
          condicion_pensiones: u.condicion_pensiones || prev.condicion_pensiones,
          nivel_prioridad: u.nivel_prioridad || prev.nivel_prioridad,
        }));
      } catch (err) {
        console.error('Error al leer sesión:', err);
      }
    }

    // 2. Traer métricas en tiempo real desde Supabase (HU-02)
    const sincronizarDatos = async () => {
      try {
        const resPrioridad = await api.get('/api/estudiantes/mi-prioridad');
        if (resPrioridad.data?.evaluacion) {
          const { estudiante: info, evaluacion } = resPrioridad.data;
          setEstudiante((prev) => ({
            ...prev,
            nombre_completo: info.nombreCompleto || prev.nombre_completo,
            codigo_estudiante: info.codigoEstudiante || prev.codigo_estudiante,
            promedio_academico: Number(evaluacion.detalles?.promedio ?? prev.promedio_academico),
            porcentaje_asistencia: Number(evaluacion.detalles?.asistencia ?? prev.porcentaje_asistencia),
            condicion_pensiones: evaluacion.detalles?.condicionPensiones || prev.condicion_pensiones,
            penalidades: evaluacion.detalles?.penalidades || 0,
            nivel_prioridad: evaluacion.nivelPrioridad || prev.nivel_prioridad,
          }));
        }
      } catch (e) {
        console.log('Utilizando datos de la sesión actual.');
      }

      // 3. Comprobar si el estudiante ya cuenta con una reserva activa
      try {
        const resLista = await api.get('/api/reservas/mis-reservas');
        if (resLista.data && resLista.data.length > 0) {
          const activa = resLista.data.find((r) => r.status === 'CONFIRMADA' || r.status === 'PENDIENTE');
          if (activa) {
            setMiReservaActiva({
              codigo: activa.id,
              fecha: activa.date?.split('·')[0]?.trim(),
              hora: activa.date?.split('·')[1]?.trim(),
              zona: activa.zone
            });
          }
        }
      } catch (e) {
        console.log('Sin reservas registradas previas.');
      }
    };

    sincronizarDatos();
  }, [vistaActual]);

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    if (onLogout) onLogout();
  };

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    if (!esSolvente) {
      alert('Acceso denegado: regularice sus pensiones pendientes (HU-03).');
      return;
    }

    if (aforos[zonaSeleccionada].disponibles <= 0) {
      alert('No quedan lugares disponibles en esta zona.');
      return;
    }

    try {
      const res = await api.post('/api/reservas', {
        fecha_reserva: fechaReserva,
        hora_ingreso: horaIngreso,
        duracion_horas: duracionHoras,
        zona: zonaSeleccionada
      });

      // Disminución reactiva de los lugares disponibles
      setAforos((prev) => ({
        ...prev,
        [zonaSeleccionada]: {
          ...prev[zonaSeleccionada],
          disponibles: Math.max(0, prev[zonaSeleccionada].disponibles - 1)
        }
      }));

      const dataReserva = res.data?.reserva || {
        codigo: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
        fecha: fechaReserva,
        hora: horaIngreso,
        duracion: `${duracionHoras} horas`,
        zona: aforos[zonaSeleccionada].nombre
      };

      setMiReservaActiva(dataReserva);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
    } catch (error) {
      alert(error.response?.data?.mensaje || 'Error al guardar la reserva.');
    }
  };

  const getIniciales = (nombre) => {
    if (!nombre || nombre === 'Cargando...') return 'UT';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    return partes[0].substring(0, 2).toUpperCase();
  };

  const totalDisponibles =
    aforos.ZONA_NORTE.disponibles +
    aforos.ZONA_LATERAL.disponibles +
    aforos.ZONA_SUR.disponibles;

  const porcentajeMerito = Math.min(100, (estudiante.promedio_academico / 20) * 100);
  const porcentajeAsistencia = Math.min(100, estudiante.porcentaje_asistencia);

  // Si se selecciona la pestaña 'Mis reservas', renderizamos su vista
  if (vistaActual === 'mis-reservas') {
    return <MisReservas onBackToDashboard={() => setVistaActual('inicio')} />;
  }

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
          <button
            type="button"
            className={`dash-nav-btn ${vistaActual === 'inicio' ? 'active' : ''}`}
            onClick={() => setVistaActual('inicio')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Inicio
          </button>
          <button
            type="button"
            className={`dash-nav-btn ${vistaActual === 'mis-reservas' ? 'active' : ''}`}
            onClick={() => setVistaActual('mis-reservas')}
          >
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

      {/* ÁREA PRINCIPAL */}
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
              <div className="dash-avatar">{getIniciales(estudiante.nombre_completo)}</div>
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

          {/* ALERTA DE DEUDA (HU-03) */}
          {!esSolvente && (
            <div className="dash-debt-alert">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <strong>Acceso restringido por cuotas vencidas (HU-03)</strong>
                <p>Mantiene pagos pendientes con la institución. Regularice su estado para habilitar el sistema de reservas.</p>
              </div>
            </div>
          )}

          {/* TARJETA DE PRIORIDAD ACADÉMICA (HU-02) */}
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
              <div className="dash-updated-time">Actualizado en tiempo real</div>
            </div>

            <div className="dash-metrics-grid">
              {/* Mérito Académico */}
              <div className="dash-metric-item">
                <div className="dash-metric-header">
                  <span>Mérito académico</span>
                  <strong>{estudiante.promedio_academico}/20</strong>
                </div>
                <div className="dash-progress-bg">
                  <div
                    className="dash-progress-bar"
                    style={{ width: `${porcentajeMerito}%` }}
                  />
                </div>
                <span className="dash-metric-sub">
                  Promedio ponderado del ciclo ({estudiante.promedio_academico >= 14 ? 'Apto ≥ 14' : 'Bajo'})
                </span>
              </div>

              {/* Asistencia */}
              <div className="dash-metric-item">
                <div className="dash-metric-header">
                  <span>Asistencia</span>
                  <strong>{estudiante.porcentaje_asistencia}%</strong>
                </div>
                <div className="dash-progress-bg">
                  <div
                    className="dash-progress-bar"
                    style={{ width: `${porcentajeAsistencia}%` }}
                  />
                </div>
                <span className="dash-metric-sub">
                  Asistencia acumulada ({estudiante.porcentaje_asistencia >= 85 ? 'Apto ≥ 85%' : 'Bajo'})
                </span>
              </div>

              <div className="dash-grid-line" />

              {/* Condición de pensiones */}
              <div className="dash-metric-item">
                <span className="dash-metric-label-pension">Condición de pensiones</span>
                <span className={esSolvente ? 'dash-badge-high dash-badge-inline' : 'dash-badge-debt dash-badge-inline'}>
                  {esSolvente ? '✓ Al día' : '⚠ Con deuda'}
                </span>
                <span className="dash-metric-sub">
                  {esSolvente ? 'Sin pagos pendientes' : 'Cuotas vencidas registradas'}
                </span>
              </div>

              {/* Penalidades */}
              <div className="dash-metric-item">
                <strong className="dash-metric-penalties">Penalidades: {estudiante.penalidades}</strong>
                <span className="dash-metric-penalty-status">
                  <svg width="14" height="14" fill="none" stroke="#21805b" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 12 15 16 10" />
                  </svg>
                  {estudiante.penalidades === 0 ? 'Sin infracciones' : 'Infracciones activas'}
                </span>
              </div>
            </div>

            <div className="dash-info-row">
              <svg width="15" height="15" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Fórmula institucional: Prioridad = Mérito académico + Asistencia + Pensiones − Penalidades.</span>
            </div>
          </div>

          {/* FILA DE SOLICITAR RESERVA & MAPA EN FORMA DE "D" */}
          <div className="dash-reservation-row">
            {/* Columna Izquierda: Formulario Simple */}
            <div className="dash-card">
              <h3 className="dash-reservation-title">Solicitar Reserva</h3>
              <p className="dash-reservation-subtitle">
                Elige tu fecha en el calendario, hora de ingreso y duración de tu permanencia.
              </p>

              <form onSubmit={handleConfirmReservation}>
                <div className="dash-form-grid">
                  {/* Selector con Calendario Nativo (min / max) */}
                  <div className="dash-input-wrap">
                    <label>Fecha de reserva</label>
                    <div className="dash-field-box">
                      <input
                        type="date"
                        value={fechaReserva}
                        min={fechaMin}
                        max={fechaMax}
                        disabled={!esSolvente}
                        onChange={(e) => setFechaReserva(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Selector de Hora (07:00 a 19:00) */}
                  <div className="dash-input-wrap">
                    <label>Hora de ingreso (07:00 – 19:00)</label>
                    <div className="dash-field-box">
                      <select
                        value={horaIngreso}
                        disabled={!esSolvente}
                        onChange={(e) => setHoraIngreso(e.target.value)}
                      >
                        {listaHoras.map((h) => (
                          <option key={h} value={h}>
                            {h} hrs
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Opción de 3 o 4 horas */}
                <div className="dash-duration-section">
                  <label className="dash-duration-label">Tiempo de estadía:</label>
                  <div className="dash-duration-radios">
                    <label className="dash-radio-option">
                      <input
                        type="radio"
                        name="duracion"
                        value={3}
                        checked={duracionHoras === 3}
                        onChange={() => setDuracionHoras(3)}
                      />
                      <span>3 Horas</span>
                    </label>
                    <label className="dash-radio-option">
                      <input
                        type="radio"
                        name="duracion"
                        value={4}
                        checked={duracionHoras === 4}
                        onChange={() => setDuracionHoras(4)}
                      />
                      <span>4 Horas</span>
                    </label>
                  </div>
                </div>

                <div className="dash-banner-summary">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>
                    <b>{fechaReserva}</b> · <b>{horaIngreso} hrs</b> ({duracionHoras}h) · {aforos[zonaSeleccionada].nombre}
                  </span>
                </div>

                <button
                  type="submit"
                  className={`dash-btn-confirm ${!esSolvente ? 'dash-btn-disabled' : ''}`}
                  disabled={!esSolvente}
                >
                  {esSolvente ? 'Confirmar reserva →' : 'Bloqueado por deuda de pensión'}
                </button>
              </form>
            </div>

            {/* Columna Derecha: Mapa en forma de "D" */}
            <div className="dash-card">
              <div className="dash-map-header">
                <div>
                  <h3 className="dash-reservation-title">Zonas del Campus</h3>
                  <p className="dash-map-location">Distribución perimetral en forma de "D"</p>
                </div>
                <span className="dash-badge-high">{totalDisponibles} disponibles</span>
              </div>

              <div className="dash-d-layout">
                {/* Zona Norte (Superior: 7 espacios) */}
                <div
                  className={`dash-zone-box dash-zone-north ${
                    zonaSeleccionada === 'ZONA_NORTE' ? 'selected' : ''
                  }`}
                  onClick={() => setZonaSeleccionada('ZONA_NORTE')}
                >
                  <div className="dash-zone-info">
                    <strong>Zona Norte (Arriba)</strong>
                    <span>{aforos.ZONA_NORTE.disponibles} de {aforos.ZONA_NORTE.total} disponibles</span>
                  </div>
                  <div className="dash-zone-slots-mini">
                    {Array.from({ length: aforos.ZONA_NORTE.total }).map((_, i) => (
                      <span
                        key={i}
                        className={`dash-slot-dot ${
                          i < (aforos.ZONA_NORTE.total - aforos.ZONA_NORTE.disponibles) ? 'occupied' : 'free'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Vía de tránsito + Zona Lateral (20 espacios) */}
                <div className="dash-d-middle">
                  <div className="dash-transit-lane">
                    <div className="dash-lane-arrow">↑</div>
                    <span>VÍA DE TRÁNSITO VEHICULAR</span>
                    <div className="dash-lane-arrow">↓</div>
                  </div>

                  <div
                    className={`dash-zone-box dash-zone-lateral ${
                      zonaSeleccionada === 'ZONA_LATERAL' ? 'selected' : ''
                    }`}
                    onClick={() => setZonaSeleccionada('ZONA_LATERAL')}
                  >
                    <div className="dash-zone-info">
                      <strong>Zona Lateral (Costado)</strong>
                      <span>{aforos.ZONA_LATERAL.disponibles} de {aforos.ZONA_LATERAL.total} disponibles</span>
                    </div>
                    <div className="dash-zone-slots-grid">
                      {Array.from({ length: aforos.ZONA_LATERAL.total }).map((_, i) => (
                        <span
                          key={i}
                          className={`dash-slot-dot ${
                            i < (aforos.ZONA_LATERAL.total - aforos.ZONA_LATERAL.disponibles) ? 'occupied' : 'free'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Zona Sur (Inferior: 8 espacios) */}
                <div
                  className={`dash-zone-box dash-zone-south ${
                    zonaSeleccionada === 'ZONA_SUR' ? 'selected' : ''
                  }`}
                  onClick={() => setZonaSeleccionada('ZONA_SUR')}
                >
                  <div className="dash-zone-info">
                    <strong>Zona Sur (Abajo)</strong>
                    <span>{aforos.ZONA_SUR.disponibles} de {aforos.ZONA_SUR.total} disponibles</span>
                  </div>
                  <div className="dash-zone-slots-mini">
                    {Array.from({ length: aforos.ZONA_SUR.total }).map((_, i) => (
                      <span
                        key={i}
                        className={`dash-slot-dot ${
                          i < (aforos.ZONA_SUR.total - aforos.ZONA_SUR.disponibles) ? 'occupied' : 'free'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="dash-map-legend">
                <span><i className="legend-dot" style={{ background: '#21805b' }} /> Disponible</span>
                <span><i className="legend-dot" style={{ background: '#cbd5e1' }} /> Ocupado</span>
                <span><i className="legend-dot" style={{ background: '#173473' }} /> Zona seleccionada</span>
              </div>
            </div>
          </div>

          {/* PANEL INFERIOR: ESTADO DE LA RESERVA */}
          <div className="dash-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="dash-reservation-title">Estado de tu Reserva</h3>
                <p className="dash-reservation-subtitle" style={{ margin: 0 }}>
                  Reserva registrada para tu usuario.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVistaActual('mis-reservas')}
                style={{
                  background: '#173473',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                Ver todas y Cancelar →
              </button>
            </div>

            {miReservaActiva ? (
              <div className="dash-status-card-active" style={{ marginTop: '16px' }}>
                <div className="dash-status-badge">Confirmada</div>
                <div className="dash-status-details">
                  <p><strong>Código de reserva:</strong> {miReservaActiva.codigo}</p>
                  <p><strong>Zona asignada:</strong> {miReservaActiva.zona}</p>
                  <p><strong>Fecha y hora:</strong> {miReservaActiva.fecha} · {miReservaActiva.hora}</p>
                </div>
              </div>
            ) : (
              <div className="dash-status-card-empty" style={{ marginTop: '16px' }}>
                <p>No tienes reservas registradas actualmente. Completa el formulario de arriba para solicitar tu cupo.</p>
              </div>
            )}
          </div>

          <footer className="dash-footer">
            <span>Universidad · ParkingU</span>
            <span>¿Necesitas ayuda? Contacta a Servicios Universitarios</span>
          </footer>
        </main>
      </div>

      {showToast && (
        <div className="dash-toast dash-toast-card">
          <div className="dash-toast-title">
            <span>✅</span>
            <strong>¡Reserva registrada con éxito!</strong>
          </div>
          <div className="dash-toast-sub">
            {aforos[zonaSeleccionada].nombre} | {fechaReserva} · {horaIngreso} hrs ({duracionHoras}h)
          </div>
        </div>
      )}
    </div>
  );
}