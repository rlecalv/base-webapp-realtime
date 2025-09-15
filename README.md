# Base WebApp - Application Temps Réel

Une base d'application web temps réel réutilisable avec Node.js/Express, React/Next.js, WebSocket, Redis, PostgreSQL et Docker.

## 🚀 Fonctionnalités

- **Backend Node.js/Express** avec API REST et WebSocket
- **Frontend React/Next.js** avec interface moderne
- **Authentification JWT** sécurisée
- **Communication temps réel** via WebSocket (Socket.IO)
- **Tâches asynchrones** avec Bull Queue et Redis
- **Base de données PostgreSQL** avec Sequelize ORM
- **Cache Redis** pour les performances
- **Containerisation Docker** complète
- **Reverse proxy Traefik** avec SSL automatique
- **Interface responsive** avec Tailwind CSS
- **Export de données** en PDF, Excel et CSV via Puppeteer
- **Génération de rapports** avec statistiques complètes

## 📋 Prérequis

- Docker et Docker Compose
- Node.js 18+ (pour le développement local)
- Git

## 🛠️ Installation et Démarrage

### Développement

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd base_app
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Démarrer l'environnement de développement**
   ```bash
   make dev
   ```
   
   Ou manuellement :
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Accéder à l'application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Adminer (DB): http://localhost:8081

### Production

1. **Configurer les variables d'environnement de production**
   ```bash
   # Modifier les fichiers .env avec les valeurs de production
   # Changer notamment JWT_SECRET, mots de passe, etc.
   ```

2. **Démarrer en production**
   ```bash
   make prod
   ```
   
   Ou manuellement :
   ```bash
   docker-compose up -d
   ```

3. **Accéder à l'application**
   - Application: http://localhost (via Traefik)
   - Traefik Dashboard: http://localhost:8080

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

## 🔄 Roadmap

- [ ] Tests automatisés complets
- [ ] CI/CD avec GitHub Actions
- [ ] Monitoring avec Prometheus/Grafana
- [ ] Support multi-tenant
- [ ] API GraphQL
- [ ] Application mobile React Native