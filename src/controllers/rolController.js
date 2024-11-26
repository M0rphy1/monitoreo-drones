const Rol = require('../models/rol');

exports.createRol = async (req, res) => {
  try {
    const newRol = await Rol.create(req.body);
    res.status(201).json(newRol);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Rol.findAll();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRol = async (req, res) => {
  try {
    const rol = await Rol.findByPk(req.params.id);
    if (rol) {
      res.status(200).json(rol);
    } else {
      res.status(404).json({ error: 'Rol not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRol = async (req, res) => {
  try {
    const rol = await Rol.findByPk(req.params.id);
    if (rol) {
      await rol.update(req.body);
      res.status(200).json(rol);
    } else {
      res.status(404).json({ error: 'Rol not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRol = async (req, res) => {
  try {
    const rol = await Rol.findByPk(req.params.id);
    if (rol) {
      await rol.destroy();
      res.status(200).json({ message: 'Rol deleted' });
    } else {
      res.status(404).json({ error: 'Rol not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

