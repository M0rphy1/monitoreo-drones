document.addEventListener('DOMContentLoaded', () => {
    const userTable = document.querySelector('#userTable tbody');
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const cancelEdit = document.getElementById('cancelEdit');
    const logoutButton = document.getElementById('logoutButton');
    
    // Cargar usuarios al iniciar
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/usuarios');
        const users = await response.json();
        
        userTable.innerHTML = '';
        users.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.nombreUsuario}</td>
            <td>${user.correo}</td>
            <td>${user.idRol === 1 ? 'Administrador' : 'Usuario'}</td>
            <td>
              <button class="editButton" data-id="${user.nombreUsuario}">Editar</button>
              <button class="deleteButton" data-id="${user.nombreUsuario}">Eliminar</button>
            </td>
          `;
          userTable.appendChild(row);
        });
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    };
  
    // Abrir modal de edición
    const openEditModal = (user) => {
      editModal.classList.remove('hidden');
      document.getElementById('editUserId').value = user.id;
      document.getElementById('editUserName').value = user.nombreUsuario;
      document.getElementById('editEmail').value = user.correo;
      document.getElementById('editRol').value = user.idRol;
    };
  
    // Editar usuario
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = document.getElementById('editUserId').value;
      const correo = document.getElementById('editEmail').value;
      const idRol = document.getElementById('editRol').value;
  
      try {
        const response = await fetch(`/api/usuarios/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ correo, idRol }),
        });
  
        if (response.ok) {
          alert('Usuario actualizado exitosamente');
          editModal.classList.add('hidden');
          loadUsers();
        } else {
          alert('Error al actualizar usuario');
        }
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
      }
    });
  
    // Cancelar edición
    cancelEdit.addEventListener('click', () => {
      editModal.classList.add('hidden');
    });
  
    // Eliminar usuario
    userTable.addEventListener('click', async (e) => {
      if (e.target.classList.contains('deleteButton')) {
        const userId = e.target.dataset.id;
  
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
          try {
            const response = await fetch(`/api/usuarios/${userId}`, {
              method: 'DELETE',
            });
  
            if (response.ok) {
              alert('Usuario eliminado');
              loadUsers();
            } else {
              alert('Error al eliminar usuario');
            }
          } catch (error) {
            console.error('Error al eliminar usuario:', error);
          }
        }
      }
  
      if (e.target.classList.contains('editButton')) {
        const userId = e.target.dataset.id;
        try {
          const response = await fetch(`/api/usuarios/${userId}`);
          const user = await response.json();
          openEditModal(user);
        } catch (error) {
          console.error('Error al cargar usuario:', error);
        }
      }
    });
  
    // Cerrar sesión
    logoutButton.addEventListener('click', () => {
      localStorage.clear();
      alert('Sesión cerrada');
      window.location.href = '/login.html';
    });
  
    // Cargar usuarios al inicio
    loadUsers();
  });
  