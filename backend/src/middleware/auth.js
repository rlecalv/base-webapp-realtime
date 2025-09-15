const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Token d\'accès requis' 
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({ 
        error: 'Utilisateur non trouvé ou inactif' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(403).json({ 
      error: 'Token invalide' 
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ 
      error: 'Accès administrateur requis' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};