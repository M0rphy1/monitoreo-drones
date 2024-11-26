// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err) => {
  if (err) {
    console.error('Error al conectarse a la base de datos:', err.stack);
  } else {
    console.log('Conexión exitosa a PostgreSQL');
  }
});

module.exports = pool;
