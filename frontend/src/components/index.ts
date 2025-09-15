/**
 * Index principal des composants
 * Structure organisée pour faciliter les imports
 */

// ===== COMPOSANTS UI DE BASE =====
// Éléments réutilisables et primitifs
export * from './ui';

// ===== LAYOUTS ET STRUCTURE =====
// Composants de mise en page et navigation
export * from './layouts';

// ===== COMPOSANTS MÉTIER =====
// Composants spécifiques aux fonctionnalités
export * from './features';

// ===== EXEMPLES ET DÉMONSTRATIONS =====
// Composants d'exemple et de démonstration
export * from './examples';

// ===== EXPORTS DIRECTS POUR COMPATIBILITÉ =====
// Imports directs les plus courants pour faciliter l'utilisation

// UI essentiels
export { Button } from './ui/Button';
export { Card } from './ui/Card';
export { Modal } from './ui/Modal';
export { FormInput } from './ui/FormInput';
export { DataTable } from './ui/DataTable';
export { Badge } from './ui/Badge';
export { Avatar } from './ui/Avatar';

// Layouts principaux
export { AppShell } from './layouts/AppShell';
export { MultiColumnLayout } from './layouts/MultiColumnLayout';

// Features principales
export { ChatInput } from './features/chat/ChatInput';
export { ChatMessage } from './features/chat/ChatMessage';
export { UserManagement } from './features/admin/UserManagement';