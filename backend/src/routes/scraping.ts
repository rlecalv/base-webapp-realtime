import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { createScrapingJob, executeScrapingJob } from '../services/scrapingService';
import { ScrapingJob } from '../models';

const router = Router();

/**
 * POST /api/v1/scraping/jobs
 * Crée un nouveau job de scraping (admin uniquement)
 */
router.post(
  '/jobs',
  [
    authenticateToken,
    body('site').isIn(['seloger', 'leboncoin', 'pap']).withMessage('Site invalide'),
    body('type').isIn(['annonces', 'transactions']).withMessage('Type invalide'),
    body('parametres').isObject().withMessage('Paramètres invalides'),
    body('parametres.code_postal').optional().matches(/^\d{5}$/),
    body('parametres.ville').optional().trim(),
    body('parametres.surface_min').optional().isFloat({ min: 0 }),
    body('parametres.surface_max').optional().isFloat({ min: 0 }),
    body('parametres.prix_min').optional().isFloat({ min: 0 }),
    body('parametres.prix_max').optional().isFloat({ min: 0 }),
    body('parametres.scrapeDetails').optional().isBoolean()
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Vérifier les droits admin
      if (!req.user?.is_admin) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé. Droits administrateur requis.'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { site, type, parametres } = req.body;

      const job = await createScrapingJob(site, type, parametres);

      return res.status(201).json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Erreur lors de la création du job de scraping:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la création du job'
      });
    }
  }
);

/**
 * GET /api/v1/scraping/jobs
 * Liste les jobs de scraping (admin uniquement)
 */
router.get(
  '/jobs',
  [
    authenticateToken,
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('statut').optional().isIn(['en_attente', 'en_cours', 'termine', 'erreur']),
    query('site').optional().isIn(['seloger', 'leboncoin', 'pap'])
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Vérifier les droits admin
      if (!req.user?.is_admin) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé. Droits administrateur requis.'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = (page - 1) * limit;

      const whereClause: any = {};
      if (req.query.statut) {
        whereClause.statut = req.query.statut;
      }
      if (req.query.site) {
        whereClause.site = req.query.site;
      }

      const { rows: jobs, count: total } = await ScrapingJob.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return res.json({
        success: true,
        data: jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des jobs:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des jobs'
      });
    }
  }
);

/**
 * GET /api/v1/scraping/jobs/:id
 * Récupère un job de scraping par son ID (admin uniquement)
 */
router.get(
  '/jobs/:id',
  [authenticateToken],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Vérifier les droits admin
      if (!req.user?.is_admin) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé. Droits administrateur requis.'
        });
      }

      const job = await ScrapingJob.findByPk(parseInt(req.params.id));

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job de scraping non trouvé'
        });
      }

      return res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du job:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du job'
      });
    }
  }
);

/**
 * POST /api/v1/scraping/jobs/:id/execute
 * Exécute manuellement un job de scraping (admin uniquement)
 */
router.post(
  '/jobs/:id/execute',
  [authenticateToken],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Vérifier les droits admin
      if (!req.user?.is_admin) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé. Droits administrateur requis.'
        });
      }

      const jobId = parseInt(req.params.id);
      await executeScrapingJob(jobId);

      return res.json({
        success: true,
        message: 'Job de scraping exécuté avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de l\'exécution du job:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'exécution du job'
      });
    }
  }
);

export default router;

