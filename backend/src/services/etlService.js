// backend/src/services/etlService.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function ejecutarETL() {
  console.log('🔄 Iniciando Carga ETL: 150 estudiantes con contraseña DNI...');

  const posiblesRutas = [
    path.join(__dirname, '../../alumnos_matriculados_150.csv'),
    path.join(__dirname, '../../../alumnos_matriculados_150.csv'),
    path.join(process.cwd(), 'alumnos_matriculados_150.csv'),
  ];

  const rutaCsv = posiblesRutas.find((r) => fs.existsSync(r));
  if (!rutaCsv) {
    console.error('❌ Error: No se encontró alumnos_matriculados_150.csv en backend.');
    process.exit(1);
  }

  try {
    const alumnos = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(rutaCsv)
        .pipe(csv())
        .on('data', (row) => alumnos.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📂 Procesando ${alumnos.length} estudiantes del CSV...`);

    for (const al of alumnos) {
      const codigo = (al.codigo_estudiante || '').trim();
      const correo = (al.correo_institucional || `${codigo.toLowerCase()}@utp.edu.pe`).trim().toLowerCase();
      const nombre = (al.nombres_apellidos || 'Estudiante UTP').trim();
      const dni = String(al.dni || '').trim();
      const celular = String(al.celular || '900000000').trim();
      const promedio = parseFloat(al.promedio_periodo || 0.0);
      const asistencia = parseFloat(al.porcentaje_asistencia || 0.0);
      const merito = (al.pertenece_merito || '-').trim();

      const alDia = String(al.pensiones_al_dia).toLowerCase() === 'true';
      const condicion = alDia ? 'AL DIA' : 'CON DEUDA';

      // 🔐 La contraseña cifrada de cada estudiante es su propio DNI
      const passwordDni = dni || '12345678';
      const contrasenaHash = await bcrypt.hash(passwordDni, 10);

      // 1. Insertar / Actualizar en USUARIOS
      const resUser = await db.query(
        `
        INSERT INTO usuarios (correo_institucional, contrasena_hash, nombre_completo, dni, celular, rol, estado)
        VALUES ($1, $2, $3, $4, $5, 'ESTUDIANTE', 'ACTIVO')
        ON CONFLICT (correo_institucional) DO UPDATE 
        SET contrasena_hash = EXCLUDED.contrasena_hash,
            nombre_completo = EXCLUDED.nombre_completo,
            dni = EXCLUDED.dni
        RETURNING id_usuario;
      `,
        [correo, contrasenaHash, nombre, dni, celular]
      );

      const idUsuario = resUser.rows[0].id_usuario;

      // 2. Insertar / Actualizar en ESTUDIANTES
      await db.query(
        `
        INSERT INTO estudiantes (
          id_usuario, codigo_estudiante, promedio_academico, porcentaje_asistencia, condicion_pensiones, pertenece_merito
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (codigo_estudiante) DO UPDATE 
        SET promedio_academico = EXCLUDED.promedio_academico,
            porcentaje_asistencia = EXCLUDED.porcentaje_asistencia,
            condicion_pensiones = EXCLUDED.condicion_pensiones,
            pertenece_merito = EXCLUDED.pertenece_merito;
      `,
        [idUsuario, codigo, promedio, asistencia, condicion, merito]
      );
    }

    // 3. Cálculo algorítmico institucional (RF02 / HU-02)
    console.log('⚙️ Calculando y persistiendo prioridades...');
    await db.query(`
      UPDATE estudiantes
      SET 
        puntaje_prioridad = ROUND(
          ((promedio_academico / 20.0) * 40.0) +
          ((porcentaje_asistencia / 100.0) * 40.0) +
          (CASE WHEN UPPER(condicion_pensiones) = 'AL DIA' THEN 20.0 ELSE 0.0 END)
        , 2),
        nivel_prioridad = CASE 
          WHEN (
            ((promedio_academico / 20.0) * 40.0) +
            ((porcentaje_asistencia / 100.0) * 40.0) +
            (CASE WHEN UPPER(condicion_pensiones) = 'AL DIA' THEN 20.0 ELSE 0.0 END)
          ) >= 80.0 THEN 'Prioridad Alta'
          WHEN (
            ((promedio_academico / 20.0) * 40.0) +
            ((porcentaje_asistencia / 100.0) * 40.0) +
            (CASE WHEN UPPER(condicion_pensiones) = 'AL DIA' THEN 20.0 ELSE 0.0 END)
          ) >= 60.0 THEN 'Prioridad Media'
          ELSE 'Prioridad Baja'
        END,
        fecha_actualizacion = NOW();
    `);

    console.log('--------------------------------------------------');
    console.log('✅ PROCESO ETL COMPLETADO:');
    console.log(`   - 150 estudiantes cargados con contraseña = DNI`);
    console.log(`   - Prioridades calculadas y guardadas en Supabase`);
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en ETL:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  ejecutarETL();
}

module.exports = { ejecutarETL };