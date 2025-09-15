# 📚 Index de Documentation - Base WebApp

## 🎯 Démarrage Rapide

### Pour les Nouveaux Développeurs
1. **[📖 README Principal](../README.md)** - Vue d'ensemble et installation
2. **[🏛️ Règles d'Architecture](ARCHITECTURE_RULES.md)** - **OBLIGATOIRE** - Règles de la coquille
3. **[📖 Guide du Développeur](DEVELOPER_GUIDE.md)** - Conventions et bonnes pratiques

### Pour les DevOps
1. **[🚀 Mise à jour Performance](PERFORMANCE_SECURITY_UPGRADE.md)** - Détails techniques
2. **[📜 Scripts d'Automatisation](../scripts/)** - Build, deploy, security
3. **[🐳 Configuration Docker](../docker/)** - Nginx, Traefik, pages d'erreur

## 📋 Documentation par Catégorie

### 🏗️ Architecture & Règles
| Document | Description | Audience | Priorité |
|----------|-------------|----------|----------|
| [🏛️ Règles d'Architecture](ARCHITECTURE_RULES.md) | **Règles NON-NÉGOCIABLES** de la coquille | Tous | 🔴 Critique |
| [📖 Guide du Développeur](DEVELOPER_GUIDE.md) | Conventions, workflow, bonnes pratiques | Développeurs | 🟡 Important |
| [🚀 Mise à jour Performance](PERFORMANCE_SECURITY_UPGRADE.md) | Détails des améliorations récentes | DevOps/Lead | 🟢 Info |

### 🔧 Configuration & Setup
| Document | Description | Usage |
|----------|-------------|-------|
| [🔧 Variables CDN](../cdn.env.example) | Configuration CloudFlare/CloudFront | Production |
| [🐳 Docker Nginx](../docker/nginx/) | Configuration reverse proxy | Production |
| [🛡️ Traefik WAF](../docker/traefik/) | Configuration firewall | Production |
| [📄 Pages d'erreur](../docker/error-pages/) | Pages d'erreur sécurisées | Production |

### 📜 Scripts & Automatisation
| Script | Description | Usage |
|--------|-------------|-------|
| [🔨 Build Docker](../scripts/docker-build.sh) | Build optimisé avec cache | CI/CD |
| [🌐 Deploy CDN](../scripts/deploy-cdn.sh) | Déploiement CloudFlare/CloudFront | Production |
| [🔒 Setup Security](../scripts/setup-security.sh) | Génération secrets | Installation |

### 🧩 Frontend
| Document | Description | Audience |
|----------|-------------|----------|
| [🧩 Composants UI](../frontend/src/components/README.md) | Documentation composants | Frontend |
| [📊 Structure](../frontend/src/components/STRUCTURE.md) | Organisation composants | Frontend |
| [🎨 Exemples](../frontend/src/components/examples/) | Exemples d'utilisation | Frontend |

### 🔧 Backend
| Dossier | Description | Contenu |
|---------|-------------|---------|
| [⚙️ Config](../backend/src/config/) | Configuration app | Database, Redis, JWT |
| [🛡️ Middleware](../backend/src/middleware/) | Middlewares Express | Auth, Rate limiting, CDN |
| [🗄️ Models](../backend/src/models/) | Modèles Sequelize | User, Message |
| [🛣️ Routes](../backend/src/routes/) | Routes API | Auth, Messages, Exports |
| [🔧 Services](../backend/src/services/) | Services métier | Cache, Export |

## 🎯 Parcours de Lecture Recommandés

### 🆕 Nouveau Développeur
```
1. ../README.md (vue d'ensemble)
2. ARCHITECTURE_RULES.md (OBLIGATOIRE - règles strictes)
3. DEVELOPER_GUIDE.md (conventions)
4. ../frontend/src/components/README.md (si frontend)
5. Exploration du code avec les règles en tête
```

### 🔧 DevOps/Infrastructure
```
1. PERFORMANCE_SECURITY_UPGRADE.md (améliorations)
2. ../docker/ (configurations)
3. ../scripts/ (automatisation)
4. ../cdn.env.example (CDN)
5. ../Makefile (commandes)
```

### 👨‍💼 Chef de Projet/Lead
```
1. ../README.md (vue d'ensemble)
2. PERFORMANCE_SECURITY_UPGRADE.md (gains)
3. ARCHITECTURE_RULES.md (règles imposées)
4. Roadmap dans ../README.md
```

### 🔒 Audit Sécurité
```
1. ARCHITECTURE_RULES.md (règles sécurité)
2. ../backend/src/middleware/ (protections)
3. ../docker/traefik/ (WAF)
4. ../scripts/setup-security.sh (secrets)
```

## 🔍 Recherche Rapide

### Par Technologie
- **Docker** : `../docker/`, `../scripts/docker-build.sh`, Dockerfile
- **Nginx** : `../docker/nginx/`
- **Traefik** : `../docker/traefik/`, `../docker-compose.secure.yml`
- **Redis** : `../backend/src/config/redis.ts`, cache
- **PostgreSQL** : `../backend/src/config/database.ts`, models
- **Next.js** : `../frontend/src/app/`, components
- **Express** : `../backend/src/routes/`, middleware

### Par Fonctionnalité
- **Authentification** : `../backend/src/middleware/auth.ts`, `../backend/src/routes/auth.ts`
- **Rate Limiting** : `../backend/src/middleware/rateLimiting.ts`
- **Cache** : `../backend/src/services/cacheService.ts`
- **Export** : `../backend/src/routes/exports.ts`, `../backend/src/services/exportService.ts`
- **WebSocket** : `../backend/src/websocket/`
- **CDN** : `../backend/src/middleware/cdn.ts`, `../scripts/deploy-cdn.sh`

### Par Problème
- **Performance lente** : PERFORMANCE_SECURITY_UPGRADE.md, cache, CDN
- **Erreur sécurité** : ARCHITECTURE_RULES.md, ../backend/src/middleware/auth.ts
- **Build Docker** : ../scripts/docker-build.sh, Dockerfile
- **Configuration** : ../backend/src/config/, .env files
- **Déploiement** : ../scripts/, ../docker-compose.secure.yml

## 🆘 Aide Rapide

### Commandes Utiles
```bash
make help           # Liste toutes les commandes
make audit          # Audit complet du projet
make dev-logs       # Logs de développement
make security-scan  # Scan de vulnérabilités
```

### Debugging
```bash
make logs           # Tous les logs
make ps             # Statut des services
make shell-backend  # Shell dans le backend
make shell-db       # Shell PostgreSQL
make cache-stats    # Statistiques Redis
```

### En Cas de Problème
1. **Vérifier les logs** : `make logs`
2. **Audit complet** : `make audit`
3. **Consulter** : ARCHITECTURE_RULES.md (règles)
4. **Chercher** : Dans cette documentation
5. **Demander** : Issue GitHub

## 📝 Mise à Jour de la Documentation

### Règles de Mise à Jour
- **Toujours** mettre à jour la doc en même temps que le code
- **Respecter** le format Markdown avec emojis
- **Tester** les exemples de code
- **Lier** les documents entre eux

### Responsabilités
- **Développeurs** : Mettre à jour DEVELOPER_GUIDE.md
- **DevOps** : Mettre à jour scripts et docker/
- **Lead** : Maintenir ARCHITECTURE_RULES.md
- **Tous** : Maintenir README.md à jour

---

## 🎯 Résumé pour Démarrer

### ⚡ Ultra-Rapide (5 min)
1. Lire [README.md](../README.md) 
2. `make install`
3. `make dev`

### 🚀 Complet (30 min)
1. [README.md](../README.md) - Vue d'ensemble
2. [ARCHITECTURE_RULES.md](ARCHITECTURE_RULES.md) - **OBLIGATOIRE**
3. [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Conventions
4. Explorer le code avec les règles

### 🏆 Expert (2h)
- Lire toute la documentation
- Comprendre l'architecture complète
- Maîtriser les scripts d'automatisation
- Connaître les optimisations performance

---

**💡 Cette documentation évolue avec le projet. Contribuez à la maintenir à jour !**
