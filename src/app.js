const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Cargar el archivo .env de forma explícita
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("JWT_SECRET:", process.env.JWT_SECRET); // Esto debería mostrar 123 en la consola

const sequelize = require('./database/conexiones');
const usuarioRoutes = require('./routes/usuarioRoutes');
const rolRoutes = require('./routes/rolRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

// Configura la carpeta 'public' como estática
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo index.html al acceder a '/'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Montar rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
