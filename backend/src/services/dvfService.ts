import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { createGunzip } from 'zlib';
import csv from 'csv-parser';
import { Comparable } from '../models';
import { ComparableAttributes } from '../types';
import redisClient from '../config/redis';
import { Op } from 'sequelize';

/**
 * Service pour télécharger et parser les fichiers DVF géolocalisées d'Etalab
 * Documentation: https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres-geolocalisees/
 * 
 * Format des fichiers :
 * - CSV avec séparateur virgule et encodage UTF-8
 * - Disponibles par département ou par commune
 * - Format compressé .csv.gz disponible
 * 
 * Pour l'Île-de-France, les départements concernés sont : 75, 77, 78, 91, 92, 93, 94, 95
 */

interface DVFTransaction {
  id_mutation?: string;
  date_mutation?: string;
  numero_disposition?: number;
  nature_mutation?: string;
  valeur_fonciere?: number;
  adresse_numero?: string;
  adresse_suffixe?: string;
  adresse_code_voie?: string;
  adresse_nom_voie?: string;
  code_postal?: string;
  code_commune?: string;
  nom_commune?: string;
  code_departement?: string;
  id_parcelle?: string;
  nombre_lots?: number;
  code_type_local?: string;
  type_local?: string;
  surface_reelle_bati?: number;
  nombre_pieces_principales?: number;
  code_nature_culture?: string;
  nature_culture?: string;
  code_nature_culture_speciale?: string;
  nature_culture_speciale?: string;
  surface_terrain?: number;
  longitude?: number;
  latitude?: number;
}

interface DVFSearchParams {
  code_postal?: string;
  code_commune?: string;
  code_departement?: string;
  date_debut?: string; // Format YYYY-MM-DD
  date_fin?: string; // Format YYYY-MM-DD
  type_local?: string; // 'Maison', 'Appartement', 'Local industriel. commercial ou assimilé'
  surface_min?: number;
  surface_max?: number;
  prix_min?: number;
  prix_max?: number;
  rayon?: number; // En km, nécessite latitude/longitude
  latitude?: number;
  longitude?: number;
}

// Départements d'Île-de-France
const DEPARTEMENTS_IDF = ['75', '77', '78', '91', '92', '93', '94', '95'];

// Répertoire pour stocker les fichiers DVF téléchargés
const DVF_DATA_DIR = path.join(__dirname, '../../data/dvf');

// URL spécifique pour télécharger le fichier DVF géolocalisé complet pour l'Île-de-France
const DVF_IDF_URL = 'https://static.data.gouv.fr/resources/demandes-de-valeurs-foncieres-geolocalisees/20251105-140205/dvf.csv.gz';

/**
 * Crée le répertoire de données DVF s'il n'existe pas
 */
function ensureDVFDataDir(): void {
  if (!fs.existsSync(DVF_DATA_DIR)) {
    fs.mkdirSync(DVF_DATA_DIR, { recursive: true });
  }
}

/**
 * Télécharge le fichier DVF géolocalisé complet pour l'Île-de-France
 */
export async function downloadDVFIdfFile(): Promise<string> {
  ensureDVFDataDir();

  const nomFichier = 'dvf-idf.csv.gz';
  const filepath = path.join(DVF_DATA_DIR, nomFichier);

  // Si le fichier existe déjà, ne pas le retélécharger
  if (fs.existsSync(filepath)) {
    console.log(`Fichier DVF déjà présent: ${filepath}`);
    return filepath;
  }

  try {
    console.log(`Téléchargement du fichier DVF IDF depuis ${DVF_IDF_URL}...`);
    
    const response = await axios.get(DVF_IDF_URL, {
      responseType: 'stream',
      timeout: 600000, // 10 minutes de timeout pour les gros fichiers
      headers: {
        'User-Agent': 'MonEstimation/1.0 (contact@monestimation.fr)',
        'Accept-Encoding': 'gzip'
      }
    });

    // Écrire le fichier sur le disque
    const writer = fs.createWriteStream(filepath);
    await pipeline(response.data, writer);

    console.log(`Fichier DVF téléchargé: ${filepath}`);
    return filepath;
  } catch (error: any) {
    console.error(`Erreur lors du téléchargement du fichier DVF IDF:`, error.message);
    throw new Error(`Impossible de télécharger le fichier DVF IDF: ${error.message}`);
  }
}

/**
 * Parse un fichier CSV DVF géolocalisé et retourne les transactions
 * Supporte les fichiers compressés (.csv.gz) et non compressés (.csv)
 */
export async function parseDVFFile(filepath: string): Promise<DVFTransaction[]> {
  const transactions: DVFTransaction[] = [];
  const isCompressed = filepath.endsWith('.gz');

  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filepath);
    const csvStream = csv({
      separator: ',' // Les fichiers DVF géolocalisées utilisent la virgule comme séparateur
    });

    let stream: NodeJS.ReadableStream = fileStream;
    
    // Si le fichier est compressé, décompresser d'abord
    if (isCompressed) {
      stream = fileStream.pipe(createGunzip());
    }

    stream
      .pipe(csvStream)
      .on('data', (row: any) => {
        try {
          // Parser les données selon le format DVF géolocalisé
          // Les colonnes sont normalisées avec des noms en snake_case
          const transaction: DVFTransaction = {
            id_mutation: row['id_mutation'],
            date_mutation: row['date_mutation'],
            numero_disposition: row['numero_disposition'] ? parseInt(row['numero_disposition']) : undefined,
            nature_mutation: row['nature_mutation'],
            valeur_fonciere: row['valeur_fonciere'] ? parseFloat(row['valeur_fonciere']) : undefined,
            adresse_numero: row['adresse_numero'],
            adresse_suffixe: row['adresse_suffixe'],
            adresse_code_voie: row['adresse_code_voie'],
            adresse_nom_voie: row['adresse_nom_voie'],
            code_postal: row['code_postal'],
            code_commune: row['code_commune'],
            nom_commune: row['nom_commune'],
            code_departement: row['code_departement'],
            id_parcelle: row['id_parcelle'],
            nombre_lots: row['nombre_lots'] ? parseInt(row['nombre_lots']) : undefined,
            code_type_local: row['code_type_local'],
            type_local: row['type_local'],
            surface_reelle_bati: row['surface_reelle_bati'] ? parseFloat(row['surface_reelle_bati']) : undefined,
            nombre_pieces_principales: row['nombre_pieces_principales'] ? parseInt(row['nombre_pieces_principales']) : undefined,
            code_nature_culture: row['code_nature_culture'],
            nature_culture: row['nature_culture'],
            code_nature_culture_speciale: row['code_nature_culture_speciale'],
            nature_culture_speciale: row['nature_culture_speciale'],
            surface_terrain: row['surface_terrain'] ? parseFloat(row['surface_terrain']) : undefined,
            longitude: row['longitude'] ? parseFloat(row['longitude']) : undefined,
            latitude: row['latitude'] ? parseFloat(row['latitude']) : undefined
          };

          // Filtrer uniquement les transactions valides (avec valeur foncière et surface)
          if (transaction.valeur_fonciere && transaction.valeur_fonciere > 0) {
            transactions.push(transaction);
          }
        } catch (error) {
          // Ignorer les lignes mal formées
          console.warn(`Ligne ignorée lors du parsing:`, error);
        }
      })
      .on('end', () => {
        console.log(`${transactions.length} transactions parsées depuis ${filepath}`);
        resolve(transactions);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Télécharge et indexe le fichier DVF pour l'Île-de-France
 */
export async function downloadAndIndexDVFIdf(): Promise<number> {
  try {
    console.log('Téléchargement du fichier DVF IDF...');
    
    // Télécharger le fichier
    const filepath = await downloadDVFIdfFile();
    
    // Parser le fichier
    console.log('Parsing du fichier DVF...');
    const transactions = await parseDVFFile(filepath);
    
    console.log(`${transactions.length} transactions trouvées dans le fichier`);
    
    // Filtrer uniquement les transactions de l'Île-de-France
    const transactionsIdf = transactions.filter(t => 
      t.code_departement && DEPARTEMENTS_IDF.includes(t.code_departement)
    );
    
    console.log(`${transactionsIdf.length} transactions en Île-de-France`);
    
    // Indexer dans la base de données
    let imported = 0;
    let skipped = 0;
    
    for (const transaction of transactionsIdf) {
      // Filtrer uniquement les biens bâtis (appartements, maisons, locaux)
      if (!transaction.type_local || 
          !['Maison', 'Appartement', 'Local industriel. commercial ou assimilé'].includes(transaction.type_local)) {
        skipped++;
        continue;
      }

      const comparableData = dvfTransactionToComparable(transaction);
      
      // Vérifier si le comparable existe déjà
      const existing = await Comparable.findOne({
        where: {
          source: 'dvf',
          code_postal: comparableData.code_postal,
          ville: comparableData.ville,
          adresse: comparableData.adresse,
          surface: comparableData.surface,
          prix: comparableData.prix,
          date_transaction: comparableData.date_transaction
        }
      });

      if (!existing && comparableData.code_postal && comparableData.ville) {
        await Comparable.create(comparableData as ComparableAttributes);
        imported++;
      } else {
        skipped++;
      }
    }

    console.log(`${imported} comparables importés`);
    console.log(`${skipped} transactions ignorées (doublons ou non pertinentes)`);
    
    return imported;
  } catch (error) {
    console.error(`Erreur lors du traitement du fichier DVF IDF:`, error);
    throw error;
  }
}

/**
 * Recherche les transactions DVF dans la base de données
 */
export async function searchDVFTransactions(params: DVFSearchParams): Promise<Comparable[]> {
  const whereClause: any = {
    source: 'dvf',
    type: 'transaction'
  };

  if (params.code_postal) {
    whereClause.code_postal = params.code_postal;
  }

  if (params.code_departement) {
    // Extraire le département du code postal si nécessaire
    whereClause.code_postal = {
      [Op.like]: `${params.code_departement}%`
    };
  }

  // Note: ville n'est pas dans DVFSearchParams mais peut être recherchée via code_postal

  if (params.date_debut || params.date_fin) {
    whereClause.date_transaction = {};
    if (params.date_debut) {
      whereClause.date_transaction[Op.gte] = new Date(params.date_debut);
    }
    if (params.date_fin) {
      whereClause.date_transaction[Op.lte] = new Date(params.date_fin);
    }
  }

  if (params.surface_min || params.surface_max) {
    whereClause.surface = {};
    if (params.surface_min) {
      whereClause.surface[Op.gte] = params.surface_min;
    }
    if (params.surface_max) {
      whereClause.surface[Op.lte] = params.surface_max;
    }
  }

  if (params.prix_min || params.prix_max) {
    whereClause.prix = {};
    if (params.prix_min) {
      whereClause.prix[Op.gte] = params.prix_min;
    }
    if (params.prix_max) {
      whereClause.prix[Op.lte] = params.prix_max;
    }
  }

  if (params.type_local) {
    whereClause.caracteristiques = {
      type_local: params.type_local
    };
  }

  let comparables = await Comparable.findAll({
    where: whereClause,
    limit: 1000, // Limiter les résultats
    order: [['date_transaction', 'DESC']]
  });

  // Filtrer par rayon si coordonnées fournies
  if (params.rayon && params.latitude && params.longitude) {
    comparables = comparables.filter((comp) => {
      if (!comp.latitude || !comp.longitude) return false;
      const distance = calculateDistance(
        params.latitude!,
        params.longitude!,
        Number(comp.latitude),
        Number(comp.longitude)
      );
      return distance <= params.rayon!;
    });
  }

  return comparables;
}

/**
 * Convertit une transaction DVF géolocalisée en Comparable
 */
export function dvfTransactionToComparable(transaction: DVFTransaction): Partial<ComparableAttributes> {
  const surface = transaction.surface_reelle_bati || transaction.surface_terrain || 0;
  const prix = transaction.valeur_fonciere || 0;
  const prixM2 = surface > 0 ? prix / surface : 0;

  // Construire l'adresse complète
  let adresse = '';
  if (transaction.adresse_numero) {
    adresse += transaction.adresse_numero;
    if (transaction.adresse_suffixe) {
      adresse += transaction.adresse_suffixe;
    }
    adresse += ' ';
  }
  if (transaction.adresse_nom_voie) {
    adresse += transaction.adresse_nom_voie;
  }
  if (!adresse && transaction.adresse_code_voie) {
    adresse = `Voie ${transaction.adresse_code_voie}`;
  }

  return {
    type: 'transaction',
    source: 'dvf',
    adresse: adresse.trim() || 'Adresse non disponible',
    code_postal: transaction.code_postal || '',
    ville: transaction.nom_commune || transaction.code_commune || '',
    surface: surface,
    prix: prix,
    prix_m2: Math.round(prixM2 * 100) / 100,
    date_transaction: transaction.date_mutation ? new Date(transaction.date_mutation) : undefined,
    caracteristiques: {
      nature_mutation: transaction.nature_mutation,
      type_local: transaction.type_local,
      code_type_local: transaction.code_type_local,
      nombre_pieces: transaction.nombre_pieces_principales,
      nombre_lots: transaction.nombre_lots,
      surface_terrain: transaction.surface_terrain,
      code_departement: transaction.code_departement,
      code_commune: transaction.code_commune,
      id_parcelle: transaction.id_parcelle
    },
    latitude: transaction.latitude,
    longitude: transaction.longitude
  };
}

/**
 * Récupère les transactions DVF et les sauvegarde comme comparables
 */
export async function importDVFTransactionsAsComparables(params: DVFSearchParams): Promise<Comparable[]> {
  const comparables = await searchDVFTransactions(params);
  return comparables;
}

/**
 * Calcule la distance en km entre deux points GPS (formule de Haversine)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
