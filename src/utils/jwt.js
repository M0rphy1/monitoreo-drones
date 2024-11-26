const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateToken = (payload) => {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
  };

const verifyToken = (token, expiresIn) => {
  try {
    return jwt.verify(token, config.jwtSecret, { expiresIn });
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };