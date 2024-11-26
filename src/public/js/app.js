// js/app.js

// Manejo de WebSocket para retransmisión de video
const socket = io();
const videoElement = document.getElementById('videoStream');

// Aquí se manejará la transmisión de video
socket.on('video-stream', (data) => {
  // Este es el lugar donde recibirás la transmisión de video desde el servidor
  // Dependiendo del formato, puedes configurar el video en el elemento HTML
});

// Cerrar sesión
document.getElementById('cerrarSesion')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// Registro de usuario
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, contrasena })
    });

    if (response.ok) {
      alert('Registro exitoso');
      window.location.href = 'login.html';
    } else {
      alert('Error en el registro');
    }
  });
}

// Inicio de sesión
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      window.location.href = 'index.html';
    } else {
      alert('Error en el inicio de sesión');
    }
  });
}
