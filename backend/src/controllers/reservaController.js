import pool from '../config/db.js';
import { validarReglaCancelacion } from '../services/cancelacionService.js';

// 1. Crear reserva simple (Persiste en Supabase)
export const crearReservaSimple = async (req, res) => {
  try {
    const idUsuario = req.usuario?.id_usuario;
    const { fecha_reserva, hora_ingreso } = req.body;

    if (!fecha_reserva || !hora_ingreso) {
      return res.status(400).json({ mensaje: 'Fecha y hora de ingreso requeridas.' });
    }

    // Buscar al estudiante asociado al usuario autenticado
    const estRes = await pool.query(
      'SELECT id_estudiante, condicion_pensiones FROM estudiantes WHERE id_usuario = $1 LIMIT 1',
      [idUsuario]
    );

    if (estRes.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Perfil de estudiante no encontrado.' });
    }

    const { id_estudiante, condicion_pensiones } = estRes.rows[0];

    // Restricción por deudas de pensión (HU-03)
    if (condicion_pensiones?.toUpperCase() === 'CON DEUDA') {
      return res.status(403).json({ mensaje: 'Acceso restringido por cuotas pendientes.' });
    }

    // Insertar en la tabla reservas de Supabase
    const query = `
      INSERT INTO reservas (id_estudiante, fecha_reserva, horario, placa_vehiculo, estado_reserva)
      VALUES ($1, $2, $3, 'AUTOMATICO', 'CONFIRMADA')
      RETURNING id_reserva, fecha_reserva, horario, estado_reserva;
    `;

    const result = await pool.query(query, [id_estudiante, fecha_reserva, hora_ingreso]);
    const reservaCreada = result.rows[0];

    return res.status(201).json({
      mensaje: 'Reserva registrada con éxito en Supabase',
      reserva: {
        codigo: `RES-${String(reservaCreada.id_reserva).padStart(4, '0')}`,
        fecha: reservaCreada.fecha_reserva,
        hora: reservaCreada.horario,
        estado: reservaCreada.estado_reserva
      }
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    return res.status(500).json({ mensaje: 'Error interno al registrar la reserva en la base de datos.' });
  }
};

// 2. Cancelar reserva (tu lógica previa intacta)
export const cancelarReservaEstudiante = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_reserva } = req.body;
    const idUsuario = req.usuario?.id_usuario;

    if (!id_reserva) {
      return res.status(400).json({ mensaje: 'ID de reserva requerido' });
    }

    await client.query('BEGIN');

    const reservaQuery = `
      SELECT r.id_reserva, r.id_estudiante, r.fecha_reserva, r.horario, r.estado_reserva
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
    const evaluacion = validarReglaCancelacion(reserva.fecha_reserva, reserva.horario);

    await client.query(
      `UPDATE reservas 
       SET estado_reserva = 'CANCELADA' 
       WHERE id_reserva = $1`,
      [id_reserva]
    );

    if (evaluacion.aplicaPenalidad) {
      await client.query(
        `UPDATE estudiantes 
         SET penalidades = COALESCE(penalidades, 0) + 1 
         WHERE id_estudiante = $1`,
        [reserva.id_estudiante]
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