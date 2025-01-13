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
      Swal.fire({
        title: 'Inicio de sesión exitoso',
        text: 'Bienvenido como Administrador',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 3000,
      }).then(() => {
        window.location.href = '/index-admin.html'; // Redirigir
      });
    } else {
      // Usuario
      Swal.fire({
        title: 'Inicio de sesión exitoso',
        text: 'Bienvenido como Usuario',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 3000,
      }).then(() => {
        window.location.href = '/index-dron.html'; // Redirigir
      });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);

    // Mostrar error con SweetAlert2
    Swal.fire({
      title: 'Error',
      text: error.message,
      icon: 'error',
      confirmButtonText: 'Intentar nuevamente',
    });
  }
});




