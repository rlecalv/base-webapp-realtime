import express, { Request, Response, NextFunction } from 'express';
import exportService from '../services/exportService';
import auth from '../middleware/auth';
import { exportLimiter } from '../middleware/rateLimiting';
import { body, query, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Middleware de validation des erreurs
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors.array()
    });
    return;
  }
  next();
};

// Middleware pour vérifier les permissions admin (pour certains exports)
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.is_admin) {
    res.status(403).json({
      success: false,
      message: 'Accès refusé. Droits administrateur requis.'
    });
    return;
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
  exportLimiter,
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
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { format = 'excel', dateFrom, dateTo, isActive, isAdmin } = req.query;
      
      const filters: any = {};
      if (dateFrom) filters.dateFrom = dateFrom as string;
      if (dateTo) filters.dateTo = dateTo as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (isAdmin !== undefined) filters.isAdmin = isAdmin === 'true';

      const result = await exportService.exportUsers(format as string, filters);

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.buffer);
        return;
      } else {
        // Pour Excel et CSV, renvoyer le fichier
        res.download(result.filepath, result.filename, (err: any) => {
          if (err) {
            console.error('Erreur lors du téléchargement:', err);
            res.status(500).json({
              success: false,
              message: 'Erreur lors du téléchargement du fichier'
            });
          }
        });
      }
    } catch (error: any) {
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
  exportLimiter,
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
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { format = 'excel', dateFrom, dateTo, userId, messageType } = req.query;
      
      const filters: any = {};
      if (dateFrom) filters.dateFrom = dateFrom as string;
      if (dateTo) filters.dateTo = dateTo as string;
      if (userId) filters.userId = parseInt(userId as string);
      if (messageType) filters.messageType = messageType as string;

      // Si l'utilisateur n'est pas admin, il ne peut exporter que ses propres messages
      if (!req.user?.is_admin) {
        filters.userId = req.user?.id;
      }

      const result = await exportService.exportMessages(format as string, filters);

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.buffer);
        return;
      } else {
        res.download(result.filepath, result.filename, (err: any) => {
          if (err) {
            console.error('Erreur lors du téléchargement:', err);
            res.status(500).json({
              success: false,
              message: 'Erreur lors du téléchargement du fichier'
            });
          }
        });
      }
    } catch (error: any) {
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
  exportLimiter,
  [
    query('format')
      .optional()
      .isIn(['pdf', 'excel'])
      .withMessage('Format doit être pdf ou excel pour les statistiques'),
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { format = 'pdf' } = req.query;
      
      const result = await exportService.exportStatistics(format as string);

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.buffer);
        return;
      } else {
        res.download(result.filepath, result.filename, (err: any) => {
          if (err) {
            console.error('Erreur lors du téléchargement:', err);
            res.status(500).json({
              success: false,
              message: 'Erreur lors du téléchargement du fichier'
            });
          }
        });
      }
    } catch (error: any) {
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
 * @route GET /api/v1/exports/health
 * @desc Vérification de l'état du service d'export
 * @access Public
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Service d\'export opérationnel',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/v1/exports/formats
 * @desc Liste des formats d'export disponibles
 * @access Private
 */
router.get('/formats', auth, (req: Request, res: Response) => {
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
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { days = 7 } = req.query;
      
      await exportService.cleanupOldExports(parseInt(days as string));
      
      res.json({
        success: true,
        message: `Nettoyage des fichiers d'export de plus de ${days} jours effectué`
      });
    } catch (error: any) {
      console.error('Erreur nettoyage exports:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du nettoyage des exports',
        error: error.message
      });
    }
  }
);

export default router;