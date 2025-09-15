import { Router } from 'express';
import { sequelize } from '../models';

const router = Router();

// Route pour la liste du patrimoine
router.get('/patrimoine', async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT * FROM view_list_patrimoine
      ORDER BY revenus_annuels DESC
    `);
    
    res.json({
      success: true,
      data: results,
      total: results.length,
      message: 'Liste du patrimoine récupérée avec succès'
    });
  } catch (error) {
    console.error('Erreur récupération patrimoine:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du patrimoine'
    });
  }
});

// Route pour le détail d'un actif
router.get('/patrimoine/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await sequelize.query(`
      SELECT * FROM view_detail_patrimoine
      WHERE actif_id = :id
    `, {
      replacements: { id }
    });
    
    res.json({
      success: true,
      data: results,
      message: 'Détail du patrimoine récupéré avec succès'
    });
  } catch (error) {
    console.error('Erreur récupération détail patrimoine:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du détail'
    });
  }
});

// Route pour la liste des locataires
router.get('/locataires', async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT * FROM view_list_locataires
      ORDER BY total_loyers_annuels DESC
    `);
    
    res.json({
      success: true,
      data: results,
      total: results.length,
      message: 'Liste des locataires récupérée avec succès'
    });
  } catch (error) {
    console.error('Erreur récupération locataires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des locataires'
    });
  }
});

// Route pour la liste des sociétés
router.get('/societes', async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT * FROM view_list_societes
      ORDER BY revenus_bruts_totaux DESC
    `);
    
    res.json({
      success: true,
      data: results,
      total: results.length,
      message: 'Liste des sociétés récupérée avec succès'
    });
  } catch (error) {
    console.error('Erreur récupération sociétés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sociétés'
    });
  }
});

// Route pour la liste des dettes
router.get('/dettes', async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT * FROM view_list_dettes
      ORDER BY capital_restant_du DESC
    `);
    
    res.json({
      success: true,
      data: results,
      total: results.length,
      message: 'Liste des dettes récupérée avec succès'
    });
  } catch (error) {
    console.error('Erreur récupération dettes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des dettes'
    });
  }
});

// Route pour la synthèse globale
router.get('/synthese', async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT * FROM view_synthese_globale
    `);
    
    res.json({
      success: true,
      data: results[0],
      message: 'Synthèse globale récupérée avec succès'
    });
  } catch (error) {
    console.error('Erreur récupération synthèse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la synthèse'
    });
  }
});

// Route pour les échéances prochaines
router.get('/echeances', async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT * FROM view_echeances_prochaines
      ORDER BY date_echeance ASC
    `);
    
    res.json({
      success: true,
      data: results,
      total: results.length,
      message: 'Échéances prochaines récupérées avec succès'
    });
  } catch (error) {
    console.error('Erreur récupération échéances:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des échéances'
    });
  }
});

export default router;
