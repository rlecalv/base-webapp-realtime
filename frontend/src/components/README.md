# 📁 Structure des Composants

Cette structure organisée facilite la maintenance et l'utilisation des composants.

## 🏗️ Organisation

```
components/
├── ui/                    # 🎨 Composants UI de base
├── layouts/              # 📐 Layouts et structure
├── features/             # 💼 Composants métier
├── examples/             # 🎯 Exemples et démonstrations
└── index.ts              # 📦 Exports centralisés
```

## 📂 Détail des dossiers

### `ui/` - Composants UI de base
Composants réutilisables et primitifs, sans logique métier.

**Catégories :**
- **Éléments de base** : `Button`, `Input`, `Card`, `Badge`, `Avatar`
- **Formulaires** : `FormInput`, `LoginForm`
- **Données** : `DataTable`
- **Feedback** : `Alert`, `Notification`, `LoadingSpinner`, `EmptyState`
- **Interactions** : `Modal`, `Dropdown`

### `layouts/` - Layouts et structure
Composants de mise en page et navigation.

**Composants :**
- `AppShell` : Layout principal avec navbar et sidebar
- `MultiColumnLayout` : Layouts multi-colonnes avancés
- `SidebarLayout` : Layout avec sidebar simple
- `Navbar` : Barre de navigation

### `features/` - Composants métier
Composants spécifiques aux fonctionnalités, organisés par domaine.

**Domaines :**
- `chat/` : Messagerie et chat temps réel
- `admin/` : Administration et gestion
- `auth/` : Authentification (à venir)

### `examples/` - Exemples et démonstrations
Composants de démonstration et d'exemple.

**Composants :**
- `ExampleUsage` : Démonstration des composants UI
- `MultiColumnExample` : Démonstration des layouts

## 🚀 Utilisation

### Import depuis l'index principal
```tsx
import { Button, Card, AppShell, ChatInput } from '@/components';
```

### Import par catégorie
```tsx
import { Button, Card, Modal } from '@/components/ui';
import { AppShell, MultiColumnLayout } from '@/components/layouts';
import { ChatInput, UserManagement } from '@/components/features';
```

### Import spécifique
```tsx
import { ChatInput } from '@/components/features/chat';
import { UserManagement } from '@/components/features/admin';
```

## 📋 Bonnes pratiques

### 🎨 Composants UI (`ui/`)
- **Réutilisables** : Aucune logique métier
- **Configurables** : Props pour personnalisation
- **Accessibles** : Support ARIA et navigation clavier
- **Thémés** : Support du mode sombre

### 💼 Composants Features (`features/`)
- **Spécialisés** : Logique métier intégrée
- **Organisés par domaine** : Un dossier par fonctionnalité
- **Composables** : Utilisent les composants UI

### 📐 Composants Layouts (`layouts/`)
- **Structurants** : Définissent la mise en page
- **Responsives** : Adaptés mobile/desktop
- **Flexibles** : Configurables selon les besoins

## 🔄 Migration

Si vous avez des imports existants, voici comment les migrer :

### Avant
```tsx
import { Button } from '@/components/ui/Button';
import { ChatInput } from '@/components/ChatInput';
import { AppShell } from '@/components/ui/AppShell';
```

### Après
```tsx
import { Button } from '@/components/ui';
import { ChatInput } from '@/components/features/chat';
import { AppShell } from '@/components/layouts';

// Ou plus simple :
import { Button, ChatInput, AppShell } from '@/components';
```

## 📚 Documentation

- **Composants UI** : Voir `/docs/components-ui.md`
- **Layouts** : Voir `/docs/layouts.md`
- **Guide complet** : Voir `COMPONENTS.md` à la racine