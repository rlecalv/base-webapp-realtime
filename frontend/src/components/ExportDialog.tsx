'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { FormInput } from './ui/FormInput';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Alert } from './ui/Alert';
import { exportsApi, ExportFilters, ExportFormat } from '@/lib/api';
import { downloadBlob, generateExportFilename, validateExportFilters, formatDateForAPI } from '@/lib/utils';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: 'users' | 'messages' | 'statistics';
  title: string;
  description?: string;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  exportType,
  title,
  description
}) => {
  const [loading, setLoading] = useState(false);
  const [formats, setFormats] = useState<ExportFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [filters, setFilters] = useState<ExportFilters>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Charger les formats disponibles
  useEffect(() => {
    if (isOpen) {
      loadFormats();
    }
  }, [isOpen]);

  const loadFormats = async () => {
    try {
      const response = await exportsApi.getFormats();
      setFormats(response.formats);
    } catch (err) {
      console.error('Erreur lors du chargement des formats:', err);
      setError('Impossible de charger les formats d\'export');
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Valider les filtres
      const validationErrors = validateExportFilters(filters);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }

      // Préparer les filtres pour l'API
      const apiFilters: ExportFilters = { ...filters };
      if (apiFilters.dateFrom) {
        apiFilters.dateFrom = formatDateForAPI(new Date(apiFilters.dateFrom));
      }
      if (apiFilters.dateTo) {
        apiFilters.dateTo = formatDateForAPI(new Date(apiFilters.dateTo));
      }

      let blob: Blob;
      let filename: string;

      // Effectuer l'export selon le type
      switch (exportType) {
        case 'users':
          blob = await exportsApi.exportUsers(selectedFormat, apiFilters);
          filename = generateExportFilename('utilisateurs', selectedFormat);
          break;
        case 'messages':
          blob = await exportsApi.exportMessages(selectedFormat, apiFilters);
          filename = generateExportFilename('messages', selectedFormat);
          break;
        case 'statistics':
          blob = await exportsApi.exportStatistics(selectedFormat);
          filename = generateExportFilename('statistiques', selectedFormat);
          break;
        default:
          throw new Error('Type d\'export non supporté');
      }

      // Télécharger le fichier
      downloadBlob(blob, filename);
      setSuccess(`Export ${selectedFormat.toUpperCase()} téléchargé avec succès !`);
      
      // Fermer la modal après un délai
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Erreur lors de l\'export:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(null);
      setFilters({});
      setSelectedFormat('excel');
      onClose();
    }
  };

  const renderFilters = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Date de début"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            placeholder="Filtrer à partir de..."
          />
          <FormInput
            label="Date de fin"
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            placeholder="Filtrer jusqu'à..."
          />
        </div>

        {exportType === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut utilisateur
              </label>
              <select
                value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les utilisateurs</option>
                <option value="true">Utilisateurs actifs</option>
                <option value="false">Utilisateurs inactifs</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle administrateur
              </label>
              <select
                value={filters.isAdmin === undefined ? '' : filters.isAdmin.toString()}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isAdmin: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les rôles</option>
                <option value="true">Administrateurs</option>
                <option value="false">Utilisateurs standard</option>
              </select>
            </div>
          </div>
        )}

        {exportType === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="ID Utilisateur"
              type="number"
              value={filters.userId?.toString() || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                userId: e.target.value ? parseInt(e.target.value) : undefined
              }))}
              placeholder="Filtrer par utilisateur..."
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de message
              </label>
              <select
                value={filters.messageType || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  messageType: e.target.value as any || undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="text">Texte</option>
                <option value="image">Image</option>
                <option value="file">Fichier</option>
                <option value="system">Système</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-6">
        {description && (
          <p className="text-gray-600 text-sm">{description}</p>
        )}

        {error && (
          <Alert type="error" message={error} />
        )}

        {success && (
          <Alert type="success" message={success} />
        )}

        {/* Sélection du format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format d'export
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formats.map((format) => (
              <label
                key={format.key}
                className={`
                  flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                  ${selectedFormat === format.key 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input
                  type="radio"
                  name="format"
                  value={format.key}
                  checked={selectedFormat === format.key}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="sr-only"
                />
                <div>
                  <div className="font-medium text-sm">{format.name}</div>
                  <div className="text-xs text-gray-500">{format.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Filtres */}
        {exportType !== 'statistics' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Filtres (optionnels)</h4>
            {renderFilters()}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading || !selectedFormat}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Export...</span>
              </div>
            ) : (
              'Exporter'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
