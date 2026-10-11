const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarJWT } = require('../middlewares/authMiddleware');

/**
 * HU-09: Cancelación oportuna de reserva
 * RF10: > 2 horas de anticipación -> cancela sin penalidad y libera plaza.
 * RF11: <= 2 horas -> cancela, libera plaza y registra penalidad.
 */
router.post('/cancelar', verificarJWT, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_reserva } = req.body;
    const idUsuario = req.usuario?.id_usuario;

    if (!id_reserva) {
      return res.status(400).json({ mensaje: 'Debe especificar el id_reserva' });
    }

    await client.query('BEGIN');

    // 1. Obtener la reserva validando pertenencia al usuario autenticado
    const queryReserva = `
      SELECT r.id_reserva, r.id_estudiante, r.id_espacio, r.fecha_reserva, 
             r.hora_inicio, r.estado_reserva
      FROM reservas r
      INNER JOIN estudiantes e ON e.id_estudiante = r.id_estudiante
      WHERE r.id_reserva = $1 AND e.id_usuario = $2
        AND r.estado_reserva IN ('CONFIRMADA', 'PENDIENTE')
      FOR UPDATE;
    `;
    const resultado = await client.query(queryReserva, [id_reserva, idUsuario]);

    if (resultado.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensaje: 'Reserva no encontrada o no susceptible de cancelación' });
    }

    const reserva = resultado.rows[0];

    // 2. Evaluar regla algorítmica de 2 horas (HU-09)
    const fechaHoraTurno = new Date(`${reserva.fecha_reserva}T${reserva.hora_inicio}`);
    const ahora = new Date();
    const diferenciaHoras = (fechaHoraTurno.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    const esCancelacionOportuna = diferenciaHoras > 2.0;

    // 3. Cambiar estado de la reserva
    await client.query(
      `UPDATE reservas 
       SET estado_reserva = 'CANCELADA' 
       WHERE id_reserva = $1`,
      [id_reserva]
    );

    // 4. Liberar la plaza para futuros estudiantes (RF10 / HU-09)
    if (reserva.id_espacio) {
      await client.query(
        `UPDATE espacios_estacionamiento 
         SET estado = 'LIBRE' 
         WHERE id_espacio = $1`,
        [reserva.id_espacio]
      );
    }

    // 5. Aplicar penalidad si la cancelación fue tardía (RF11 / HU-10)
    let penalidadRegistrada = false;
    if (!esCancelacionOportuna) {
      penalidadRegistrada = true;
      await client.query(
        `UPDATE estudiantes 
         SET penalidades = COALESCE(penalidades, 0) + 1 
         WHERE id_estudiante = $1`,
        [reserva.id_estudiante]
      );
    }

    await client.query('COMMIT');

    return res.status(200).json({
      exito: true,
      esCancelacionOportuna,
      penalidadAplicada: penalidadRegistrada,
      mensaje: esCancelacionOportuna
        ? 'Reserva cancelada exitosamente sin penalidad (más de 2 horas de anticipación).'
        : 'Reserva cancelada con penalidad registrada (menos de 2 horas de anticipación).',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al cancelar reserva en HU-09:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al procesar la cancelación' });
  } finally {
    client.release();
  }
});

module.exports = router;