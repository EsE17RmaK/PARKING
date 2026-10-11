const express = require('express');
const router = express.Router();

router.get('/consultar', (req, res) => {
  res.json({ mensaje: 'Módulo de garita activo' });
});

module.exports = router;