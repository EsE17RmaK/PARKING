const jwt = require('jsonwebtoken');

const verificarJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <token>

  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado: Token no proporcionado' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'admin_jwt_admin';
    const decoded = jwt.verify(token, secret);
    req.usuario = decoded; // Inyecta { id_usuario, rol, ... }
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
};

module.exports = {
  verificarJWT,
};