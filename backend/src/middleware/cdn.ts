import { Request, Response, NextFunction } from 'express';
import config from '../config';

// Configuration CDN
interface CDNConfig {
  enabled: boolean;
  provider: 'cloudflare' | 'cloudfront' | 'custom';
  baseUrl: string;
  domains: {
    assets: string;
    images: string;
    videos?: string;
  };
  fallback: boolean;
}

// Configuration par défaut
const cdnConfig: CDNConfig = {
  enabled: process.env.CDN_ENABLED === 'true',
  provider: (process.env.CDN_PROVIDER as any) || 'cloudflare',
  baseUrl: process.env.CDN_BASE_URL || '',
  domains: {
    assets: process.env.CDN_ASSETS_DOMAIN || '',
    images: process.env.CDN_IMAGES_DOMAIN || '',
    videos: process.env.CDN_VIDEOS_DOMAIN || ''
  },
  fallback: process.env.CDN_FALLBACK !== 'false'
};

// Helper pour générer les URLs CDN
export class CDNHelper {
  
  // Générer l'URL CDN pour un asset
  static getAssetUrl(path: string, type: 'assets' | 'images' | 'videos' = 'assets'): string {
    if (!cdnConfig.enabled || !cdnConfig.domains[type]) {
      return path;
    }
    
    // Nettoyer le chemin
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Construire l'URL CDN
    const cdnDomain = cdnConfig.domains[type];
    return `https://${cdnDomain}/${cleanPath}`;
  }
  
  // Générer l'URL avec version pour le cache busting
  static getVersionedAssetUrl(path: string, version?: string): string {
    const assetUrl = this.getAssetUrl(path);
    
    if (!version) {
      version = process.env.ASSET_VERSION || Date.now().toString();
    }
    
    const separator = assetUrl.includes('?') ? '&' : '?';
    return `${assetUrl}${separator}v=${version}`;
  }
  
  // Générer l'URL d'image avec optimisations
  static getOptimizedImageUrl(
    path: string, 
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'auto';
    } = {}
  ): string {
    const imageUrl = this.getAssetUrl(path, 'images');
    
    if (!cdnConfig.enabled) {
      return imageUrl;
    }
    
    // Construire les paramètres d'optimisation selon le provider
    const params = new URLSearchParams();
    
    switch (cdnConfig.provider) {
      case 'cloudflare':
        if (options.width) params.set('width', options.width.toString());
        if (options.height) params.set('height', options.height.toString());
        if (options.quality) params.set('quality', options.quality.toString());
        if (options.format) params.set('format', options.format);
        break;
        
      case 'cloudfront':
        // AWS CloudFront avec Lambda@Edge
        if (options.width) params.set('w', options.width.toString());
        if (options.height) params.set('h', options.height.toString());
        if (options.quality) params.set('q', options.quality.toString());
        if (options.format) params.set('f', options.format);
        break;
        
      default:
        // Provider personnalisé
        Object.entries(options).forEach(([key, value]) => {
          if (value) params.set(key, value.toString());
        });
    }
    
    const queryString = params.toString();
    return queryString ? `${imageUrl}?${queryString}` : imageUrl;
  }
  
  // Générer les URLs pour différentes tailles d'image (responsive)
  static getResponsiveImageUrls(
    path: string,
    sizes: number[] = [320, 640, 960, 1280, 1920]
  ): { [key: string]: string } {
    const urls: { [key: string]: string } = {};
    
    sizes.forEach(size => {
      urls[`${size}w`] = this.getOptimizedImageUrl(path, { width: size });
    });
    
    return urls;
  }
  
  // Vérifier si une ressource est disponible sur le CDN
  static async isAvailableOnCDN(path: string): Promise<boolean> {
    if (!cdnConfig.enabled) return false;
    
    try {
      const cdnUrl = this.getAssetUrl(path);
      const response = await fetch(cdnUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Erreur vérification CDN:', error);
      return false;
    }
  }
}

// Middleware pour injecter les helpers CDN dans les templates
export const cdnMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Ajouter les helpers CDN aux locals pour les templates
  res.locals.cdn = {
    asset: CDNHelper.getAssetUrl,
    versionedAsset: CDNHelper.getVersionedAssetUrl,
    image: CDNHelper.getOptimizedImageUrl,
    responsiveImage: CDNHelper.getResponsiveImageUrls,
    config: cdnConfig
  };
  
  next();
};

// Middleware pour rediriger les assets vers le CDN
export const assetRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Vérifier si c'est une requête d'asset
  const isAssetRequest = req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i);
  
  if (isAssetRequest && cdnConfig.enabled && cdnConfig.domains.assets) {
    const cdnUrl = CDNHelper.getAssetUrl(req.path);
    
    // Redirection 301 vers le CDN
    return res.redirect(301, cdnUrl);
  }
  
  next();
};

// Middleware pour les headers de cache des assets
export const assetCacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const isAssetRequest = req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i);
  
  if (isAssetRequest) {
    // Headers de cache agressif pour les assets
    const isVersioned = req.query.v || req.path.includes('-') || req.path.includes('.');
    
    if (isVersioned) {
      // Assets versionnés - cache très long
      res.set({
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Expires': new Date(Date.now() + 31536000 * 1000).toUTCString()
      });
    } else {
      // Assets non versionnés - cache moyen
      res.set({
        'Cache-Control': 'public, max-age=86400',
        'Expires': new Date(Date.now() + 86400 * 1000).toUTCString()
      });
    }
    
    // Headers de sécurité pour les assets
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*'
    });
  }
  
  next();
};

// Middleware pour servir les assets avec fallback
export const assetFallbackMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const isAssetRequest = req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i);
  
  if (isAssetRequest && cdnConfig.enabled && cdnConfig.fallback) {
    // Intercepter les erreurs 404 pour les assets
    const originalSend = res.send;
    
    res.send = function(data: any) {
      if (res.statusCode === 404) {
        // Essayer de servir depuis le CDN
        const cdnUrl = CDNHelper.getAssetUrl(req.path);
        return res.redirect(302, cdnUrl);
      }
      
      return originalSend.call(this, data);
    };
  }
  
  next();
};

// Service pour la gestion du CDN
export class CDNService {
  
  // Purger le cache CDN
  static async purgeCache(paths?: string[]): Promise<boolean> {
    if (!cdnConfig.enabled) return false;
    
    try {
      switch (cdnConfig.provider) {
        case 'cloudflare':
          return await this.purgeCloudflareCache(paths);
        case 'cloudfront':
          return await this.purgeCloudFrontCache(paths);
        default:
          console.warn('Purge cache non supportée pour le provider:', cdnConfig.provider);
          return false;
      }
    } catch (error) {
      console.error('Erreur purge cache CDN:', error);
      return false;
    }
  }
  
  // Purger le cache CloudFlare
  private static async purgeCloudflareCache(paths?: string[]): Promise<boolean> {
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!zoneId || !apiToken) {
      console.error('Configuration CloudFlare manquante');
      return false;
    }
    
    const body = paths ? { files: paths } : { purge_everything: true };
    
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    return response.ok;
  }
  
  // Purger le cache CloudFront
  private static async purgeCloudFrontCache(paths?: string[]): Promise<boolean> {
    // Implémentation avec AWS SDK
    console.warn('Purge CloudFront non implémentée - utilisez AWS CLI');
    return false;
  }
  
  // Précharger des ressources sur le CDN
  static async preloadResources(urls: string[]): Promise<void> {
    if (!cdnConfig.enabled) return;
    
    const preloadPromises = urls.map(async (url) => {
      try {
        const cdnUrl = CDNHelper.getAssetUrl(url);
        await fetch(cdnUrl, { method: 'HEAD' });
      } catch (error) {
        console.error(`Erreur préchargement ${url}:`, error);
      }
    });
    
    await Promise.allSettled(preloadPromises);
  }
  
  // Obtenir les statistiques du CDN
  static async getStats(): Promise<any> {
    if (!cdnConfig.enabled) return null;
    
    // Implémentation selon le provider
    return {
      provider: cdnConfig.provider,
      enabled: cdnConfig.enabled,
      domains: cdnConfig.domains,
      timestamp: new Date().toISOString()
    };
  }
}

export default {
  CDNHelper,
  cdnMiddleware,
  assetRedirectMiddleware,
  assetCacheMiddleware,
  assetFallbackMiddleware,
  CDNService
};
