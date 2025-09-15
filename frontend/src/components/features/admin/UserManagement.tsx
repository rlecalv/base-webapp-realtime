'use client';

import React, { useState } from 'react';
import { DataTable, Modal, FormInput, Button, Badge, Avatar } from '../../ui';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login?: string;
}

export function UserManagement() {
  const { connectedUsers } = useSocket();
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Exemple de données utilisateurs (normalement récupérées via API)
  const users: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      is_active: true,
      is_admin: true,
      created_at: '2025-01-01T00:00:00Z',
      last_login: '2025-01-15T10:30:00Z'
    },
    {
      id: 2,
      username: 'user1',
      email: 'user1@example.com',
      is_active: true,
      is_admin: false,
      created_at: '2025-01-02T00:00:00Z',
      last_login: '2025-01-15T09:15:00Z'
    },
    {
      id: 3,
      username: 'user2',
      email: 'user2@example.com',
      is_active: false,
      is_admin: false,
      created_at: '2025-01-03T00:00:00Z'
    }
  ];

  const columns = [
    {
      key: 'username' as keyof User,
      header: 'Utilisateur',
      render: (value: string, user: User) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            name={value} 
            size="sm"
            fallbackColor={user.is_admin ? 'indigo' : 'gray'}
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        </div>
      ),
      className: "py-4 pr-3 pl-4 sm:pl-0"
    },
    {
      key: 'is_admin' as keyof User,
      header: 'Rôle',
      render: (value: boolean) => (
        <Badge variant={value ? 'info' : 'default'}>
          {value ? 'Administrateur' : 'Utilisateur'}
        </Badge>
      )
    },
    {
      key: 'is_active' as keyof User,
      header: 'Statut',
      render: (value: boolean, user: User) => {
        const isOnline = connectedUsers.some(cu => cu.username === user.username);
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={value ? 'success' : 'error'}>
              {value ? 'Actif' : 'Inactif'}
            </Badge>
            {isOnline && (
              <Badge variant="info" size="sm">
                En ligne
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'created_at' as keyof User,
      header: 'Créé le',
      render: (value: string) => (
        new Date(value).toLocaleDateString('fr-FR')
      )
    }
  ];

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici, vous ajouteriez la logique pour sauvegarder l'utilisateur
    console.log('Sauvegarde de l\'utilisateur:', selectedUser);
    handleCloseModal();
  };

  // Vérifier si l'utilisateur actuel est admin
  if (!currentUser?.is_admin) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Accès réservé aux administrateurs
        </p>
      </div>
    );
  }

  return (
    <div>
      <DataTable
        data={users}
        columns={columns}
        title="Gestion des utilisateurs"
        description="Liste de tous les utilisateurs de l'application avec leur statut et rôle."
        actionButton={
          <Button onClick={() => setIsModalOpen(true)}>
            Ajouter un utilisateur
          </Button>
        }
        onRowAction={handleEditUser}
        actionLabel="Modifier"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        size="md"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <FormInput
            label="Nom d'utilisateur"
            type="text"
            placeholder="Entrez le nom d'utilisateur"
            defaultValue={selectedUser?.username || ''}
            required
          />
          
          <FormInput
            label="Email"
            type="email"
            placeholder="Entrez l'email"
            defaultValue={selectedUser?.email || ''}
            helpText="L'email sera utilisé pour les notifications"
            required
          />
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked={selectedUser?.is_active ?? true}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Utilisateur actif
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked={selectedUser?.is_admin ?? false}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Administrateur
              </span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Annuler
            </Button>
            <Button type="submit">
              {selectedUser ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}