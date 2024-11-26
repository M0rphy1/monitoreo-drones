const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Token requerido' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.idRol !== 1) { // Solo el rol con id 1 (Administrador) puede acceder
      return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = isAdmin;



