import React, { useState } from 'react';
import '../styles/GaritaControl.css';

export default function GaritaControl() {
  const [reserva, setReserva] = useState({
    id: 'RS-00231',
    estudiante: 'Ana Torres',
    espacio: 'A-03',
    horario: '08:00 - 10:00',
    placa: 'ABC-123',
    valida: true,
  });

  const handleManualEntry = () => {
    const input = window.prompt("Ingresa el código de reserva o placa:");
    if (input) {
      alert(`Buscando reserva para: ${input}`);
    }
  };

  const handleConfirm = () => {
    window.alert(`¡Ingreso vehicular confirmado con éxito para ${reserva.estudiante} (${reserva.placa})!`);
  };

  return (
    <main className="garita">
      {/* HEADER */}
      <header className="garita__header">
        <div className="garita__identity">
          <div className="garita__product">
            <div className="garita__brand" aria-hidden="true">P</div>
            <div className="garita__product-name">
              <span>Universidad</span>
              <strong>ParkingU</strong>
            </div>
          </div>

          <div className="garita__security">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Seguridad</span>
          </div>
        </div>

        <div className="garita__operator">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Carlos G. · Turno mañana</span>
        </div>

        <div className="garita__title">
          <h1>G03 · Validar Ingreso (Escaneo QR)</h1>
        </div>
      </header>

      {/* CONTENIDO DUAL */}
      <section className="garita__content" aria-label="Control de ingreso">
        {/* Lector QR */}
        <div className="garita__scanner-section">
          <div className="garita__camera">
            <div className="garita__camera-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                LECTOR QR
              </span>
              <span>G03</span>
            </div>

            <div className="garita__scan-area" aria-hidden="true">
              <span className="garita__corner garita__corner--top-left" />
              <span className="garita__corner garita__corner--top-right" />
              <span className="garita__corner garita__corner--bottom-left" />
              <span className="garita__corner garita__corner--bottom-right" />
              <svg width="60" height="60" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span className="garita__scan-line" />
            </div>

            <p>Apunta la cámara al código QR</p>
          </div>

          <button
            className="garita__manual-button"
            type="button"
            onClick={handleManualEntry}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="6" y1="8" x2="6.01" y2="8" />
              <line x1="10" y1="8" x2="10.01" y2="8" />
              <line x1="14" y1="8" x2="14.01" y2="8" />
              <line x1="18" y1="8" x2="18.01" y2="8" />
              <line x1="6" y1="12" x2="18" y2="12" />
            </svg>
            <span>Ingresar código manualmente</span>
          </button>
        </div>

        {/* Tarjeta de Reserva Válida */}
        <article className="garita__reservation">
          <div className="garita__validity">
            <span className="garita__validity-icon">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <h2>Reserva válida</h2>
          </div>

          <p className="garita__reservation-details">
            <strong>{reserva.estudiante}</strong>
            <span> · Espacio {reserva.espacio} · {reserva.horario}</span>
          </p>

          <p className="garita__instructions">
            Verifica los datos antes de autorizar el acceso vehicular.
          </p>

          <button
            className="garita__confirm-button"
            type="button"
            onClick={handleConfirm}
          >
            <span>Confirmar ingreso</span>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </article>
      </section>
    </main>
  );
}