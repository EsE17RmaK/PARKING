// backend/src/services/etlService.js
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

function buscarRutaCSV(nombreArchivo) {
  const rutas = [
    path.join(process.cwd(), nombreArchivo),
    path.join(process.cwd(), 'backend', nombreArchivo),
    path.resolve(__dirname, '../../..', nombreArchivo),
    path.resolve(__dirname, '../..', nombreArchivo),
  ];
  for (const r of rutas) {
    if (fs.existsSync(r)) return r;
  }
  throw new Error(`No se encontró el archivo: ${nombreArchivo}`);
}

async function importarCSVs() {
  console.log("🔄 Iniciando Ingesta ETL de Archivos CSV...");

  try {
    // Hash BCrypt universal para los estudiantes del CSV
    const contrasenaPlana = 'Password123!';
    const hashValido = await bcrypt.hash(contrasenaPlana, 10);

    // 1. Ingesta de Cursos y Horarios (secciones_horarios_300.csv)
    const rutaSecciones = buscarRutaCSV('secciones_horarios_300.csv');
    const lineasSecciones = fs.readFileSync(rutaSecciones, 'utf-8').split('\n').filter(l => l.trim());
    console.log(`📚 1. Guardando ${lineasSecciones.length - 1} secciones...`);

    for (let i = 1; i < lineasSecciones.length; i++) {
      const col = lineasSecciones[i].split(',');
      if (col.length < 4) continue;

      const codigo_seccion = col[0].trim();
      const nombre_curso = col[1].trim();
      const campus_sede = col[2].trim();
      const modalidad = col[3].trim();

      await db.query(`
        INSERT INTO SECCIONES (codigo_seccion, nombre_curso, campus_sede, modalidad)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (codigo_seccion) DO UPDATE 
        SET nombre_curso = EXCLUDED.nombre_curso,
            campus_sede = EXCLUDED.campus_sede,
            modalidad = EXCLUDED.modalidad;
      `, [codigo_seccion, nombre_curso, campus_sede, modalidad]);
    }
    console.log("✅ Secciones importadas correctamente.");

    // 2. Ingesta de Alumnos Matriculados (alumnos_matriculados_300.csv)
    const rutaAlumnos = buscarRutaCSV('alumnos_matriculados_300.csv');
    const lineasAlumnos = fs.readFileSync(rutaAlumnos, 'utf-8').split('\n').filter(l => l.trim());
    console.log(`👨‍🎓 2. Guardando ${lineasAlumnos.length - 1} alumnos...`);

    let totalAlumnos = 0;

    for (let i = 1; i < lineasAlumnos.length; i++) {
      const col = lineasAlumnos[i].split(',');
      if (col.length < 9) continue;

      const codigo_estudiante = col[0].trim();
      const dni = col[1].trim();
      const nombres_apellidos = col[2].trim();
      const correo_institucional = col[3].trim().toLowerCase();
      const celular = col[4].trim();
      const promedio_academico = parseFloat(col[5]) || 0;
      const porcentaje_asistencia = parseFloat(col[6]) || 0;
      const merito_academico = col[7] ? col[7].trim() : '-';
      const alDia = col[8] && col[8].trim().toUpperCase() === 'TRUE';
      const condicion_pensiones = alDia ? 'AL DIA' : 'MOROSO';
      const codigos_seccion = col[10] ? col[10].trim().split('|') : [];

      // A) Insertar usuario estudiante
      const resUser = await db.query(`
        INSERT INTO USUARIOS (correo_institucional, contrasena_hash, nombre_completo, dni, celular, rol, estado)
        VALUES ($1, $2, $3, $4, $5, 'ESTUDIANTE', 'ACTIVO')
        ON CONFLICT (correo_institucional) DO UPDATE 
        SET contrasena_hash = EXCLUDED.contrasena_hash,
            nombre_completo = EXCLUDED.nombre_completo,
            estado = 'ACTIVO'
        RETURNING id_usuario;
      `, [correo_institucional, hashValido, nombres_apellidos, dni, celular]);

      const id_usuario = resUser.rows[0].id_usuario;

      // B) Insertar registro de estudiante
      const resEst = await db.query(`
        INSERT INTO ESTUDIANTES (id_usuario, codigo_estudiante, promedio_academico, porcentaje_asistencia, condicion_pensiones, merito_academico)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (codigo_estudiante) DO UPDATE 
        SET promedio_academico = EXCLUDED.promedio_academico,
            porcentaje_asistencia = EXCLUDED.porcentaje_asistencia,
            condicion_pensiones = EXCLUDED.condicion_pensiones,
            merito_academico = EXCLUDED.merito_academico
        RETURNING id_estudiante;
      `, [id_usuario, codigo_estudiante, promedio_academico, porcentaje_asistencia, condicion_pensiones, merito_academico]);

      let id_estudiante = resEst.rows[0]?.id_estudiante;
      if (!id_estudiante) {
        const estExist = await db.query(`SELECT id_estudiante FROM ESTUDIANTES WHERE codigo_estudiante = $1`, [codigo_estudiante]);
        id_estudiante = estExist.rows[0]?.id_estudiante;
      }

      // C) Asociar matrículas a secciones
      if (id_estudiante) {
        for (const codSec of codigos_seccion) {
          if (!codSec) continue;
          const secRes = await db.query(`SELECT id_seccion FROM SECCIONES WHERE codigo_seccion = $1`, [codSec.trim()]);
          if (secRes.rows.length > 0) {
            await db.query(`
              INSERT INTO MATRICULAS_ESTUDIANTE (id_estudiante, id_seccion)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING;
            `, [id_estudiante, secRes.rows[0].id_seccion]);
          }
        }
      }

      totalAlumnos++;
      if (totalAlumnos % 50 === 0 || totalAlumnos === lineasAlumnos.length - 1) {
        console.log(`   ↳ [${totalAlumnos}/${lineasAlumnos.length - 1}] Alumnos importados...`);
      }
    }

    console.log("--------------------------------------------------");
    console.log(`✅ Ingesta de CSVs finalizada: ${totalAlumnos} alumnos y ${lineasSecciones.length - 1} secciones.`);
    console.log("--------------------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en la importación de CSVs:", error.message);
    process.exit(1);
  }
}

importarCSVs();