#!/bin/bash

# Script de déploiement CDN avec CloudFlare et alternatives
set -e

# Configuration
CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
CLOUDFLARE_ZONE_ID=${CLOUDFLARE_ZONE_ID}
DOMAIN=${DOMAIN:-"localhost"}
CDN_PROVIDER=${CDN_PROVIDER:-"cloudflare"}

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Fonction pour configurer CloudFlare
setup_cloudflare() {
    log "Configuration de CloudFlare CDN..."
    
    if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ZONE_ID" ]; then
        error "CLOUDFLARE_API_TOKEN et CLOUDFLARE_ZONE_ID sont requis"
    fi
    
    # Configuration des règles de cache
    log "Configuration des règles de cache CloudFlare..."
    
    # Règle pour les assets statiques
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/pagerules" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{
            "targets": [
                {
                    "target": "url",
                    "constraint": {
                        "operator": "matches",
                        "value": "*.'$DOMAIN'/assets/*"
                    }
                }
            ],
            "actions": [
                {
                    "id": "cache_level",
                    "value": "cache_everything"
                },
                {
                    "id": "edge_cache_ttl",
                    "value": 31536000
                },
                {
                    "id": "browser_cache_ttl",
                    "value": 31536000
                }
            ],
            "status": "active"
        }' > /dev/null
    
    # Règle pour les images
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/pagerules" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{
            "targets": [
                {
                    "target": "url",
                    "constraint": {
                        "operator": "matches",
                        "value": "*.'$DOMAIN'/*.{jpg,jpeg,png,gif,svg,webp,avif}"
                    }
                }
            ],
            "actions": [
                {
                    "id": "cache_level",
                    "value": "cache_everything"
                },
                {
                    "id": "edge_cache_ttl",
                    "value": 2592000
                },
                {
                    "id": "browser_cache_ttl",
                    "value": 2592000
                }
            ],
            "status": "active"
        }' > /dev/null
    
    # Configuration de la compression
    log "Activation de la compression CloudFlare..."
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/brotli" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"value":"on"}' > /dev/null
    
    # Configuration de la minification
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/minify" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"value":{"css":"on","html":"on","js":"on"}}' > /dev/null
    
    # Configuration de l'optimisation des images
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/polish" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"value":"lossless"}' > /dev/null
    
    success "CloudFlare CDN configuré avec succès"
}

# Fonction pour configurer AWS CloudFront (alternative)
setup_cloudfront() {
    log "Configuration d'AWS CloudFront..."
    
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        error "AWS_ACCESS_KEY_ID et AWS_SECRET_ACCESS_KEY sont requis"
    fi
    
    # Créer une distribution CloudFront
    aws cloudfront create-distribution \
        --distribution-config file://cloudfront-config.json \
        --output json > cloudfront-distribution.json
    
    success "AWS CloudFront configuré avec succès"
}

# Fonction pour optimiser les assets avant déploiement
optimize_assets() {
    log "Optimisation des assets pour le CDN..."
    
    # Créer le répertoire d'assets optimisés
    mkdir -p /tmp/cdn-assets
    
    # Copier les assets du frontend
    if [ -d "frontend/public" ]; then
        cp -r frontend/public/* /tmp/cdn-assets/
    fi
    
    # Optimiser les images avec ImageMagick (si disponible)
    if command -v convert &> /dev/null; then
        log "Optimisation des images..."
        find /tmp/cdn-assets -name "*.jpg" -o -name "*.jpeg" | while read img; do
            convert "$img" -quality 85 -strip "$img"
        done
        
        find /tmp/cdn-assets -name "*.png" | while read img; do
            convert "$img" -strip "$img"
        done
    fi
    
    # Générer des versions WebP (si disponible)
    if command -v cwebp &> /dev/null; then
        log "Génération des images WebP..."
        find /tmp/cdn-assets -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" | while read img; do
            cwebp -q 85 "$img" -o "${img%.*}.webp"
        done
    fi
    
    # Compresser les assets avec Brotli
    if command -v brotli &> /dev/null; then
        log "Compression Brotli des assets..."
        find /tmp/cdn-assets -name "*.js" -o -name "*.css" -o -name "*.html" | while read file; do
            brotli -c -q 11 "$file" > "$file.br"
        done
    fi
    
    # Compresser avec Gzip
    find /tmp/cdn-assets -name "*.js" -o -name "*.css" -o -name "*.html" | while read file; do
        gzip -c -9 "$file" > "$file.gz"
    done
    
    success "Assets optimisés avec succès"
}

# Fonction pour uploader les assets vers S3 (pour CloudFront)
upload_to_s3() {
    local bucket_name=$1
    
    if [ -z "$bucket_name" ]; then
        error "Nom du bucket S3 requis"
    fi
    
    log "Upload des assets vers S3..."
    
    # Synchroniser les assets avec S3
    aws s3 sync /tmp/cdn-assets s3://$bucket_name/ \
        --delete \
        --cache-control "public, max-age=31536000" \
        --metadata-directive REPLACE
    
    # Configurer les headers spécifiques par type de fichier
    aws s3 cp s3://$bucket_name/ s3://$bucket_name/ \
        --recursive \
        --exclude "*" \
        --include "*.js" \
        --include "*.css" \
        --cache-control "public, max-age=31536000, immutable" \
        --content-encoding "gzip" \
        --metadata-directive REPLACE
    
    success "Assets uploadés vers S3"
}

# Fonction pour purger le cache CDN
purge_cache() {
    case $CDN_PROVIDER in
        "cloudflare")
            log "Purge du cache CloudFlare..."
            curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
                -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
                -H "Content-Type: application/json" \
                --data '{"purge_everything":true}' > /dev/null
            success "Cache CloudFlare purgé"
            ;;
        "cloudfront")
            log "Purge du cache CloudFront..."
            local distribution_id=$(cat cloudfront-distribution.json | jq -r '.Distribution.Id')
            aws cloudfront create-invalidation \
                --distribution-id $distribution_id \
                --paths "/*" > /dev/null
            success "Cache CloudFront purgé"
            ;;
        *)
            warning "Provider CDN non supporté pour la purge: $CDN_PROVIDER"
            ;;
    esac
}

# Fonction pour vérifier la configuration CDN
verify_cdn() {
    log "Vérification de la configuration CDN..."
    
    # Test de la compression
    local compression_test=$(curl -s -H "Accept-Encoding: gzip, br" -I "https://$DOMAIN/assets/main.css" | grep -i "content-encoding" || echo "")
    if [ -n "$compression_test" ]; then
        success "Compression activée: $compression_test"
    else
        warning "Compression non détectée"
    fi
    
    # Test du cache
    local cache_test=$(curl -s -I "https://$DOMAIN/assets/main.css" | grep -i "cache-control" || echo "")
    if [ -n "$cache_test" ]; then
        success "Cache configuré: $cache_test"
    else
        warning "Configuration cache non détectée"
    fi
    
    # Test de la sécurité
    local security_test=$(curl -s -I "https://$DOMAIN/" | grep -i "x-frame-options\|x-content-type-options" | wc -l)
    if [ "$security_test" -gt 0 ]; then
        success "Headers de sécurité détectés"
    else
        warning "Headers de sécurité manquants"
    fi
}

# Fonction principale
main() {
    log "🌐 Déploiement CDN pour $DOMAIN avec $CDN_PROVIDER"
    
    # Optimiser les assets
    optimize_assets
    
    # Configurer le CDN selon le provider
    case $CDN_PROVIDER in
        "cloudflare")
            setup_cloudflare
            ;;
        "cloudfront")
            setup_cloudfront
            upload_to_s3 "${S3_BUCKET_NAME}"
            ;;
        *)
            error "Provider CDN non supporté: $CDN_PROVIDER"
            ;;
    esac
    
    # Purger le cache
    purge_cache
    
    # Vérifier la configuration
    sleep 30 # Attendre la propagation
    verify_cdn
    
    # Nettoyer les fichiers temporaires
    rm -rf /tmp/cdn-assets
    
    success "🎉 Déploiement CDN terminé avec succès!"
    log "🔗 Votre site est maintenant optimisé via CDN: https://$DOMAIN"
}

# Vérifier les prérequis
if ! command -v curl &> /dev/null; then
    error "curl est requis mais non installé"
fi

if [ "$CDN_PROVIDER" = "cloudfront" ] && ! command -v aws &> /dev/null; then
    error "AWS CLI est requis pour CloudFront"
fi

# Exécuter le script principal
main "$@"
