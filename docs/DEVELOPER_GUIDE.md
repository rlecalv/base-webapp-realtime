# 📚 Guide du Développeur - Base WebApp

## 🎯 Philosophie du projet

Ce projet suit une approche **pragmatique** et **maintenable** :
- **Simplicité** avant complexité
- **Performance** sans sur-ingénierie
- **Sécurité** par défaut
- **Documentation** vivante

## 🏗️ Architecture

### Stack Technique
```
Frontend: Next.js 14 + TypeScript + Tailwind CSS
Backend: Node.js + Express + TypeScript
Base de données: PostgreSQL + Redis
Reverse Proxy: Traefik + Nginx
Containerisation: Docker + Docker Compose
```

### Structure des dossiers
```
base_app/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── config/         # Configuration (DB, Redis)
│   │   ├── middleware/     # Middlewares (auth, rate limiting)
│   │   ├── models/         # Modèles Sequelize
│   │   ├── routes/         # Routes API
│   │   ├── services/       # Services métier
│   │   ├── types/          # Types TypeScript
│   │   └── websocket/      # Gestion WebSocket
│   ├── dist/               # Code compilé
│   └── exports/            # Fichiers d'export générés
├── frontend/               # Application Next.js
│   ├── src/
│   │   ├── app/           # App Router Next.js 14
│   │   ├── components/    # Composants réutilisables
│   │   ├── contexts/      # Contextes React
│   │   ├── hooks/         # Hooks personnalisés
│   │   ├── lib/           # Utilitaires
│   │   └── types/         # Types TypeScript
├── docker/                # Configurations Docker
│   ├── nginx/            # Configuration Nginx
│   ├── traefik/          # Configuration Traefik
│   └── error-pages/      # Pages d'erreur personnalisées
├── scripts/              # Scripts d'automatisation
└── monitoring/           # Configuration monitoring
```

## 🔧 Règles de Développement

### 1. Code Quality

#### TypeScript
```typescript
// ✅ BON - Types explicites et interfaces claires
interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
}

export const createUser = async (data: UserCreateRequest): Promise<User> => {
  // Implémentation
};

// ❌ MAUVAIS - Types any et manque de structure
export const createUser = async (data: any): Promise<any> => {
  // Implémentation
};
```

#### Gestion d'erreurs
```typescript
// ✅ BON - Gestion d'erreur structurée
try {
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé'
    });
  }
  // Suite du traitement
} catch (error) {
  console.error('Erreur récupération utilisateur:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
}

// ❌ MAUVAIS - Pas de gestion d'erreur
const user = await User.findByPk(id);
res.json(user);
```

### 2. Sécurité

#### Validation des données
```typescript
// ✅ BON - Validation avec express-validator
import { body, validationResult } from 'express-validator';

export const validateUserCreation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mot de passe trop faible'),
];

// ❌ MAUVAIS - Pas de validation
app.post('/users', (req, res) => {
  const { email, password } = req.body;
  // Utilisation directe sans validation
});
```

#### Authentification
```typescript
// ✅ BON - Middleware d'authentification
import { authenticateToken } from '../middleware/auth';

router.get('/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// ❌ MAUVAIS - Route non protégée
router.get('/profile', (req, res) => {
  // Accès sans vérification
});
```

### 3. Performance

#### Rate Limiting
```typescript
// ✅ BON - Rate limiting approprié
import { authLimiter } from '../middleware/rateLimiting';

router.post('/login', authLimiter, loginController);

// ❌ MAUVAIS - Pas de protection
router.post('/login', loginController);
```

#### Cache
```typescript
// ✅ BON - Cache pour données coûteuses
const getCachedStats = async () => {
  const cached = await redisClient.get('stats:global');
  if (cached) {
    return JSON.parse(cached);
  }
  
  const stats = await calculateExpensiveStats();
  await redisClient.setEx('stats:global', 300, JSON.stringify(stats));
  return stats;
};

// ❌ MAUVAIS - Calcul à chaque requête
const getStats = async () => {
  return await calculateExpensiveStats(); // Toujours recalculé
};
```

### 4. Base de Données

#### Modèles Sequelize
```typescript
// ✅ BON - Modèle bien structuré
class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  // ... autres propriétés
  
  // Associations
  static associate(models: any) {
    User.hasMany(models.Message, { foreignKey: 'user_id' });
  }
}

// ❌ MAUVAIS - Modèle sans types
const User = sequelize.define('User', {
  // Définition sans types
});
```

#### Requêtes optimisées
```typescript
// ✅ BON - Requête avec includes et limites
const getMessagesWithUsers = async (limit = 50) => {
  return await Message.findAll({
    include: [{
      model: User,
      attributes: ['id', 'username'] // Seulement les champs nécessaires
    }],
    limit,
    order: [['created_at', 'DESC']]
  });
};

// ❌ MAUVAIS - Requête sans optimisation
const getMessages = async () => {
  return await Message.findAll({
    include: [User] // Tous les champs, pas de limite
  });
};
```

### 5. Frontend (Next.js)

#### Composants
```tsx
// ✅ BON - Composant typé et réutilisable
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size = 'md',
  onClick,
  children,
  disabled = false
}) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// ❌ MAUVAIS - Composant sans types
export const Button = ({ variant, onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};
```

#### Hooks personnalisés
```tsx
// ✅ BON - Hook typé et réutilisable
interface UseApiOptions {
  immediate?: boolean;
}

export const useApi = <T>(url: string, options: UseApiOptions = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erreur réseau');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [url]);
  
  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [fetchData, options.immediate]);
  
  return { data, loading, error, refetch: fetchData };
};
```

## 🚀 Workflow de Développement

### 1. Démarrage
```bash
# Cloner le projet
git clone https://github.com/rlecalv/base-webapp-realtime.git
cd base_app

# Configuration initiale
make setup-security
cp .env.example .env

# Démarrage développement
make dev
```

### 2. Développement quotidien
```bash
# Démarrer l'environnement
make dev

# Voir les logs
make dev-logs

# Tests
make test

# Linting
make lint

# Arrêter
make dev-stop
```

### 3. Avant commit
```bash
# Vérifier la qualité
make lint
make test

# Build pour vérifier
make build

# Commit avec message descriptif
git add .
git commit -m "feat: ajouter authentification OAuth"
```

### 4. Déploiement
```bash
# Build optimisé
make build-optimized

# Déploiement sécurisé
make secure

# Vérification
make audit
```

## 📝 Conventions de Nommage

### Fichiers et Dossiers
```
PascalCase: Composants React (Button.tsx, UserProfile.tsx)
camelCase: Fichiers utilitaires (apiClient.ts, formatDate.ts)
kebab-case: Pages Next.js (user-profile.tsx)
UPPER_CASE: Constantes (API_ENDPOINTS.ts)
```

### Variables et Fonctions
```typescript
// Variables
const userName = 'john'; // camelCase
const API_URL = 'https://api.example.com'; // UPPER_CASE pour constantes

// Fonctions
const getUserById = (id: number) => { }; // camelCase
const handleUserClick = () => { }; // handle* pour event handlers

// Composants
const UserProfile = () => { }; // PascalCase

// Types et Interfaces
interface UserData { } // PascalCase
type ApiResponse<T> = { }; // PascalCase
```

### Base de Données
```sql
-- Tables: snake_case
users, user_profiles, message_attachments

-- Colonnes: snake_case
user_id, created_at, is_active

-- Index: descriptifs
idx_users_email, idx_messages_created_at
```

## 🔍 Debugging et Logs

### Logs structurés
```typescript
// ✅ BON - Logs structurés
console.log('User login attempt', {
  userId: user.id,
  email: user.email,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
});

// ❌ MAUVAIS - Logs non structurés
console.log('User ' + user.email + ' logged in');
```

### Debugging
```typescript
// Utiliser les outils de debug appropriés
import debug from 'debug';
const log = debug('app:auth');

log('Processing login for user %s', email);
```

## 🧪 Tests

### Tests unitaires
```typescript
// ✅ BON - Test complet
describe('User Service', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!'
      };
      
      const user = await createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Vérifie le hash
    });
    
    it('should throw error with invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'SecurePass123!'
      };
      
      await expect(createUser(userData)).rejects.toThrow('Email invalide');
    });
  });
});
```

## 🔒 Sécurité - Checklist

### Avant chaque release
- [ ] Toutes les routes sensibles sont protégées par authentification
- [ ] Rate limiting activé sur les endpoints critiques
- [ ] Validation des données d'entrée
- [ ] Pas de données sensibles dans les logs
- [ ] Variables d'environnement pour les secrets
- [ ] Headers de sécurité configurés
- [ ] Scan de vulnérabilités passé (`make security-scan`)

### Variables d'environnement sensibles
```bash
# ✅ BON - Utiliser des variables d'environnement
JWT_SECRET=your-super-secret-key
DB_PASSWORD=secure-password

# ❌ MAUVAIS - Hardcodé dans le code
const JWT_SECRET = 'my-secret'; // Ne jamais faire ça !
```

## 📊 Monitoring et Métriques

### Métriques importantes
- Temps de réponse API
- Taux d'erreur
- Utilisation mémoire/CPU
- Connexions base de données
- Cache hit ratio

### Logs à surveiller
- Tentatives de connexion échouées
- Erreurs 500
- Rate limiting déclenché
- Activités suspectes

## 🚨 Gestion des Erreurs

### Codes d'erreur standardisés
```typescript
// Codes HTTP appropriés
200: Succès
201: Créé
400: Requête invalide
401: Non authentifié
403: Non autorisé
404: Non trouvé
429: Trop de requêtes
500: Erreur serveur
```

### Format de réponse d'erreur
```typescript
// Format standardisé
{
  "success": false,
  "message": "Message d'erreur lisible",
  "error": "CODE_ERREUR",
  "details": { /* détails optionnels */ }
}
```

## 📚 Ressources

### Documentation officielle
- [Next.js](https://nextjs.org/docs)
- [Express.js](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [Docker](https://docs.docker.com/)
- [Traefik](https://doc.traefik.io/)

### Outils recommandés
- **IDE**: VS Code avec extensions TypeScript, ESLint, Prettier
- **Database**: DBeaver ou pgAdmin pour PostgreSQL
- **API Testing**: Postman ou Insomnia
- **Monitoring**: Docker Desktop, Redis CLI

## 🤝 Contribution

### Processus de contribution
1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Commit** les changements (`git commit -m 'feat: add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### Format des commits
```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: mise à jour documentation
style: formatage code
refactor: refactoring
test: ajout de tests
chore: tâches de maintenance
```

---

**💡 Conseil**: Ce guide évolue avec le projet. N'hésitez pas à le mettre à jour quand vous découvrez de nouvelles bonnes pratiques !

**🆘 Besoin d'aide ?** Consultez les logs avec `make logs` ou l'audit avec `make audit`.
