# Makefile pour Base WebApp

# Variables
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml
PROJECT_NAME = base_app

# Commandes de développement
.PHONY: dev
dev: ## Démarrer l'environnement de développement
	docker-compose -f $(COMPOSE_DEV_FILE) up -d
	@echo "🚀 Environnement de développement démarré"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔧 Backend: http://localhost:8000"
	@echo "🗄️  Adminer: http://localhost:8081"

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

.PHONY: help
help: ## Afficher cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Par défaut, afficher l'aide
.DEFAULT_GOAL := help