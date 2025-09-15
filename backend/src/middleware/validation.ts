import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction): any => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }
  next();
};

const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères')
    .isAlphanumeric()
    .withMessage('Le nom d\'utilisateur ne peut contenir que des lettres et des chiffres'),
  
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  
  handleValidationErrors
];

const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Nom d\'utilisateur requis'),
  
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis'),
  
  handleValidationErrors
];

const validateMessage = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Le message doit contenir entre 1 et 1000 caractères')
    .trim(),
  
  handleValidationErrors
];

export {
  validateRegistration,
  validateLogin,
  validateMessage,
  handleValidationErrors
};