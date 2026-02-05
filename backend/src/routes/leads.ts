import { Router, Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { Lead, Estimation } from '../models';
import { LeadAttributes } from '../types';

const router = Router();

/**
 * POST /api/v1/leads
 * Crée un nouveau lead
 */
router.post(
  '/',
  [
    body('estimation_id').isInt(),
    body('email').isEmail().normalizeEmail(),
    body('telephone').optional().matches(/^(\+33|0)[1-9](\d{2}){4}$/),
    body('nom').optional().trim(),
    body('prenom').optional().trim(),
    body('type_bien_interesse').optional().trim(),
    body('budget_max').optional().isFloat({ min: 0 })
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const {
        estimation_id,
        email,
        telephone,
        nom,
        prenom,
        type_bien_interesse,
        budget_max
      } = req.body;

      // Vérifier que l'estimation existe
      const estimation = await Estimation.findByPk(estimation_id);
      if (!estimation) {
        return res.status(404).json({
          success: false,
          error: 'Estimation non trouvée'
        });
      }

      // Créer le lead
      const lead = await Lead.create({
        estimation_id: parseInt(estimation_id),
        email,
        telephone,
        nom,
        prenom,
        type_bien_interesse,
        budget_max: budget_max ? parseFloat(budget_max) : undefined,
        statut: 'nouveau'
      } as LeadAttributes);

      return res.status(201).json({
        success: true,
        data: lead
      });
    } catch (error) {
      console.error('Erreur lors de la création du lead:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du lead'
      });
    }
  }
);

/**
 * GET /api/v1/leads
 * Liste des leads (admin uniquement)
 */
router.get(
  '/',
  [authenticateToken],
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('statut').optional().isIn(['nouveau', 'contacte', 'convertis', 'perdu'])
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

      const { rows: leads, count: total } = await Lead.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Estimation,
            as: 'estimation',
            include: [
              {
                model: require('../models/Bien').default,
                as: 'bien'
              }
            ]
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return res.json({
        success: true,
        data: leads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des leads:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des leads'
      });
    }
  }
);

/**
 * GET /api/v1/leads/:id
 * Récupère un lead par son ID (admin uniquement)
 */
router.get(
  '/:id',
  [authenticateToken, param('id').isInt()],
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

      const lead = await Lead.findByPk(parseInt(req.params.id), {
        include: [
          {
            model: Estimation,
            as: 'estimation',
            include: [
              {
                model: require('../models/Bien').default,
                as: 'bien'
              }
            ]
          }
        ]
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead non trouvé'
        });
      }

      return res.json({
        success: true,
        data: lead
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du lead:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du lead'
      });
    }
  }
);

/**
 * PATCH /api/v1/leads/:id
 * Met à jour un lead (admin uniquement)
 */
router.patch(
  '/:id',
  [
    authenticateToken,
    param('id').isInt(),
    body('statut').optional().isIn(['nouveau', 'contacte', 'convertis', 'perdu']),
    body('notes').optional().trim()
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

      const lead = await Lead.findByPk(parseInt(req.params.id));
      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead non trouvé'
        });
      }

      const { statut, notes } = req.body;
      if (statut) {
        lead.statut = statut;
      }
      if (notes !== undefined) {
        lead.notes = notes;
      }

      await lead.save();

      return res.json({
        success: true,
        data: lead
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du lead:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour du lead'
      });
    }
  }
);

export default router;

