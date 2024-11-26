const Usuario = require("../models/usuario");

const createUsuario = async (req, res) => {
  console.log(req.body);
  try {
    const newUsuario = await Usuario.create(req.body);
    res.status(201).json(newUsuario);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: error.message });
  }
};

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.nombreUsuario);
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ error: "Usuario not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsuarioByNombreUsuario = async (req, res) => {
  const { nombreUsuario } = req.params;

  try {
    const usuario = await Usuario.findOne({ where: { nombreUsuario } });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    console.error("Error al buscar usuario por nombre de usuario:", error);
    res.status(500).json({ message: "Error al buscar usuario" });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.nombreUsuario);
    if (usuario) {
      await usuario.update(req.body);
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ error: "Usuario not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.nombreUsuario);
    if (usuario) {
      await usuario.destroy();
      res.status(200).json({ message: "Usuario deleted" });
    } else {
      res.status(404).json({ error: "Usuario not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createUsuario,
  getUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
  getUsuarioByNombreUsuario,
};
