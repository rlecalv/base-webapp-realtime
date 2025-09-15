const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

// Inscription
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      where: {
        $or: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Un utilisateur avec cet email ou nom d\'utilisateur existe déjà'
      });
    }

    // Créer le nouvel utilisateur
    const user = await User.create({
      username,
      email,
      password
    });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Connexion
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({
      where: { username }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'Nom d\'utilisateur ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Nom d\'utilisateur ou mot de passe incorrect'
      });
    }

    // Mettre à jour la dernière connexion
    await user.update({ last_login: new Date() });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      message: 'Connexion réussie',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Profil utilisateur
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Vérification du token
router.post('/verify-token', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user.toJSON()
  });
});

module.exports = router;