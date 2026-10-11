const express = require('express');
const { getPrioridadEstudiante } = require('../controllers/estudianteController');
const { verificarJWT } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/mi-prioridad', verificarJWT, getPrioridadEstudiante);

module.exports = router;