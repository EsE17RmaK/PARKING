// backend/src/services/cancelacionService.js
/**
 * HU-09: Cancelación oportuna de reserva
 * Regla: Cancelación con > 2 horas de anticipación es sin penalidad (RF10).
 * Menor o igual a 2 horas genera penalidad (RF11).
 */
export const validarReglaCancelacion = (fechaReserva, horaInicioStr) => {
  // Construir fecha/hora completa del turno (Ej: "2026-10-12" y "08:00")
  const [hora, minuto] = horaInicioStr.split(':').map(Number);
  const fechaTurno = new Date(fechaReserva);
  fechaTurno.setHours(hora, minuto, 0, 0);

  const ahora = new Date();
  const diferenciaMs = fechaTurno.getTime() - ahora.getTime();
  const horasAnticipacion = diferenciaMs / (1000 * 60 * 60);

  const esOportuna = horasAnticipacion > 2.0;

  return {
    esOportuna,
    horasAnticipacion: Math.round(horasAnticipacion * 10) / 10,
    aplicaPenalidad: !esOportuna,
    motivo: esOportuna 
      ? 'Cancelación oportuna (más de 2 horas de anticipación)' 
      : 'Cancelación tardía (menos de 2 horas de anticipación)',
  };
};