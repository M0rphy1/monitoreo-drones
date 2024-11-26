// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post('/reset-password', authController.resetPassword);
router.get('/check-admin', authController.checkAdmin);


router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Cierre de sesión exitoso" });
  });
});

module.exports = router;