# 🚀 Guide de Démarrage Rapide - MonEstimation

Guide pour démarrer l'application en mode développement et télécharger les données DVF.

## 📋 Prérequis

- Docker et Docker Compose installés
- Node.js 18+ (pour le développement local si nécessaire)
- Git

## 🏃 Démarrage Rapide

### 1. Démarrer l'environnement de développement

```bash
make dev
```

Cette commande va :
- Démarrer PostgreSQL (base de données)
- Démarrer Redis (cache et queues)
- Démarrer le backend Node.js/Express
- Démarrer le worker Bull (tâches asynchrones)
- Démarrer le frontend Next.js
- Démarrer Adminer (interface de gestion de base de données)

**Services disponibles :**
- Frontend : http://localhost:3000
- Backend API : http://localhost:8000
- Adminer : http://localhost:8081

### 2. Vérifier que tout fonctionne

```bash
# Vérifier les logs
make dev-logs

# Vérifier le statut des conteneurs
make ps

# Tester l'API
curl http://localhost:8000/health
```

### 3. Télécharger les données DVF

Les données DVF (Demandes de Valeurs Foncières) sont nécessaires pour les estimations. Elles doivent être téléchargées et indexées dans la base de données.

#### Option 1 : Via le script (recommandé)

```bash
make dvf-download
```

#### Option 2 : Avec authentification admin

Si vous avez un compte admin, vous pouvez utiliser le token :

```bash
make dvf-download-token TOKEN=your_admin_token
```

#### Option 3 : Via l'API directement

```bash
curl -X POST http://localhost:8000/api/v1/dvf/download-idf \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Note :** Le téléchargement peut prendre plusieurs minutes car il télécharge et indexe les données pour tous les départements d'Île-de-France (75, 77, 78, 91, 92, 93, 94, 95).

### 4. Accéder à l'application

1. Ouvrez votre navigateur : http://localhost:3000
2. Vous serez redirigé vers le formulaire d'estimation
3. Remplissez le formulaire pour obtenir une estimation

## 🛠️ Commandes Utiles

### Développement

```bash
make dev          # Démarrer l'environnement de dev
make dev-logs     # Voir les logs
make dev-stop     # Arrêter l'environnement
make dev-clean    # Nettoyer complètement
```

### Base de données

```bash
make shell-db     # Ouvrir un shell PostgreSQL
make db-backup    # Sauvegarder la base de données
make db-reset     # Réinitialiser la base de données
```

### Cache Redis

```bash
make shell-redis  # Ouvrir un shell Redis
make cache-stats  # Voir les statistiques du cache
make cache-clear  # Vider le cache
```

### DVF

```bash
make dvf-download           # Télécharger les données DVF
make dvf-download-token     # Télécharger avec token admin
```

## 📊 Structure de l'Application

```
MonEstimation/
├── backend/          # API Node.js/Express
│   ├── src/
│   │   ├── models/   # Modèles Sequelize (Bien, Estimation, Comparable, Lead)
│   │   ├── routes/   # Routes API
│   │   ├── services/ # Services métier (estimation, DVF, scraping)
│   │   └── jobs/     # Worker Bull
│   └── data/dvf/     # Fichiers DVF téléchargés (gitignored)
├── frontend/         # Interface Next.js
│   └── src/
│       ├── app/      # Pages Next.js
│       └── components/ # Composants React
└── docker/           # Configurations Docker
```

## 🔧 Configuration

### Variables d'environnement

Les variables d'environnement sont définies dans `docker-compose.dev.yml` :

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` : Configuration PostgreSQL
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB` : Configuration Redis
- `JWT_SECRET` : Secret pour les tokens JWT
- `NEXT_PUBLIC_API_URL` : URL de l'API backend (frontend)

### Base de données

En développement, la base de données est automatiquement synchronisée au démarrage du backend (via Sequelize `sync`).

Les modèles créés :
- `users` : Utilisateurs
- `biens` : Biens immobiliers
- `estimations` : Estimations
- `comparables` : Comparables (DVF + offres)
- `leads` : Leads générés
- `scraping_jobs` : Jobs de scraping

## 🐛 Dépannage

### Les services ne démarrent pas

```bash
# Vérifier les logs
make dev-logs

# Vérifier les ports disponibles
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est démarré
make ps

# Réinitialiser la base de données
make db-reset
```

### Erreur lors du téléchargement DVF

1. Vérifier que le backend est accessible : `curl http://localhost:8000/health`
2. Vérifier les logs : `make dev-logs`
3. Vérifier l'espace disque disponible (les fichiers DVF peuvent être volumineux)
4. Vérifier la connexion internet

### Le frontend ne se connecte pas au backend

1. Vérifier que `NEXT_PUBLIC_API_URL` est bien défini dans `docker-compose.dev.yml`
2. Vérifier que le backend répond : `curl http://localhost:8000/health`
3. Vérifier les CORS dans la configuration backend

## 📚 Documentation Complète

- [Architecture](docs/ARCHITECTURE_RULES.md)
- [Guide du développeur](docs/DEVELOPER_GUIDE.md)
- [Audit estimation immobilière](AUDIT_ESTIMATION_IMMOBILIERE.md)

## 🆘 Support

En cas de problème :
1. Vérifier les logs : `make dev-logs`
2. Vérifier le statut : `make ps`
3. Consulter la documentation
4. Vérifier les issues GitHub

