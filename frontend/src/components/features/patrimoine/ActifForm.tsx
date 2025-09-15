'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { Modal } from '@/components/ui/Modal';

interface ActifFormData {
  nom: string;
  adresse: string;
  code_postal: string;
  ville: string;
  type_bien: string;
  surface_totale: number | '';
  surface_louable: number | '';
  nombre_lots: number | '';
  date_acquisition: string;
  prix_acquisition: number | '';
  valeur_actuelle: number | '';
  description: string;
  societe_id: number | '';
}

interface ActifFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ActifFormData) => void;
  initialData?: Partial<ActifFormData>;
  title?: string;
  societes?: Array<{ id: number; nom: string }>;
}

export default function ActifForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = {},
  title = "Nouvel Actif Immobilier",
  societes = []
}: ActifFormProps) {
  const [formData, setFormData] = useState<ActifFormData>({
    nom: '',
    adresse: '',
    code_postal: '',
    ville: '',
    type_bien: 'commerce',
    surface_totale: '',
    surface_louable: '',
    nombre_lots: 1,
    date_acquisition: '',
    prix_acquisition: '',
    valeur_actuelle: '',
    description: '',
    societe_id: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ActifFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est obligatoire';
    }
    if (!formData.ville.trim()) {
      newErrors.ville = 'La ville est obligatoire';
    }
    if (!formData.societe_id) {
      newErrors.societe_id = 'La société propriétaire est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const typesBien = [
    { value: 'appartement', label: 'Appartement' },
    { value: 'maison', label: 'Maison' },
    { value: 'bureau', label: 'Bureau' },
    { value: 'commerce', label: 'Local commercial' },
    { value: 'entrepot', label: 'Entrepôt' },
    { value: 'terrain', label: 'Terrain' },
    { value: 'immeuble', label: 'Immeuble' },
    { value: 'parking', label: 'Parking' },
    { value: 'autre', label: 'Autre' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="large">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🏠 Informations Générales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nom de l'actif *"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              error={errors.nom}
              placeholder="Ex: Local commercial - Paris"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Société propriétaire *
              </label>
              <select
                value={formData.societe_id}
                onChange={(e) => handleChange('societe_id', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une société</option>
                {societes.map(societe => (
                  <option key={societe.id} value={societe.id}>
                    {societe.nom}
                  </option>
                ))}
              </select>
              {errors.societe_id && (
                <p className="text-red-600 text-sm mt-1">{errors.societe_id}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de bien
              </label>
              <select
                value={formData.type_bien}
                onChange={(e) => handleChange('type_bien', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {typesBien.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Localisation */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📍 Localisation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormInput
                label="Adresse *"
                value={formData.adresse}
                onChange={(e) => handleChange('adresse', e.target.value)}
                error={errors.adresse}
                placeholder="Ex: 123 rue de la Paix"
              />
            </div>
            
            <FormInput
              label="Code postal"
              value={formData.code_postal}
              onChange={(e) => handleChange('code_postal', e.target.value)}
              placeholder="75001"
            />
            
            <FormInput
              label="Ville *"
              value={formData.ville}
              onChange={(e) => handleChange('ville', e.target.value)}
              error={errors.ville}
              placeholder="Paris"
            />
          </div>
        </Card>

        {/* Caractéristiques */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📐 Caractéristiques
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Surface totale (m²)"
              type="number"
              value={formData.surface_totale}
              onChange={(e) => handleChange('surface_totale', parseFloat(e.target.value) || '')}
              placeholder="100"
            />
            
            <FormInput
              label="Surface louable (m²)"
              type="number"
              value={formData.surface_louable}
              onChange={(e) => handleChange('surface_louable', parseFloat(e.target.value) || '')}
              placeholder="95"
            />
            
            <FormInput
              label="Nombre de lots"
              type="number"
              value={formData.nombre_lots}
              onChange={(e) => handleChange('nombre_lots', parseInt(e.target.value) || '')}
              placeholder="1"
            />
          </div>
        </Card>

        {/* Valorisation */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            💰 Valorisation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Date d'acquisition"
              type="date"
              value={formData.date_acquisition}
              onChange={(e) => handleChange('date_acquisition', e.target.value)}
            />
            
            <FormInput
              label="Prix d'acquisition (€)"
              type="number"
              value={formData.prix_acquisition}
              onChange={(e) => handleChange('prix_acquisition', parseFloat(e.target.value) || '')}
              placeholder="500000"
            />
            
            <FormInput
              label="Valeur actuelle (€)"
              type="number"
              value={formData.valeur_actuelle}
              onChange={(e) => handleChange('valeur_actuelle', parseFloat(e.target.value) || '')}
              placeholder="550000"
            />
          </div>
        </Card>

        {/* Description */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📝 Description
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Informations complémentaires sur l'actif..."
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            💾 Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
