# Makefile pour Base WebApp

# Variables
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml
COMPOSE_SECURE_FILE = docker-compose.secure.yml
COMPOSE_MONITORING_FILE = docker-compose.monitoring.yml
PROJECT_NAME = base_app

# Commandes de développement
.PHONY: dev
dev: ## Démarrer l'environnement de développement
	docker-compose -f $(COMPOSE_DEV_FILE) up -d
	@echo "🚀 Environnement de développement démarré"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔧 Backend: http://localhost:8000"
	@echo "🗄️  Adminer: http://localhost:8081"
	@echo ""
	@echo "⏳ Attente du démarrage des services..."
	@sleep 5
	@echo "✅ Services prêts !"

.PHONY: dev-logs
dev-logs: ## Voir les logs de développement
	docker-compose -f $(COMPOSE_DEV_FILE) logs -f

.PHONY: dev-stop
dev-stop: ## Arrêter l'environnement de développement
	docker-compose -f $(COMPOSE_DEV_FILE) down

.PHONY: dev-clean
dev-clean: ## Nettoyer l'environnement de développement
	docker-compose -f $(COMPOSE_DEV_FILE) down -v --remove-orphans
	docker system prune -f

# Commandes de production
.PHONY: prod
prod: ## Démarrer l'environnement de production
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "🚀 Environnement de production démarré"
	@echo "🌐 Application: http://localhost"
	@echo "📊 Traefik Dashboard: http://localhost:8080"

.PHONY: prod-logs
prod-logs: ## Voir les logs de production
	docker-compose -f $(COMPOSE_FILE) logs -f

.PHONY: prod-stop
prod-stop: ## Arrêter l'environnement de production
	docker-compose -f $(COMPOSE_FILE) down

.PHONY: prod-clean
prod-clean: ## Nettoyer l'environnement de production
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker system prune -f

# Commandes de build
.PHONY: build
build: ## Construire toutes les images
	docker-compose -f $(COMPOSE_FILE) build --no-cache

.PHONY: build-dev
build-dev: ## Construire les images de développement
	docker-compose -f $(COMPOSE_DEV_FILE) build --no-cache

# Commandes de base de données
.PHONY: db-reset
db-reset: ## Réinitialiser la base de données de développement
	docker-compose -f $(COMPOSE_DEV_FILE) down db
	docker volume rm $(PROJECT_NAME)_postgres_dev_data || true
	docker-compose -f $(COMPOSE_DEV_FILE) up -d db

.PHONY: db-backup
db-backup: ## Sauvegarder la base de données
	@mkdir -p backups
	docker-compose -f $(COMPOSE_DEV_FILE) exec db pg_dump -U postgres base_app_dev > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Sauvegarde créée dans le dossier backups/"

.PHONY: db-restore
db-restore: ## Restaurer la base de données (usage: make db-restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then echo "❌ Veuillez spécifier le fichier: make db-restore FILE=backup.sql"; exit 1; fi
	docker-compose -f $(COMPOSE_DEV_FILE) exec -T db psql -U postgres base_app_dev < $(FILE)
	@echo "✅ Base de données restaurée"

# Commandes utilitaires
.PHONY: logs
logs: ## Voir tous les logs
	docker-compose -f $(COMPOSE_DEV_FILE) logs -f

.PHONY: ps
ps: ## Voir le statut des conteneurs
	docker-compose -f $(COMPOSE_DEV_FILE) ps

.PHONY: shell-backend
shell-backend: ## Ouvrir un shell dans le conteneur backend
	docker-compose -f $(COMPOSE_DEV_FILE) exec backend sh

.PHONY: shell-db
shell-db: ## Ouvrir un shell PostgreSQL
	docker-compose -f $(COMPOSE_DEV_FILE) exec db psql -U postgres base_app_dev

.PHONY: shell-redis
shell-redis: ## Ouvrir un shell Redis
	docker-compose -f $(COMPOSE_DEV_FILE) exec redis redis-cli

.PHONY: install
install: ## Installer les dépendances
	cd backend && npm install
	cd frontend && npm install

.PHONY: test
test: ## Lancer les tests
	cd backend && npm test
	cd frontend && npm test

.PHONY: lint
lint: ## Lancer le linting
	cd backend && npm run lint || true
	cd frontend && npm run lint

.PHONY: clean
clean: ## Nettoyer complètement
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker-compose -f $(COMPOSE_DEV_FILE) down -v --remove-orphans
	docker system prune -af
	docker volume prune -f

# Commandes de sécurité
.PHONY: setup-security
setup-security: ## Configurer la sécurité (génération des secrets)
	./scripts/setup-security.sh

.PHONY: secure
secure: ## Démarrer avec la configuration sécurisée
	docker-compose -f $(COMPOSE_SECURE_FILE) up -d
	@echo "🔒 Environnement sécurisé démarré"

.PHONY: secure-stop
secure-stop: ## Arrêter l'environnement sécurisé
	docker-compose -f $(COMPOSE_SECURE_FILE) down

# Commandes de monitoring
.PHONY: monitoring
monitoring: ## Démarrer le monitoring (Prometheus + Grafana)
	docker-compose -f $(COMPOSE_MONITORING_FILE) up -d
	@echo "📊 Monitoring démarré"
	@echo "📈 Grafana: http://localhost:3001"
	@echo "📊 Prometheus: http://localhost:9090"

.PHONY: monitoring-stop
monitoring-stop: ## Arrêter le monitoring
	docker-compose -f $(COMPOSE_MONITORING_FILE) down

.PHONY: full-stack
full-stack: ## Démarrer la stack complète (app + monitoring)
	docker-compose -f $(COMPOSE_SECURE_FILE) -f $(COMPOSE_MONITORING_FILE) up -d
	@echo "🚀 Stack complète démarrée"

# Commandes de sécurité et audit
.PHONY: security-scan
security-scan: ## Scanner les vulnérabilités des images Docker
	@echo "🔍 Scan de sécurité des images..."
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image $(PROJECT_NAME)_backend:latest || true
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image $(PROJECT_NAME)_frontend:latest || true

# Commandes CDN et performance
.PHONY: deploy-cdn
deploy-cdn: ## Déployer et configurer le CDN
	@echo "🌐 Déploiement CDN..."
	./scripts/deploy-cdn.sh

.PHONY: build-optimized
build-optimized: ## Construire les images avec optimisations avancées
	@echo "🐳 Construction optimisée des images..."
	./scripts/docker-build.sh

.PHONY: cache-stats
cache-stats: ## Afficher les statistiques du cache Redis
	@echo "📊 Statistiques du cache Redis..."
	docker-compose -f $(COMPOSE_DEV_FILE) exec redis redis-cli info memory
	docker-compose -f $(COMPOSE_DEV_FILE) exec redis redis-cli info keyspace

.PHONY: cache-clear
cache-clear: ## Vider le cache Redis
	@echo "🧹 Vidage du cache Redis..."
	docker-compose -f $(COMPOSE_DEV_FILE) exec redis redis-cli flushall

# Commandes DVF
.PHONY: dvf-download
dvf-download: ## Télécharger les données DVF pour l'Île-de-France
	@echo "📥 Téléchargement des données DVF..."
	@./scripts/download-dvf.sh

.PHONY: dvf-download-token
dvf-download-token: ## Télécharger les données DVF avec token (usage: make dvf-download-token TOKEN=your_token)
	@if [ -z "$(TOKEN)" ]; then echo "❌ Veuillez spécifier le token: make dvf-download-token TOKEN=your_token"; exit 1; fi
	@ADMIN_TOKEN=$(TOKEN) ./scripts/download-dvf.sh

.PHONY: audit
audit: ## Audit complet de la configuration
	@echo "📋 Audit de configuration..."
	@echo "✅ Vérification des fichiers de configuration"
	@test -f .env && echo "✅ Fichier .env présent" || echo "❌ Fichier .env manquant"
	@test -f docker-compose.secure.yml && echo "✅ Configuration sécurisée présente" || echo "❌ Configuration sécurisée manquante"
	@echo "📊 Vérification des services..."
	docker-compose -f $(COMPOSE_SECURE_FILE) config --quiet && echo "✅ Configuration Docker valide" || echo "❌ Erreur de configuration Docker"

.PHONY: help
help: ## Afficher cette aide
	@echo "📚 Commandes disponibles:"
	@echo ""
	@echo "🔧 Développement:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$' $(MAKEFILE_LIST) | grep -E '(dev|install|test|lint)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $1, $2}'
	@echo ""
	@echo "🚀 Production:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$' $(MAKEFILE_LIST) | grep -E '(prod|secure|build)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $1, $2}'
	@echo ""
	@echo "🗄️  Base de données:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$' $(MAKEFILE_LIST) | grep -E 'db-' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $1, $2}'
	@echo ""
	@echo "📊 Monitoring:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$' $(MAKEFILE_LIST) | grep -E 'monitoring' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $1, $2}'
	@echo ""
	@echo "🔒 Sécurité:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$' $(MAKEFILE_LIST) | grep -E '(security|audit|secure)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $1, $2}'
	@echo ""
	@echo "🛠️  Utilitaires:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$' $(MAKEFILE_LIST) | grep -E '(clean|shell|ps|help)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $1, $2}'

# Par défaut, afficher l'aide
.DEFAULT_GOAL := help