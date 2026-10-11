import pool from '../config/db.js';
import { validarSolvenciaFinanciera } from '../services/financieroService.js';

export const verificarEstadoFinanciero = async (req, res) => {
  try {
    const idUsuario = req.usuario?.id_usuario;

    if (!idUsuario) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    const query = `
      SELECT 
        e.id_estudiante,
        e.codigo_estudiante,
        e.condicion_pensiones,
        COALESCE(e.cuotas_vencidas, 0) AS cuotas_vencidas
      FROM estudiantes e
      WHERE e.id_usuario = $1
      LIMIT 1;
    `;

    const result = await pool.query(query, [idUsuario]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const row = result.rows[0];
    const evaluacionFinanciera = validarSolvenciaFinanciera(
      row.condicion_pensiones,
      row.cuotas_vencidas
    );

    return res.status(200).json({
      codigoEstudiante: row.codigo_estudiante,
      ...evaluacionFinanciera
    });
  } catch (error) {
    console.error('Error al verificar solvencia financiera (HU-03):', error);
    return res.status(500).json({ mensaje: 'Error al consultar estado financiero' });
  }
};