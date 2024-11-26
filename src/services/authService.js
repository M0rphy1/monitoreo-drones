const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Usuario } = require('../models');

const JWT_SECRET = 123; // Debes cambiar esto por una clave segura

// Función para registrar un nuevo usuario
async function registrarUsuario(nombreUsuario, correo, contrasena, idEmpleado) {
  try {
    // Verificar si el correo ya está registrado
    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      throw new Error('El correo ya está registrado');
    }

    // Encriptar la contraseña
    const hashContrasena = await bcrypt.hash(contrasena, 10);

    // Generar código de verificación (puedes personalizarlo según tus necesidades)
    const codigoVerificacion = Math.random().toString(36).substring(7);

    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      idEmpleado,
      nombreUsuario,
      correo,
      contrasena: hashContrasena,
      codigoVerificacion
    });

    // Enviar correo electrónico con el código de verificación (opcional)
    enviarCorreoVerificacion(correo, codigoVerificacion);

    return nuevoUsuario;
  } catch (error) {
    throw error;
  }
}

// Función para iniciar sesión
async function iniciarSesion(correo, contrasena) {
  try {
    // Buscar usuario por correo
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      throw new Error('Correo electrónico no registrado');
    }

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      throw new Error('Contraseña incorrecta');
    }

    // Generar token de autenticación JWT
    const token = jwt.sign({ idUsuario: usuario.idUsuario }, JWT_SECRET, { expiresIn: '1h' });

    return { usuario, token };
  } catch (error) {
    throw error;
  }
}

// Función para enviar correo electrónico de verificación (ejemplo usando nodemailer)
async function enviarCorreoVerificacion(correo, codigoVerificacion) {
  try {
    const transporter = nodemailer.createTransport({
      // Configuración de transporte de correo electrónico (por ejemplo, Gmail SMTP)
      service: 'gmail',
      auth: {
        user: 'tu_correo@gmail.com',
        pass: 'tu_contraseña'
      }
    });

    const mailOptions = {
      from: 'tu_correo@gmail.com',
      to: correo,
      subject: 'Código de Verificación',
      text: `Tu código de verificación es: ${codigoVerificacion}`
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error al enviar correo de verificación:', error);
  }
}

module.exports = {
  registrarUsuario,
  iniciarSesion
};
