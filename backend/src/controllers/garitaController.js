const pool = require('../config/db');

// Validar o consultar reserva por código QR o Matrícula (HU-06 Criterios 1, 2 y 3)
const consultarReservaGarita = async (req, res) => {
  try {
    const { codigo_reserva, matricula } = req.query;

    if (!codigo_reserva && !matricula) {
      return res.status(400).json({ mensaje: 'Debe ingresar un código QR o matrícula.' });
    }

    const query = `
      SELECT 
        r.id_reserva,
        r.fecha_reserva,
        r.hora_inicio,
        r.hora_fin,
        r.estado_reserva,
        p.codigo_plaza,
        p.zona,
        u.nombre_completo,
        v.placa
      FROM reservas r
      INNER JOIN estudiantes e ON e.id_estudiante = r.id_estudiante
      INNER JOIN usuarios u ON u.id_usuario = e.id_usuario
      INNER JOIN plazas p ON p.id_plaza = r.id_plaza
      LEFT JOIN vehiculos v ON v.id_estudiante = e.id_estudiante
      WHERE ($1::text IS NULL OR r.id_reserva = $1)
        AND ($2::text IS NULL OR v.placa ILIKE $2)
        AND r.estado_reserva IN ('CONFIRMADA', 'PENDIENTE')
      ORDER BY r.fecha_reserva DESC
      LIMIT 1;
    `;

    const result = await pool.query(query, [codigo_reserva || null, matricula || null]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        valido: false,
        mensaje: 'No se encontró una reserva activa para este vehículo o código.',
      });
    }

    const reserva = result.rows[0];

    return res.status(200).json({
      valido: true,
      mensaje: 'Reserva válida',
      reserva: {
        id: reserva.id_reserva,
        estudiante: reserva.nombre_completo,
        espacio: `${reserva.codigo_plaza} · ${reserva.zona}`,
        horario: `${reserva.hora_inicio} - ${reserva.hora_fin}`,
        placa: reserva.placa,
      },
    });
  } catch (error) {
    console.error('Error al consultar garita (HU-06):', error);
    return res.status(500).json({ mensaje: 'Error al consultar reserva en garita' });
  }
};

// Registrar acceso y marca de tiempo (HU-06 Criterio 4 / RF19)
const confirmarIngresoGarita = async (req, res) => {
  try {
    const { id_reserva } = req.body;

    if (!id_reserva) {
      return res.status(400).json({ mensaje: 'ID de reserva requerido' });
    }

    await pool.query(
      `UPDATE reservas 
       SET estado_reserva = 'UTILIZADA', fecha_ingreso = NOW() 
       WHERE id_reserva = $1`,
      [id_reserva]
    );

    return res.status(200).json({
      exito: true,
      mensaje: 'Ingreso registrado correctamente en garita',
    });
  } catch (error) {
    console.error('Error al registrar ingreso:', error);
    return res.status(500).json({ mensaje: 'Error interno al registrar ingreso' });
  }
};

module.exports = {
  consultarReservaGarita,
  confirmarIngresoGarita,
};