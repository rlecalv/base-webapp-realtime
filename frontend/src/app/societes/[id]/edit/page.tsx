'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import PatrimoineLayout from '@/components/layouts/PatrimoineLayout';
import toast from 'react-hot-toast';

interface SocieteFormData {
  nom: string;
  siret: string;
  adresse: string;
  code_postal: string;
  ville: string;
  telephone: string;
  email: string;
  forme_juridique: string;
  capital_social: string;
  date_creation: string;
  secteur_activite: string;
  description: string;
  actif: boolean;
}

const formesJuridiques = [
  'SAS',
  'SARL',
  'SCI',
  'EURL',
  'SA',
  'SASU',
  'SNC',
  'Autre'
];

export default function EditSocietePage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<SocieteFormData>({
    nom: '',
    siret: '',
    adresse: '',
    code_postal: '',
    ville: '',
    telephone: '',
    email: '',
    forme_juridique: '',
    capital_social: '',
    date_creation: '',
    secteur_activite: '',
    description: '',
    actif: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<SocieteFormData>>({});

  useEffect(() => {
    const loadSociete = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/v1/societes/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Société non trouvée');
        }

        const data = await response.json();
        const societe = data.data;
        
        setFormData({
          nom: societe.nom || '',
          siret: societe.siret || '',
          adresse: societe.adresse || '',
          code_postal: societe.code_postal || '',
          ville: societe.ville || '',
          telephone: societe.telephone || '',
          email: societe.email || '',
          forme_juridique: societe.forme_juridique || '',
          capital_social: societe.capital_social ? String(societe.capital_social) : '',
          date_creation: societe.date_creation ? societe.date_creation.split('T')[0] : '',
          secteur_activite: societe.secteur_activite || '',
          description: societe.description || '',
          actif: societe.actif
        });
      } catch (error) {
        console.error('Erreur chargement société:', error);
        toast.error('Erreur lors du chargement de la société');
        router.push('/societes');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadSociete();
    }
  }, [params.id, router]);

  const handleInputChange = (field: keyof SocieteFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Nettoyer l'erreur du champ modifié
    if (errors[field as keyof Partial<SocieteFormData>]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SocieteFormData> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }

    if (formData.siret && formData.siret.length !== 14) {
      newErrors.siret = 'Le SIRET doit contenir 14 chiffres';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.capital_social && isNaN(Number(formData.capital_social))) {
      newErrors.capital_social = 'Le capital social doit être un nombre';
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

    setSaving(true);
    
    try {
      const payload = {
        ...formData,
        capital_social: formData.capital_social ? Number(formData.capital_social) : null,
        date_creation: formData.date_creation || null
      };

      const response = await fetch(`http://localhost:8000/api/v1/societes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification');
      }

      toast.success('Société modifiée avec succès !');
      router.push(`/societes/${params.id}`);
    } catch (error) {
      console.error('Erreur modification société:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <PatrimoineLayout>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ✏️ Modifier la Société
            </h1>
            <p className="text-gray-600">Mettre à jour les informations de la société</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => router.push(`/societes/${params.id}`)}
          >
            ← Retour
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informations principales */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-6">📋 Informations principales</h3>
              <div className="space-y-4">
                <FormInput
                  label="Nom de la société *"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  error={errors.nom}
                  placeholder="Ex: SAS IMMOBILIER FRANCE"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forme juridique
                  </label>
                  <select
                    value={formData.forme_juridique}
                    onChange={(e) => handleInputChange('forme_juridique', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner une forme juridique</option>
                    {formesJuridiques.map(forme => (
                      <option key={forme} value={forme}>{forme}</option>
                    ))}
                  </select>
                </div>

                <FormInput
                  label="SIRET"
                  value={formData.siret}
                  onChange={(e) => handleInputChange('siret', e.target.value.replace(/\D/g, '').slice(0, 14))}
                  error={errors.siret}
                  placeholder="14 chiffres"
                  helpText="14 chiffres uniquement"
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Capital social (€)"
                    type="number"
                    value={formData.capital_social}
                    onChange={(e) => handleInputChange('capital_social', e.target.value)}
                    error={errors.capital_social}
                    placeholder="Ex: 10000"
                  />

                  <FormInput
                    label="Date de création"
                    type="date"
                    value={formData.date_creation}
                    onChange={(e) => handleInputChange('date_creation', e.target.value)}
                  />
                </div>

                <FormInput
                  label="Secteur d'activité"
                  value={formData.secteur_activite}
                  onChange={(e) => handleInputChange('secteur_activite', e.target.value)}
                  placeholder="Ex: Immobilier locatif"
                />

                {/* Statut actif/inactif */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="actif"
                    checked={formData.actif}
                    onChange={(e) => handleInputChange('actif', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="actif" className="text-sm font-medium text-gray-700">
                    Société active
                  </label>
                </div>
              </div>
            </Card>

            {/* Informations de contact */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-6">📞 Contact et adresse</h3>
              <div className="space-y-4">
                <FormInput
                  label="Adresse"
                  value={formData.adresse}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
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
                    label="Ville"
                    value={formData.ville}
                    onChange={(e) => handleInputChange('ville', e.target.value)}
                    placeholder="Ex: Paris"
                  />
                </div>

                <FormInput
                  label="Téléphone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  placeholder="Ex: 01 23 45 67 89"
                />

                <FormInput
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="contact@societe.fr"
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
                    placeholder="Description optionnelle de l'activité de la société..."
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
              onClick={() => router.push(`/societes/${params.id}`)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? 'Enregistrement...' : '✅ Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </PatrimoineLayout>
  );
}
