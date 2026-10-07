const db = require('../config/db');

class EstudianteRepository {
    // 1. SEGURIDAD SQL
    static async buscarPorCodigo(codigo) {
        const query = `
            SELECT e.*, u.correo_institucional, u.nombre_completo 
            FROM ESTUDIANTES e
            INNER JOIN USUARIOS u ON e.id_usuario = u.id_usuario
            WHERE e.codigo_estudiante = $1
        `;
        const { rows } = await db.query(query, [codigo]);
        return rows[0];
    }

    // FORMULA DE PRIORIDAD
    static async obtenerEstudiantesAptosPrioridad() {
        const query = `
            SELECT e.*, u.nombre_completo
            FROM ESTUDIANTES e
            INNER JOIN USUARIOS u ON e.id_usuario = u.id_usuario
            WHERE e.promedio_academico >= 14.0
              AND e.porcentaje_asistencia >= 80.0
              AND e.condicion_pensiones = 'AL DIA'
            ORDER BY e.promedio_academico DESC;
        `;
        const { rows } = await db.query(query);
        return rows;
    }

    // NIVEL DE PRIORIDAD
    static async actualizarPrioridad(idEstudiante, puntaje, nivel) {
        const query = `
            UPDATE ESTUDIANTES 
            SET puntaje_prioridad = $1, nivel_prioridad = $2
            WHERE id_estudiante = $3
        `;
        await db.query(query, [puntaje, nivel, idEstudiante]);
    }
}

module.exports = EstudianteRepository;