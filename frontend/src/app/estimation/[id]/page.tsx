'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Estimation, Comparable, LeadFormData } from '@/types';
import { estimationsApi, leadsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/ui/FormInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { PriceChart } from '@/components/charts/PriceChart';
import { PriceDistribution } from '@/components/charts/PriceDistribution';
import { ConfidenceGauge } from '@/components/charts/ConfidenceGauge';
import { TrendChart } from '@/components/charts/TrendChart';
import { FinancialAnalysis } from '@/components/charts/FinancialAnalysis';
import { 
  CheckCircleIcon,
  MapPinIcon,
  HomeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function EstimationResultPage() {
  const params = useParams();
  const router = useRouter();
  const estimationId = parseInt(params.id as string);

  const [estimation, setEstimation] = useState<Estimation | null>(null);
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadData, setLeadData] = useState<LeadFormData>({
    estimation_id: estimationId,
    email: '',
    telephone: '',
    nom: '',
    prenom: '',
    type_bien_interesse: '',
    budget_max: undefined
  });

  useEffect(() => {
    loadEstimation();
  }, [estimationId]);

  const loadEstimation = async () => {
    try {
      setLoading(true);
      const [estimationResponse, comparablesResponse] = await Promise.all([
        estimationsApi.getEstimation(estimationId),
        estimationsApi.getComparables(estimationId)
      ]);

      if (estimationResponse.data) {
        setEstimation(estimationResponse.data);
      }

      if (comparablesResponse.data) {
        setComparables(comparablesResponse.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement de l\'estimation');
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadLoading(true);

    try {
      const response = await leadsApi.createLead(leadData);
      if (response.data) {
        toast.success('Votre demande a été enregistrée ! Nous vous contacterons sous peu.');
        setShowLeadForm(false);
        setLeadData({
          estimation_id: estimationId,
          email: '',
          telephone: '',
          nom: '',
          prenom: '',
          type_bien_interesse: '',
          budget_max: undefined
        });
      } else {
        toast.error(response.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setLeadLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getConfidenceColor = (confiance: number) => {
    if (confiance >= 80) return 'text-green-600 bg-green-100';
    if (confiance >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Calcul de votre estimation en cours...</p>
        </div>
      </div>
    );
  }

  if (!estimation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Estimation non trouvée</h2>
          <Button onClick={() => router.push('/estimation')}>
            Retour au formulaire
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Votre estimation est prête !
          </h1>
          {estimation.bien && (
            <div className="flex items-center justify-center text-lg text-gray-600">
              <MapPinIcon className="w-5 h-5 mr-2 text-gray-400" />
              {estimation.bien.adresse}, {estimation.bien.code_postal} {estimation.bien.ville}
            </div>
          )}
        </div>

        {/* Main Estimation Card */}
        <Card className="p-8 mb-6 shadow-xl border-2 border-blue-100">
          <div className="text-center mb-8">
            <div className="text-6xl md:text-7xl font-bold text-blue-600 mb-3">
              {formatPrice(estimation.valeur_estimee)}
            </div>
            <div className="text-xl text-gray-600 mb-6">
              Fourchette estimée : <span className="font-semibold text-gray-900">{formatPrice(estimation.valeur_min)}</span> - <span className="font-semibold text-gray-900">{formatPrice(estimation.valeur_max)}</span>
            </div>
            
            {/* Confidence Badge */}
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getConfidenceColor(estimation.confiance)}`}>
              <ShieldCheckIcon className="w-5 h-5 mr-2" />
              Score de confiance : {estimation.confiance}%
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
              <ChartBarIcon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{estimation.nombre_comparables}</div>
              <div className="text-sm text-gray-600">Comparables analysés</div>
              <div className="text-xs text-gray-500 mt-2">
                Biens similaires dans un rayon de 2km
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center">
              <BuildingOfficeIcon className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <div className="text-lg font-bold text-gray-900 mb-1 capitalize">
                {estimation.methode === 'mixte' && 'Mixte'}
                {estimation.methode === 'comparables_dvf' && 'Transactions DVF'}
                {estimation.methode === 'comparables_offres' && 'Annonces'}
              </div>
              <div className="text-sm text-gray-600">Méthode utilisée</div>
              <div className="text-xs text-gray-500 mt-2">
                {estimation.methode === 'mixte' && 'Combinaison optimale'}
                {estimation.methode === 'comparables_dvf' && 'Données officielles'}
                {estimation.methode === 'comparables_offres' && 'Prix du marché'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center">
              <HomeIcon className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <div className="text-lg font-bold text-gray-900 mb-1">
                {estimation.bien?.surface_totale} m²
              </div>
              <div className="text-sm text-gray-600">Surface analysée</div>
              <div className="text-xs text-gray-500 mt-2">
                Prix au m² : {formatPrice(Math.round(estimation.valeur_estimee / (estimation.bien?.surface_totale || 1)))}
              </div>
            </div>
          </div>

          {/* Bien Characteristics */}
          {estimation.bien && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <InformationCircleIcon className="w-6 h-6 mr-2 text-blue-600" />
                Caractéristiques du bien analysé
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Type</div>
                  <div className="font-semibold text-gray-900">
                    {estimation.bien.type === 'appartement' && 'Appartement'}
                    {estimation.bien.type === 'maison' && 'Maison'}
                    {estimation.bien.type === 'immeuble_bloc' && 'Immeuble'}
                    {estimation.bien.type === 'part_indivise' && 'Part indivise'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Surface</div>
                  <div className="font-semibold text-gray-900">{estimation.bien.surface_totale} m²</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">État</div>
                  <div className="font-semibold text-gray-900 capitalize">{estimation.bien.etat_general}</div>
                </div>
                {estimation.bien.annee_construction && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Année</div>
                    <div className="font-semibold text-gray-900">{estimation.bien.annee_construction}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Algorithm Explanation */}
          {estimation.details && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Comment cette estimation a été calculée ?</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                <div>
                  <div className="font-semibold text-blue-900 mb-1">Prix de référence au m²</div>
                  <div className="text-sm text-blue-800">
                    Médiane des {estimation.nombre_comparables} comparables : <strong>{formatPrice(estimation.details.prix_m2_median || 0)}/m²</strong>
                  </div>
                </div>
                {estimation.details.ajustements && (
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">Ajustements appliqués</div>
                    <div className="text-sm text-blue-800 space-y-1">
                      {estimation.details.ajustements.etat_general && (
                        <div>• État général : {((estimation.details.ajustements.etat_general - 1) * 100).toFixed(0)}%</div>
                      )}
                      {estimation.details.ajustements.annee_construction && (
                        <div>• Année de construction : {((estimation.details.ajustements.annee_construction - 1) * 100).toFixed(0)}%</div>
                      )}
                      {estimation.details.ajustements.dpe && (
                        <div>• DPE : {((estimation.details.ajustements.dpe - 1) * 100).toFixed(0)}%</div>
                      )}
                      {estimation.details.ajustements.occupation && (
                        <div>• Occupation : {((estimation.details.ajustements.occupation - 1) * 100).toFixed(0)}% (vacance commerciale)</div>
                      )}
                      {estimation.details.ajustements.immeuble_bloc && (
                        <div>• Immeuble en bloc : {((estimation.details.ajustements.immeuble_bloc - 1) * 100).toFixed(0)}%</div>
                      )}
                      {estimation.details.ajustements.parts_indivises && (
                        <div>• Parts indivises : {((estimation.details.ajustements.parts_indivises - 1) * 100).toFixed(0)}%</div>
                      )}
                      {estimation.details.ajustements.illiquidite && (
                        <div>• Illiquidité : {((estimation.details.ajustements.illiquidite - 1) * 100).toFixed(0)}%</div>
                      )}
                      {estimation.details.ajustements.quote_part && (
                        <div>• Quote-part appliquée : {(estimation.details.ajustements.quote_part * 100).toFixed(1)}%</div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <div className="font-semibold text-blue-900 mb-1">Fourchette de prix</div>
                  <div className="text-sm text-blue-800">
                    Basée sur les quartiles statistiques (Q1: {formatPrice(estimation.details.prix_m2_min || 0)}/m² - Q3: {formatPrice(estimation.details.prix_m2_max || 0)}/m²)
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Map Section */}
        {estimation.bien && (estimation.bien.latitude || comparables.length > 0) && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <MapPinIcon className="w-6 h-6 mr-2 text-blue-600" />
              Carte des comparables
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Visualisez votre bien (pin vert) et les biens comparables (pins bleus) sur la carte
            </p>
            <PropertyMap
              propertyLat={estimation.bien.latitude || undefined}
              propertyLon={estimation.bien.longitude || undefined}
              propertyAddress={`${estimation.bien.adresse}, ${estimation.bien.code_postal} ${estimation.bien.ville}`}
              comparables={comparables
                .filter(comp => comp.latitude && comp.longitude)
                .map(comp => ({
                  id: comp.id,
                  adresse: comp.adresse,
                  latitude: comp.latitude!,
                  longitude: comp.longitude!,
                  prix: comp.prix,
                  prix_m2: comp.prix_m2,
                  surface: comp.surface,
                  distance_bien: comp.distance_bien,
                }))}
              className="h-[500px] w-full"
            />
          </Card>
        )}

        {/* Charts Section */}
        {comparables.length > 0 && (
          <div className="space-y-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PriceChart
                data={comparables.slice(0, 10).map((comp, index) => ({
                  name: `Comp ${index + 1}`,
                  prix_m2: comp.prix_m2,
                }))}
                medianPrice={estimation.details?.prix_m2_median}
              />
              <ConfidenceGauge value={estimation.confiance} />
            </div>
            
            {/* Graphique d'analyse financière */}
            <FinancialAnalysis
              comparables={comparables}
              estimationValue={estimation.valeur_estimee}
              medianPriceM2={estimation.details?.prix_m2_median}
            />
            
            {/* Graphique d'évolution temporelle si dates disponibles */}
            {comparables.some(c => c.date_transaction || c.date_publication) && (
              <TrendChart
                data={comparables
                  .filter(c => c.date_transaction || c.date_publication)
                  .slice(0, 20)
                  .map(comp => ({
                    date: comp.date_transaction || comp.date_publication || '',
                    prix_m2: comp.prix_m2,
                  }))
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
                medianPrice={estimation.details?.prix_m2_median}
              />
            )}
          </div>
        )}

        {comparables.length > 0 && (
          <Card className="p-6 mb-6">
            <PriceDistribution
              data={[
                { range: '< 3000€', count: comparables.filter(c => c.prix_m2 < 3000).length, prix_m2: 2500 },
                { range: '3000-4000€', count: comparables.filter(c => c.prix_m2 >= 3000 && c.prix_m2 < 4000).length, prix_m2: 3500 },
                { range: '4000-5000€', count: comparables.filter(c => c.prix_m2 >= 4000 && c.prix_m2 < 5000).length, prix_m2: 4500 },
                { range: '5000-6000€', count: comparables.filter(c => c.prix_m2 >= 5000 && c.prix_m2 < 6000).length, prix_m2: 5500 },
                { range: '> 6000€', count: comparables.filter(c => c.prix_m2 >= 6000).length, prix_m2: 6500 },
              ]}
            />
          </Card>
        )}

        {/* Comparables Section */}
        {comparables.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Biens comparables utilisés ({comparables.length})
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Ces biens similaires dans votre secteur ont été analysés pour calculer votre estimation
            </p>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comparables.slice(0, 10).map((comp) => (
                <div key={comp.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{comp.adresse}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {comp.code_postal} {comp.ville}
                        {comp.distance_bien && (
                          <span className="ml-2 text-blue-600">• {comp.distance_bien.toFixed(2)} km</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-700">
                          <strong>{comp.surface} m²</strong>
                        </span>
                        <span className="text-gray-700">
                          <strong>{formatPrice(comp.prix)}</strong>
                        </span>
                        <span className="text-blue-600 font-semibold">
                          {formatPrice(comp.prix_m2)}/m²
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        comp.type === 'transaction' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {comp.type === 'transaction' ? 'Transaction' : 'Offre'}
                      </span>
                      <div className="text-xs text-gray-500 mt-2 capitalize">
                        {comp.source}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {comparables.length > 10 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                {comparables.length - 10} autres comparables analysés...
              </div>
            )}
          </Card>
        )}

        {/* CTA Section */}
        {!showLeadForm ? (
          <Card className="p-8 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <h2 className="text-2xl font-bold mb-3">
              Cette estimation vous intéresse ?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Contactez-nous pour obtenir plus d'informations sur notre fonds d'investissement immobilier 
              ou pour discuter de votre projet d'acquisition.
            </p>
            <Button 
              onClick={() => setShowLeadForm(true)}
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Nous contacter
            </Button>
          </Card>
        ) : (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Formulaire de contact</h2>
            <p className="text-gray-600 mb-6">Remplissez ce formulaire et nous vous recontacterons rapidement</p>
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Prénom"
                  type="text"
                  value={leadData.prenom}
                  onChange={(e) => setLeadData({ ...leadData, prenom: e.target.value })}
                  placeholder="Jean"
                />
                <FormInput
                  label="Nom"
                  type="text"
                  value={leadData.nom}
                  onChange={(e) => setLeadData({ ...leadData, nom: e.target.value })}
                  placeholder="Dupont"
                />
              </div>
              <FormInput
                label="Email *"
                type="email"
                value={leadData.email}
                onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                required
                placeholder="jean.dupont@example.com"
              />
              <FormInput
                label="Téléphone"
                type="tel"
                value={leadData.telephone}
                onChange={(e) => setLeadData({ ...leadData, telephone: e.target.value })}
                placeholder="06 12 34 56 78"
              />
              <FormInput
                label="Budget maximum (€)"
                type="number"
                value={leadData.budget_max || ''}
                onChange={(e) => setLeadData({ ...leadData, budget_max: parseFloat(e.target.value) || undefined })}
                placeholder="500000"
              />
              <div className="flex gap-4">
                <Button type="submit" disabled={leadLoading} className="flex-1" size="lg">
                  {leadLoading ? 'Envoi...' : 'Envoyer ma demande'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowLeadForm(false)}
                  size="lg"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/estimation')}
            size="lg"
          >
            Nouvelle estimation
          </Button>
          <Button
            onClick={() => router.push('/')}
            size="lg"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
