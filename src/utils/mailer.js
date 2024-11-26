// mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gianklodd@gmail.com', // Tu correo
        pass: 'gszg scqy gvdd kcpn' // Tu contraseña o contraseña de aplicación
    }
});

const sendPasswordResetEmail = async (email, tempPassword) => {
  const mailOptions = {
    from: 'gianklodd@gmail.com', // Tu correo
    to: email, // Asegúrate de que este sea un correo receptor válido
    subject: 'Restablecimiento de contraseña',
    text: `Tu nueva contraseña temporal es: ${tempPassword}. Por favor, cámbiala después de iniciar sesión.`,
};

  try {
      await transporter.sendMail(mailOptions);
      console.log('Correo enviado correctamente');
  } catch (error) {
      console.error('Error al enviar el correo:', error.message); // Registra el mensaje de error
      throw new Error('Error al enviar el correo');
  }
  
};

module.exports = {
    sendPasswordResetEmail,
};
