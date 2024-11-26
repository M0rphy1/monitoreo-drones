document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const correo = document.getElementById('correo').value;
  const contrasena = document.getElementById('contrasena').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo, contrasena }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    // Guardar token y datos del usuario
    localStorage.setItem('token', data.token);
    localStorage.setItem('nombreUsuario', data.nombreUsuario);
    localStorage.setItem('rol', data.rol); // Guardar el rol del usuario

    // Redirigir según el rol
    if (data.rol === 1) {
      // Administrador
      alert(`Inicio de sesión exitoso como Administrador`);
      window.location.href = '/admin.html';
    } else {
      // Usuario
      alert(`Inicio de sesión exitoso como Usuario`);
      window.location.href = '/index-dron.html';
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    alert(error.message);
  }
});



