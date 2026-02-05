'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EstimationFormData } from '@/types';
import { estimationsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { Card } from '@/components/ui/Card';
import { 
  HomeIcon, 
  BuildingOfficeIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function EstimationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EstimationFormData>({
    type: 'appartement',
    adresse: '',
    code_postal: '',
    ville: '',
    departement: '',
    surface_totale: 0,
    etat_general: 'bon',
    methode: 'mixte',
    caracteristiques: {}
  });

  const steps = [
    { id: 1, title: 'Localisation', description: 'Où se trouve votre bien ?' },
    { id: 2, title: 'Caractéristiques', description: 'Décrivez votre bien' },
    { id: 3, title: 'Méthode', description: 'Choisissez la méthode d\'estimation' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const departement = formData.code_postal.substring(0, 2);
      
      // Extraire latitude et longitude des caractéristiques si présentes
      const latitude = formData.caracteristiques?.latitude;
      const longitude = formData.caracteristiques?.longitude;
      
      const dataToSend = {
        ...formData,
        departement: departement.length === 2 ? departement : formData.departement,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        // Ne pas envoyer latitude/longitude dans caracteristiques
        caracteristiques: Object.fromEntries(
          Object.entries(formData.caracteristiques || {}).filter(([key]) => key !== 'latitude' && key !== 'longitude')
        )
      };

      const response = await estimationsApi.createEstimation(dataToSend);
      
      if (response.data) {
        toast.success('Estimation créée avec succès !');
        router.push(`/estimation/${response.data.id}`);
      } else {
        const errorMsg = response.error || 'Erreur lors de la création de l\'estimation';
        toast.error(errorMsg, { duration: 6000 });
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Erreur lors de la création de l\'estimation';
      
      // Message d'erreur amélioré si pas de comparables
      if (errorMsg.includes('Aucun comparable') || errorMsg.includes('Aucun')) {
        toast.error(
          'Aucun comparable trouvé pour cette zone. Les données DVF doivent être importées ou le scraping doit être lancé.',
          { duration: 8000 }
        );
      } else {
        toast.error(errorMsg, { duration: 6000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof EstimationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canProceedToStep2 = formData.adresse && formData.code_postal && formData.ville;
  const canProceedToStep3 = formData.surface_totale > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Estimation Immobilière Gratuite
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Obtenez une estimation précise de votre bien immobilier en quelques minutes grâce à notre algorithme d'intelligence artificielle
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep === step.id 
                      ? 'bg-blue-600 text-white shadow-lg scale-110' 
                      : currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 transition-all ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Localisation */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-6">
                  <BuildingOfficeIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Où se trouve votre bien ?</h2>
                  <p className="text-gray-600">Ces informations nous permettent de trouver les biens comparables dans votre secteur</p>
                </div>

            <AddressAutocomplete
              label="Adresse complète *"
              value={formData.adresse}
              onChange={(address, postcode, city, lat, lon) => {
                handleChange('adresse', address);
                if (postcode) handleChange('code_postal', postcode);
                if (city) handleChange('ville', city);
                // Stocker les coordonnées dans caracteristiques pour l'instant
                // Elles seront extraites lors de l'envoi
                if (lat && lon) {
                  handleChange('caracteristiques', { ...formData.caracteristiques, latitude: lat, longitude: lon });
                }
              }}
              required
              placeholder="Commencez à taper votre adresse..."
              helpText="L'autocomplétion vous aide à trouver rapidement votre adresse"
            />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Code postal *"
                    type="text"
                    value={formData.code_postal}
                    onChange={(e) => {
                      const cp = e.target.value.replace(/\D/g, '').substring(0, 5);
                      handleChange('code_postal', cp);
                      if (cp.length === 5) {
                        handleChange('departement', cp.substring(0, 2));
                      }
                    }}
                    required
                    placeholder="75001"
                    maxLength={5}
                  />
                  <FormInput
                    label="Ville *"
                    type="text"
                    value={formData.ville}
                    onChange={(e) => handleChange('ville', e.target.value)}
                    required
                    placeholder="Paris"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedToStep2}
                    size="lg"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Caractéristiques */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-6">
                  <HomeIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Caractéristiques de votre bien</h2>
                  <p className="text-gray-600">Plus les informations sont précises, plus l'estimation sera fiable</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de bien *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="appartement">Appartement</option>
                    <option value="maison">Maison</option>
                    <option value="immeuble_bloc">Immeuble en bloc</option>
                    <option value="part_indivise">Part indivise</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Le type de bien influence directement le prix au m² utilisé pour le calcul
                  </p>
                </div>

                <FormInput
                  label="Surface totale (m²) *"
                  type="number"
                  value={formData.surface_totale || ''}
                  onChange={(e) => handleChange('surface_totale', parseFloat(e.target.value) || 0)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="75"
                  helpText="Surface habitable totale (Loi Carrez pour les appartements)"
                />

                {formData.type === 'immeuble_bloc' && (
                  <div className="space-y-4">
                    <FormInput
                      label="Nombre de lots"
                      type="number"
                      value={formData.nombre_lots || ''}
                      onChange={(e) => handleChange('nombre_lots', parseInt(e.target.value) || undefined)}
                      min="1"
                      placeholder="10"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Répartition des surfaces (m²)
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <FormInput
                          label="Habitation"
                          type="number"
                          value={formData.caracteristiques?.surface_habitation || ''}
                          onChange={(e) => handleChange('caracteristiques', {
                            ...formData.caracteristiques,
                            surface_habitation: parseFloat(e.target.value) || 0
                          })}
                          min="0"
                          step="0.01"
                          placeholder="0"
                        />
                        <FormInput
                          label="Bureaux"
                          type="number"
                          value={formData.caracteristiques?.surface_bureaux || ''}
                          onChange={(e) => handleChange('caracteristiques', {
                            ...formData.caracteristiques,
                            surface_bureaux: parseFloat(e.target.value) || 0
                          })}
                          min="0"
                          step="0.01"
                          placeholder="0"
                        />
                        <FormInput
                          label="Parking"
                          type="number"
                          value={formData.caracteristiques?.surface_parking || ''}
                          onChange={(e) => handleChange('caracteristiques', {
                            ...formData.caracteristiques,
                            surface_parking: parseFloat(e.target.value) || 0
                          })}
                          min="0"
                          step="0.01"
                          placeholder="0"
                        />
                        <FormInput
                          label="Commerce"
                          type="number"
                          value={formData.caracteristiques?.surface_commerce || ''}
                          onChange={(e) => handleChange('caracteristiques', {
                            ...formData.caracteristiques,
                            surface_commerce: parseFloat(e.target.value) || 0
                          })}
                          min="0"
                          step="0.01"
                          placeholder="0"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        La somme doit correspondre à la surface totale
                      </p>
                    </div>
                  </div>
                )}

                {formData.type === 'part_indivise' && (
                  <FormInput
                    label="Quote-part (entre 0 et 1)"
                    type="number"
                    value={formData.quote_part || ''}
                    onChange={(e) => handleChange('quote_part', parseFloat(e.target.value) || undefined)}
                    min="0"
                    max="1"
                    step="0.0001"
                    placeholder="0.5"
                    helpText="Exemple : 0.5 = 50% du bien"
                  />
                )}

                <FormInput
                  label="Année de construction"
                  type="number"
                  value={formData.annee_construction || ''}
                  onChange={(e) => handleChange('annee_construction', parseInt(e.target.value) || undefined)}
                  min="1000"
                  max={new Date().getFullYear() + 1}
                  placeholder="1990"
                  helpText="L'année de construction permet d'ajuster le prix selon l'âge du bien"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    État général *
                  </label>
                  <select
                    value={formData.etat_general}
                    onChange={(e) => handleChange('etat_general', e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="excellent">Excellent - Récent ou rénové récemment (+10%)</option>
                    <option value="bon">Bon - Bien entretenu (prix de référence)</option>
                    <option value="moyen">Moyen - Nécessite quelques travaux (-10%)</option>
                    <option value="a_renover">À rénover - Travaux importants nécessaires (-30%)</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    L'état général applique un coefficient d'ajustement sur le prix de référence
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnostic de Performance Énergétique (DPE)
                  </label>
                  <select
                    value={formData.caracteristiques?.dpe || ''}
                    onChange={(e) => handleChange('caracteristiques', {
                      ...formData.caracteristiques,
                      dpe: e.target.value || undefined
                    })}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Non renseigné</option>
                    <option value="A">A - Très performant</option>
                    <option value="B">B - Performant</option>
                    <option value="C">C - Assez performant</option>
                    <option value="D">D - Moyennement performant</option>
                    <option value="E">E - Peu performant</option>
                    <option value="F">F - Très peu performant</option>
                    <option value="G">G - Extrêmement peu performant</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Le DPE peut influencer la valeur du bien (décote pour F et G)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupation actuelle
                  </label>
                  <select
                    value={formData.caracteristiques?.occupe ? 'true' : 'false'}
                    onChange={(e) => handleChange('caracteristiques', {
                      ...formData.caracteristiques,
                      occupe: e.target.value === 'true'
                    })}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="false">Libre</option>
                    <option value="true">Occupé</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Un bien occupé peut subir une décote pour vacance commerciale
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    size="lg"
                  >
                    Précédent
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={!canProceedToStep3}
                    size="lg"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Méthode */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-6">
                  <InformationCircleIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Méthode d'estimation</h2>
                  <p className="text-gray-600">Choisissez la méthode de calcul pour votre estimation</p>
                </div>

                <div className="space-y-4">
                  <div 
                    onClick={() => handleChange('methode', 'mixte')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.methode === 'mixte' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="methode"
                        value="mixte"
                        checked={formData.methode === 'mixte'}
                        onChange={(e) => handleChange('methode', e.target.value)}
                        className="mt-1"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Mixte (Recommandé)
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Combine les transactions DVF (officielles) et les annonces immobilières pour une estimation équilibrée
                        </p>
                        <div className="text-xs text-gray-500">
                          ✓ Plus précise • ✓ Score de confiance élevé • ✓ Prend en compte le marché actuel
                        </div>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleChange('methode', 'comparables_dvf')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.methode === 'comparables_dvf' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="methode"
                        value="comparables_dvf"
                        checked={formData.methode === 'comparables_dvf'}
                        onChange={(e) => handleChange('methode', e.target.value)}
                        className="mt-1"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Transactions DVF uniquement
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Basée uniquement sur les transactions réelles enregistrées par l'administration fiscale
                        </p>
                        <div className="text-xs text-gray-500">
                          ✓ Données officielles • ✓ Très fiable • ⚠ Peut être moins récent
                        </div>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleChange('methode', 'comparables_offres')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.methode === 'comparables_offres' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="methode"
                        value="comparables_offres"
                        checked={formData.methode === 'comparables_offres'}
                        onChange={(e) => handleChange('methode', e.target.value)}
                        className="mt-1"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Annonces immobilières uniquement
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Basée uniquement sur les prix des annonces actuellement sur le marché
                        </p>
                        <div className="text-xs text-gray-500">
                          ✓ Prix actuels • ✓ Réflexion du marché en temps réel • ⚠ Peut être surévalué
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info sur l'algorithme */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <InformationCircleIcon className="w-5 h-5 mr-2" />
                    Comment fonctionne notre algorithme ?
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                    <li>Recherche des biens comparables dans un rayon de 2km</li>
                    <li>Calcul de la médiane des prix au m² des comparables trouvés</li>
                    <li>Application d'ajustements selon l'état général et l'âge du bien</li>
                    <li>Détermination d'une fourchette de prix basée sur les quartiles statistiques</li>
                    <li>Attribution d'un score de confiance selon le nombre et la qualité des comparables</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    size="lg"
                  >
                    Précédent
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="px-8"
                  >
                    {loading ? 'Calcul en cours...' : 'Obtenir mon estimation'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>

        {/* Trust indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-sm text-gray-600">Gratuit et sans engagement</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">&lt; 2 min</div>
            <div className="text-sm text-gray-600">Temps de calcul moyen</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
            <div className="text-sm text-gray-600">Score de confiance maximum</div>
          </div>
        </div>
      </div>
    </div>
  );
}
