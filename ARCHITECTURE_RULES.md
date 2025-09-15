# 🏛️ Règles d'Architecture - Base WebApp "Coquille"

## 🎯 Philosophie de la Coquille

La "coquille" Base WebApp est conçue comme un **framework d'application** réutilisable qui impose des règles strictes pour maintenir la **cohérence**, la **sécurité** et la **maintenabilité**.

## 🏗️ Principes Architecturaux

### 1. Séparation des Responsabilités
```
Frontend (Next.js) ←→ API (Express) ←→ Database (PostgreSQL)
     ↑                    ↑                    ↑
   UI/UX              Business Logic        Data Layer
```

### 2. Sécurité par Défaut
- **Authentification** obligatoire sur toutes les routes sensibles
- **Rate limiting** automatique
- **Validation** des données à tous les niveaux
- **Headers de sécurité** par défaut

### 3. Performance Intégrée
- **Cache Redis** pour les données temporaires
- **Compression** automatique des assets
- **Optimisation Docker** native
- **CDN ready** par design

## 📋 Règles Obligatoires

### 🔒 Sécurité

#### Règle S1: Authentification Systématique
```typescript
// ✅ OBLIGATOIRE - Toute route sensible DOIT être protégée
router.get('/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
  // Implémentation
});

// ❌ INTERDIT - Route sensible non protégée
router.get('/profile', (req, res) => {
  // Accès direct interdit
});
```

#### Règle S2: Validation des Données
```typescript
// ✅ OBLIGATOIRE - Validation avec express-validator
export const validateUserInput = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  handleValidationErrors // Middleware obligatoire
];

router.post('/users', validateUserInput, createUser);

// ❌ INTERDIT - Utilisation directe des données
router.post('/users', (req, res) => {
  const { email, password } = req.body; // Dangereux !
});
```

#### Règle S3: Rate Limiting Obligatoire
```typescript
// ✅ OBLIGATOIRE - Rate limiting sur endpoints critiques
import { authLimiter, generalLimiter } from '../middleware/rateLimiting';

router.post('/login', authLimiter, loginController);
router.post('/register', registerLimiter, registerController);
router.use('/api/', generalLimiter); // Global

// ❌ INTERDIT - Endpoint sans protection
router.post('/login', loginController); // Vulnérable aux attaques
```

### 🏗️ Structure

#### Règle A1: Organisation des Dossiers
```
backend/src/
├── config/          # Configuration uniquement
├── middleware/      # Middlewares réutilisables
├── models/          # Modèles de données Sequelize
├── routes/          # Définition des routes API
├── services/        # Logique métier
├── types/           # Types TypeScript partagés
└── websocket/       # Gestion WebSocket

frontend/src/
├── app/             # App Router Next.js (pages)
├── components/      # Composants réutilisables
│   ├── ui/         # Composants de base
│   ├── features/   # Composants métier
│   └── layouts/    # Layouts d'application
├── contexts/        # Contextes React
├── hooks/           # Hooks personnalisés
├── lib/             # Utilitaires et helpers
└── types/           # Types TypeScript
```

#### Règle A2: Nommage des Fichiers
```typescript
// ✅ OBLIGATOIRE - Conventions strictes
Components: PascalCase (Button.tsx, UserProfile.tsx)
Pages: kebab-case (user-profile.tsx, admin-dashboard.tsx)
Hooks: camelCase avec préfixe use (useAuth.ts, useApi.ts)
Services: camelCase (userService.ts, emailService.ts)
Types: PascalCase (UserData.ts, ApiResponse.ts)
Constants: UPPER_CASE (API_ENDPOINTS.ts, CONFIG.ts)

// ❌ INTERDIT - Nommage incohérent
button.tsx, user_profile.tsx, UseAuth.ts, USERSERVICE.ts
```

#### Règle A3: Structure des Composants React
```tsx
// ✅ OBLIGATOIRE - Structure standardisée
interface ComponentProps {
  // Props typées obligatoirement
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. Hooks en premier
  const [state, setState] = useState();
  const { data } = useApi();
  
  // 2. Fonctions utilitaires
  const handleAction = useCallback(() => {
    // Implémentation
  }, []);
  
  // 3. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 4. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// ❌ INTERDIT - Structure désorganisée
export const Component = ({ prop1, prop2 }) => {
  const handleAction = () => {}; // Pas de useCallback
  const [state, setState] = useState(); // Hooks mélangés
  // Pas de types, structure chaotique
};
```

### 🔄 API

#### Règle API1: Format de Réponse Standardisé
```typescript
// ✅ OBLIGATOIRE - Format uniforme
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
  };
}

// Succès
res.json({
  success: true,
  data: users,
  meta: { timestamp: new Date().toISOString() }
});

// Erreur
res.status(400).json({
  success: false,
  message: 'Données invalides',
  error: 'VALIDATION_ERROR'
});

// ❌ INTERDIT - Formats incohérents
res.json(users); // Pas de wrapper
res.json({ error: 'Erreur' }); // Format non standardisé
```

#### Règle API2: Codes HTTP Appropriés
```typescript
// ✅ OBLIGATOIRE - Codes HTTP corrects
200: GET réussi, opération réussie
201: Ressource créée (POST)
204: Suppression réussie (DELETE)
400: Données invalides
401: Non authentifié
403: Non autorisé (authentifié mais pas les droits)
404: Ressource non trouvée
409: Conflit (email déjà utilisé)
422: Données valides mais non traitables
429: Rate limit dépassé
500: Erreur serveur

// ❌ INTERDIT - Codes inappropriés
res.status(200).json({ error: 'Erreur' }); // 200 pour une erreur !
res.status(500).json({ message: 'Non autorisé' }); // Mauvais code
```

#### Règle API3: Versioning Obligatoire
```typescript
// ✅ OBLIGATOIRE - Versioning dans l'URL
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/messages', messageRoutes);

// ❌ INTERDIT - Pas de versioning
app.use('/api/users', userRoutes); // Pas de version
app.use('/users', userRoutes); // Pas de préfixe API
```

### 🗄️ Base de Données

#### Règle DB1: Modèles Sequelize Typés
```typescript
// ✅ OBLIGATOIRE - Modèle complet avec types
interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  
  // Associations obligatoires
  static associate(models: any) {
    User.hasMany(models.Message, { foreignKey: 'user_id' });
  }
}

// ❌ INTERDIT - Modèle sans types
const User = sequelize.define('User', {
  username: DataTypes.STRING
}); // Pas de types, pas d'interface
```

#### Règle DB2: Migrations Obligatoires
```typescript
// ✅ OBLIGATOIRE - Toute modification de schéma via migration
// migrations/20231215-create-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // ... autres champs
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },
  
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};

// ❌ INTERDIT - Modification directe de la DB
// Pas de modification manuelle de la base !
```

#### Règle DB3: Nommage des Tables
```sql
-- ✅ OBLIGATOIRE - snake_case, pluriel
users, user_profiles, message_attachments, password_resets

-- Colonnes: snake_case
user_id, created_at, is_active, first_name

-- Index: descriptifs avec préfixe
idx_users_email, idx_messages_created_at, fk_messages_user_id

-- ❌ INTERDIT - Nommage incohérent
User, userProfile, messageAttachment (PascalCase)
userId, createdAt (camelCase)
```

### 🎨 Frontend

#### Règle F1: Composants Atomiques
```tsx
// ✅ OBLIGATOIRE - Hiérarchie claire
components/
├── ui/              # Composants atomiques (Button, Input, Card)
├── features/        # Composants métier (UserProfile, MessageList)
└── layouts/         # Layouts d'application (AppShell, Sidebar)

// Composant atomique
export const Button: React.FC<ButtonProps> = ({ variant, children, ...props }) => {
  return <button className={getButtonClasses(variant)} {...props}>{children}</button>;
};

// Composant métier
export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { user, loading } = useUser(userId);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <Card>
      <Avatar src={user.avatar} />
      <Text>{user.username}</Text>
      <Button variant="primary" onClick={handleEdit}>Éditer</Button>
    </Card>
  );
};

// ❌ INTERDIT - Composants monolithiques
export const UserProfileWithEverything = () => {
  // 500 lignes de code avec tout mélangé
};
```

#### Règle F2: Hooks Personnalisés
```tsx
// ✅ OBLIGATOIRE - Logique réutilisable dans des hooks
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const login = useCallback(async (credentials: LoginCredentials) => {
    // Logique de connexion
  }, []);
  
  const logout = useCallback(() => {
    // Logique de déconnexion
  }, []);
  
  return { user, loading, login, logout };
};

// Utilisation
const LoginForm = () => {
  const { login, loading } = useAuth();
  // ...
};

// ❌ INTERDIT - Logique dupliquée dans les composants
const LoginForm = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    // Logique dupliquée dans chaque composant
  };
};
```

### 🐳 Docker

#### Règle D1: Multi-stage Builds Obligatoires
```dockerfile
# ✅ OBLIGATOIRE - Build multi-stage
FROM node:18-alpine AS base
# Dépendances communes

FROM base AS deps
# Installation dépendances

FROM deps AS build
# Build de l'application

FROM base AS production
# Image finale optimisée

# ❌ INTERDIT - Build monolithique
FROM node:18
COPY . .
RUN npm install && npm run build
# Image trop lourde, pas optimisée
```

#### Règle D2: Utilisateurs Non-Root
```dockerfile
# ✅ OBLIGATOIRE - Utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# ❌ INTERDIT - Utilisateur root
# Pas de USER, reste en root (dangereux)
```

### 🔧 Configuration

#### Règle C1: Variables d'Environnement
```typescript
// ✅ OBLIGATOIRE - Configuration centralisée
// config/index.ts
export const config = {
  app: {
    port: parseInt(process.env.PORT || '8000'),
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    // ... autres configs
  }
};

// ❌ INTERDIT - Configuration dispersée
const port = process.env.PORT || 8000; // Dans server.ts
const dbHost = process.env.DB_HOST || 'localhost'; // Dans database.ts
// Configuration éparpillée partout
```

#### Règle C2: Secrets Sécurisés
```bash
# ✅ OBLIGATOIRE - Secrets générés automatiquement
make setup-security  # Génère tous les secrets

# .env (généré automatiquement)
JWT_SECRET=generated-secure-random-string
DB_PASSWORD=generated-secure-password

# ❌ INTERDIT - Secrets hardcodés
JWT_SECRET=mysecret
DB_PASSWORD=password123
```

## 🚨 Règles de Sécurité Critiques

### Règle SEC1: Jamais de Données Sensibles en Logs
```typescript
// ✅ OBLIGATOIRE - Logs sécurisés
console.log('User login attempt', {
  userId: user.id,
  email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Email masqué
  ip: req.ip
});

// ❌ INTERDIT - Données sensibles exposées
console.log('User login', { password: user.password }); // JAMAIS !
console.log('JWT token', token); // JAMAIS !
```

### Règle SEC2: Validation Côté Serveur Obligatoire
```typescript
// ✅ OBLIGATOIRE - Validation serveur même si frontend valide
router.post('/users', [
  body('email').isEmail(), // Validation serveur obligatoire
  body('password').isLength({ min: 8 }),
  handleValidationErrors
], createUser);

// ❌ INTERDIT - Faire confiance au frontend
router.post('/users', (req, res) => {
  // Pas de validation serveur = vulnérabilité
});
```

### Règle SEC3: Principe du Moindre Privilège
```typescript
// ✅ OBLIGATOIRE - Vérification des permissions
const requireOwnershipOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const resourceUserId = parseInt(req.params.userId);
  const currentUserId = req.user.id;
  
  if (currentUserId !== resourceUserId && !req.user.is_admin) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  next();
};

router.get('/users/:userId/profile', authenticateToken, requireOwnershipOrAdmin, getProfile);

// ❌ INTERDIT - Accès trop permissif
router.get('/users/:userId/profile', authenticateToken, getProfile);
// N'importe quel utilisateur peut voir n'importe quel profil !
```

## 📊 Règles de Performance

### Règle P1: Cache Intelligent
```typescript
// ✅ OBLIGATOIRE - Cache pour données coûteuses
const getExpensiveData = async (key: string) => {
  const cached = await redisClient.get(`expensive:${key}`);
  if (cached) return JSON.parse(cached);
  
  const data = await performExpensiveOperation();
  await redisClient.setEx(`expensive:${key}`, 300, JSON.stringify(data));
  return data;
};

// ❌ INTERDIT - Pas de cache pour opérations coûteuses
const getExpensiveData = async () => {
  return await performExpensiveOperation(); // Toujours recalculé
};
```

### Règle P2: Pagination Obligatoire
```typescript
// ✅ OBLIGATOIRE - Pagination sur les listes
export const getUsers = async (page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  
  const { rows: users, count: total } = await User.findAndCountAll({
    limit: Math.min(limit, 100), // Max 100 par page
    offset,
    order: [['created_at', 'DESC']]
  });
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// ❌ INTERDIT - Pas de pagination
export const getUsers = async () => {
  return await User.findAll(); // Peut retourner des millions d'enregistrements !
};
```

## 🧪 Règles de Tests

### Règle T1: Tests Obligatoires pour la Logique Métier
```typescript
// ✅ OBLIGATOIRE - Tests pour services critiques
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Test implémentation
    });
    
    it('should reject duplicate email', async () => {
      // Test cas d'erreur
    });
  });
});

// ❌ INTERDIT - Pas de tests pour logique critique
// Service sans tests = code fragile
```

## 📝 Documentation Obligatoire

### Règle DOC1: JSDoc pour Fonctions Publiques
```typescript
// ✅ OBLIGATOIRE - Documentation des fonctions publiques
/**
 * Crée un nouvel utilisateur avec validation complète
 * @param userData - Données de l'utilisateur à créer
 * @returns Promise<User> - Utilisateur créé
 * @throws {ValidationError} - Si les données sont invalides
 * @throws {ConflictError} - Si l'email existe déjà
 */
export const createUser = async (userData: UserCreateData): Promise<User> => {
  // Implémentation
};

// ❌ INTERDIT - Fonctions publiques sans documentation
export const createUser = async (userData: any): Promise<any> => {
  // Pas de documentation
};
```

## 🔄 Processus de Développement

### Règle PROC1: Branches et Commits
```bash
# ✅ OBLIGATOIRE - Branches descriptives
git checkout -b feature/user-authentication
git checkout -b fix/rate-limiting-bug
git checkout -b docs/api-documentation

# Commits descriptifs
git commit -m "feat: add user authentication with JWT"
git commit -m "fix: resolve rate limiting memory leak"
git commit -m "docs: update API documentation"

# ❌ INTERDIT - Nommage vague
git checkout -b dev
git commit -m "fix"
git commit -m "update"
```

### Règle PROC2: Pull Requests
```markdown
# ✅ OBLIGATOIRE - PR complète
## Description
Ajoute l'authentification utilisateur avec JWT

## Changements
- [ ] Middleware d'authentification
- [ ] Tests unitaires
- [ ] Documentation API
- [ ] Migration base de données

## Tests
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Scan sécurité OK

# ❌ INTERDIT - PR sans contexte
"Fix stuff"
```

---

## 🎯 Résumé des Règles Critiques

### 🔴 JAMAIS
- Données sensibles dans les logs
- Routes sensibles sans authentification
- Validation uniquement côté client
- Secrets hardcodés
- Utilisateur root dans Docker
- Requêtes sans pagination
- Code sans types TypeScript

### 🟢 TOUJOURS
- Authentification sur routes sensibles
- Validation côté serveur
- Rate limiting sur endpoints critiques
- Variables d'environnement pour config
- Multi-stage Docker builds
- Format de réponse API standardisé
- Tests pour logique métier

---

**⚡ Ces règles sont NON-NÉGOCIABLES dans la coquille Base WebApp !**

**🛡️ Elles garantissent la sécurité, la performance et la maintenabilité du projet.**
