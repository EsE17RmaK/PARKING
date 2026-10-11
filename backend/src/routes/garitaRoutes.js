const { Router } = require('express');
const { consultarReservaGarita, confirmarIngresoGarita } = require('../controllers/garitaController');
const { verificarJWT } = require('../middlewares/authMiddleware');

const router = Router();

router.get('/consultar', verificarJWT, consultarReservaGarita);
router.post('/confirmar-ingreso', verificarJWT, confirmarIngresoGarita);

module.exports = router;