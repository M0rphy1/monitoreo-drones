const { DataTypes } = require('sequelize');
const sequelize = require('../database/conexiones');

const Rol = sequelize.define('Rol', {
  idRol: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
}, {
  tableName: 'Rol',
  timestamps: false
});

module.exports = Rol;

