import express, { Request, Response, NextFunction } from 'express';
import exportService from '../services/exportService';
import auth from '../middleware/auth';
import { body, query, validationResult } from 'express-validator';
import * as path from 'path';
import { promises as fs } from 'fs';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Middleware de validation des erreurs
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors.array()
    });
  }
  next();
};

// Middleware pour vérifier les permissions admin (pour certains exports)
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user.is_admin) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Droits administrateur requis.'
    });
  }
  next();
};

// Validation des formats d'export
const validateExportFormat = [
  query('format')
    .optional()
    .isIn(['pdf', 'excel', 'csv'])
    .withMessage('Format doit être pdf, excel ou csv'),
];

// Validation des filtres de date
const validateDateFilters = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom doit être une date valide (ISO 8601)'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo doit être une date valide (ISO 8601)'),
];

/**
 * @route GET /api/v1/exports/users
 * @desc Export des utilisateurs
 * @access Private (Admin)
 */
router.get('/users', 
  auth, 
  requireAdmin,
  [
    ...validateExportFormat,
    ...validateDateFilters,
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive doit être un booléen'),
    query('isAdmin')
      .optional()
      .isBoolean()
      .withMessage('isAdmin doit être un booléen'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { format = 'excel', dateFrom, dateTo, isActive, isAdmin } = req.query;
      
      const filters = {};
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (isAdmin !== undefined) filters.isAdmin = isAdmin === 'true';

      const result = await exportService.exportUsers(format, filters);

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        return res.send(result.buffer);
      } else {
        // Pour Excel et CSV, renvoyer le fichier
        res.download(result.filepath, result.filename, (err) => {
          if (err) {
            console.error('Erreur lors du téléchargement:', err);
            res.status(500).json({
              success: false,
              message: 'Erreur lors du téléchargement du fichier'
            });
          }
        });
      }
    } catch (error) {
      console.error('Erreur export utilisateurs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'export des utilisateurs',
        error: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/exports/messages
 * @desc Export des messages
 * @access Private
 */
router.get('/messages',
  auth,
  [
    ...validateExportFormat,
    ...validateDateFilters,
    query('userId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('userId doit être un entier positif'),
    query('messageType')
      .optional()
      .isIn(['text', 'image', 'file', 'system'])
      .withMessage('messageType doit être text, image, file ou system'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { format = 'excel', dateFrom, dateTo, userId, messageType } = req.query;
      
      const filters = {};
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (userId) filters.userId = parseInt(userId);
      if (messageType) filters.messageType = messageType;

      // Si l'utilisateur n'est pas admin, il ne peut exporter que ses propres messages
      if (!req.user.is_admin) {
        filters.userId = req.user.id;
      }

      const result = await exportService.exportMessages(format, filters);

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        return res.send(result.buffer);
      } else {
        res.download(result.filepath, result.filename, (err) => {
          if (err) {
            console.error('Erreur lors du téléchargement:', err);
            res.status(500).json({
              success: false,
              message: 'Erreur lors du téléchargement du fichier'
            });
          }
        });
      }
    } catch (error) {
      console.error('Erreur export messages:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'export des messages',
        error: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/exports/statistics
 * @desc Export des statistiques
 * @access Private (Admin)
 */
router.get('/statistics',
  auth,
  requireAdmin,
  [
    query('format')
      .optional()
      .isIn(['pdf', 'excel'])
      .withMessage('Format doit être pdf ou excel pour les statistiques'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { format = 'pdf' } = req.query;
      
      const result = await exportService.exportStatistics(format);

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        return res.send(result.buffer);
      } else {
        res.download(result.filepath, result.filename, (err) => {
          if (err) {
            console.error('Erreur lors du téléchargement:', err);
            res.status(500).json({
              success: false,
              message: 'Erreur lors du téléchargement du fichier'
            });
          }
        });
      }
    } catch (error) {
      console.error('Erreur export statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'export des statistiques',
        error: error.message
      });
    }
  }
);

/**
 * @route POST /api/v1/exports/custom
 * @desc Export personnalisé avec données fournies
 * @access Private
 */
router.post('/custom',
  auth,
  [
    body('data')
      .notEmpty()
      .withMessage('Les données sont requises'),
    body('format')
      .isIn(['pdf', 'excel', 'csv'])
      .withMessage('Format doit être pdf, excel ou csv'),
    body('template')
      .optional()
      .isString()
      .withMessage('Template doit être une chaîne de caractères'),
    body('filename')
      .optional()
      .isString()
      .withMessage('Filename doit être une chaîne de caractères'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { data, format, template = 'default', filename } = req.body;
      
      let result;
      
      switch (format) {
        case 'pdf':
          result = await exportService.exportToPDF(data, template);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
          return res.send(result.buffer);
          
        case 'excel':
          result = await exportService.exportToExcel(data, 'Export', filename);
          break;
          
        case 'csv':
          if (!Array.isArray(data)) {
            return res.status(400).json({
              success: false,
              message: 'Les données doivent être un tableau pour l\'export CSV'
            });
          }
          result = await exportService.exportToCSV(data, filename);
          break;
      }

      if (format !== 'pdf') {
        res.download(result.filepath, result.filename, (err) => {
          if (err) {
            console.error('Erreur lors du téléchargement:', err);
            res.status(500).json({
              success: false,
              message: 'Erreur lors du téléchargement du fichier'
            });
          }
        });
      }
    } catch (error) {
      console.error('Erreur export personnalisé:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'export personnalisé',
        error: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/exports/formats
 * @desc Liste des formats d'export disponibles
 * @access Private
 */
router.get('/formats', auth, (req, res) => {
  res.json({
    success: true,
    formats: [
      {
        key: 'pdf',
        name: 'PDF',
        description: 'Document PDF avec mise en forme',
        mimeType: 'application/pdf'
      },
      {
        key: 'excel',
        name: 'Excel',
        description: 'Fichier Excel (.xlsx)',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        key: 'csv',
        name: 'CSV',
        description: 'Fichier CSV séparé par virgules',
        mimeType: 'text/csv'
      }
    ]
  });
});

/**
 * @route DELETE /api/v1/exports/cleanup
 * @desc Nettoyage des anciens fichiers d'export
 * @access Private (Admin)
 */
router.delete('/cleanup',
  auth,
  requireAdmin,
  [
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('days doit être un entier entre 1 et 365'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { days = 7 } = req.query;
      
      await exportService.cleanupOldExports(parseInt(days));
      
      res.json({
        success: true,
        message: `Nettoyage des fichiers d'export de plus de ${days} jours effectué`
      });
    } catch (error) {
      console.error('Erreur nettoyage exports:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du nettoyage des exports',
        error: error.message
      });
    }
  }
);

/**
 * @route GET /api/v1/exports/health
 * @desc Vérification de l'état du service d'export
 * @access Private (Admin)
 */
router.get('/health', auth, requireAdmin, async (req, res) => {
  try {
    // Tester Puppeteer
    const browser = await exportService.getBrowser();
    const puppeteerStatus = browser ? 'OK' : 'ERROR';
    
    // Vérifier le répertoire d'exports
    const exportsDir = path.join(__dirname, '../../exports');
    let exportsDirStatus = 'OK';
    try {
      await fs.access(exportsDir);
    } catch {
      exportsDirStatus = 'ERROR - Répertoire non accessible';
    }

    res.json({
      success: true,
      status: {
        puppeteer: puppeteerStatus,
        exportsDirectory: exportsDirStatus,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erreur health check exports:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du service d\'export',
      error: error.message
    });
  }
});

export default router;
