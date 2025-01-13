// Función para verificar si ya existe un Administrador al cargar el formulario
document.addEventListener("DOMContentLoaded", async function() {
  const rolSelect = document.getElementById("rol");

  try {
    // Hacer una solicitud al backend para verificar si existe un Administrador
    const response = await fetch('/api/auth/check-admin');
    const data = await response.json();

    if (data.adminExists) {
      // Si existe un administrador, deshabilitar la opción de rol Administrador
      for (let i = 0; i < rolSelect.options.length; i++) {
        if (rolSelect.options[i].value === "1") {
          rolSelect.options[i].disabled = true;
          break;
        }
      }
    }
  } catch (error) {
    console.error("Error al verificar la existencia del Administrador:", error);

    // Mostrar error con SweetAlert2
    Swal.fire({
      title: "Error",
      text: "Hubo un problema al verificar la existencia del Administrador.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
});

// Código del evento para enviar el formulario de registro
document.getElementById('registerForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const nombreUsuario = document.getElementById('nombreUsuario').value;
  const correo = document.getElementById('correo').value;
  const contrasena = document.getElementById('contrasena').value;
  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;
  const telefono = document.getElementById('telefono').value;
  const direccion = document.getElementById('direccion').value;
  const idRol = document.getElementById('rol').value; // Captura el valor del rol

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombreUsuario,
        correo,
        contrasena,
        nombre,
        apellido,
        telefono,
        direccion,
        idRol, // Enviar el rol seleccionado al backend
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar usuario');
    }

    // Mostrar el rol correcto según la asignación (1 = Administrador, 2 = Usuario)
    Swal.fire({
      title: "Registro exitoso",
      text: `Te has registrado exitosamente como ${idRol == 1 ? 'Administrador' : 'Usuario'}.`,
      icon: "success",
      confirmButtonText: "Aceptar",
      timer: 3000,
    }).then(() => {
      // Redirigir al usuario a la página de inicio de sesión
      window.location.href = 'login.html';
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);

    // Mostrar error con SweetAlert2
    Swal.fire({
      title: "Error",
      text: error.message || "Hubo un problema al registrar el usuario.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
});


