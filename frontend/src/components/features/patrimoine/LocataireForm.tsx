'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { Modal } from '@/components/ui/Modal';

interface LocataireFormData {
  nom: string;
  prenom: string;
  type_locataire: 'particulier' | 'entreprise';
  raison_sociale: string;
  siret: string;
  adresse: string;
  code_postal: string;
  ville: string;
  telephone: string;
  email: string;
  profession: string;
  revenus_annuels: number | '';
  notes: string;
}

interface LocataireFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LocataireFormData) => void;
  initialData?: Partial<LocataireFormData>;
  title?: string;
}

export default function LocataireForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = {},
  title = "Nouveau Locataire"
}: LocataireFormProps) {
  const [formData, setFormData] = useState<LocataireFormData>({
    nom: '',
    prenom: '',
    type_locataire: 'entreprise',
    raison_sociale: '',
    siret: '',
    adresse: '',
    code_postal: '',
    ville: '',
    telephone: '',
    email: '',
    profession: '',
    revenus_annuels: '',
    notes: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof LocataireFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    
    if (formData.type_locataire === 'entreprise' && !formData.raison_sociale.trim()) {
      newErrors.raison_sociale = 'La raison sociale est obligatoire pour une entreprise';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (formData.siret && formData.siret.length !== 14) {
      newErrors.siret = 'Le SIRET doit contenir 14 chiffres';
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

  const professions = [
    'Restauration',
    'Commerce de détail',
    'Coiffure',
    'Articles de sport',
    'Boulangerie',
    'Distribution',
    'Télécommunications',
    'Agriculture',
    'Services',
    'Autre'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="large">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type et identité */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            👤 Identité
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de locataire
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="particulier"
                  checked={formData.type_locataire === 'particulier'}
                  onChange={(e) => handleChange('type_locataire', e.target.value as 'particulier' | 'entreprise')}
                  className="mr-2"
                />
                Particulier
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="entreprise"
                  checked={formData.type_locataire === 'entreprise'}
                  onChange={(e) => handleChange('type_locataire', e.target.value as 'particulier' | 'entreprise')}
                  className="mr-2"
                />
                Entreprise
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.type_locataire === 'particulier' ? (
              <>
                <FormInput
                  label="Nom *"
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  error={errors.nom}
                  placeholder="Dupont"
                />
                <FormInput
                  label="Prénom"
                  value={formData.prenom}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  placeholder="Jean"
                />
              </>
            ) : (
              <>
                <FormInput
                  label="Raison sociale *"
                  value={formData.raison_sociale}
                  onChange={(e) => handleChange('raison_sociale', e.target.value)}
                  error={errors.raison_sociale}
                  placeholder="SARL EXEMPLE"
                />
                <FormInput
                  label="Nom commercial"
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  error={errors.nom}
                  placeholder="Enseigne commerciale"
                />
              </>
            )}
          </div>

          {formData.type_locataire === 'entreprise' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="SIRET"
                value={formData.siret}
                onChange={(e) => handleChange('siret', e.target.value)}
                error={errors.siret}
                placeholder="12345678901234"
                maxLength={14}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité
                </label>
                <select
                  value={formData.profession}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un secteur</option>
                  {professions.map(prof => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </Card>

        {/* Contact */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📞 Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Téléphone"
              value={formData.telephone}
              onChange={(e) => handleChange('telephone', e.target.value)}
              placeholder="01 23 45 67 89"
            />
            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="contact@exemple.fr"
            />
          </div>
        </Card>

        {/* Adresse */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🏠 Adresse
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormInput
                label="Adresse"
                value={formData.adresse}
                onChange={(e) => handleChange('adresse', e.target.value)}
                placeholder="123 rue de la République"
              />
            </div>
            <FormInput
              label="Code postal"
              value={formData.code_postal}
              onChange={(e) => handleChange('code_postal', e.target.value)}
              placeholder="75001"
            />
            <FormInput
              label="Ville"
              value={formData.ville}
              onChange={(e) => handleChange('ville', e.target.value)}
              placeholder="Paris"
            />
          </div>
        </Card>

        {/* Informations financières */}
        {formData.type_locataire === 'particulier' && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              💰 Informations Financières
            </h3>
            <FormInput
              label="Revenus annuels (€)"
              type="number"
              value={formData.revenus_annuels}
              onChange={(e) => handleChange('revenus_annuels', parseFloat(e.target.value) || '')}
              placeholder="50000"
            />
          </Card>
        )}

        {/* Notes */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📝 Notes
          </h3>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Informations complémentaires..."
          />
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
