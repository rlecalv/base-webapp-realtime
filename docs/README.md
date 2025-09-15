# 📚 Documentation Base WebApp

Bienvenue dans la documentation complète de la coquille Base WebApp !

## 🚀 Démarrage Rapide

### 🆕 Nouveau sur le projet ?
1. **[📋 Index de Documentation](DOCUMENTATION_INDEX.md)** - Navigation complète
2. **[🏛️ Règles d'Architecture](ARCHITECTURE_RULES.md)** - **OBLIGATOIRE** - Règles de la coquille
3. **[📖 Guide du Développeur](DEVELOPER_GUIDE.md)** - Conventions et workflow

## 📖 Documents Disponibles

### 🎯 Essentiels (À lire en priorité)
| Document | Description | Audience | Priorité |
|----------|-------------|----------|----------|
| **[📋 Index de Documentation](DOCUMENTATION_INDEX.md)** | Navigation et parcours recommandés | Tous | 🔴 Start Here |
| **[🏛️ Règles d'Architecture](ARCHITECTURE_RULES.md)** | Règles NON-NÉGOCIABLES de la coquille | Tous | 🔴 Critique |
| **[📖 Guide du Développeur](DEVELOPER_GUIDE.md)** | Conventions, bonnes pratiques, workflow | Développeurs | 🟡 Important |

### 📊 Techniques et Détails
| Document | Description | Audience |
|----------|-------------|----------|
| **[🚀 Mise à jour Performance](PERFORMANCE_SECURITY_UPGRADE.md)** | Détails des améliorations récentes | DevOps/Lead |

## 🎯 Parcours Recommandés

### 👨‍💻 Développeur Frontend/Backend
```
1. Index de Documentation (navigation)
2. Règles d'Architecture (règles strictes)
3. Guide du Développeur (conventions)
4. Explorer le code avec les règles en tête
```

### 🔧 DevOps/Infrastructure
```
1. Index de Documentation (navigation)
2. Mise à jour Performance (améliorations)
3. Règles d'Architecture (contraintes)
4. Configuration dans /docker et /scripts
```

### 👨‍💼 Chef de Projet/Lead
```
1. Index de Documentation (vue d'ensemble)
2. Mise à jour Performance (gains obtenus)
3. Règles d'Architecture (règles imposées)
4. Roadmap dans README principal
```

## 🔍 Recherche Rapide

### Par Sujet
- **Architecture** : [ARCHITECTURE_RULES.md](ARCHITECTURE_RULES.md)
- **Développement** : [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Performance** : [PERFORMANCE_SECURITY_UPGRADE.md](PERFORMANCE_SECURITY_UPGRADE.md)
- **Navigation** : [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

### Par Technologie
- **Docker** : `../docker/`, `../scripts/docker-build.sh`
- **Nginx** : `../docker/nginx/`
- **Traefik** : `../docker/traefik/`
- **Next.js** : `../frontend/src/`
- **Express** : `../backend/src/`

## 🆘 Besoin d'Aide ?

1. **Commencer par** : [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
2. **Problème spécifique** : Chercher dans [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
3. **Règle à vérifier** : [ARCHITECTURE_RULES.md](ARCHITECTURE_RULES.md)
4. **Commandes utiles** : `make help` dans le projet

## 📝 Contribution à la Documentation

### Règles de Mise à Jour
- **Toujours** mettre à jour la doc avec le code
- **Respecter** le format Markdown avec emojis
- **Tester** les exemples avant commit
- **Maintenir** les liens à jour

### Structure
```
docs/
├── README.md                    # Ce fichier (index du dossier)
├── DOCUMENTATION_INDEX.md       # Navigation complète
├── ARCHITECTURE_RULES.md        # Règles strictes
├── DEVELOPER_GUIDE.md          # Guide développeur
└── PERFORMANCE_SECURITY_UPGRADE.md # Détails techniques
```

---

**💡 Cette documentation évolue avec le projet. Elle est maintenue à jour par l'équipe de développement.**

**🎯 Objectif : Faciliter l'onboarding et maintenir la qualité du code selon les règles de la coquille.**
