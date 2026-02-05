#!/bin/bash

# Script pour télécharger les données DVF pour l'Île-de-France
# Utilise l'API backend pour déclencher le téléchargement

set -e

API_URL="${API_URL:-http://localhost:8000}"
API_VERSION="${API_VERSION:-v1}"

echo "📥 Téléchargement des données DVF pour l'Île-de-France..."
echo "🔗 API: ${API_URL}/api/${API_VERSION}/dvf/download-idf"
echo ""

# Vérifier que l'API est accessible
if ! curl -f -s "${API_URL}/health" > /dev/null 2>&1; then
    echo "❌ L'API backend n'est pas accessible à ${API_URL}"
    echo "   Assurez-vous que le backend est démarré: make dev"
    exit 1
fi

# Demander le token admin (optionnel, peut être passé en variable d'environnement)
if [ -z "$ADMIN_TOKEN" ]; then
    echo "⚠️  Ce script nécessite un token d'authentification admin"
    echo "   Vous pouvez le passer via: ADMIN_TOKEN=your_token ./scripts/download-dvf.sh"
    echo ""
    read -p "Token admin (ou appuyez sur Entrée pour continuer sans auth): " ADMIN_TOKEN
fi

# Construire la commande curl
CURL_CMD="curl -X POST \"${API_URL}/api/${API_VERSION}/dvf/download-idf\""

if [ -n "$ADMIN_TOKEN" ]; then
    CURL_CMD="${CURL_CMD} -H \"Authorization: Bearer ${ADMIN_TOKEN}\""
fi

CURL_CMD="${CURL_CMD} -H \"Content-Type: application/json\" -w \"\n\""

# Exécuter la requête
echo "🚀 Démarrage du téléchargement..."
RESPONSE=$(eval $CURL_CMD)

# Afficher la réponse
echo ""
echo "📊 Réponse:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Vérifier le succès
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo ""
    echo "✅ Téléchargement et indexation réussis !"
    COMPARABLES=$(echo "$RESPONSE" | grep -o '"comparables_importes":[0-9]*' | grep -o '[0-9]*' || echo "0")
    echo "📈 ${COMPARABLES} comparables importés"
else
    echo ""
    echo "❌ Erreur lors du téléchargement"
    exit 1
fi

