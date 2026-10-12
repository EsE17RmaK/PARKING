const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarJWT } = require('../middlewares/authMiddleware');

/**
 * 1. GUARDAR RESERVA SIMPLE
 * Endpoint: POST /api/reservas
 * Recibe únicamente: { fecha_reserva, hora_ingreso, duracion_horas, zona }
 */
router.post('/', verificarJWT, async (req, res) => {
  try {
    const idUsuario = req.usuario?.id_usuario;
    const { fecha_reserva, hora_ingreso, duracion_horas, zona } = req.body;

    if (!fecha_reserva || !hora_ingreso) {
      return res.status(400).json({ mensaje: 'Fecha y hora requeridas.' });
    }

    // Obtener estudiante autenticado
    const estRes = await pool.query(
      'SELECT id_estudiante, condicion_pensiones FROM estudiantes WHERE id_usuario = $1 LIMIT 1',
      [idUsuario]
    );

    if (estRes.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado.' });
    }

    const { id_estudiante, condicion_pensiones } = estRes.rows[0];

    // Validación HU-03: Solvencia financiera
    if (condicion_pensiones?.toUpperCase() === 'CON DEUDA') {
      return res.status(403).json({ mensaje: 'Acceso restringido por cuotas pendientes.' });
    }

    // Identificar zona seleccionada
    let idZona = null;
    let nombreZona = 'Zona General';
    if (zona) {
      const zRes = await pool.query(
        'SELECT id_zona, nombre_zona FROM zonas_estacionamiento WHERE codigo_zona = $1 LIMIT 1',
        [zona]
      );
      if (zRes.rows.length > 0) {
        idZona = zRes.rows[0].id_zona;
        nombreZona = zRes.rows[0].nombre_zona;
      }
    }

    const duracion = duracion_horas || 4;
    const detalleEstadia = `${hora_ingreso} (${duracion}h)`;

    // Se asigna 'AUTOMATICO' en placa_vehiculo para evitar el error de constraint NOT NULL
    const query = `
      INSERT INTO reservas (id_estudiante, id_zona, fecha_reserva, horario, placa_vehiculo, estado_reserva)
      VALUES ($1, $2, $3, $4, 'AUTOMATICO', 'CONFIRMADA')
      RETURNING id_reserva, fecha_reserva, estado_reserva;
    `;
    const resultado = await pool.query(query, [id_estudiante, idZona, fecha_reserva, detalleEstadia]);
    const nueva = resultado.rows[0];

    return res.status(201).json({
      mensaje: 'Reserva registrada con éxito',
      reserva: {
        codigo: `RES-${String(nueva.id_reserva).padStart(4, '0')}`,
        fecha: nueva.fecha_reserva,
        hora: hora_ingreso,
        duracion: `${duracion} horas`,
        zona: nombreZona,
        estado: nueva.estado_reserva
      }
    });
  } catch (error) {
    console.error('Error al guardar reserva:', error);
    return res.status(500).json({ mensaje: 'Error al registrar la reserva en la base de datos.' });
  }
});

/**
 * 2. LISTAR MIS RESERVAS (Estudiante)
 * Endpoint: GET /api/reservas/mis-reservas
 */
router.get('/mis-reservas', verificarJWT, async (req, res) => {
  try {
    const idUsuario = req.usuario?.id_usuario;

    const query = `
      SELECT r.id_reserva, r.fecha_reserva, r.horario, r.estado_reserva,
             COALESCE(z.nombre_zona, 'Zona General') AS zona
      FROM reservas r
      INNER JOIN estudiantes e ON e.id_estudiante = r.id_estudiante
      LEFT JOIN zonas_estacionamiento z ON z.id_zona = r.id_zona
      WHERE e.id_usuario = $1
      ORDER BY r.id_reserva DESC;
    `;
    const resultado = await pool.query(query, [idUsuario]);

    const lista = resultado.rows.map((row) => ({
      id: `RES-${String(row.id_reserva).padStart(4, '0')}`,
      id_real: row.id_reserva,
      date: `${row.fecha_reserva} · ${row.horario}`,
      zone: row.zona,
      status: row.estado_reserva,
      esCancelacionSinPenalidad: true
    }));

    return res.status(200).json(lista);
  } catch (error) {
    console.error('Error al listar reservas:', error);
    return res.status(500).json({ mensaje: 'Error al obtener reservas.' });
  }
});

/**
 * 3. CANCELAR RESERVA SIMPLE (Directo, sin penalidades)
 * Endpoint: POST /api/reservas/cancelar
 */
router.post('/cancelar', verificarJWT, async (req, res) => {
  try {
    const { id_reserva } = req.body;
    const idUsuario = req.usuario?.id_usuario;

    if (!id_reserva) {
      return res.status(400).json({ mensaje: 'ID de reserva requerido.' });
    }

    const idLimpio = String(id_reserva).replace('RES-', '');

    const query = `
      UPDATE reservas r
      SET estado_reserva = 'CANCELADA'
      FROM estudiantes e
      WHERE r.id_reserva = $1 
        AND r.id_estudiante = e.id_estudiante 
        AND e.id_usuario = $2
        AND r.estado_reserva = 'CONFIRMADA'
      RETURNING r.id_reserva;
    `;
    const resultado = await pool.query(query, [idLimpio, idUsuario]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada o ya cancelada.' });
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Reserva cancelada exitosamente.'
    });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    return res.status(500).json({ mensaje: 'Error al procesar la cancelación.' });
  }
});

/**
 * 4. LISTAR RESERVAS DEL DÍA (Para la Garita)
 * Endpoint: GET /api/reservas/garita/dia
 */
router.get('/garita/dia', verificarJWT, async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaFiltro = fecha || new Date().toISOString().split('T')[0];

    const query = `
      SELECT r.id_reserva, r.fecha_reserva, r.horario, r.estado_reserva,
             u.nombre_completo, e.codigo_estudiante,
             COALESCE(z.nombre_zona, 'General') AS zona
      FROM reservas r
      INNER JOIN estudiantes e ON e.id_estudiante = r.id_estudiante
      INNER JOIN usuarios u ON u.id_usuario = e.id_usuario
      LEFT JOIN zonas_estacionamiento z ON z.id_zona = r.id_zona
      WHERE r.fecha_reserva = $1 AND r.estado_reserva = 'CONFIRMADA'
      ORDER BY r.id_reserva ASC;
    `;
    const resultado = await pool.query(query, [fechaFiltro]);

    return res.status(200).json({
      fecha: fechaFiltro,
      total_reservas: resultado.rows.length,
      reservas: resultado.rows.map(r => ({
        codigo: `RES-${String(r.id_reserva).padStart(4, '0')}`,
        estudiante: r.nombre_completo,
        codigo_estudiante: r.codigo_estudiante,
        hora_duracion: r.horario,
        zona: r.zona,
        estado: r.estado_reserva
      }))
    });
  } catch (error) {
    console.error('Error al consultar garita:', error);
    return res.status(500).json({ mensaje: 'Error al consultar reservas del día.' });
  }
});

module.exports = router;