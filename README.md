# 🚀 Base WebApp - Coquille d'Application Sécurisée

Une **coquille d'application web** prête pour la production avec sécurité niveau entreprise, performance optimisée et architecture scalable.

## ✨ Fonctionnalités Principales

### 🏗️ Architecture Moderne
- **Backend Node.js/Express** avec TypeScript
- **Frontend Next.js 14** avec App Router
- **Base de données PostgreSQL** avec Sequelize ORM
- **Cache Redis** pour les performances
- **WebSocket** temps réel avec Socket.IO

### 🔒 Sécurité Niveau Entreprise
- **Rate limiting intelligent** multi-niveaux
- **WAF (Web Application Firewall)** avec Traefik
- **Authentification JWT** sécurisée
- **Headers de sécurité** complets (HSTS, CSP, etc.)
- **Validation stricte** des données
- **Protection DDoS** intégrée

### 🚀 Performance Optimisée
- **Nginx** avec compression Gzip/Brotli
- **Images Docker** multi-stage optimisées (-60% taille)
- **CDN ready** (CloudFlare/CloudFront)
- **Cache HTTP** intelligent avec Redis
- **Compression automatique** des assets

### 🛠️ DevOps Intégré
- **Docker Compose** multi-environnements
- **Scripts d'automatisation** complets
- **Monitoring** Prometheus intégré
- **Health checks** natifs
- **Backup automatisé** des données

## 📋 Prérequis

- Docker et Docker Compose
- Node.js 18+ (pour le développement local)
- Git

## 🚀 Installation Rapide

### Démarrage Express (Recommandé)
```bash
# 1. Cloner et configurer
git clone https://github.com/rlecalv/base-webapp-realtime.git
cd base_app

# 2. Installation complète automatique
make install
```

### Développement
```bash
# Démarrer l'environnement de développement
make dev

# Accès aux services
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000  
# - Adminer (DB): http://localhost:8081
# - Redis CLI: make shell-redis
```

### Production Sécurisée
```bash
# Configuration sécurisée automatique
make setup-security

# Build optimisé
make build-optimized

# Démarrage production avec WAF
make secure

# Déploiement CDN (optionnel)
make deploy-cdn
```

### Commandes Essentielles
```bash
make help           # Aide complète (25+ commandes)
make dev            # Développement
make secure         # Production sécurisée
make cache-stats    # Statistiques cache
make security-scan  # Scan vulnérabilités
make audit          # Audit complet
make clean          # Nettoyage
```

## 🏗️ Architecture

```
base_app/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── config/         # Configuration (DB, Redis, etc.)
│   │   ├── models/         # Modèles Sequelize
│   │   ├── routes/         # Routes API
│   │   ├── middleware/     # Middlewares Express
│   │   ├── services/       # Services (Cache, Queue, etc.)
│   │   ├── websocket/      # Gestion WebSocket
│   │   ├── jobs/           # Workers Bull Queue
│   │   └── server.js       # Point d'entrée
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Interface React/Next.js
│   ├── src/
│   │   ├── app/           # Pages Next.js 13+
│   │   ├── components/    # Composants React
│   │   ├── contexts/      # Contextes React
│   │   ├── hooks/         # Hooks personnalisés
│   │   ├── lib/           # Utilitaires (API, Socket, etc.)
│   │   └── types/         # Types TypeScript
│   ├── Dockerfile
│   └── package.json
├── docker/                # Configuration Docker
├── docker-compose.yml     # Production
├── docker-compose.dev.yml # Développement
├── Makefile              # Commandes utiles
└── README.md
```

## 🔧 Commandes Utiles

### Makefile

```bash
make dev          # Démarrer l'environnement de développement
make dev-logs     # Voir les logs de développement
make dev-stop     # Arrêter le développement
make dev-clean    # Nettoyer l'environnement de développement

make prod         # Démarrer la production
make prod-logs    # Voir les logs de production
make prod-stop    # Arrêter la production

make build        # Construire toutes les images
make db-reset     # Réinitialiser la base de données
make db-backup    # Sauvegarder la base de données
make clean        # Nettoyer complètement

make help         # Afficher toutes les commandes
```

### Docker Compose

```bash
# Développement
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## 🔌 API Endpoints

### Authentification
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `GET /api/v1/auth/me` - Profil utilisateur
- `POST /api/v1/auth/verify-token` - Vérification token

### Messages
- `GET /api/v1/messages` - Liste des messages
- `POST /api/v1/messages` - Créer un message
- `PUT /api/v1/messages/:id` - Modifier un message
- `DELETE /api/v1/messages/:id` - Supprimer un message

### Exports
- `GET /api/v1/exports/formats` - Formats d'export disponibles
- `GET /api/v1/exports/users` - Export des utilisateurs (PDF/Excel/CSV)
- `GET /api/v1/exports/messages` - Export des messages (PDF/Excel/CSV)
- `GET /api/v1/exports/statistics` - Export des statistiques (PDF/Excel)
- `POST /api/v1/exports/custom` - Export personnalisé
- `GET /api/v1/exports/health` - État du service d'export
- `DELETE /api/v1/exports/cleanup` - Nettoyage des anciens exports

### WebSocket Events
- `connection` - Connexion établie
- `new_message` - Nouveau message
- `message_updated` - Message modifié
- `message_deleted` - Message supprimé
- `user_connected` - Utilisateur connecté
- `user_disconnected` - Utilisateur déconnecté
- `user_typing` - Utilisateur en train d'écrire

## 🗄️ Base de Données

### Modèles Principaux

- **User** - Utilisateurs de l'application
- **Message** - Messages du chat

### Migrations

Les migrations Sequelize sont automatiquement appliquées au démarrage en mode développement.

## 🔄 Tâches Asynchrones

Le système utilise Bull Queue avec Redis pour gérer les tâches asynchrones :

- **Email Queue** - Envoi d'emails
- **Notification Queue** - Notifications push
- **Data Processing Queue** - Traitement de données

## 🔒 Sécurité

- Authentification JWT
- Validation des données avec Joi
- Rate limiting
- Helmet.js pour les headers de sécurité
- CORS configuré
- Mots de passe hashés avec bcrypt

## 🚀 Déploiement

### Variables d'Environnement Importantes

```bash
# Sécurité
JWT_SECRET=votre-clé-très-sécurisée
POSTGRES_PASSWORD=mot-de-passe-fort
REDIS_PASSWORD=mot-de-passe-redis

# Domaine (pour Traefik SSL)
DOMAIN=votre-domaine.com
ACME_EMAIL=admin@votre-domaine.com
```

### SSL avec Traefik

Traefik gère automatiquement les certificats SSL avec Let's Encrypt. Configurez simplement :

1. Votre domaine dans les labels Traefik
2. Votre email dans `ACME_EMAIL`
3. Pointez votre domaine vers votre serveur

## 🧪 Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# Test des fonctionnalités d'export
node test_exports.js

# Ou via Makefile
make test
```

## 📊 Fonctionnalités d'Export

L'application inclut un système d'export complet permettant d'exporter les données en plusieurs formats :

### Formats Supportés
- **PDF** - Documents formatés avec Puppeteer
- **Excel (XLSX)** - Feuilles de calcul avec formatage
- **CSV** - Données tabulaires simples

### Types d'Export
- **Utilisateurs** - Liste complète avec filtres (statut, rôle, dates)
- **Messages** - Historique des conversations avec filtres
- **Statistiques** - Rapports complets de l'application
- **Export personnalisé** - Données custom avec templates

### Utilisation Frontend
Les boutons d'export sont intégrés dans :
- Page d'administration (utilisateurs et statistiques)
- Page de chat (messages)
- Interface modale avec filtres avancés

### API d'Export
```javascript
// Exemple d'utilisation de l'API d'export
import { exportsApi } from '@/lib/api';

// Export des utilisateurs en Excel
const blob = await exportsApi.exportUsers('excel', {
  isActive: true,
  dateFrom: '2024-01-01'
});

// Téléchargement automatique
downloadBlob(blob, 'utilisateurs.xlsx');
```

## 📝 Développement

### Ajouter de Nouvelles Fonctionnalités

1. **Nouveau modèle** : Ajouter dans `backend/src/models/`
2. **Nouvelle route** : Ajouter dans `backend/src/routes/`
3. **Nouveau composant** : Ajouter dans `frontend/src/components/`
4. **Nouvelle page** : Ajouter dans `frontend/src/app/`

### Hot Reload

- Backend : Nodemon activé en mode développement
- Frontend : Next.js Hot Reload activé

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

1. Vérifiez la documentation
2. Consultez les logs : `make dev-logs`
3. Vérifiez le statut des services : `make ps`
4. Ouvrez une issue sur GitHub

## 📚 Documentation Complète

### Guides Développeurs
- **[📖 Guide du Développeur](DEVELOPER_GUIDE.md)** - Règles de code, conventions, workflow
- **[🏛️ Règles d'Architecture](ARCHITECTURE_RULES.md)** - Règles strictes de la "coquille"
- **[🚀 Mise à jour Performance](PERFORMANCE_SECURITY_UPGRADE.md)** - Détails des améliorations

### Configuration
- **[🔧 Variables CDN](cdn.env.example)** - Configuration CDN CloudFlare/CloudFront
- **[🐳 Docker](docker/)** - Configurations Nginx, Traefik, pages d'erreur
- **[📜 Scripts](scripts/)** - Automatisation build, deploy, security

### Composants
- **[🧩 Composants UI](frontend/src/components/README.md)** - Documentation des composants
- **[📊 Structure](frontend/src/components/STRUCTURE.md)** - Organisation des composants

## 🎯 Philosophie du Projet

Cette **coquille d'application** suit une approche **pragmatique** :

### ✅ Principes
- **Sécurité par défaut** - Toutes les protections activées
- **Performance native** - Optimisations intégrées
- **Simplicité maintenable** - Pas de sur-ingénierie
- **Documentation vivante** - Guides toujours à jour

### 🚫 Anti-patterns évités
- Pas de données hardcodées
- Pas de secrets en clair
- Pas de routes non protégées
- Pas de validation uniquement frontend

## 🔄 Roadmap

### ✅ Implémenté
- [x] Sécurité niveau entreprise (WAF, rate limiting)
- [x] Performance optimisée (cache, compression, CDN)
- [x] DevOps complet (Docker, scripts, monitoring)
- [x] Documentation exhaustive

### 🎯 Prochaines étapes
- [ ] Tests automatisés complets (Jest + Playwright)
- [ ] CI/CD avec GitHub Actions
- [ ] Monitoring Grafana
- [ ] Backup automatisé PostgreSQL
- [ ] Support multi-tenant