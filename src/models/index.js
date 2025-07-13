const sequelize = require('../database/conexiones');
const Usuario = require('./usuario');
const Rol = require('./rol');

// Define las relaciones
Usuario.belongsTo(Rol, { foreignKey: 'idRol'});
Rol.hasMany(Usuario, { foreignKey: 'idRol' });

// Sincronización de modelos con la base de datos
sequelize.sync({ alter: true }) // force: true eliminará las tablas existentes y las volverá a crear
  .then(() => {
    console.log('Tablas sincronizadas correctamente.');
  })
  .catch((error) => {
    console.error('Error al sincronizar las tablas:', error);
  });

module.exports = { Usuario, Rol };





