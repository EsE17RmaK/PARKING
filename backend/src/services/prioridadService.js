/**
 * Servicio de Validación Algorítmica y Prioridad (HU-02 / RF02)
 */
const UMBRAL_PROMEDIO = 14.0;
const UMBRAL_ASISTENCIA = 80.0;

const evaluarElegibilidadYPrioridad = ({
  promedioAcademico,
  porcentajeAsistencia,
  condicionPensiones = 'AL DIA',
  penalidades = 0,
}) => {
  const promedio = Number(promedioAcademico) || 0;
  const asistencia = Number(porcentajeAsistencia) || 0;
  const sanciones = Number(penalidades) || 0;

  // 1. Criterios HU-02
  const motivosRechazo = [];
  if (promedio < UMBRAL_PROMEDIO) {
    motivosRechazo.push(`Promedio académico insuficiente (${promedio} < ${UMBRAL_PROMEDIO})`);
  }
  if (asistencia < UMBRAL_ASISTENCIA) {
    motivosRechazo.push(`Porcentaje de asistencia insuficiente (${asistencia}% < ${UMBRAL_ASISTENCIA}%)`);
  }

  const esApto = motivosRechazo.length === 0;

  // 2. Cálculo algorítmico: Prioridad = Mérito + Asistencia + Pensión - Penalidades
  const puntajeMerito = (promedio / 20) * 40;
  const puntajeAsistencia = (asistencia / 100) * 40;
  const puntajePension = String(condicionPensiones).toUpperCase() === 'AL DIA' ? 20 : 0;
  const penalizacionPuntos = sanciones * 10;

  let puntajeTotal = puntajeMerito + puntajeAsistencia + puntajePension - penalizacionPuntos;
  if (puntajeTotal < 0) puntajeTotal = 0;
  puntajeTotal = Math.round(puntajeTotal * 100) / 100;

  let nivelPrioridad = 'Baja';
  if (puntajeTotal >= 80) {
    nivelPrioridad = 'Prioridad Alta';
  } else if (puntajeTotal >= 60) {
    nivelPrioridad = 'Prioridad Media';
  }

  return {
    esApto,
    estadoEvaluacion: esApto ? 'Aprobado' : 'Rechazado',
    motivosRechazo,
    puntajePrioridad: puntajeTotal,
    nivelPrioridad,
    detalles: {
      promedio,
      asistencia,
      condicionPensiones,
      penalidades: sanciones,
    },
  };
};

module.exports = {
  evaluarElegibilidadYPrioridad,
};