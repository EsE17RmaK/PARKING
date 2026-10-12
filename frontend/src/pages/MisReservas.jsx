import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import '../styles/MisReservas.css';

export default function MisReservas({ onBackToDashboard }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [activeTab, setActiveTab] = useState('proximas');

  const [usuario, setUsuario] = useState({
    nombre_completo: 'Estudiante UTP',
    codigo_estudiante: '---'
  });

  // 1. Obtener reservas reales del estudiante desde Supabase
  const cargarMisReservas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/reservas/mis-reservas');
      setItems(res.data || []);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sesion = localStorage.getItem('usuario');
    if (sesion) {
      try {
        const u = JSON.parse(sesion);
        setUsuario({
          nombre_completo: u.nombre_completo || u.nombre || 'Estudiante UTP',
          codigo_estudiante: u.codigo_estudiante || '---'
        });
      } catch (e) {
        console.error('Error al leer sesión:', e);
      }
    }
    cargarMisReservas();
  }, []);

  // 2. Cancelar la reserva en Supabase
  const confirmCancellation = async () => {
    if (!selectedReservation) return;

    try {
      const res = await api.post('/api/reservas/cancelar', {
        id_reserva: selectedReservation.id_real || selectedReservation.id
      });

      alert(res.data?.mensaje || 'Reserva cancelada con éxito.');
      setSelectedReservation(null);
      cargarMisReservas(); // Recargar el listado actualizado
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      alert(error.response?.data?.mensaje || 'No se pudo cancelar la reserva.');
    }
  };

  const getIniciales = (nombre) => {
    if (!nombre) return 'UT';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    return partes[0].substring(0, 2).toUpperCase();
  };

  // Filtrado según estado simple (Próximas vs Anteriores)
  const reservasFiltradas = items.filter((r) => {
    if (activeTab === 'proximas') {
      return r.status === 'CONFIRMADA' || r.status === 'PENDIENTE';
    }
    return r.status === 'CANCELADA' || r.status === 'UTILIZADA';
  });

  return (
    <div className="mis-reservas">
      {/* Header superior */}
      <header className="site-header">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={onBackToDashboard}>
          <div className="brand__mark">P</div>
          <div>
            <p className="brand__eyebrow">Universidad</p>
            <p className="brand__name">ParkingU</p>
          </div>
        </div>

        <div className="profile">
          <div className="profile__avatar">{getIniciales(usuario.nombre_completo)}</div>
          <div>
            <p className="profile__name">{usuario.nombre_completo}</p>
            <p className="profile__meta">Estudiante · {usuario.codigo_estudiante}</p>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="mis-reservas__content">
        <section className="reservations-card">
          <div className="reservations-card__intro">
            <div className="reservations-card__heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  style={{
                    background: '#edf2fc',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    color: '#173473',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  ← Volver al Inicio
                </button>
                <h1 style={{ margin: 0 }}>Mis Reservas</h1>
              </div>
              <p>{reservasFiltradas.length} reservas registradas</p>
            </div>
            <p className="reservations-card__description">
              Visualiza tus reservas activas o libera tu lugar en el campus si ya no vas a asistir.
            </p>
          </div>

          <div className="reservations-tabs" role="tablist">
            <button
              className={`reservations-tabs__tab ${
                activeTab === 'proximas' ? 'reservations-tabs__tab--active' : ''
              }`}
              onClick={() => setActiveTab('proximas')}
              type="button"
            >
              Próximas
            </button>
            <button
              className={`reservations-tabs__tab ${
                activeTab === 'anteriores' ? 'reservations-tabs__tab--active' : ''
              }`}
              onClick={() => setActiveTab('anteriores')}
              type="button"
            >
              Canceladas / Pasadas
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '36px', color: '#6b7280' }}>
              Cargando reservas desde Supabase...
            </p>
          ) : reservasFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
              <p>No tienes reservas en esta sección.</p>
            </div>
          ) : (
            <div className="reservations-list">
              {reservasFiltradas.map((reservation) => (
                <article className="reservation" key={reservation.id}>
                  <div className="reservation__calendar">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>

                  <div className="reservation__details">
                    <p className="reservation__date">{reservation.date}</p>
                    <p className="reservation__meta">
                      Código: <b>{reservation.id}</b> · {reservation.zone}
                    </p>
                  </div>

                  <div
                    className={`reservation__status ${
                      reservation.status === 'CANCELADA' ? 'reservation__status--pending' : ''
                    }`}
                  >
                    <span>{reservation.status}</span>
                  </div>

                  {/* Botón de Cancelar solo para reservas activas */}
                  {(reservation.status === 'CONFIRMADA' || reservation.status === 'PENDIENTE') && (
                    <div className="reservation__actions">
                      <button
                        className="button button--cancel"
                        onClick={() => setSelectedReservation(reservation)}
                        type="button"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          <div className="access-info">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p>Al cancelar tu reserva, el lugar se liberará inmediatamente para que otro estudiante pueda solicitarlo.</p>
          </div>
        </section>

        <footer className="site-footer">
          <p>Universidad · ParkingU</p>
          <p>¿Necesitas ayuda? Contacta a Servicios Universitarios</p>
        </footer>
      </main>

      {/* MODAL SIMPLE DE CANCELACIÓN */}
      {selectedReservation && (
        <div className="cancel-dialog" role="dialog" aria-modal="true">
          <button
            className="cancel-dialog__backdrop"
            onClick={() => setSelectedReservation(null)}
            type="button"
          />

          <div className="cancel-dialog__panel">
            <div className="cancel-dialog__header">
              <div className="cancel-dialog__calendar">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
              <button
                className="cancel-dialog__close"
                onClick={() => setSelectedReservation(null)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="cancel-dialog__message">
              <h2>¿Desea cancelar su reserva?</h2>
              <p>El cupo seleccionado se liberará de inmediato en el sistema del campus.</p>
            </div>

            <div className="cancel-dialog__reservation">
              <svg width="20" height="20" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
              <div>
                <p className="cancel-dialog__date">{selectedReservation.date}</p>
                <p className="cancel-dialog__meta">
                  Código: <b>{selectedReservation.id}</b> · {selectedReservation.zone}
                </p>
              </div>
            </div>

            <div className="cancel-dialog__actions">
              <button
                className="button button--keep"
                onClick={() => setSelectedReservation(null)}
                type="button"
              >
                Mantener reserva
              </button>
              <button
                className="button button--confirm"
                onClick={confirmCancellation}
                type="button"
              >
                Sí, cancelar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}