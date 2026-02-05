import { Bien, Estimation, Comparable, User } from '../models';
import { BienAttributes, EstimationAttributes } from '../types';
import redisClient from '../config/redis';
import { Op } from 'sequelize';
import { geocodeAddressToCoordinates } from './geocodingService';

interface EstimationResult {
  valeur_estimee: number;
  valeur_min: number;
  valeur_max: number;
  confiance: number;
  nombre_comparables: number;
  comparables: Comparable[];
  details: {
    methode: string;
    prix_m2_median: number;
    prix_m2_min: number;
    prix_m2_max: number;
    ajustements: Record<string, any>;
  };
}

/**
 * Calcule la distance en km entre deux points GPS (formule de Haversine)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Trouve les comparables pertinents pour un bien
 */
async function findComparables(
  bien: Bien,
  rayonKm: number = 2,
  maxComparables: number = 20
): Promise<Comparable[]> {
  const { code_postal, ville, type, surface_totale, latitude, longitude } = bien;

  let whereClause: any = {
    code_postal,
    ville
  };

  // Si on a des coordonnées GPS, on peut faire une recherche par rayon
  if (latitude && longitude) {
    // Pour l'instant, on filtre par code postal et ville
    // TODO: Implémenter recherche géospatiale avec PostGIS si nécessaire
  }

  // Filtrer par type de bien similaire
  // Pour un immeuble en bloc, on cherche d'autres immeubles en bloc
  // Pour un appartement, on cherche des appartements, etc.
  const typeMapping: Record<string, string[]> = {
    immeuble_bloc: ['immeuble_bloc'],
    appartement: ['appartement'],
    maison: ['maison'],
    part_indivise: ['appartement', 'maison', 'immeuble_bloc']
  };

  // Recherche élargie si pas de résultats exacts
  let comparables = await Comparable.findAll({
    where: whereClause,
    limit: maxComparables * 2,
    order: [
      ['date_transaction', 'DESC'],
      ['date_publication', 'DESC']
    ]
  });

  // Si aucun résultat exact, élargir la recherche au département (mais toujours avec données réelles)
  if (comparables.length === 0) {
    console.log(`Aucun comparable trouvé pour ${code_postal} ${ville}, élargissement au département ${bien.departement}`);
    comparables = await Comparable.findAll({
      where: {
        code_postal: {
          [Op.like]: `${bien.departement}%`
        }
      },
      limit: maxComparables * 2,
      order: [
        ['date_transaction', 'DESC'],
        ['date_publication', 'DESC']
      ]
    });
  }

  // Filtrer et trier par pertinence
  const comparablesFiltered = comparables
    .map((comp) => {
      let distance = 0;
      if (latitude && longitude && comp.latitude && comp.longitude) {
        distance = calculateDistance(
          Number(latitude),
          Number(longitude),
          Number(comp.latitude),
          Number(comp.longitude)
        );
      }

      // Calculer un score de similarité
      const surfaceDiff = Math.abs(Number(comp.surface) - Number(surface_totale));
      const surfaceSimilarity = 1 - Math.min(surfaceDiff / Number(surface_totale), 1);

      return {
        comparable: comp,
        distance,
        surfaceSimilarity,
        score: surfaceSimilarity * (1 - Math.min(distance / rayonKm, 1))
      };
    })
    .filter((item) => item.distance <= rayonKm || item.distance === 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxComparables)
    .map((item) => {
      const comp = item.comparable;
      if (item.distance > 0) {
        comp.distance_bien = Number(item.distance.toFixed(2));
      }
      return comp;
    });

  return comparablesFiltered;
}

/**
 * Calcule l'estimation d'un bien basée sur les comparables
 */
export async function calculateEstimation(
  bien: Bien,
  method: 'comparables_dvf' | 'comparables_offres' | 'mixte' = 'mixte'
): Promise<EstimationResult> {
  const cacheKey = `estimation:${bien.id}:${method}`;
  
  // Vérifier le cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Trouver les comparables
  const comparables = await findComparables(bien);

  // Filtrer selon la méthode
  let comparablesFiltered = comparables;
  if (method === 'comparables_dvf') {
    comparablesFiltered = comparables.filter((c) => c.type === 'transaction' && c.source === 'dvf');
  } else if (method === 'comparables_offres') {
    comparablesFiltered = comparables.filter((c) => c.type === 'offre');
  }

  // Pas de fallback : on exige des données réelles
  if (comparablesFiltered.length === 0) {
    const methodLabel = method === 'comparables_dvf' ? 'transactions DVF' : 
                        method === 'comparables_offres' ? 'annonces immobilières' : 
                        'comparables';
    const errorMessage = `Aucun ${methodLabel} trouvé pour ce bien (${bien.code_postal} ${bien.ville}). ` +
      `Veuillez d'abord importer les données DVF ou lancer le scraping des annonces immobilières pour cette zone.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Calculer les prix au m²
  const prixM2 = comparablesFiltered.map((c) => Number(c.prix_m2));
  const prixM2Sorted = [...prixM2].sort((a, b) => a - b);

  // Médiane
  const mediane = prixM2Sorted.length % 2 === 0
    ? (prixM2Sorted[prixM2Sorted.length / 2 - 1] + prixM2Sorted[prixM2Sorted.length / 2]) / 2
    : prixM2Sorted[Math.floor(prixM2Sorted.length / 2)];

  // Quartiles
  const q1Index = Math.floor(prixM2Sorted.length / 4);
  const q3Index = Math.floor((prixM2Sorted.length * 3) / 4);
  const q1 = prixM2Sorted[q1Index];
  const q3 = prixM2Sorted[q3Index];

  // Prix au m² de référence
  const prixM2Reference = mediane;

  // Ajustements selon les caractéristiques du bien
  const ajustements: Record<string, number> = {};
  let coefficientAjustement = 1;

  // Ajustement selon l'état général
  const etatCoefficients: Record<string, number> = {
    excellent: 1.1,
    bon: 1.0,
    moyen: 0.9,
    a_renover: 0.7
  };
  coefficientAjustement *= etatCoefficients[bien.etat_general] || 1.0;
  ajustements.etat_general = etatCoefficients[bien.etat_general] || 1.0;

  // Ajustement selon l'année de construction
  if (bien.annee_construction) {
    const anneeActuelle = new Date().getFullYear();
    const age = anneeActuelle - bien.annee_construction;
    if (age < 5) {
      coefficientAjustement *= 1.05;
      ajustements.annee_construction = 1.05;
    } else if (age > 50) {
      coefficientAjustement *= 0.95;
      ajustements.annee_construction = 0.95;
    }
  }

  // Ajustement selon le DPE
  const caracteristiques = bien.caracteristiques || {};
  const dpe = caracteristiques.dpe;
  if (dpe && typeof dpe === 'string') {
    const dpeCoefficients: Record<string, number> = {
      A: 1.0,
      B: 1.0,
      C: 1.0,
      D: 0.98,
      E: 0.95,
      F: 0.90, // -10% pour DPE F
      G: 0.85  // -15% pour DPE G
    };
    const dpeCoeff = dpeCoefficients[dpe.toUpperCase()] || 1.0;
    if (dpeCoeff !== 1.0) {
      coefficientAjustement *= dpeCoeff;
      ajustements.dpe = dpeCoeff;
    }
  }

  // Décote pour occupation (vacance commerciale)
  const occupe = caracteristiques.occupe;
  if (occupe === true || occupe === 'true') {
    // Décote de 5% pour bien occupé (risque de vacance commerciale)
    coefficientAjustement *= 0.95;
    ajustements.occupation = 0.95;
  }

  // Décote pour immeuble en bloc
  if (bien.type === 'immeuble_bloc') {
    // Décote de 10% pour immeuble en bloc (complexité de gestion, copropriété)
    coefficientAjustement *= 0.90;
    ajustements.immeuble_bloc = 0.90;
  }

  // Traitement spécial pour parts indivises
  if (bien.type === 'part_indivise') {
    // Valoriser comme un immeuble en bloc d'abord
    if (!ajustements.immeuble_bloc) {
      coefficientAjustement *= 0.90;
      ajustements.immeuble_bloc = 0.90;
    }
    
    // Décote supplémentaire pour parts indivises (-15%)
    coefficientAjustement *= 0.85;
    ajustements.parts_indivises = 0.85;
    
    // Décote pour illiquidité (-10%)
    coefficientAjustement *= 0.90;
    ajustements.illiquidite = 0.90;
    
    // Appliquer la quote-part si renseignée
    if (bien.quote_part && bien.quote_part > 0 && bien.quote_part <= 1) {
      // La valeur totale est multipliée par la quote-part
      // Mais on garde le coefficient d'ajustement pour le calcul du prix au m²
      ajustements.quote_part = bien.quote_part;
    }
  }

  // Calcul de la valeur estimée
  let valeurEstimee = Number(bien.surface_totale) * prixM2Reference * coefficientAjustement;

  // Pour les parts indivises, appliquer la quote-part sur la valeur totale
  if (bien.type === 'part_indivise' && bien.quote_part && bien.quote_part > 0 && bien.quote_part <= 1) {
    valeurEstimee = valeurEstimee * bien.quote_part;
  }

  // Calcul de la fourchette (basée sur les quartiles)
  let valeurMin = Number(bien.surface_totale) * q1 * coefficientAjustement * 0.9;
  let valeurMax = Number(bien.surface_totale) * q3 * coefficientAjustement * 1.1;
  
  // Appliquer la quote-part pour les parts indivises
  if (bien.type === 'part_indivise' && bien.quote_part && bien.quote_part > 0 && bien.quote_part <= 1) {
    valeurMin = valeurMin * bien.quote_part;
    valeurMax = valeurMax * bien.quote_part;
  }

  // Arrondir les valeurs
  valeurEstimee = Math.round(valeurEstimee);
  valeurMin = Math.round(valeurMin);
  valeurMax = Math.round(valeurMax);

  // Score de confiance (basé sur le nombre de comparables et leur qualité)
  let confiance = Math.min(comparablesFiltered.length * 5, 80); // Max 80% avec 16+ comparables
  if (method === 'comparables_dvf') {
    confiance += 10; // Les transactions DVF sont plus fiables
  }
  confiance = Math.min(confiance, 95); // Max 95%

  const result: EstimationResult = {
    valeur_estimee: valeurEstimee, // Déjà arrondi ligne 298
    valeur_min: valeurMin, // Déjà arrondi ligne 299
    valeur_max: valeurMax, // Déjà arrondi ligne 300
    confiance: Math.round(confiance),
    nombre_comparables: comparablesFiltered.length,
    comparables: comparablesFiltered,
    details: {
      methode: method,
      prix_m2_median: Math.round(mediane),
      prix_m2_min: Math.round(q1),
      prix_m2_max: Math.round(q3),
      ajustements
    }
  };

  // Mettre en cache pour 24h
  await redisClient.setEx(cacheKey, 86400, JSON.stringify(result));

  return result;
}

/**
 * Crée une estimation complète (bien + calcul)
 */
export async function createEstimation(
  bienData: Partial<BienAttributes>,
  userId?: number,
  method: 'comparables_dvf' | 'comparables_offres' | 'mixte' = 'mixte'
): Promise<Estimation> {
  try {
    // S'assurer que caracteristiques est un objet
    if (!bienData.caracteristiques || typeof bienData.caracteristiques !== 'object') {
      bienData.caracteristiques = {};
    }

    // Géocoder l'adresse si les coordonnées GPS manquent
    if (!bienData.latitude || !bienData.longitude) {
      const coordinates = await geocodeAddressToCoordinates(
        bienData.adresse || '',
        bienData.code_postal,
        bienData.ville
      );
      if (coordinates) {
        bienData.latitude = coordinates.latitude;
        bienData.longitude = coordinates.longitude;
      }
    }

    // Créer ou trouver le bien
    const bien = await Bien.create(bienData as BienAttributes);

    // Calculer l'estimation
    const estimationResult = await calculateEstimation(bien, method);

    // Créer l'enregistrement d'estimation
    const estimationData: any = {
      bien_id: bien.id,
      valeur_estimee: estimationResult.valeur_estimee,
      valeur_min: estimationResult.valeur_min,
      valeur_max: estimationResult.valeur_max,
      methode: method,
      nombre_comparables: estimationResult.nombre_comparables,
      confiance: estimationResult.confiance,
      details: estimationResult.details
    };
    
    if (userId) {
      estimationData.user_id = userId;
    }
    
    const estimation = await Estimation.create(estimationData);

    // Sauvegarder les comparables avec référence à l'estimation
    // Note: On pourrait créer une table de liaison si nécessaire
    for (const comparable of estimationResult.comparables) {
      if (!comparable.distance_bien && bien.latitude && bien.longitude && comparable.latitude && comparable.longitude) {
        const distance = calculateDistance(
          Number(bien.latitude),
          Number(bien.longitude),
          Number(comparable.latitude),
          Number(comparable.longitude)
        );
        await comparable.update({ distance_bien: Number(distance.toFixed(2)) });
      }
    }

    return estimation;
  } catch (error) {
    console.error('Erreur dans createEstimation:', error);
    // Si le bien a été créé mais l'estimation a échoué, on pourrait le supprimer
    // Mais pour l'instant on laisse le bien en base pour debug
    throw error;
  }
}

/**
 * Récupère une estimation avec ses détails
 */
export async function getEstimationById(id: number): Promise<Estimation | null> {
  return await Estimation.findByPk(id, {
    include: [
      { model: Bien, as: 'bien' },
      { model: User, as: 'user', required: false }
    ]
  });
}

/**
 * Récupère les comparables d'une estimation
 */
export async function getEstimationComparables(
  bienId: number,
  method?: 'comparables_dvf' | 'comparables_offres' | 'mixte'
): Promise<Comparable[]> {
  const bien = await Bien.findByPk(bienId);
  if (!bien) {
    throw new Error('Bien non trouvé');
  }

  const comparables = await findComparables(bien);
  
  if (method) {
    if (method === 'comparables_dvf') {
      return comparables.filter((c) => c.type === 'transaction' && c.source === 'dvf');
    } else if (method === 'comparables_offres') {
      return comparables.filter((c) => c.type === 'offre');
    }
  }

  return comparables;
}

