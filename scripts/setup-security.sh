#!/bin/bash

# =================================
# Script de Configuration Sécurisée
# =================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
print_header() {
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction de génération de mots de passe
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Fonction de génération de hash pour Traefik
generate_traefik_hash() {
    local user=$1
    local password=$2
    echo $(htpasswd -nb $user $password)
}

# Vérification des dépendances
check_dependencies() {
    print_header "Vérification des dépendances"
    
    local deps=("openssl" "htpasswd" "docker" "docker-compose")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            missing+=($dep)
        else
            print_success "$dep installé"
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        print_error "Dépendances manquantes: ${missing[*]}"
        echo "Installez-les avec:"
        echo "  - openssl: généralement préinstallé"
        echo "  - htpasswd: apt-get install apache2-utils (Ubuntu) ou brew install httpd (macOS)"
        echo "  - docker: https://docs.docker.com/get-docker/"
        echo "  - docker-compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
}

# Configuration initiale
setup_env() {
    print_header "Configuration de l'environnement"
    
    if [ -f .env ]; then
        print_warning "Le fichier .env existe déjà"
        read -p "Voulez-vous le remplacer ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "Configuration annulée"
            return
        fi
    fi
    
    # Copier le template
    cp .env.example .env
    print_success "Fichier .env créé à partir du template"
    
    # Générer les secrets
    print_header "Génération des secrets"
    
    # JWT Secret
    JWT_SECRET=$(generate_password 64)
    sed -i.bak "s/your-super-secret-jwt-key-change-this-in-production-min-32-chars/$JWT_SECRET/" .env
    print_success "JWT_SECRET généré"
    
    # Session Secret
    SESSION_SECRET=$(generate_password 64)
    sed -i.bak "s/your-session-secret-change-this-in-production/$SESSION_SECRET/" .env
    print_success "SESSION_SECRET généré"
    
    # Mots de passe base de données
    DB_PASSWORD=$(generate_password 32)
    sed -i.bak "s/change_me_in_production/$DB_PASSWORD/g" .env
    print_success "Mots de passe base de données générés"
    
    # Redis password
    REDIS_PASSWORD=$(generate_password 32)
    sed -i.bak "s/change_me_in_production/$REDIS_PASSWORD/2" .env
    print_success "Mot de passe Redis généré"
    
    # Traefik dashboard
    read -p "Nom d'utilisateur pour Traefik dashboard (défaut: admin): " TRAEFIK_USER
    TRAEFIK_USER=${TRAEFIK_USER:-admin}
    
    TRAEFIK_PASSWORD=$(generate_password 16)
    TRAEFIK_HASH=$(generate_traefik_hash $TRAEFIK_USER $TRAEFIK_PASSWORD)
    
    sed -i.bak "s/admin/$TRAEFIK_USER/" .env
    sed -i.bak "s/change_me_in_production/$TRAEFIK_PASSWORD/3" .env
    
    # Ajouter le hash pour docker-compose
    echo "" >> .env
    echo "# Hash généré automatiquement pour Traefik" >> .env
    echo "TRAEFIK_DASHBOARD_PASSWORD_HASH=$TRAEFIK_HASH" >> .env
    
    print_success "Authentification Traefik configurée"
    
    # Configuration domaine
    read -p "Nom de domaine (défaut: localhost): " DOMAIN
    DOMAIN=${DOMAIN:-localhost}
    sed -i.bak "s/yourapp.com/$DOMAIN/" .env
    print_success "Domaine configuré: $DOMAIN"
    
    # Email pour SSL
    if [ "$DOMAIN" != "localhost" ]; then
        read -p "Email pour les certificats SSL: " ACME_EMAIL
        sed -i.bak "s/admin@example.com/$ACME_EMAIL/" .env
        print_success "Email SSL configuré"
    fi
    
    # Nettoyer les fichiers de sauvegarde
    rm -f .env.bak
    
    print_success "Configuration terminée !"
}

# Affichage des informations de connexion
show_credentials() {
    print_header "Informations de connexion"
    
    if [ ! -f .env ]; then
        print_error "Fichier .env non trouvé. Lancez d'abord la configuration."
        return
    fi
    
    source .env
    
    echo -e "${YELLOW}🔐 Identifiants générés:${NC}"
    echo "  - Base de données: postgres / $DB_PASSWORD"
    echo "  - Redis: (mot de passe) $REDIS_PASSWORD"
    echo "  - Traefik dashboard: $TRAEFIK_DASHBOARD_USER / $TRAEFIK_PASSWORD"
    echo ""
    echo -e "${YELLOW}🌐 URLs d'accès:${NC}"
    if [ "$DOMAIN" = "localhost" ]; then
        echo "  - Application: http://localhost"
        echo "  - API: http://localhost:8000"
        echo "  - Traefik dashboard: http://localhost:8080"
        echo "  - Adminer: http://localhost:8081"
    else
        echo "  - Application: https://$DOMAIN"
        echo "  - API: https://api.$DOMAIN"
        echo "  - Traefik dashboard: https://traefik.$DOMAIN"
        echo "  - Adminer: https://db.$DOMAIN"
    fi
    echo ""
    echo -e "${RED}⚠️  IMPORTANT: Sauvegardez ces informations en lieu sûr !${NC}"
}

# Menu principal
show_menu() {
    echo -e "${BLUE}"
    echo "================================="
    echo "   Configuration Sécurisée"
    echo "   Base WebApp"
    echo "================================="
    echo -e "${NC}"
    echo "1) Configuration initiale"
    echo "2) Afficher les identifiants"
    echo "3) Vérification de sécurité"
    echo "4) Tout configurer (recommandé)"
    echo "0) Quitter"
    echo ""
}

# Fonction principale
main() {
    while true; do
        show_menu
        read -p "Choisissez une option: " choice
        
        case $choice in
            1)
                check_dependencies
                setup_env
                ;;
            2)
                show_credentials
                ;;
            3)
                echo "Vérification de sécurité basique..."
                ;;
            4)
                check_dependencies
                setup_env
                show_credentials
                ;;
            0)
                print_success "Au revoir !"
                exit 0
                ;;
            *)
                print_error "Option invalide"
                ;;
        esac
        
        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
        clear
    done
}

# Lancement du script
if [ "$1" = "--auto" ]; then
    # Mode automatique pour CI/CD
    check_dependencies
    setup_env
else
    # Mode interactif
    clear
    main
fi