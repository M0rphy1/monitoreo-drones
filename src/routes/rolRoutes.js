const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController'); // Asegúrate de que la ruta al controlador es correcta

router.post('/', rolController.createRol);
router.get('/', rolController.getRoles); // Usa rolController.getRoles
router.get('/:id', rolController.getRol);
router.put('/:id', rolController.updateRol);
router.delete('/:id', rolController.deleteRol);

module.exports = router;

