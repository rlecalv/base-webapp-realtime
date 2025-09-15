#!/bin/bash

# Script de build Docker optimisé avec cache
set -e

echo "🐳 Build Docker optimisé avec cache"

# Configuration
REGISTRY=${REGISTRY:-"base-app"}
VERSION=${VERSION:-"latest"}
CACHE_FROM=${CACHE_FROM:-""}

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

# Fonction pour construire une image avec cache
build_with_cache() {
    local service=$1
    local dockerfile=$2
    local context=$3
    local target=${4:-"production"}
    
    log "Construction de l'image $service..."
    
    # Arguments de cache
    local cache_args=""
    if [ ! -z "$CACHE_FROM" ]; then
        cache_args="--cache-from $CACHE_FROM/$service:latest"
    fi
    
    # Build avec BuildKit pour de meilleures performances
    DOCKER_BUILDKIT=1 docker build \
        --target $target \
        --tag $REGISTRY/$service:$VERSION \
        --tag $REGISTRY/$service:latest \
        --file $dockerfile \
        $cache_args \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        $context
    
    success "Image $service construite avec succès"
}

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé ou disponible"
fi

# Vérifier que Docker BuildKit est activé
export DOCKER_BUILDKIT=1

log "Démarrage du build des images Docker..."

# Build du backend
log "🔧 Construction du backend..."
build_with_cache "backend" "backend/Dockerfile" "backend/"

# Build du frontend
log "🎨 Construction du frontend..."
build_with_cache "frontend" "frontend/Dockerfile" "frontend/"

# Build de Nginx
log "🌐 Construction de Nginx..."
build_with_cache "nginx" "docker/nginx/Dockerfile" "docker/nginx/"

# Build des pages d'erreur
log "📄 Construction des pages d'erreur..."
build_with_cache "error-pages" "docker/error-pages/Dockerfile" "docker/error-pages/"

# Afficher les tailles des images
log "📊 Tailles des images construites:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep $REGISTRY

# Nettoyer les images intermédiaires
log "🧹 Nettoyage des images intermédiaires..."
docker image prune -f --filter label=stage=intermediate

success "🎉 Toutes les images ont été construites avec succès!"

# Optionnel: Push vers le registry
if [ "$PUSH" = "true" ]; then
    log "📤 Push des images vers le registry..."
    docker push $REGISTRY/backend:$VERSION
    docker push $REGISTRY/frontend:$VERSION
    docker push $REGISTRY/nginx:$VERSION
    docker push $REGISTRY/error-pages:$VERSION
    success "Images poussées vers le registry"
fi

log "✨ Build terminé avec succès!"
