# Composants UI Tailwind

Cette documentation présente les composants UI avancés récupérés depuis [Tailwind UI](https://tailwindcss.com/plus/ui-blocks/application-ui) et intégrés dans notre application.

## 🎨 Composants Disponibles

### 📱 Layout & Navigation

#### AppShell
Layout principal de l'application avec navbar, sidebar optionnelle et footer.

```tsx
import { AppShell } from '@/components/ui/AppShell';

const navbarConfig = {
  logo: '/logo.svg',
  navigation: [
    { name: 'Dashboard', href: '#', current: true },
    { name: 'Users', href: '#', current: false }
  ],
  userMenuItems: [
    { name: 'Profile', onClick: () => {} },
    { name: 'Logout', onClick: () => {} }
  ],
  userAvatar: '/avatar.jpg',
  userName: 'John Doe'
};

<AppShell navbar={navbarConfig}>
  <div>Contenu principal</div>
</AppShell>
```

#### Navbar
Barre de navigation responsive avec menu utilisateur et notifications.

```tsx
import { Navbar } from '@/components/ui/Navbar';

<Navbar
  logo="/logo.svg"
  navigation={navigationItems}
  userMenuItems={userMenuItems}
  onNotificationClick={() => {}}
  notificationCount={5}
/>
```

#### SidebarLayout
Layout avec sidebar responsive basé sur le design Tailwind UI "Simple sidebar".

```tsx
import { SidebarLayout } from '@/components/ui/SidebarLayout';

<SidebarLayout>
  <div>Contenu principal</div>
</SidebarLayout>
```

**Fonctionnalités :**
- Sidebar responsive (mobile/desktop)
- Navigation avec icônes Heroicons
- Support du mode sombre
- Overlay mobile avec animations

#### MultiColumnLayout
Layouts multi-colonnes avancés pour applications complexes (email, gestion de projet, etc.).

```tsx
import { MultiColumnLayout, EmailLayout, DashboardLayout, ProjectManagementLayout } from '@/components/ui/MultiColumnLayout';

// Layout 3 colonnes pleine largeur (type email)
<EmailLayout
  navigation={emailNavigation}
  teams={teams}
  user={user}
  title="Messagerie"
  secondaryColumn={<EmailList />}
>
  <EmailContent />
</EmailLayout>

// Layout dashboard avec contraintes
<DashboardLayout
  navigation={navigation}
  user={user}
  title="Dashboard"
  secondaryColumn={<Sidebar />}
>
  <MainContent />
</DashboardLayout>

// Layout gestion de projet avec sidebar étroite
<ProjectManagementLayout
  navigation={navigation}
  user={user}
  title="Projet"
  secondaryColumn={<ProjectSidebar />}
>
  <ProjectContent />
</ProjectManagementLayout>
```

**Variantes disponibles :**
- `full-width-three` : 3 colonnes pleine largeur (sidebar + contenu + panel secondaire)
- `constrained-three` : 3 colonnes avec contraintes de largeur
- `narrow-sidebar` : Sidebar étroite avec icônes uniquement
- `constrained-sticky` : Colonnes collantes avec scroll indépendant
- `full-width-secondary-right` : 2 colonnes avec panel secondaire à droite
- `narrow-sidebar-header` : Sidebar étroite avec header fixe

**Cas d'usage :**
- **EmailLayout** : Applications de messagerie, clients email
- **DashboardLayout** : Tableaux de bord, analytics
- **ProjectManagementLayout** : Gestion de projet, outils collaboratifs

### 📝 Formulaires

#### FormInput
Input avancé avec label, aide et validation d'erreur.

```tsx
import { FormInput } from '@/components/ui/FormInput';

<FormInput
  label="Email"
  type="email"
  placeholder="vous@exemple.com"
  helpText="Nous n'utiliserons ceci que pour le spam."
  error="Email invalide"
/>
```

#### LoginForm
Formulaire de connexion complet avec validation.

```tsx
import { LoginForm } from '@/components/ui/LoginForm';

<LoginForm
  onSubmit={async (credentials) => {
    // Logique de connexion
    return true; // ou false en cas d'erreur
  }}
  title="Connectez-vous"
  logo="/logo.svg"
  showForgotPassword={true}
  onSignUp={() => router.push('/register')}
/>
```

### 📊 Données

#### DataTable
Table de données avec tri, actions et pagination.

```tsx
import { DataTable } from '@/components/ui/DataTable';

const columns = [
  {
    key: 'name',
    header: 'Nom',
    render: (value, row) => <strong>{value}</strong>
  },
  { key: 'email', header: 'Email' }
];

<DataTable
  data={users}
  columns={columns}
  title="Utilisateurs"
  onRowAction={(user) => editUser(user)}
  actionLabel="Modifier"
/>
```

### 🔔 Notifications & Feedback

#### Notification
Notifications toast avec différents types et auto-fermeture.

```tsx
import { Notification, useNotification } from '@/components/ui/Notification';

const { addNotification } = useNotification();

// Utilisation
addNotification({
  title: 'Succès !',
  message: 'Opération réalisée avec succès',
  type: 'success'
});
```

#### Alert
Alertes inline avec différents types et actions.

```tsx
import { Alert } from '@/components/ui/Alert';

<Alert
  type="warning"
  title="Attention"
  description="Vérifiez vos données avant de continuer"
  onClose={() => setShowAlert(false)}
/>
```

### 🎛️ Interactions

#### Dropdown
Menus déroulants avec Headless UI.

```tsx
import { Dropdown, SimpleDropdown } from '@/components/ui/Dropdown';

const items = [
  { label: 'Profil', icon: UserIcon, onClick: () => {} },
  { label: 'Paramètres', icon: CogIcon, onClick: () => {} },
  { divider: true },
  { label: 'Déconnexion', onClick: () => {} }
];

<SimpleDropdown label="Options" items={items} />
```

#### Modal
Modales avec Headless UI et différentes tailles.

```tsx
import { Modal } from '@/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmation"
  size="md"
>
  <p>Êtes-vous sûr de vouloir continuer ?</p>
</Modal>
```

### 🎨 Éléments visuels

#### Avatar
Avatars avec fallback et initiales.

```tsx
import { Avatar } from '@/components/ui/Avatar';

<Avatar
  src="/avatar.jpg"
  name="John Doe"
  size="lg"
  showOnlineStatus={true}
/>
```

#### Badge
Badges colorés avec différentes variantes.

```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success">Actif</Badge>
<Badge variant="warning">En attente</Badge>
<Badge variant="error">Erreur</Badge>
```

#### LoadingSpinner
Indicateurs de chargement avec différentes tailles.

```tsx
import { LoadingSpinner, InlineLoading, LoadingPage } from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="lg" color="primary" />
<InlineLoading message="Chargement..." />
<LoadingPage message="Initialisation de l'application" />
```

#### EmptyState
États vides avec icône et action.

```tsx
import { EmptyState } from '@/components/ui/EmptyState';

<EmptyState
  icon={FolderIcon}
  title="Aucun fichier"
  description="Commencez par importer vos fichiers"
  action={<Button>Importer</Button>}
/>
```

### 🎯 Composants de base

#### Button
Boutons avec différentes variantes et tailles.

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg">Confirmer</Button>
<Button variant="outline">Annuler</Button>
<Button variant="ghost" size="sm">Aide</Button>
```

#### Card
Cartes avec header, contenu et footer.

```tsx
import { Card } from '@/components/ui/Card';

<Card
  title="Titre de la carte"
  description="Description optionnelle"
  footer={<Button>Action</Button>}
>
  <p>Contenu de la carte</p>
</Card>
```

## 🚀 Exemples d'utilisation complète

### Composants UI de base
Voir le composant `ExampleUsage.tsx` pour un exemple complet d'utilisation de tous les composants ensemble.

```tsx
import { ExampleUsage } from '@/components/ExampleUsage';

export default function DemoPage() {
  return <ExampleUsage />;
}
```

### Layouts multi-colonnes
Voir le composant `MultiColumnExample.tsx` pour des exemples d'applications complètes avec différents layouts.

```tsx
import { MultiColumnExample } from '@/components/MultiColumnExample';

export default function LayoutsDemo() {
  return <MultiColumnExample />;
}
```

**Accès direct :** Visitez `/layouts` pour voir la démonstration interactive des layouts.

## 🎨 Personnalisation

Tous les composants supportent :
- **Mode sombre** : Basculement automatique avec `dark:`
- **Classes personnalisées** : Prop `className` pour override
- **Variantes** : Différents styles prédéfinis
- **Tailles** : Multiples tailles disponibles
- **Accessibilité** : Support ARIA et navigation clavier

## 📦 Dépendances

- `@headlessui/react` : Composants accessibles
- `@heroicons/react` : Icônes
- `tailwindcss` : Styles
- `class-variance-authority` : Gestion des variantes

## 🔧 Configuration

Assurez-vous d'avoir configuré Tailwind CSS avec le mode sombre :

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}
```

Et d'avoir installé les dépendances :

```bash
npm install @headlessui/react @heroicons/react class-variance-authority
```ror="Email invalide"
/>
```

**Props :**
- `label`: Libellé du champ
- `helpText`: Texte d'aide
- `error`: Message d'erreur
- `hideLabel`: Masquer le label (accessible)

### DataTable
Table de données avec actions et pagination.

```tsx
import { DataTable } from '@/components/ui/DataTable';

const columns = [
  {
    key: 'name',
    header: 'Nom',
    render: (value, item) => <strong>{value}</strong>
  },
  {
    key: 'email',
    header: 'Email'
  }
];

<DataTable
  data={users}
  columns={columns}
  title="Utilisateurs"
  description="Liste des utilisateurs"
  actionButton={<Button>Ajouter</Button>}
  onRowAction={(user) => editUser(user)}
/>
```

**Fonctionnalités :**
- Colonnes configurables avec rendu personnalisé
- Actions par ligne
- Header avec titre et bouton d'action
- État vide automatique
- Responsive

### Modal
Modale accessible avec Headless UI.

```tsx
import { Modal } from '@/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Titre de la modale"
  size="md"
>
  <p>Contenu de la modale</p>
</Modal>
```

**Props :**
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `showCloseButton`: Afficher le bouton fermer
- Animations et transitions automatiques

### Badge
Badges colorés avec variantes.

```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success" size="md">
  Actif
</Badge>
```

**Variantes :**
- `default`: Gris
- `success`: Vert
- `warning`: Jaune
- `error`: Rouge
- `info`: Bleu

**Tailles :** `sm`, `md`, `lg`

### Avatar
Avatars avec image et fallback.

```tsx
import { Avatar } from '@/components/ui/Avatar';

<Avatar
  src="https://exemple.com/avatar.jpg"
  name="John Doe"
  size="md"
  fallbackColor="indigo"
/>
```

**Fonctionnalités :**
- Image avec fallback automatique
- Initiales générées depuis le nom
- Couleurs de fallback configurables
- Tailles multiples

## 🔧 Utilisation Avancée

### UserManagement
Composant complet de gestion des utilisateurs utilisant tous les composants UI.

```tsx
import { UserManagement } from '@/components/UserManagement';

// Dans une page admin
<UserManagement />
```

**Fonctionnalités :**
- Table des utilisateurs avec statuts
- Modale d'édition/création
- Badges de rôle et statut
- Avatars avec initiales
- Restriction d'accès admin

### Page d'Administration
Page complète d'administration accessible via `/admin`.

**Accès :** Réservé aux utilisateurs avec `is_admin: true`

**Fonctionnalités :**
- Gestion des utilisateurs
- Navigation vers le chat
- Interface responsive
- Mode sombre

## 🎯 Intégration

### Dépendances Requises
```bash
npm install @headlessui/react @heroicons/react
```

### Imports Nécessaires
```tsx
// Composants de base
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

// Nouveaux composants Tailwind UI
import { FormInput } from '@/components/ui/FormInput';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { SidebarLayout } from '@/components/ui/SidebarLayout';
```

### Configuration Tailwind
Les composants utilisent les classes Tailwind standard et sont compatibles avec le mode sombre via la classe `dark:`.

### Accessibilité
Tous les composants respectent les standards d'accessibilité :
- Labels appropriés
- ARIA attributes
- Navigation clavier
- Contraste des couleurs
- Screen reader support

## 🚀 Exemples d'Utilisation

### Formulaire Complet
```tsx
<form className="space-y-4">
  <FormInput
    label="Nom d'utilisateur"
    type="text"
    required
    helpText="3 caractères minimum"
  />
  
  <FormInput
    label="Email"
    type="email"
    required
    error={emailError}
  />
  
  <Button type="submit">
    Créer le compte
  </Button>
</form>
```

### Table avec Actions
```tsx
const handleEdit = (user) => {
  setSelectedUser(user);
  setModalOpen(true);
};

<DataTable
  data={users}
  columns={userColumns}
  title="Gestion des utilisateurs"
  actionButton={
    <Button onClick={() => setModalOpen(true)}>
      Nouvel utilisateur
    </Button>
  }
  onRowAction={handleEdit}
/>
```

### Layout Complet
```tsx
<SidebarLayout>
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1>Dashboard</h1>
      <Badge variant="success">En ligne</Badge>
    </div>
    
    <DataTable data={data} columns={columns} />
  </div>
</SidebarLayout>
```

## 📱 Responsive Design

Tous les composants sont entièrement responsives :
- **Mobile** : Sidebar en overlay, tables scrollables
- **Tablet** : Adaptation automatique des espacements
- **Desktop** : Sidebar fixe, layout optimal

## 🌙 Mode Sombre

Support complet du mode sombre avec les classes `dark:` de Tailwind CSS.

## 🔄 Réutilisabilité

Ces composants sont conçus pour être réutilisés dans différents projets :
- Props configurables
- Styles personnalisables
- TypeScript pour la sécurité des types
- Documentation complète