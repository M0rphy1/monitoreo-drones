// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");
const generateToken = require("../utils/generateToken");

// Registro único para cualquier tipo de usuario (se determina el rol con idRol)
const register = async (req, res) => {
  const {
    nombreUsuario,
    correo,
    contrasena,
    nombre,
    apellido,
    telefono,
    direccion,
    idRol, // idRol: 1 para usuario, 2 para administrador
  } = req.body;

  try {
    // Verificar si ya existe un administrador
    if (idRol === 1) { // Si intenta registrar un Administrador
      const adminExists = await Usuario.findOne({ where: { idRol: 1 } });
      if (adminExists) {
        return res.status(400).json({
          message: "Ya existe un Administrador en el sistema. No se puede registrar otro.",
        });
      }
    }

    // Verificar si el usuario ya existe
    const userExists = await Usuario.findOne({ where: { correo } });
    if (userExists) {
      return res.status(400).json({
        message: "El correo electrónico ya está en uso. Por favor, intenta con otro.",
      });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear el usuario con la contraseña encriptada
    const nuevoUsuario = await Usuario.create({
      nombreUsuario,
      correo,
      contrasena: hashedPassword,
      nombre,
      apellido,
      telefono,
      direccion,
      idRol,
    });

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
};

// Inicio de sesión único, determina rol después de autenticación
const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const user = await Usuario.findOne({ where: { correo } });

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Comparar la contraseña en texto plano con la contraseña encriptada
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (!validPassword) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar token y enviar información adicional, incluido el rol
    const token = generateToken(user.idUsuario);
    res.json({
      id: user.idUsuario,
      nombreUsuario: user.nombreUsuario,
      correo: user.correo,
      token,
      rol: user.idRol, // Incluye el rol en la respuesta si necesitas diferenciar en frontend
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

// Resto de métodos (resetPassword) permanece igual
const { sendPasswordResetEmail } = require('../utils/mailer');
const resetPassword = async (req, res) => {
  const { email } = req.body;

  // Generar una nueva contraseña temporal
  const tempPassword = Math.random().toString(36).slice(-8);

  try {
    // Buscar el usuario por correo
    const usuario = await Usuario.findOne({ where: { correo: email } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Encriptar la contraseña temporal
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Actualizar la contraseña en la base de datos
    await usuario.update({ contrasena: hashedPassword });

    // Enviar el correo de restablecimiento
    await sendPasswordResetEmail(email, tempPassword);
    res.status(200).send('Correo de recuperación enviado');
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    res.status(500).send('Error al enviar el correo');
  }
};
const checkAdmin = async (req, res) => {
  try {
    const adminExists = await Usuario.findOne({ where: { idRol: 1 } });
    res.json({ adminExists: !!adminExists });
  } catch (error) {
    console.error("Error al verificar la existencia del Administrador:", error);
    res.status(500).json({ message: "Error al verificar el administrador" });
  }
};

module.exports = {
  register,
  login,
  resetPassword,
  checkAdmin,
};

