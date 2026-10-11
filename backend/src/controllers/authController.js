// backend/src/controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    let entrada = (req.body.correo_institucional || req.body.correo || '').trim().toLowerCase();
    const contrasena = req.body.contrasena || req.body.password;

    if (!entrada || !contrasena) {
      return res.status(400).json({ mensaje: 'Credenciales incompletas.' });
    }

    // Si el usuario ingresó solo su código (ej: "u22000001"), completamos el dominio
    let correoBuscado = entrada;
    if (!correoBuscado.includes('@')) {
      correoBuscado = `${entrada}@utp.edu.pe`;
    }

    // Consulta en Supabase buscando por correo institucional o por código de estudiante
    const query = `
      SELECT 
        u.id_usuario,
        u.correo_institucional,
        u.contrasena_hash,
        u.nombre_completo,
        u.rol,
        e.id_estudiante,
        e.codigo_estudiante,
        e.promedio_academico,
        e.porcentaje_asistencia,
        e.condicion_pensiones,
        e.puntaje_prioridad,
        e.nivel_prioridad
      FROM usuarios u
      LEFT JOIN estudiantes e ON u.id_usuario = e.id_usuario
      WHERE LOWER(u.correo_institucional) = $1 
         OR LOWER(e.codigo_estudiante) = $2
      LIMIT 1;
    `;

    const result = await pool.query(query, [correoBuscado, entrada]);

    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const usuario = result.rows[0];

    // Validación segura con BCrypt
    let esValida = false;
    if (usuario.contrasena_hash && usuario.contrasena_hash.startsWith('$2')) {
      esValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    } else {
      esValida = (contrasena === usuario.contrasena_hash);
    }

    if (!esValida) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const secret = process.env.JWT_SECRET || 'admin_jwt_admin';
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol },
      secret,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      mensaje: '¡Inicio de sesión exitoso!',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo,
        correo_institucional: usuario.correo_institucional,
        rol: usuario.rol,
        codigo_estudiante: usuario.codigo_estudiante || 'ADM-001',
        promedio_academico: Number(usuario.promedio_academico || 0),
        porcentaje_asistencia: Number(usuario.porcentaje_asistencia || 0),
        condicion_pensiones: usuario.condicion_pensiones || 'AL DIA',
        puntaje_prioridad: Number(usuario.puntaje_prioridad || 0),
        nivel_prioridad: usuario.nivel_prioridad || 'Prioridad Baja',
      },
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = { login };