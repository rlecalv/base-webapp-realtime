import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
import { Comparable, ScrapingJob } from '../models';
import { ComparableAttributes, ScrapingJobAttributes } from '../types';
import { addJob } from './queueService';

/**
 * Service de scraping respectueux des sites d'annonces immobilières
 * Respecte les robots.txt et applique un rate limiting strict
 */

interface ScrapingConfig {
  site: string;
  baseUrl: string;
  searchUrl: string;
  selectors: {
    listingContainer: string;
    title?: string;
    price: string;
    surface: string;
    address?: string;
    url?: string;
    description?: string;
    detailSelectors?: {
      photos?: string;
      etage?: string;
      exterieur?: string;
      surface_exterieur?: string;
      nombre_pieces?: string;
      description?: string;
    };
  };
  rateLimitMs: number; // Délai entre les requêtes en ms
  maxPages?: number;
}

const SCRAPING_CONFIGS: Record<string, ScrapingConfig> = {
  seloger: {
    site: 'seloger',
    baseUrl: 'https://www.seloger.com',
    searchUrl: 'https://www.seloger.com/list.htm',
    selectors: {
      listingContainer: '.c-pa-link',
      title: '.c-pa-link__title',
      price: '.c-pa-price',
      surface: '.c-pa-surface',
      address: '.c-pa-city',
      url: '.c-pa-link',
      detailSelectors: {
        photos: '.slider img, .photos img',
        etage: '[data-test="floor"], .criterion-item:contains("Étage")',
        exterieur: '[data-test="outdoor"], .criterion-item:contains("Balcon"), .criterion-item:contains("Terrasse"), .criterion-item:contains("Jardin")',
        surface_exterieur: '.criterion-item:contains("m²")',
        nombre_pieces: '[data-test="rooms"], .criterion-item:contains("pièces")',
        description: '.description, .detail-description'
      }
    },
    rateLimitMs: 2000,
    maxPages: 5
  },
  leboncoin: {
    site: 'leboncoin',
    baseUrl: 'https://www.leboncoin.fr',
    searchUrl: 'https://www.leboncoin.fr/recherche',
    selectors: {
      listingContainer: '[data-qa-id="aditem_container"]',
      title: '[data-qa-id="aditem_title"]',
      price: '[data-qa-id="aditem_price"]',
      surface: '[data-qa-id="criteria_item_surface"]',
      address: '[data-qa-id="aditem_location"]',
      url: 'a',
      detailSelectors: {
        photos: '.adview_image img, .carousel img',
        etage: '[data-qa-id="criteria_item_floor"], .criteria_item:contains("Étage")',
        exterieur: '[data-qa-id="criteria_item_outdoor"], .criteria_item:contains("Balcon"), .criteria_item:contains("Terrasse"), .criteria_item:contains("Jardin")',
        surface_exterieur: '.criteria_item:contains("m²")',
        nombre_pieces: '[data-qa-id="criteria_item_rooms"]',
        description: '[data-qa-id="adview_description"]'
      }
    },
    rateLimitMs: 3000,
    maxPages: 3
  },
  pap: {
    site: 'pap',
    baseUrl: 'https://www.pap.fr',
    searchUrl: 'https://www.pap.fr/annonces',
    selectors: {
      listingContainer: '.search-list-item',
      title: '.item-title',
      price: '.item-price',
      surface: '.item-surface',
      address: '.item-city',
      url: '.item-link',
      detailSelectors: {
        photos: '.photos img, .gallery img',
        etage: '.detail-item:contains("Étage"), .characteristic:contains("Étage")',
        exterieur: '.detail-item:contains("Balcon"), .detail-item:contains("Terrasse"), .detail-item:contains("Jardin")',
        surface_exterieur: '.detail-item:contains("m²")',
        nombre_pieces: '.detail-item:contains("pièces"), .characteristic:contains("pièces")',
        description: '.description, .detail-description'
      }
    },
    rateLimitMs: 2000,
    maxPages: 5
  }
};

/**
 * Vérifie si le scraping est autorisé selon robots.txt
 */
async function checkRobotsTxt(baseUrl: string, path: string): Promise<boolean> {
  try {
    const robotsUrl = new URL('/robots.txt', baseUrl).toString();
    const response = await axios.get(robotsUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': 'MonEstimation/1.0 (contact@monestimation.fr)'
      }
    });

    const robots = robotsParser(robotsUrl, response.data);
    return robots.isAllowed(path, 'MonEstimation/1.0') ?? true;
  } catch (error) {
    console.warn(`Impossible de vérifier robots.txt pour ${baseUrl}:`, error);
    // En cas d'erreur, on autorise mais on sera plus prudent
    return true;
  }
}

/**
 * Attend un délai aléatoire pour éviter la détection
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Scrape les détails d'une annonce individuelle
 */
async function scrapeAnnouncementDetails(
  url: string,
  config: ScrapingConfig,
  browser: Browser
): Promise<Partial<ComparableAttributes>> {
  const details: Partial<ComparableAttributes> = {
    caracteristiques: {}
  };

  try {
    const page = await browser.newPage();
    await page.setUserAgent('MonEstimation/1.0 (contact@monestimation.fr)');
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(config.rateLimitMs);

    const content = await page.content();
    const $ = cheerio.load(content);

    const detailSelectors = config.selectors.detailSelectors;
    if (detailSelectors) {
      // Extraire les photos
      if (detailSelectors.photos) {
        const photos: string[] = [];
        $(detailSelectors.photos).each((_, img) => {
          const src = $(img).attr('src') || $(img).attr('data-src');
          if (src && !src.includes('placeholder') && !src.includes('logo')) {
            const fullUrl = src.startsWith('http') ? src : new URL(src, config.baseUrl).toString();
            photos.push(fullUrl);
          }
        });
        if (photos.length > 0) {
          details.caracteristiques!.photos = photos.slice(0, 10);
        }
      }

      // Extraire l'étage
      if (detailSelectors.etage) {
        const etageText = $(detailSelectors.etage).first().text().trim();
        const etageMatch = etageText.match(/(\d+)/);
        if (etageMatch) {
          details.caracteristiques!.etage = parseInt(etageMatch[1], 10);
        } else if (etageText.toLowerCase().includes('rdc') || etageText.toLowerCase().includes('rez')) {
          details.caracteristiques!.etage = 0;
        }
      }

      // Extraire les informations sur l'extérieur
      if (detailSelectors.exterieur) {
        const exterieurText = $(detailSelectors.exterieur).first().text().trim().toLowerCase();
        const hasBalcon = exterieurText.includes('balcon');
        const hasTerrasse = exterieurText.includes('terrasse');
        const hasJardin = exterieurText.includes('jardin');
        
        if (hasBalcon || hasTerrasse || hasJardin) {
          details.caracteristiques!.exterieur = true;
          details.caracteristiques!.type_exterieur = [];
          if (hasBalcon) details.caracteristiques!.type_exterieur.push('balcon');
          if (hasTerrasse) details.caracteristiques!.type_exterieur.push('terrasse');
          if (hasJardin) details.caracteristiques!.type_exterieur.push('jardin');

          // Extraire la surface extérieure
          if (detailSelectors.surface_exterieur) {
            const surfaceExterieurText = $(detailSelectors.surface_exterieur).first().text().trim();
            const surfaceMatch = surfaceExterieurText.match(/(\d+(?:[.,]\d+)?)\s*m²/);
            if (surfaceMatch) {
              details.caracteristiques!.surface_exterieur = parseFloat(surfaceMatch[1].replace(',', '.'));
            }
          }
        } else {
          details.caracteristiques!.exterieur = false;
        }
      }

      // Extraire le nombre de pièces
      if (detailSelectors.nombre_pieces) {
        const piecesText = $(detailSelectors.nombre_pieces).first().text().trim();
        const piecesMatch = piecesText.match(/(\d+)/);
        if (piecesMatch) {
          details.caracteristiques!.nombre_pieces = parseInt(piecesMatch[1], 10);
        }
      }

      // Extraire la description
      if (detailSelectors.description) {
        const description = $(detailSelectors.description).first().text().trim();
        if (description) {
          details.caracteristiques!.description = description.substring(0, 1000);
        }
      }
    }

    await page.close();
  } catch (error) {
    console.error(`Erreur lors du scraping des détails de ${url}:`, error);
  }

  return details;
}

/**
 * Scrape une page d'annonces avec Puppeteer
 */
async function scrapePageWithPuppeteer(
  url: string,
  config: ScrapingConfig,
  scrapeDetails: boolean = true
): Promise<Partial<ComparableAttributes>[]> {
  let browser: Browser | null = null;
  const comparables: Partial<ComparableAttributes>[] = [];

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('MonEstimation/1.0 (contact@monestimation.fr)');
    await page.setViewport({ width: 1920, height: 1080 });

    // Vérifier robots.txt avant de scraper
    const path = new URL(url).pathname;
    const allowed = await checkRobotsTxt(config.baseUrl, path);
    if (!allowed) {
      throw new Error(`Scraping non autorisé par robots.txt pour ${url}`);
    }

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(config.rateLimitMs);

    const content = await page.content();
    const $ = cheerio.load(content);

    const announcementUrls: string[] = [];

    $(config.selectors.listingContainer).each((_, element) => {
      try {
        const $el = $(element);
        
        // Extraire les données
        const title = config.selectors.title
          ? $el.find(config.selectors.title).text().trim()
          : '';
        const priceText = $el.find(config.selectors.price).text().trim();
        const surfaceText = $el.find(config.selectors.surface).text().trim();
        const address = config.selectors.address
          ? $el.find(config.selectors.address).text().trim()
          : '';
        const urlSource = config.selectors.url
          ? $el.find(config.selectors.url).attr('href') || ''
          : '';

        // Parser le prix
        const priceMatch = priceText.match(/[\d\s]+/);
        const prix = priceMatch
          ? parseInt(priceMatch[0].replace(/\s/g, ''), 10)
          : 0;

        // Parser la surface
        const surfaceMatch = surfaceText.match(/[\d,]+/);
        const surface = surfaceMatch
          ? parseFloat(surfaceMatch[0].replace(',', '.'))
          : 0;

        // Parser l'adresse pour extraire code postal et ville
        const codePostalMatch = address.match(/\b\d{5}\b/);
        const codePostal = codePostalMatch ? codePostalMatch[0] : '';
        const ville = address.replace(/\b\d{5}\b/, '').trim();

        if (prix > 0 && surface > 0) {
          const prixM2 = Math.round((prix / surface) * 100) / 100;
          const fullUrl = urlSource.startsWith('http')
            ? urlSource
            : new URL(urlSource, config.baseUrl).toString();

          const comparable: Partial<ComparableAttributes> = {
            type: 'offre',
            source: config.site as any,
            adresse: address || title,
            code_postal: codePostal,
            ville: ville || '',
            surface: surface,
            prix: prix,
            prix_m2: prixM2,
            date_publication: new Date(),
            url_source: fullUrl,
            caracteristiques: {
              titre: title,
              source_site: config.site
            }
          };

          comparables.push(comparable);
          announcementUrls.push(fullUrl);
        }
      } catch (error) {
        console.error(`Erreur lors de l'extraction d'une annonce:`, error);
      }
    });

    await page.close();

    // Scraper les détails de chaque annonce si demandé
    if (scrapeDetails && browser && announcementUrls.length > 0) {
      for (let i = 0; i < Math.min(announcementUrls.length, 10); i++) {
        try {
          const details = await scrapeAnnouncementDetails(announcementUrls[i], config, browser);
          if (details.caracteristiques && Object.keys(details.caracteristiques).length > 0) {
            comparables[i].caracteristiques = {
              ...comparables[i].caracteristiques,
              ...details.caracteristiques
            };
          }
          await delay(config.rateLimitMs);
        } catch (error) {
          console.error(`Erreur lors du scraping des détails:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Erreur lors du scraping de ${url}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return comparables;
}

/**
 * Scrape un site d'annonces immobilières
 */
export async function scrapeSite(
  siteName: string,
  searchParams: Record<string, any>
): Promise<Comparable[]> {
  const config = SCRAPING_CONFIGS[siteName];
  if (!config) {
    throw new Error(`Configuration non trouvée pour le site: ${siteName}`);
  }

  const comparables: Comparable[] = [];
  const maxPages = config.maxPages || 1;

  // Construire l'URL de recherche
  const searchUrl = new URL(config.searchUrl);
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      searchUrl.searchParams.append(key, String(value));
    }
  });

  // Scraper les pages
  for (let page = 1; page <= maxPages; page++) {
    try {
      searchUrl.searchParams.set('page', String(page));
      const pageUrl = searchUrl.toString();

      console.log(`Scraping ${siteName}, page ${page}...`);
      const scrapeDetails = searchParams.scrapeDetails !== false;
      const pageComparables = await scrapePageWithPuppeteer(pageUrl, config, scrapeDetails);

      // Sauvegarder les comparables (éviter les doublons)
      for (const compData of pageComparables) {
        const existing = await Comparable.findOne({
          where: {
            source: compData.source,
            url_source: compData.url_source
          }
        });

        if (!existing && compData.code_postal && compData.ville) {
          const comparable = await Comparable.create(compData as ComparableAttributes);
          comparables.push(comparable);
        }
      }

      // Délai entre les pages
      if (page < maxPages) {
        await delay(config.rateLimitMs);
      }
    } catch (error) {
      console.error(`Erreur lors du scraping de la page ${page}:`, error);
      // Continuer avec la page suivante même en cas d'erreur
    }
  }

  return comparables;
}

/**
 * Crée un job de scraping asynchrone
 */
export async function createScrapingJob(
  site: string,
  type: 'annonces' | 'transactions',
  parametres: Record<string, any>
): Promise<ScrapingJob> {
  const job = await ScrapingJob.create({
    site,
    type,
    statut: 'en_attente',
    parametres
  } as ScrapingJobAttributes);

  // Ajouter le job à la queue
  await addJob('scraping', {
    jobId: job.id,
    site,
    type,
    parametres
  });

  return job;
}

/**
 * Exécute un job de scraping
 */
export async function executeScrapingJob(jobId: number): Promise<void> {
  const job = await ScrapingJob.findByPk(jobId);
  if (!job) {
    throw new Error(`Job de scraping ${jobId} non trouvé`);
  }

  try {
    await job.update({
      statut: 'en_cours',
      started_at: new Date()
    });

    const comparables = await scrapeSite(job.site, job.parametres);

    await job.update({
      statut: 'termine',
      completed_at: new Date(),
      resultats: {
        nombre_comparables: comparables.length,
        comparables_ids: comparables.map((c) => c.id)
      }
    });
  } catch (error) {
    await job.update({
      statut: 'erreur',
      completed_at: new Date(),
      erreur: error instanceof Error ? error.message : 'Erreur inconnue'
    });
    throw error;
  }
}

