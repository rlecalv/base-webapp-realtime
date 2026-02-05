import { Router, Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  createEstimation,
  getEstimationById,
  getEstimationComparables,
  calculateEstimation
} from '../services/estimationService';
import { Bien } from '../models';
import { searchDVFTransactions } from '../services/dvfService';

const router = Router();

/**
 * POST /api/v1/estimations
 * Crée une nouvelle estimation
 */
router.post(
  '/',
  [
    body('type').isIn(['immeuble_bloc', 'appartement', 'maison', 'part_indivise']),
    body('adresse').notEmpty().trim(),
    body('code_postal').matches(/^\d{5}$/),
    body('ville').notEmpty().trim(),
    body('departement').isLength({ min: 2, max: 3 }),
    body('surface_totale').isFloat({ min: 0 }),
    body('etat_general').isIn(['excellent', 'bon', 'moyen', 'a_renover']),
    body('methode').optional().isIn(['comparables_dvf', 'comparables_offres', 'mixte']),
    body('nombre_lots').optional().isInt({ min: 1 }),
    body('quote_part').optional().isFloat({ min: 0, max: 1 }),
    body('annee_construction').optional().isInt({ min: 1000 }),
    body('latitude').optional().isFloat(),
    body('longitude').optional().isFloat()
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const {
        type,
        adresse,
        code_postal,
        ville,
        departement,
        surface_totale,
        etat_general,
        methode = 'mixte',
        nombre_lots,
        quote_part,
        annee_construction,
        latitude,
        longitude,
        caracteristiques = {}
      } = req.body;

      // Créer l'estimation
      const estimation = await createEstimation(
        {
          type,
          adresse,
          code_postal,
          ville,
          departement,
          surface_totale: parseFloat(surface_totale),
          etat_general,
          nombre_lots: nombre_lots ? parseInt(nombre_lots) : undefined,
          quote_part: quote_part ? parseFloat(quote_part) : undefined,
          annee_construction: annee_construction ? parseInt(annee_construction) : undefined,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          caracteristiques
        },
        req.user?.id,
        methode
      );

      // Charger les relations
      const estimationWithDetails = await getEstimationById(estimation.id);

      return res.status(201).json({
        success: true,
        data: estimationWithDetails
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'estimation:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'estimation'
      });
    }
  }
);

/**
 * GET /api/v1/estimations/:id
 * Récupère une estimation par son ID
 */
router.get(
  '/:id',
  [param('id').isInt()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const estimation = await getEstimationById(parseInt(req.params.id));

      if (!estimation) {
        return res.status(404).json({
          success: false,
          error: 'Estimation non trouvée'
        });
      }

      return res.json({
        success: true,
        data: estimation
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'estimation:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération de l\'estimation'
      });
    }
  }
);

/**
 * GET /api/v1/estimations/:id/comparables
 * Récupère les comparables d'une estimation
 */
router.get(
  '/:id/comparables',
  [
    param('id').isInt(),
    query('methode').optional().isIn(['comparables_dvf', 'comparables_offres', 'mixte'])
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

      const estimation = await getEstimationById(parseInt(req.params.id));
      if (!estimation) {
        return res.status(404).json({
          success: false,
          error: 'Estimation non trouvée'
        });
      }

      const comparables = await getEstimationComparables(
        estimation.bien_id,
        req.query.methode as any
      );

      return res.json({
        success: true,
        data: comparables
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des comparables:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des comparables'
      });
    }
  }
);

/**
 * POST /api/v1/estimations/:id/import-dvf
 * Importe les transactions DVF pour enrichir les comparables
 * Requiert authentification admin
 */
router.post(
  '/:id/import-dvf',
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

      const estimation = await getEstimationById(parseInt(req.params.id));
      if (!estimation) {
        return res.status(404).json({
          success: false,
          error: 'Estimation non trouvée'
        });
      }

      const bien = await Bien.findByPk(estimation.bien_id);
      if (!bien) {
        return res.status(404).json({
          success: false,
          error: 'Bien non trouvé'
        });
      }

      // Rechercher les transactions DVF existantes dans la base
      const comparables = await searchDVFTransactions({
        code_postal: bien.code_postal,
        code_departement: bien.departement,
        latitude: bien.latitude ? Number(bien.latitude) : undefined,
        longitude: bien.longitude ? Number(bien.longitude) : undefined,
        rayon: 2 // 2 km de rayon
      });

      return res.json({
        success: true,
        message: `${comparables.length} comparables DVF importés`,
        data: {
          comparables_importes: comparables.length
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'import DVF:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'import DVF'
      });
    }
  }
);

export default router;

