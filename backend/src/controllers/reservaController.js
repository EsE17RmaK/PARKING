import pool from '../config/db.js';
import { validarReglaCancelacion } from '../services/cancelacionService.js';

export const cancelarReservaEstudiante = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_reserva } = req.body;
    const idUsuario = req.usuario?.id_usuario;

    if (!id_reserva) {
      return res.status(400).json({ mensaje: 'ID de reserva requerido' });
    }

    await client.query('BEGIN');

    // 1. Obtener datos de la reserva asegurando propiedad del usuario
    const reservaQuery = `
      SELECT r.id_reserva, r.id_estudiante, r.id_plaza, r.fecha_reserva, 
             r.hora_inicio, r.estado_reserva
      FROM reservas r
      INNER JOIN estudiantes e ON e.id_estudiante = r.id_estudiante
      WHERE r.id_reserva = $1 AND e.id_usuario = $2 AND r.estado_reserva IN ('CONFIRMADA', 'PENDIENTE')
      FOR UPDATE;
    `;
    const reservaRes = await client.query(reservaQuery, [id_reserva, idUsuario]);

    if (reservaRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensaje: 'Reserva no encontrada o ya finalizada' });
    }

    const reserva = reservaRes.rows[0];

    // 2. Validar regla de las 2 horas (HU-09 / RF10 / RF11)
    const evaluacion = validarReglaCancelacion(reserva.fecha_reserva, reserva.hora_inicio);

    // 3. Actualizar estado de la reserva
    await client.query(
      `UPDATE reservas 
       SET estado_reserva = 'CANCELADA', fecha_cancelacion = NOW() 
       WHERE id_reserva = $1`,
      [id_reserva]
    );

    // 4. Liberar la plaza para que quede disponible (HU-09 Criterio 1)
    await client.query(
      `UPDATE plazas 
       SET estado_plaza = 'LIBRE' 
       WHERE id_plaza = $1`,
      [reserva.id_plaza]
    );

    // 5. Si fue tardía, registrar penalidad (RF11)
    if (evaluacion.aplicaPenalidad) {
      await client.query(
        `INSERT INTO penalidades (id_estudiante, motivo, fecha_sancion, estado)
         VALUES ($1, $2, NOW(), 'ACTIVA')`,
        [reserva.id_estudiante, evaluacion.motivo]
      );
    }

    await client.query('COMMIT');

    return res.status(200).json({
      mensaje: 'Reserva cancelada exitosamente',
      esOportuna: evaluacion.esOportuna,
      aplicaPenalidad: evaluacion.aplicaPenalidad,
      detalle: evaluacion.motivo,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al cancelar reserva (HU-09):', error);
    return res.status(500).json({ mensaje: 'Error al procesar la cancelación' });
  } finally {
    client.release();
  }
};