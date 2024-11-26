const express = require('express');
const router = express.Router();

// Importar y usar las rutas de cada entidad
const rolRoutes = require('./rolRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const authRoutes = require('./authRoutes');

router.use('/roles', rolRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/auth', authRoutes);

module.exports = router;