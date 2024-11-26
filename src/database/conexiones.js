// database/conexiones.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const dbConfig = {
  database: process.env.DB_NAME || 'Drones',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres'
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
});

module.exports = sequelize;