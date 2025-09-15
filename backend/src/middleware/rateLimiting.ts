import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Configuration simple sans Redis store pour éviter les dépendances complexes

const isDevelopment = process.env.NODE_ENV === 'development';

// Rate limiting général pour toutes les API
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Plus permissif en développement
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting strict pour l'authentification
export const authLimiter = rateLimit({
  windowMs: isDevelopment ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5 min en dev, 15 min en prod
  max: isDevelopment ? 50 : 5, // 50 tentatives en dev, 5 en prod
  message: {
    error: isDevelopment 
      ? 'Trop de tentatives de connexion, veuillez réessayer dans 5 minutes (mode développement)'
      : 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour l'inscription
export const registerLimiter = rateLimit({
  windowMs: isDevelopment ? 10 * 60 * 1000 : 60 * 60 * 1000, // 10 min en dev, 1h en prod
  max: isDevelopment ? 10 : 3, // 10 inscriptions en dev, 3 en prod
  message: {
    error: isDevelopment
      ? 'Trop d\'inscriptions, veuillez réessayer dans 10 minutes (mode développement)'
      : 'Trop d\'inscriptions, veuillez réessayer dans 1 heure'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour les messages
export const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDevelopment ? 100 : 30, // 100 messages en dev, 30 en prod
  message: {
    error: 'Trop de messages envoyés, veuillez ralentir'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour les exports (plus restrictif)
export const exportLimiter = rateLimit({
  windowMs: isDevelopment ? 5 * 60 * 1000 : 10 * 60 * 1000, // 5 min en dev, 10 min en prod
  max: isDevelopment ? 20 : 5, // 20 exports en dev, 5 en prod
  message: {
    error: isDevelopment
      ? 'Trop d\'exports demandés, veuillez réessayer dans 5 minutes (mode développement)'
      : 'Trop d\'exports demandés, veuillez réessayer dans 10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Détection d'abus - surveillance des patterns suspects
export const abuseDetection = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // 200 requêtes par minute (très élevé, juste pour détecter les abus)
  message: {
    error: 'Activité suspecte détectée, accès temporairement bloqué'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`🚨 Abus détecté - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
    res.status(429).json({
      error: 'Activité suspecte détectée, accès temporairement bloqué',
      retryAfter: '1 minute'
    });
  }
});