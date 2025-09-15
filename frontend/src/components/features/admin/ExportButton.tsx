'use client';

import React, { useState } from 'react';
import { Button } from '../../ui';
import { ExportDialog } from './ExportDialog';

interface ExportButtonProps {
  exportType: 'users' | 'messages' | 'statistics';
  title?: string;
  description?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  exportType,
  title,
  description,
  variant = 'outline',
  size = 'md',
  className,
  children
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getDefaultTitle = () => {
    switch (exportType) {
      case 'users':
        return 'Exporter les utilisateurs';
      case 'messages':
        return 'Exporter les messages';
      case 'statistics':
        return 'Exporter les statistiques';
      default:
        return 'Exporter les données';
    }
  };

  const getDefaultDescription = () => {
    switch (exportType) {
      case 'users':
        return 'Exportez la liste des utilisateurs avec leurs informations et filtres personnalisés.';
      case 'messages':
        return 'Exportez les messages avec possibilité de filtrer par utilisateur, type et période.';
      case 'statistics':
        return 'Exportez un rapport complet des statistiques de l\'application.';
      default:
        return 'Exportez les données dans le format de votre choix.';
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsDialogOpen(true)}
        className={className}
      >
        {children || (
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Exporter</span>
          </div>
        )}
      </Button>

      <ExportDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        exportType={exportType}
        title={title || getDefaultTitle()}
        description={description || getDefaultDescription()}
      />
    </>
  );
};
