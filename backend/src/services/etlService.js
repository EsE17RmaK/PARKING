require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Función helper para leer un CSV con Promesas
function cargarCSV(nombreArchivo) {
    return new Promise((resolve, reject) => {
        const registros = [];
        const ruta = path.join(process.cwd(), nombreArchivo);

        if (!fs.existsSync(ruta)) {
            return reject(new Error(`No se encontró el archivo ${nombreArchivo} en la raíz.`));
        }

        fs.createReadStream(ruta)
            .pipe(csv())
            .on('data', (data) => registros.push(data))
            .on('end', () => resolve(registros))
            .on('error', (err) => reject(err));
    });
}

async function ejecutarETL() {
    console.log('🔄 Iniciando Proceso ETL de la Universidad (03:00 AM)...');

    try {
        // 1. Ingesta de Cursos y Horarios
        const secciones = await cargarCSV('secciones_horarios_300.csv');
        console.log(`📚 1. Cursos y Horarios cargados: ${secciones.length} secciones encontradas.`);

        // 2. Ingesta de Alumnos Matriculados
        const alumnos = await cargarCSV('alumnos_matriculados_300.csv');
        console.log(`👨‍🎓 2. Alumnos cargados: ${alumnos.length} estudiantes encontrados.`);

        // 3. Evaluación de Reglas de Negocio
        let aptos = 0;
        alumnos.forEach((alumno) => {
            const promedio = parseFloat(alumno.promedio_periodo);
            const asistencia = parseFloat(alumno.porcentaje_asistencia);
            const alDia = alumno.pensiones_al_dia === 'TRUE';

            if (promedio >= 14.0 && asistencia >= 80.0 && alDia) {
                aptos++;
            }
        });

        console.log('--------------------------------------------------');
        console.log('✅ PROCESO ETL FINALIZADO CON ÉXITO:');
        console.log(`   - Secciones procesadas: ${secciones.length}`);
        console.log(`   - Estudiantes procesados: ${alumnos.length}`);
        console.log(`   - Estudiantes aptos para parqueo prioritario: ${aptos}`);
        console.log('--------------------------------------------------');

    } catch (error) {
        console.error('❌ Error en el proceso ETL:', error.message);
    }
}

ejecutarETL();