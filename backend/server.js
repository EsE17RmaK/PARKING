// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Importación obligatoria de todas las rutas
const authRoutes = require('./src/routes/authRoutes');
const estudianteRoutes = require('./src/routes/estudiantes');
const financieroRoutes = require('./src/routes/financieroRoutes');
const reservaRoutes = require('./src/routes/reservaRoutes');
const garitaRoutes = require('./src/routes/garitaRoutes');

const app = express();

// 2. Middlewares globales
app.use(cors());
app.use(express.json());

// 3. Montaje de endpoints de la API
app.use('/auth', authRoutes);
app.use('/api/estudiantes', estudianteRoutes);
app.use('/api/financiero', financieroRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/garita', garitaRoutes);

// Ruta de diagnóstico
app.get('/', (req, res) => {
  res.json({ mensaje: 'API ParkingU en ejecución' });
});

// 4. Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de backend corriendo en http://localhost:${PORT}`);
});