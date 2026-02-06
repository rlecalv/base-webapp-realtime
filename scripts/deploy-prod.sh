#!/bin/bash
# Script de deploiement MonEstimation en production
# Usage: ./scripts/deploy-prod.sh

set -e

echo "=== Deploiement MonEstimation en Production ==="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verification des reseaux Docker
echo -e "\n${YELLOW}1. Verification des reseaux Docker...${NC}"
if ! docker network ls | grep -q "traefik-network"; then
    echo "Creation du reseau traefik-network..."
    docker network create traefik-network
fi

if ! docker network ls | grep -q "horizon_network"; then
    echo -e "${RED}ERREUR: Le reseau horizon_network n'existe pas.${NC}"
    echo "Assurez-vous que Horizon est deploye avant MonEstimation."
    exit 1
fi

echo -e "${GREEN}Reseaux OK${NC}"

# Verification du fichier .env
echo -e "\n${YELLOW}2. Verification de la configuration...${NC}"
if [ ! -f "backend-python/.env" ]; then
    echo -e "${RED}ERREUR: backend-python/.env manquant${NC}"
    echo "Copiez backend-python/.env.example vers backend-python/.env et configurez les variables."
    exit 1
fi
echo -e "${GREEN}Configuration OK${NC}"

# Build des images
echo -e "\n${YELLOW}3. Build des images Docker...${NC}"
docker compose -f docker-compose.estimation.yml build --no-cache

# Arret des anciens containers
echo -e "\n${YELLOW}4. Arret des anciens containers (si existants)...${NC}"
docker compose -f docker-compose.estimation.yml down 2>/dev/null || true

# Lancement
echo -e "\n${YELLOW}5. Lancement des services...${NC}"
docker compose -f docker-compose.estimation.yml up -d

# Attente demarrage
echo -e "\n${YELLOW}6. Attente du demarrage (30s)...${NC}"
sleep 30

# Verification
echo -e "\n${YELLOW}7. Verification des services...${NC}"
echo "Backend:"
if docker exec estimation_backend curl -sf http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Backend OK${NC}"
else
    echo -e "${RED}  ✗ Backend non disponible${NC}"
    docker logs estimation_backend --tail 50
fi

echo "Frontend:"
if docker exec estimation_frontend curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Frontend OK${NC}"
else
    echo -e "${RED}  ✗ Frontend non disponible${NC}"
    docker logs estimation_frontend --tail 50
fi

echo "Redis:"
if docker exec estimation_redis redis-cli ping | grep -q "PONG"; then
    echo -e "${GREEN}  ✓ Redis OK${NC}"
else
    echo -e "${RED}  ✗ Redis non disponible${NC}"
fi

# Resume
echo -e "\n${GREEN}=== Deploiement termine ===${NC}"
echo ""
echo "URLs disponibles (apres propagation DNS):"
echo "  - https://vendremonimmeuble.fr"
echo "  - https://estimermonimmeuble.fr"
echo ""
echo "Logs:"
echo "  docker logs estimation_backend -f"
echo "  docker logs estimation_frontend -f"
