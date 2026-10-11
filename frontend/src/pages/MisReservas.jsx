import React, { useState } from 'react';
import '../styles/MisReservas.css';

const defaultReservations = [
  {
    id: "PU-08246",
    date: "24 sept · 08:00–10:00 · A-03",
    zone: "Zona A",
    plate: "ABC-123",
    status: "Confirmada",
    esCancelacionSinPenalidad: true, // Cumple > 2h de anticipación (HU-09)
  },
  {
    id: "PU-08257",
    date: "25 sept · 10:00–12:00 · A-05",
    zone: "Zona A",
    plate: "ABC-123",
    status: "Pendiente",
    esCancelacionSinPenalidad: true,
  },
  {
    id: "PU-08268",
    date: "28 sept · 08:00–10:00 · B-02",
    zone: "Zona B",
    plate: "ABC-123",
    status: "Confirmada",
    esCancelacionSinPenalidad: true,
  },
];

export default function MisReservas({ onBackToDashboard }) {
  const [items, setItems] = useState(defaultReservations);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [activeTab, setActiveTab] = useState('proximas');

  const confirmCancellation = () => {
    if (!selectedReservation) return;
    // Liberar la reserva localmente tras la confirmación de la HU-09
    setItems((current) => current.filter((item) => item.id !== selectedReservation.id));
    setSelectedReservation(null);
  };

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
          <div className="profile__avatar">MV</div>
          <div>
            <p className="profile__name">María Valdez</p>
            <p className="profile__meta">Estudiante · 20241028</p>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="mis-reservas__content">
        <section className="reservations-card">
          <div className="reservations-card__intro">
            <div className="reservations-card__heading">
              <h1>Mis Reservas</h1>
              <p>{items.length} reservas próximas</p>
            </div>
            <p className="reservations-card__description">
              Gestiona tus visitas al campus y cancela oportunamente para evitar penalizaciones (HU-09).
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
              Anteriores
            </button>
          </div>

          <div className="reservations-list">
            {items.map((reservation) => (
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
                    Reserva {reservation.id} · {reservation.zone} · {reservation.plate}
                  </p>
                </div>

                <div
                  className={`reservation__status ${
                    reservation.status === 'Pendiente' ? 'reservation__status--pending' : ''
                  }`}
                >
                  <span>{reservation.status}</span>
                </div>

                <div className="reservation__actions">
                  <button className="button button--qr" type="button">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Ver QR
                  </button>
                  <button
                    className="button button--cancel"
                    onClick={() => setSelectedReservation(reservation)}
                    type="button"
                  >
                    Cancelar
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="access-info">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p>Las cancelaciones realizadas con más de 2 horas de anticipación no acumulan penalidades en tu récord.</p>
          </div>
        </section>

        <footer className="site-footer">
          <p>Universidad · ParkingU</p>
          <p>¿Necesitas ayuda? Contacta a Servicios Universitarios</p>
        </footer>
      </main>

      {/* MODAL DE CANCELACIÓN (HU-09) */}
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
              <p>El espacio se liberará automáticamente para otros estudiantes.</p>
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
                  Reserva {selectedReservation.id} · {selectedReservation.zone}
                </p>
              </div>
            </div>

            {/* Regla de negocio HU-09 */}
            <div className="cancel-dialog__condition">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p>Cancelación sin penalidad (más de 2h de anticipación)</p>
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