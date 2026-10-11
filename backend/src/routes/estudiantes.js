const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const estudianteController = require('../controllers/estudianteController');

const router = express.Router();

// Extracción a prueba de fallos (maneja export default u objeto con claves)
const verificarJWT = authMiddleware.verificarJWT || authMiddleware;
const getPrioridadEstudiante = estudianteController.getPrioridadEstudiante;

if (typeof verificarJWT !== 'function') {
  throw new TypeError('El middleware verificarJWT no se exportó como función');
}
if (typeof getPrioridadEstudiante !== 'function') {
  throw new TypeError('El controlador getPrioridadEstudiante no se exportó como función');
}

router.get('/mi-prioridad', verificarJWT, getPrioridadEstudiante);

module.exports = router;