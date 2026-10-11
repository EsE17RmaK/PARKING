const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../src/config/db');

async function inicializarBaseDatos() {
  console.log('⚡ Reseteando y creando esquema de zonas en Supabase...');
  try {
    const rutaSql = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(rutaSql, 'utf8');

    await db.query(sql);

    console.log('✅ Esquema por zonas y capacidades creado con éxito en Supabase.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar:', error.message);
    process.exit(1);
  }
}

inicializarBaseDatos();