import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Configuration simple sans Redis store pour éviter les dépendances complexes

// Rate limiting général pour toutes les API
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP par fenêtre
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting strict pour l'authentification
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives de connexion par IP
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour l'inscription
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 inscriptions par IP par heure
  message: {
    error: 'Trop d\'inscriptions, veuillez réessayer dans 1 heure'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour les messages
export const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 messages par minute
  message: {
    error: 'Trop de messages envoyés, veuillez ralentir'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour les exports (plus restrictif)
export const exportLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 exports par IP par 10 minutes
  message: {
    error: 'Trop d\'exports demandés, veuillez réessayer dans 10 minutes'
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