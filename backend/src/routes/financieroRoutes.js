const express = require('express');
const { verificarEstadoFinanciero } = require('../controllers/financieroController');
const { verificarJWT } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/estado-solvencia', verificarJWT, verificarEstadoFinanciero);

module.exports = router;