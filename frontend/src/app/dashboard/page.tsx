'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';

interface SyntheseGlobale {
  nb_societes: number;
  nb_actifs: number;
  nb_locataires: number;
  nb_contrats_loyer: number;
  nb_financements: number;
  surface_totale_patrimoine: number;
  revenus_bruts_totaux: number;
  revenus_nets_totaux: number;
  cash_flow_total: number;
  valorisation_totale: number;
  dettes_totales: number;
  ratio_endettement_global: number;
  rendement_net_global: number;
}

interface TopActif {
  nom: string;
  ville: string;
  societe: string;
  valeur: number;
  unite: string;
}

interface Echeance {
  type_echeance: string;
  date_echeance: string;
  jours_restants: number;
  locataire: string;
  actif: string;
  loyer_annuel: number;
  action_requise: string;
}

import PatrimoineLayout from '@/components/layouts/PatrimoineLayout';

export default function DashboardPage() {
  const [synthese, setSynthese] = useState<SyntheseGlobale | null>(null);
  const [topActifs, setTopActifs] = useState<TopActif[]>([]);
  const [echeances, setEcheances] = useState<Echeance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        const [syntheseRes, echeancesRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/synthese'),
          fetch('http://localhost:8000/api/v1/echeances')
        ]);

        if (!syntheseRes.ok || !echeancesRes.ok) {
          throw new Error('Erreur lors du chargement des données');
        }

        const syntheseData = await syntheseRes.json();
        const echeancesData = await echeancesRes.json();

        setSynthese(syntheseData.data);
        setEcheances(echeancesData.data || []);
        
        // Simuler les top actifs depuis les données existantes
        setTopActifs([
          { nom: 'Local commercial - Avignon', ville: 'Avignon', societe: 'SAS FINANCIERE VOLNEY', valeur: 429812, unite: '€/an' },
          { nom: 'Local commercial - Anglet', ville: 'Anglet', societe: 'SCI FONCIERE AGA', valeur: 345310, unite: '€/an' },
          { nom: 'Local commercial - Osny', ville: 'Osny', societe: 'SAS B2A', valeur: 273164, unite: '€/an' },
          { nom: 'Locaux commerciaux - Cormeilles', ville: 'Cormeilles-en-Parisis', societe: 'SCI FONCIERE AGA', valeur: 258210, unite: '€/an' },
          { nom: 'Local commercial - Vitrolles', ville: 'Vitrolles', societe: 'SCI W2A', valeur: 254597, unite: '€/an' }
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0 €';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(value));
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00%';
    }
    return `${Number(value).toFixed(2)}%`;
  };

  const formatSurface = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0';
    }
    return Number(value).toFixed(0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <PatrimoineLayout>
      <div className="container mx-auto px-4 py-8">
      {/* En-tête élégant */}
      <div className="mb-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
            <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Tableau de Bord Patrimonial
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vue d'ensemble complète de votre portefeuille immobilier
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>
      </div>

      {/* Indicateurs principaux */}
      {synthese && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300">
            <div className="p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-bl-full opacity-10"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">Revenus</Badge>
              </div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Revenus Bruts</h3>
              <p className="text-2xl font-bold text-blue-800 mb-1">
                {formatCurrency(synthese.revenus_bruts_totaux)}
              </p>
              <p className="text-sm text-blue-600">par an</p>
            </div>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300">
            <div className="p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-bl-full opacity-10"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
                </div>
                <Badge className={`${
                  synthese.cash_flow_total >= 0 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {synthese.cash_flow_total >= 0 ? 'Positif' : 'Négatif'}
                </Badge>
              </div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Cash Flow</h3>
              <p className={`text-2xl font-bold mb-1 ${
                synthese.cash_flow_total >= 0 ? 'text-blue-800' : 'text-red-700'
              }`}>
                {formatCurrency(synthese.cash_flow_total)}
              </p>
              <p className="text-sm text-blue-600">net annuel</p>
            </div>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300">
            <div className="p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-bl-full opacity-10"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">Portfolio</Badge>
              </div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Valorisation</h3>
              <p className="text-2xl font-bold text-blue-800 mb-1">
                {formatCurrency(synthese.valorisation_totale)}
              </p>
              <p className="text-sm text-blue-600">estimée</p>
            </div>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300">
            <div className="p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-bl-full opacity-10"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">Excellent</Badge>
              </div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Rendement</h3>
              <p className="text-2xl font-bold text-blue-800 mb-1">
                {formatPercentage(synthese.rendement_net_global)}
              </p>
              <p className="text-sm text-blue-600">net global</p>
            </div>
          </Card>
        </div>
      )}

      {/* Statistiques patrimoine */}
      {synthese && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          <Card className="bg-white hover:bg-blue-50 transition-all duration-300 border border-blue-100 hover:border-blue-200 hover:shadow-lg">
            <div className="p-5 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-md opacity-90"></div>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">{synthese.nb_societes}</div>
              <div className="text-sm text-blue-600 font-medium">Sociétés</div>
            </div>
          </Card>
          <Card className="bg-white hover:bg-blue-50 transition-all duration-300 border border-blue-100 hover:border-blue-200 hover:shadow-lg">
            <div className="p-5 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-md opacity-90"></div>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">{synthese.nb_actifs}</div>
              <div className="text-sm text-blue-600 font-medium">Actifs</div>
            </div>
          </Card>
          <Card className="bg-white hover:bg-blue-50 transition-all duration-300 border border-blue-100 hover:border-blue-200 hover:shadow-lg">
            <div className="p-5 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-md opacity-90"></div>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">{synthese.nb_locataires}</div>
              <div className="text-sm text-blue-600 font-medium">Locataires</div>
            </div>
          </Card>
          <Card className="bg-white hover:bg-blue-50 transition-all duration-300 border border-blue-100 hover:border-blue-200 hover:shadow-lg">
            <div className="p-5 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-md opacity-90"></div>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">{synthese.nb_contrats_loyer}</div>
              <div className="text-sm text-blue-600 font-medium">Contrats</div>
            </div>
          </Card>
          <Card className="bg-white hover:bg-blue-50 transition-all duration-300 border border-blue-100 hover:border-blue-200 hover:shadow-lg">
            <div className="p-5 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-md opacity-90"></div>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {formatSurface(synthese.surface_totale_patrimoine)}
              </div>
              <div className="text-sm text-blue-600 font-medium">m² totaux</div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 5 Actifs */}
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">
                    Top 5 Actifs par Revenus
                  </h2>
                  <p className="text-sm text-blue-600">Meilleurs performers du portefeuille</p>
                </div>
              </div>
              <Link href="/patrimoine">
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  Voir tout
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {topActifs.map((actif, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-100 hover:shadow-md hover:border-blue-200 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white' :
                      index === 2 ? 'bg-gradient-to-br from-blue-300 to-blue-400 text-white' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900 text-sm">
                        {actif.nom}
                      </div>
                      <div className="text-xs text-blue-600">{actif.ville} • {actif.societe}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-800 text-sm">
                      {formatCurrency(actif.valeur)}
                    </div>
                    <div className="text-xs text-blue-500">{actif.unite}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Échéances prochaines */}
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">
                    Échéances Prochaines
                  </h2>
                  <p className="text-sm text-blue-600">Actions requises sous 90 jours</p>
                </div>
              </div>
              <Link href="/dettes">
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  Voir tout
                </Button>
              </Link>
            </div>
            {echeances.length > 0 ? (
              <div className="space-y-3">
                {echeances.slice(0, 5).map((echeance, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-100 hover:shadow-md hover:border-blue-200 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        echeance.jours_restants <= 30 ? 'bg-red-100' :
                        echeance.jours_restants <= 90 ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <div className={`w-5 h-5 rounded-md ${
                          echeance.jours_restants <= 30 ? 'bg-red-500' :
                          echeance.jours_restants <= 90 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-900 text-sm">
                          {echeance.locataire}
                        </div>
                        <div className="text-xs text-blue-600">{echeance.actif}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-sm ${
                        echeance.jours_restants <= 30 ? 'text-red-600' :
                        echeance.jours_restants <= 90 ? 'text-yellow-600' : 'text-blue-700'
                      }`}>
                        {echeance.jours_restants} jours
                      </div>
                      <div className="text-xs text-blue-500">
                        {new Date(echeance.date_echeance).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 bg-green-500 rounded-md"></div>
                </div>
                <p className="text-blue-800 font-medium">
                  Aucune échéance dans les 2 prochaines années
                </p>
                <p className="text-sm text-blue-600">Votre portefeuille est à jour</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card className="mt-12 bg-gradient-to-br from-blue-50 to-white border-blue-200">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              Actions Rapides
            </h2>
            <p className="text-blue-600">Accès direct aux fonctionnalités principales</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/patrimoine">
              <Card className="h-28 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-blue-100 hover:border-blue-200 group">
                <div className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-5 h-5 bg-white rounded-md opacity-90"></div>
                  </div>
                  <span className="text-sm font-semibold text-blue-800">Gérer Actifs</span>
                </div>
              </Card>
            </Link>
            <Link href="/locataires">
              <Card className="h-28 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-blue-100 hover:border-blue-200 group">
                <div className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-5 h-5 bg-white rounded-md opacity-90"></div>
                  </div>
                  <span className="text-sm font-semibold text-blue-800">Gérer Locataires</span>
                </div>
              </Card>
            </Link>
            <Link href="/societes">
              <Card className="h-28 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-blue-100 hover:border-blue-200 group">
                <div className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-5 h-5 bg-white rounded-md opacity-90"></div>
                  </div>
                  <span className="text-sm font-semibold text-blue-800">Gérer Sociétés</span>
                </div>
              </Card>
            </Link>
            <Link href="/dettes">
              <Card className="h-28 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-blue-100 hover:border-blue-200 group">
                <div className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-5 h-5 bg-white rounded-md opacity-90"></div>
                  </div>
                  <span className="text-sm font-semibold text-blue-800">Gérer Dettes</span>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </Card>

      {/* Ratios et alertes */}
      {synthese && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
                </div>
                <h3 className="text-xl font-bold text-blue-900">
                  Ratios Financiers
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                  <span className="text-blue-800 font-medium">Ratio d'endettement (LTV) :</span>
                  <span className={`font-bold text-lg ${
                    synthese.ratio_endettement_global <= 50 ? 'text-green-600' :
                    synthese.ratio_endettement_global <= 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(synthese.ratio_endettement_global)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                  <span className="text-blue-800 font-medium">Rendement net global :</span>
                  <span className="font-bold text-lg text-blue-700">
                    {formatPercentage(synthese.rendement_net_global)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                  <span className="text-blue-800 font-medium">Taux de couverture :</span>
                  <span className={`font-bold text-lg ${
                    Math.abs(synthese.cash_flow_total) <= synthese.revenus_nets_totaux * 0.3 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {((synthese.revenus_nets_totaux - Math.abs(synthese.cash_flow_total)) / synthese.revenus_nets_totaux * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
                </div>
                <h3 className="text-xl font-bold text-blue-900">
                  Alertes et Recommandations
                </h3>
              </div>
              <div className="space-y-4">
                {synthese.ratio_endettement_global > 80 && (
                  <div className="flex items-start gap-3 p-4 bg-white border border-red-200 rounded-xl">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 bg-red-500 rounded-md"></div>
                    </div>
                    <div>
                      <div className="font-semibold text-red-800">Endettement élevé</div>
                      <div className="text-sm text-red-600 mt-1">
                        Le ratio LTV de {formatPercentage(synthese.ratio_endettement_global)} dépasse 80%
                      </div>
                    </div>
                  </div>
                )}
                
                {synthese.cash_flow_total < 0 && (
                  <div className="flex items-start gap-3 p-4 bg-white border border-yellow-200 rounded-xl">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 bg-yellow-500 rounded-md"></div>
                    </div>
                    <div>
                      <div className="font-semibold text-yellow-800">Cash Flow négatif</div>
                      <div className="text-sm text-yellow-600 mt-1">
                        Optimiser la gestion ou renégocier les financements
                      </div>
                    </div>
                  </div>
                )}
                
                {echeances.filter(e => e.jours_restants <= 90).length > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-white border border-blue-200 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 bg-blue-500 rounded-md"></div>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-800">Échéances prochaines</div>
                      <div className="text-sm text-blue-600 mt-1">
                        {echeances.filter(e => e.jours_restants <= 90).length} échéance(s) dans les 3 mois
                      </div>
                    </div>
                  </div>
                )}
                
                {synthese.rendement_net_global > 8 && (
                  <div className="flex items-start gap-3 p-4 bg-white border border-green-200 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 bg-green-500 rounded-md"></div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-800">Excellent rendement</div>
                      <div className="text-sm text-green-600 mt-1">
                        Rendement de {formatPercentage(synthese.rendement_net_global)} au-dessus de la moyenne
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        <Link href="/patrimoine">
          <Card className="bg-white border-blue-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Patrimoine</h3>
              <p className="text-sm text-blue-600">
                {synthese?.nb_actifs} actifs
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/locataires">
          <Card className="bg-white border-blue-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Locataires</h3>
              <p className="text-sm text-blue-600">
                {synthese?.nb_locataires} locataires
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/societes">
          <Card className="bg-white border-blue-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Sociétés</h3>
              <p className="text-sm text-blue-600">
                {synthese?.nb_societes} sociétés
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/dettes">
          <Card className="bg-white border-blue-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Dettes</h3>
              <p className="text-sm text-blue-600">
                {synthese?.nb_financements} financements
              </p>
            </div>
          </Card>
        </Link>
      </div>
      </div>
    </PatrimoineLayout>
  );
}
