// backend/database/seedPersonal.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

async function sembrarPersonal() {
  console.log("🌱 Insertando cuentas institucionales de Administrador y Garita en Supabase...");

  try {
    const passwordAdmin = 'Admin2026!';
    const passwordGarita = 'Garita2026!';

    const hashAdmin = await bcrypt.hash(passwordAdmin, 10);
    const hashGarita = await bcrypt.hash(passwordGarita, 10);

    const personal = [
      {
        nombre: 'Marcos Sánchez Rodríguez',
        correo: 'msanchez@utp.edu.pe',
        dni: '47829143',
        celular: '987451230',
        rol: 'ADMIN',
        hash: hashAdmin,
        passPlana: passwordAdmin
      },
      {
        nombre: 'Donato Cárdenas Huamán',
        correo: 'dcardenas@utp.edu.pe',
        dni: '10482931',
        celular: '974102853',
        rol: 'GARITA',
        hash: hashGarita,
        passPlana: passwordGarita
      }
    ];

    for (const p of personal) {
      await db.query(`
        INSERT INTO USUARIOS (correo_institucional, contrasena_hash, nombre_completo, dni, celular, rol, estado)
        VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVO')
        ON CONFLICT (correo_institucional) DO UPDATE 
        SET contrasena_hash = EXCLUDED.contrasena_hash,
            nombre_completo = EXCLUDED.nombre_completo,
            dni = EXCLUDED.dni,
            celular = EXCLUDED.celular,
            rol = EXCLUDED.rol,
            estado = 'ACTIVO';
      `, [p.correo, p.hash, p.nombre, p.dni, p.celular, p.rol]);

      console.log(`✅ [${p.rol}] ${p.nombre} registrado con éxito.`);
      console.log(`   - Correo Institucional: ${p.correo}`);
      console.log(`   - Contraseña:          ${p.passPlana}\n`);
    }

    console.log("--------------------------------------------------");
    console.log("✨ Cuentas de personal listas para iniciar sesión.");
    console.log("--------------------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al sembrar personal:", error.message);
    process.exit(1);
  }
}

sembrarPersonal();