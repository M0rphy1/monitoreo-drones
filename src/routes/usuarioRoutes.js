const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const authController = require("../controllers/authController");

// Rutas para CRUD de usuarios
router.post("/", usuarioController.createUsuario);
router.get("/", usuarioController.getUsuarios);
router.get("/:nombreUsuario", usuarioController.getUsuarioById);
router.put("/:nombreUsuario", usuarioController.updateUsuario);
router.delete("/:nombreUsuario", usuarioController.deleteUsuario);
// Ruta para obtener usuario por nombre de usuario
router.get(
  "/nombre/:nombreUsuario",
  usuarioController.getUsuarioByNombreUsuario
);

// Rutas para autenticación
router.post("/signup", authController.register);
router.post("/login", authController.login);

module.exports = router;