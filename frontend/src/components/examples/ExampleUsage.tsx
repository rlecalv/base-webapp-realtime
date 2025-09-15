'use client';

import React, { useState } from 'react';
import { AppShell } from '../layouts/AppShell';
import { DataTable, Modal, FormInput, Button, Badge, Avatar, Alert, Dropdown, SimpleDropdown, Notification, useNotification, LoadingSpinner, InlineLoading, EmptyState } from '../ui';
import { 
  UserIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon,
  PlusIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

// Exemple de données
const sampleUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

export function ExampleUsage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showAlert, setShowAlert] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotification();

  // Configuration de la navbar
  const navbarConfig = {
    logo: 'https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500',
    logoAlt: 'Mon App',
    navigation: [
      { name: 'Dashboard', href: '#', current: true, onClick: () => console.log('Dashboard') },
      { name: 'Utilisateurs', href: '#', current: false, onClick: () => console.log('Users') },
      { name: 'Projets', href: '#', current: false, onClick: () => console.log('Projects') },
      { name: 'Paramètres', href: '#', current: false, onClick: () => console.log('Settings') }
    ],
    userMenuItems: [
      { name: 'Mon profil', onClick: () => console.log('Profile') },
      { name: 'Paramètres', onClick: () => console.log('Settings') },
      { name: 'Déconnexion', onClick: () => console.log('Logout') }
    ],
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    userName: 'John Doe',
    onNotificationClick: () => addNotification({
      title: 'Nouvelle notification',
      message: 'Vous avez reçu un nouveau message',
      type: 'info'
    }),
    notificationCount: 3
  };

  // Configuration des colonnes du tableau
  const columns = [
    {
      key: 'name' as keyof typeof sampleUsers[0],
      header: 'Utilisateur',
      render: (value: string, user: any) => (
        <div className="flex items-center space-x-3">
          <Avatar src={user.avatar} name={value} size="sm" />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
        </div>
      ),
      className: "py-4 pr-3 pl-4 sm:pl-0"
    },
    {
      key: 'role' as keyof typeof sampleUsers[0],
      header: 'Rôle',
      render: (value: string) => (
        <Badge variant={value === 'Admin' ? 'info' : 'default'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'status' as keyof typeof sampleUsers[0],
      header: 'Statut',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'success' : 'error'}>
          {value === 'active' ? 'Actif' : 'Inactif'}
        </Badge>
      )
    }
  ];

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    setIsLoading(true);
    // Simulation d'une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsModalOpen(false);
    addNotification({
      title: 'Utilisateur sauvegardé',
      message: 'Les modifications ont été enregistrées avec succès',
      type: 'success'
    });
  };

  const dropdownItems = [
    {
      label: 'Voir le profil',
      icon: UserIcon,
      onClick: () => console.log('View profile')
    },
    {
      label: 'Paramètres',
      icon: CogIcon,
      onClick: () => console.log('Settings')
    },
    { divider: true },
    {
      label: 'Déconnexion',
      icon: ArrowRightOnRectangleIcon,
      onClick: () => console.log('Logout')
    }
  ];

  return (
    <AppShell navbar={navbarConfig}>
      <div className="p-6 space-y-6">
        {/* Alerte d'exemple */}
        {showAlert && (
          <Alert
            type="warning"
            title="Attention"
            description="Ceci est un exemple d'utilisation des composants Tailwind UI."
            onClose={() => setShowAlert(false)}
          />
        )}

        {/* Section avec dropdowns */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Exemples de Dropdowns
          </h2>
          <div className="flex space-x-4">
            <SimpleDropdown
              label="Actions"
              items={dropdownItems}
              variant="outline"
            />
            
            <Dropdown
              trigger={
                <Button variant="ghost">
                  Options personnalisées
                </Button>
              }
              items={dropdownItems}
              align="left"
            />
          </div>
        </div>

        {/* Tableau avec données */}
        <DataTable
          data={sampleUsers}
          columns={columns}
          title="Gestion des utilisateurs"
          description="Exemple d'utilisation du composant DataTable avec tous les composants UI."
          actionButton={
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Nouvel utilisateur
            </Button>
          }
          onRowAction={handleEditUser}
          actionLabel="Modifier"
        />

        {/* État vide d'exemple */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <EmptyState
            icon={FolderIcon}
            title="Aucun projet"
            description="Vous n'avez pas encore créé de projet. Commencez par en créer un."
            action={
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Créer un projet
              </Button>
            }
          />
        </div>

        {/* Exemples de chargement */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Indicateurs de chargement
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
              <LoadingSpinner size="xl" />
            </div>
            <InlineLoading message="Chargement des données..." />
          </div>
        </div>

        {/* Modal d'exemple */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          size="md"
        >
          <div className="space-y-4">
            <FormInput
              label="Nom complet"
              defaultValue={selectedUser?.name || ''}
              placeholder="Entrez le nom complet"
            />
            
            <FormInput
              label="Email"
              type="email"
              defaultValue={selectedUser?.email || ''}
              placeholder="Entrez l'email"
              helpText="L'email sera utilisé pour les notifications"
            />
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveUser}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    Sauvegarde...
                  </>
                ) : (
                  'Sauvegarder'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}