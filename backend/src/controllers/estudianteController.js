const pool = require('../config/db');
const { evaluarElegibilidadYPrioridad } = require('../services/prioridadService');

const getPrioridadEstudiante = async (req, res) => {
  try {
    const idUsuario = req.usuario?.id_usuario;

    if (!idUsuario) {
      return res.status(401).json({ mensaje: 'No autorizado. Token inválido o ausente.' });
    }

    const query = `
      SELECT 
        e.id_estudiante,
        e.codigo_estudiante,
        e.promedio_academico,
        e.porcentaje_asistencia,
        e.condicion_pensiones,
        e.puntaje_prioridad,
        e.nivel_prioridad,
        u.nombre_completo,
        COALESCE(
          (SELECT COUNT(*) FROM reservas r 
           WHERE r.id_estudiante = e.id_estudiante AND r.estado_reserva = 'PENALIZADO'), 0
        ) AS penalidades
      FROM estudiantes e
      INNER JOIN usuarios u ON u.id_usuario = e.id_usuario
      WHERE e.id_usuario = $1
      LIMIT 1;
    `;

    const result = await pool.query(query, [idUsuario]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Registro de estudiante no encontrado para este usuario.' });
    }

    const row = result.rows[0];

    const evaluacion = evaluarElegibilidadYPrioridad({
      promedioAcademico: row.promedio_academico,
      porcentajeAsistencia: row.porcentaje_asistencia,
      condicionPensiones: row.condicion_pensiones,
      penalidades: row.penalidades,
    });

    await pool.query(
      `UPDATE estudiantes 
       SET puntaje_prioridad = $1, nivel_prioridad = $2, fecha_actualizacion_etl = NOW()
       WHERE id_estudiante = $3`,
      [evaluacion.puntajePrioridad, evaluacion.nivelPrioridad, row.id_estudiante]
    );

    return res.status(200).json({
      estudiante: {
        nombreCompleto: row.nombre_completo,
        codigoEstudiante: row.codigo_estudiante,
      },
      evaluacion,
    });
  } catch (error) {
    console.error('Error al evaluar mérito y asistencia (HU-02):', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al procesar la prioridad académica.' });
  }
};

module.exports = {
  getPrioridadEstudiante,
};