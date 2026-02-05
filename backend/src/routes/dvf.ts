import { Router, Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  downloadAndIndexDVFIdf,
  searchDVFTransactions
} from '../services/dvfService';

const router = Router();

/**
 * POST /api/v1/dvf/download-idf
 * Télécharge et indexe les fichiers DVF pour l'Île-de-France
 * Note: En développement, accessible sans authentification pour faciliter les tests
 */
router.post(
  '/download-idf',
  async (req: Request, res: Response) => {
    try {
      // En production, décommenter pour exiger l'authentification admin
      // if (!req.user?.is_admin) {
      //   return res.status(403).json({
      //     success: false,
      //     error: 'Accès refusé. Droits administrateur requis.'
      //   });
      // }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      console.log('Démarrage du téléchargement et indexation des données DVF géolocalisées pour l\'Île-de-France...');
      
      const nombreComparables = await downloadAndIndexDVFIdf();

      return res.json({
        success: true,
        message: `${nombreComparables} comparables DVF importés pour l'Île-de-France`,
        data: {
          comparables_importes: nombreComparables
        }
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement DVF:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors du téléchargement DVF'
      });
    }
  }
);

/**
 * GET /api/v1/dvf/search
 * Recherche des transactions DVF dans la base de données
 */
router.get(
  '/search',
  [
    query('code_postal').optional().matches(/^\d{5}$/),
    query('code_departement').optional().isLength({ min: 2, max: 3 }),
    query('ville').optional().trim(),
    query('date_debut').optional().isISO8601(),
    query('date_fin').optional().isISO8601(),
    query('type_local').optional().isIn(['Maison', 'Appartement', 'Local industriel. commercial ou assimilé']),
    query('surface_min').optional().isFloat({ min: 0 }),
    query('surface_max').optional().isFloat({ min: 0 }),
    query('prix_min').optional().isFloat({ min: 0 }),
    query('prix_max').optional().isFloat({ min: 0 }),
    query('rayon').optional().isFloat({ min: 0 }),
    query('latitude').optional().isFloat(),
    query('longitude').optional().isFloat()
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

      const params: any = {};
      if (req.query.code_postal) params.code_postal = req.query.code_postal as string;
      if (req.query.code_departement) params.code_departement = req.query.code_departement as string;
      if (req.query.ville) params.ville = req.query.ville as string;
      if (req.query.date_debut) params.date_debut = req.query.date_debut as string;
      if (req.query.date_fin) params.date_fin = req.query.date_fin as string;
      if (req.query.type_local) params.type_local = req.query.type_local as string;
      if (req.query.surface_min) params.surface_min = parseFloat(req.query.surface_min as string);
      if (req.query.surface_max) params.surface_max = parseFloat(req.query.surface_max as string);
      if (req.query.prix_min) params.prix_min = parseFloat(req.query.prix_min as string);
      if (req.query.prix_max) params.prix_max = parseFloat(req.query.prix_max as string);
      if (req.query.rayon) params.rayon = parseFloat(req.query.rayon as string);
      if (req.query.latitude) params.latitude = parseFloat(req.query.latitude as string);
      if (req.query.longitude) params.longitude = parseFloat(req.query.longitude as string);

      const comparables = await searchDVFTransactions(params);

      return res.json({
        success: true,
        data: comparables,
        count: comparables.length
      });
    } catch (error) {
      console.error('Erreur lors de la recherche DVF:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche DVF'
      });
    }
  }
);

export default router;

