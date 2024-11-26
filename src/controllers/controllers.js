// controllers/index.js
const Rol = require('../models/rol');
const Usuario = require('../models/usuario');


// CRUD Rol
exports.createRol = async (data) => await Rol.create(data);
exports.getRoles = async () => await Rol.findAll();
exports.updateRol = async (id, data) => await Rol.update(data, { where: { id_rol: id } });
exports.deleteRol = async (id) => await Rol.destroy({ where: { id_rol: id } });

// CRUD Usuario
exports.createUsuario = async (data) => await Usuario.create(data);
exports.getUsuarios = async () => await Usuario.findAll();
exports.updateUsuario = async (id, data) => await Usuario.update(data, { where: { id_usuario: id } });
exports.deleteUsuario = async (id) => await Usuario.destroy({ where: { id_usuario: id } });

module.exports = exports;
