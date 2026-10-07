require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

async function ejecutarETL() {
  const client = await pool.connect();
  try {
    console.log("🚀 Iniciando Carga Masiva (ETL) a Supabase...");

    // 1. Cargar Secciones
    const seccionesPath = path.join(__dirname, 'secciones_horarios_300.csv');
    if (!fs.existsSync(seccionesPath)) {
      throw new Error(`No se encontró el archivo: ${seccionesPath}`);
    }
    const lineasSecciones = fs.readFileSync(seccionesPath, 'utf-8').split('\n').filter(l => l.trim());
    console.log(`📄 Procesando ${lineasSecciones.length - 1} secciones...`);

    for (let i = 1; i < lineasSecciones.length; i++) {
      const col = lineasSecciones[i].split(',');
      if (col.length < 4) continue;
      const codigo_seccion = col[0].trim();
      const nombre_curso = col[1].trim();
      const campus_sede = col[2].trim();
      const modalidad = col[3].trim();

      await client.query(`
        INSERT INTO SECCIONES (codigo_seccion, nombre_curso, campus_sede, modalidad)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (codigo_seccion) DO NOTHING;
      `, [codigo_seccion, nombre_curso, campus_sede, modalidad]);
    }
    console.log("✅ Secciones cargadas con éxito en Supabase.");

    // 2. Cargar Alumnos y Usuarios
    const alumnosPath = path.join(__dirname, 'alumnos_matriculados_300.csv');
    if (!fs.existsSync(alumnosPath)) {
      throw new Error(`No se encontró el archivo: ${alumnosPath}`);
    }
    const lineasAlumnos = fs.readFileSync(alumnosPath, 'utf-8').split('\n').filter(l => l.trim());
    console.log(`📄 Procesando ${lineasAlumnos.length - 1} alumnos...`);

    let countAlumnos = 0;
    for (let i = 1; i < lineasAlumnos.length; i++) {
      const col = lineasAlumnos[i].split(',');
      if (col.length < 10) continue;

      const codigo_estudiante = col[0].trim();
      const dni = col[1].trim();
      const nombres_apellidos = col[2].trim();
      const correo_institucional = col[3].trim();
      const celular = col[4].trim();
      const promedio_academico = parseFloat(col[5]) || 0;
      const porcentaje_asistencia = parseFloat(col[6]) || 0;
      const merito_academico = col[7] ? col[7].trim() : '-';
      const condicion_pensiones = (col[8] && col[8].trim().toUpperCase() === 'TRUE') ? 'AL DIA' : 'MOROSO';
      const codigos_seccion = col[10] ? col[10].trim().split('|') : [];

      // A) Insertar Usuario
      const resUser = await client.query(`
        INSERT INTO USUARIOS (correo_institucional, contrasena_hash, nombre_completo, dni, celular, rol, estado)
        VALUES ($1, '$2b$10$e8T3y1234567890123456u', $2, $3, $4, 'ESTUDIANTE', 'ACTIVO')
        ON CONFLICT (correo_institucional) DO UPDATE SET nombre_completo = EXCLUDED.nombre_completo
        RETURNING id_usuario;
      `, [correo_institucional, nombres_apellidos, dni, celular]);

      const id_usuario = resUser.rows[0].id_usuario;

      // B) Insertar Estudiante
      const resEst = await client.query(`
        INSERT INTO ESTUDIANTES (id_usuario, codigo_estudiante, promedio_academico, porcentaje_asistencia, condicion_pensiones, merito_academico)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (codigo_estudiante) DO NOTHING
        RETURNING id_estudiante;
      `, [id_usuario, codigo_estudiante, promedio_academico, porcentaje_asistencia, condicion_pensiones, merito_academico]);

      let id_estudiante = resEst.rows[0]?.id_estudiante;

      if (!id_estudiante) {
        const estExist = await client.query(`SELECT id_estudiante FROM ESTUDIANTES WHERE codigo_estudiante = $1`, [codigo_estudiante]);
        id_estudiante = estExist.rows[0]?.id_estudiante;
      }

      // C) Insertar Matrículas
      if (id_estudiante) {
        for (const codSec of codigos_seccion) {
          if (!codSec) continue;
          const secRes = await client.query(`SELECT id_seccion FROM SECCIONES WHERE codigo_seccion = $1`, [codSec.trim()]);
          if (secRes.rows.length > 0) {
            const id_seccion = secRes.rows[0].id_seccion;
            await client.query(`
              INSERT INTO MATRICULAS_ESTUDIANTE (id_estudiante, id_seccion)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING;
            `, [id_estudiante, id_seccion]);
          }
        }
      }

      countAlumnos++;
    }

    console.log(`🎉 Carga masiva completada exitosamente!`);
    console.log(`📊 Total alumnos cargados: ${countAlumnos}`);

  } catch (err) {
    console.error("❌ Error en la carga ETL:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

ejecutarETL();