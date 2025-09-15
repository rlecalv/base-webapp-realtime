// Configuration CloudFlare pour CDN
const cloudflareConfig = {
  // Configuration des zones
  zones: {
    production: {
      zoneId: process.env.CLOUDFLARE_ZONE_ID,
      domain: process.env.DOMAIN || 'localhost'
    }
  },
  
  // Configuration du cache
  cacheRules: [
    {
      // Assets statiques avec cache très long
      pattern: '*.{js,css,woff,woff2,ttf,eot,ico}',
      cacheTtl: 31536000, // 1 an
      browserTtl: 31536000,
      edgeTtl: 31536000,
      cacheLevel: 'cache_everything',
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Vary': 'Accept-Encoding'
      }
    },
    {
      // Images avec cache moyen
      pattern: '*.{jpg,jpeg,png,gif,svg,webp,avif}',
      cacheTtl: 2592000, // 30 jours
      browserTtl: 2592000,
      edgeTtl: 2592000,
      cacheLevel: 'cache_everything',
      headers: {
        'Cache-Control': 'public, max-age=2592000',
        'Vary': 'Accept-Encoding'
      }
    },
    {
      // Documents et PDFs
      pattern: '*.{pdf,doc,docx,xls,xlsx,zip}',
      cacheTtl: 86400, // 1 jour
      browserTtl: 86400,
      edgeTtl: 86400,
      cacheLevel: 'cache_everything'
    },
    {
      // API - pas de cache
      pattern: '/api/*',
      cacheTtl: 0,
      browserTtl: 0,
      cacheLevel: 'bypass'
    },
    {
      // Pages HTML avec cache court
      pattern: '*.html',
      cacheTtl: 3600, // 1 heure
      browserTtl: 3600,
      edgeTtl: 3600,
      cacheLevel: 'cache_everything',
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    }
  ],
  
  // Configuration de sécurité
  security: {
    // Protection DDoS
    ddosProtection: true,
    
    // WAF (Web Application Firewall)
    waf: {
      enabled: true,
      mode: 'challenge', // block, challenge, simulate
      rules: [
        {
          name: 'Block malicious IPs',
          expression: '(ip.src in $malicious_ips)',
          action: 'block'
        },
        {
          name: 'Rate limit API',
          expression: '(http.request.uri.path matches "^/api/.*")',
          action: 'rate_limit',
          rateLimit: {
            requests: 100,
            period: 60
          }
        },
        {
          name: 'Block SQL injection attempts',
          expression: '(http.request.body contains "union select" or http.request.body contains "drop table")',
          action: 'block'
        }
      ]
    },
    
    // Headers de sécurité
    securityHeaders: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }
  },
  
  // Configuration de performance
  performance: {
    // Compression
    compression: {
      brotli: true,
      gzip: true,
      minSize: 1024
    },
    
    // Minification
    minification: {
      html: true,
      css: true,
      js: true
    },
    
    // HTTP/2 Server Push
    serverPush: [
      {
        pattern: '*.html',
        push: ['*.css', '*.js']
      }
    ],
    
    // Early Hints
    earlyHints: true,
    
    // Image optimization
    imageOptimization: {
      enabled: true,
      formats: ['webp', 'avif'],
      quality: 85,
      progressive: true
    }
  },
  
  // Configuration des workers
  workers: {
    // Worker pour l'optimisation des images
    imageWorker: {
      script: `
        addEventListener('fetch', event => {
          const url = new URL(event.request.url);
          
          // Optimiser les images
          if (url.pathname.match(/\\.(jpg|jpeg|png|gif)$/i)) {
            event.respondWith(handleImageRequest(event.request));
          }
        });
        
        async function handleImageRequest(request) {
          const url = new URL(request.url);
          const accept = request.headers.get('Accept') || '';
          
          // Servir WebP si supporté
          if (accept.includes('image/webp')) {
            url.pathname = url.pathname.replace(/\\.(jpg|jpeg|png)$/i, '.webp');
          }
          
          // Servir AVIF si supporté
          if (accept.includes('image/avif')) {
            url.pathname = url.pathname.replace(/\\.(jpg|jpeg|png|webp)$/i, '.avif');
          }
          
          return fetch(url.toString(), {
            cf: {
              image: {
                quality: 85,
                format: 'auto'
              }
            }
          });
        }
      `
    },
    
    // Worker pour la gestion du cache
    cacheWorker: {
      script: `
        addEventListener('fetch', event => {
          const url = new URL(event.request.url);
          
          // Gestion du cache personnalisée
          if (url.pathname.startsWith('/assets/')) {
            event.respondWith(handleAssetRequest(event.request));
          }
        });
        
        async function handleAssetRequest(request) {
          const cache = caches.default;
          const cacheKey = new Request(request.url, request);
          
          // Vérifier le cache
          let response = await cache.match(cacheKey);
          
          if (!response) {
            // Récupérer depuis l'origine
            response = await fetch(request);
            
            // Mettre en cache si succès
            if (response.status === 200) {
              const cacheResponse = response.clone();
              cacheResponse.headers.set('Cache-Control', 'public, max-age=31536000');
              await cache.put(cacheKey, cacheResponse);
            }
          }
          
          return response;
        }
      `
    }
  },
  
  // Configuration des redirections
  redirects: [
    {
      from: 'www.{domain}/*',
      to: '{domain}/$1',
      status: 301
    },
    {
      from: 'http://{domain}/*',
      to: 'https://{domain}/$1',
      status: 301
    }
  ],
  
  // Configuration du monitoring
  monitoring: {
    analytics: true,
    webVitals: true,
    customMetrics: [
      'cache_hit_ratio',
      'origin_response_time',
      'edge_response_time'
    ]
  }
};

module.exports = cloudflareConfig;
