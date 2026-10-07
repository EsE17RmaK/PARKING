const db = require('../config/db');

class EstudianteRepository {
    static async buscarPorCodigo(codigo) {
        const query = `
            SELECT e.*, u.correo_institucional, u.nombre_completo 
            FROM ESTUDIANTES e
            JOIN USUARIOS u ON e.id_usuario = u.id_usuario
            WHERE e.codigo_estudiante = $1
        `;
        const { rows } = await db.query(query, [codigo]);
        return rows[0];
    }

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