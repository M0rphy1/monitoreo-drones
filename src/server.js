// server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./database/conexiones'); // Asegúrate de tener la ruta correcta
const authRoutes = require('./routes/authRoutes'); // Importa el archivo de rutas de autenticación
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar Express para usar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de autenticación
app.use('/auth', authRoutes); // Usa '/auth' como prefijo para las rutas de autenticación

// Ruta para renderizar la página de inicio
app.get('/', (req, res) => {
    res.render('index', { title: 'Inicio', message: 'Bienvenido! Por favor inicia sesión o regístrate.' });
});

// Ruta para manejar otros posibles errores de rutas
app.use((req, res, next) => {
    res.status(404).send('Página no encontrada');
});

// Conectar a la base de datos y sincronizar modelos
sequelize.authenticate()
  .then(() => {
    console.log('Conectado a la base de datos');
    return sequelize.sync(); // Sincronizar modelos
  })
  .then(() => {
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
  });