'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import PatrimoineLayout from '@/components/layouts/PatrimoineLayout';
import toast from 'react-hot-toast';

interface ActifFormData {
  nom: string;
  adresse: string;
  ville: string;
  code_postal: string;
  type_bien: string;
  surface_totale: string;
  surface_louable: string;
  nombre_lots: string;
  date_acquisition: string;
  prix_acquisition: string;
  valeur_actuelle: string;
  societe_proprietaire_id: string;
  description: string;
}

interface Societe {
  id: number;
  nom: string;
  actif: boolean;
}

const typesBien = [
  'Appartement',
  'Maison',
  'Local commercial',
  'Bureau',
  'Entrepôt',
  'Parking',
  'Terrain',
  'Autre'
];

export default function NewActifPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const societeId = searchParams.get('societe');

  const [formData, setFormData] = useState<ActifFormData>({
    nom: '',
    adresse: '',
    ville: '',
    code_postal: '',
    type_bien: '',
    surface_totale: '',
    surface_louable: '',
    nombre_lots: '1',
    date_acquisition: '',
    prix_acquisition: '',
    valeur_actuelle: '',
    societe_proprietaire_id: societeId || '',
    description: ''
  });

  const [societes, setSocietes] = useState<Societe[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ActifFormData>>({});

  useEffect(() => {
    const loadSocietes = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/societes');
        if (response.ok) {
          const data = await response.json();
          setSocietes(data.data?.filter((s: Societe) => s.actif) || []);
        }
      } catch (error) {
        console.error('Erreur chargement sociétés:', error);
      }
    };

    loadSocietes();
  }, []);

  const handleInputChange = (field: keyof ActifFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Nettoyer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ActifFormData> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }

    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est obligatoire';
    }

    if (!formData.ville.trim()) {
      newErrors.ville = 'La ville est obligatoire';
    }

    if (!formData.type_bien) {
      newErrors.type_bien = 'Le type de bien est obligatoire';
    }

    if (!formData.societe_proprietaire_id) {
      newErrors.societe_proprietaire_id = 'La société propriétaire est obligatoire';
    }

    if (formData.surface_totale && isNaN(Number(formData.surface_totale))) {
      newErrors.surface_totale = 'La surface doit être un nombre';
    }

    if (formData.surface_louable && isNaN(Number(formData.surface_louable))) {
      newErrors.surface_louable = 'La surface doit être un nombre';
    }

    if (formData.prix_acquisition && isNaN(Number(formData.prix_acquisition))) {
      newErrors.prix_acquisition = 'Le prix doit être un nombre';
    }

    if (formData.valeur_actuelle && isNaN(Number(formData.valeur_actuelle))) {
      newErrors.valeur_actuelle = 'La valeur doit être un nombre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        surface_totale: formData.surface_totale ? Number(formData.surface_totale) : null,
        surface_louable: formData.surface_louable ? Number(formData.surface_louable) : null,
        nombre_lots: Number(formData.nombre_lots) || 1,
        prix_acquisition: formData.prix_acquisition ? Number(formData.prix_acquisition) : null,
        valeur_actuelle: formData.valeur_actuelle ? Number(formData.valeur_actuelle) : null,
        societe_proprietaire_id: Number(formData.societe_proprietaire_id),
        date_acquisition: formData.date_acquisition || null
      };

      const response = await fetch('http://localhost:8000/api/v1/actifs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création');
      }

      const result = await response.json();
      toast.success('Actif immobilier créé avec succès !');
      router.push(`/patrimoine/${result.data.id}`);
    } catch (error) {
      console.error('Erreur création actif:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PatrimoineLayout>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ➕ Nouvel Actif Immobilier
            </h1>
            <p className="text-gray-600">Ajouter un nouveau bien immobilier à votre portefeuille</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => router.push('/patrimoine')}
          >
            ← Retour
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informations du bien */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-6">🏠 Informations du bien</h3>
              <div className="space-y-4">
                <FormInput
                  label="Nom du bien *"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  error={errors.nom}
                  placeholder="Ex: Appartement rue de la Paix"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de bien *
                  </label>
                  <select
                    value={formData.type_bien}
                    onChange={(e) => handleInputChange('type_bien', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.type_bien ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner un type</option>
                    {typesBien.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.type_bien && (
                    <p className="mt-1 text-sm text-red-600">{errors.type_bien}</p>
                  )}
                </div>

                <FormInput
                  label="Adresse *"
                  value={formData.adresse}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  error={errors.adresse}
                  placeholder="Numéro et nom de rue"
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Code postal"
                    value={formData.code_postal}
                    onChange={(e) => handleInputChange('code_postal', e.target.value.slice(0, 5))}
                    placeholder="Ex: 75001"
                  />

                  <FormInput
                    label="Ville *"
                    value={formData.ville}
                    onChange={(e) => handleInputChange('ville', e.target.value)}
                    error={errors.ville}
                    placeholder="Ex: Paris"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormInput
                    label="Surface totale (m²)"
                    type="number"
                    value={formData.surface_totale}
                    onChange={(e) => handleInputChange('surface_totale', e.target.value)}
                    error={errors.surface_totale}
                    placeholder="Ex: 75"
                  />

                  <FormInput
                    label="Surface louable (m²)"
                    type="number"
                    value={formData.surface_louable}
                    onChange={(e) => handleInputChange('surface_louable', e.target.value)}
                    error={errors.surface_louable}
                    placeholder="Ex: 70"
                  />

                  <FormInput
                    label="Nombre de lots"
                    type="number"
                    value={formData.nombre_lots}
                    onChange={(e) => handleInputChange('nombre_lots', e.target.value)}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>
            </Card>

            {/* Informations financières et propriété */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-6">💰 Informations financières</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Société propriétaire *
                  </label>
                  <select
                    value={formData.societe_proprietaire_id}
                    onChange={(e) => handleInputChange('societe_proprietaire_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.societe_proprietaire_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner une société</option>
                    {societes.map(societe => (
                      <option key={societe.id} value={societe.id}>{societe.nom}</option>
                    ))}
                  </select>
                  {errors.societe_proprietaire_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.societe_proprietaire_id}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/societes/new')}
                      className="text-xs"
                    >
                      + Créer une nouvelle société
                    </Button>
                  </p>
                </div>

                <FormInput
                  label="Date d'acquisition"
                  type="date"
                  value={formData.date_acquisition}
                  onChange={(e) => handleInputChange('date_acquisition', e.target.value)}
                />

                <FormInput
                  label="Prix d'acquisition (€)"
                  type="number"
                  value={formData.prix_acquisition}
                  onChange={(e) => handleInputChange('prix_acquisition', e.target.value)}
                  error={errors.prix_acquisition}
                  placeholder="Ex: 250000"
                />

                <FormInput
                  label="Valeur actuelle (€)"
                  type="number"
                  value={formData.valeur_actuelle}
                  onChange={(e) => handleInputChange('valeur_actuelle', e.target.value)}
                  error={errors.valeur_actuelle}
                  placeholder="Ex: 280000"
                  helpText="Estimation de la valeur actuelle du bien"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Description optionnelle du bien (état, particularités, travaux...)..."
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8">
            <Button 
              type="button"
              variant="outline"
              onClick={() => router.push('/patrimoine')}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Création...' : '✅ Créer l\'actif'}
            </Button>
          </div>
        </form>
      </div>
    </PatrimoineLayout>
  );
}
