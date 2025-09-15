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
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          📊 Tableau de Bord Patrimonial
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de votre portefeuille immobilier
        </p>
      </div>

      {/* Indicateurs principaux */}
      {synthese && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">💵 Revenus Bruts</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(synthese.revenus_bruts_totaux)}
            </p>
            <p className="text-sm text-gray-500">par an</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">💰 Cash Flow</h3>
            <p className={`text-3xl font-bold ${
              synthese.cash_flow_total >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(synthese.cash_flow_total)}
            </p>
            <p className="text-sm text-gray-500">net annuel</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">🏠 Valorisation</h3>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(synthese.valorisation_totale)}
            </p>
            <p className="text-sm text-gray-500">portefeuille</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📈 Rendement</h3>
            <p className="text-3xl font-bold text-purple-600">
              {formatPercentage(synthese.rendement_net_global)}
            </p>
            <p className="text-sm text-gray-500">net global</p>
          </Card>
        </div>
      )}

      {/* Statistiques patrimoine */}
      {synthese && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-800">{synthese.nb_societes}</div>
            <div className="text-sm text-gray-500">Sociétés</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-800">{synthese.nb_actifs}</div>
            <div className="text-sm text-gray-500">Actifs</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-800">{synthese.nb_locataires}</div>
            <div className="text-sm text-gray-500">Locataires</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-800">{synthese.nb_contrats_loyer}</div>
            <div className="text-sm text-gray-500">Contrats</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-800">
              {synthese.surface_totale_patrimoine?.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500">m² totaux</div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 5 Actifs */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              🏆 Top 5 Actifs par Revenus
            </h2>
            <Link href="/patrimoine">
              <Button variant="outline" size="sm">Voir tout</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {topActifs.map((actif, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'} {actif.nom}
                  </div>
                  <div className="text-sm text-gray-500">{actif.ville} • {actif.societe}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {formatCurrency(actif.valeur)}
                  </div>
                  <div className="text-xs text-gray-500">{actif.unite}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Échéances prochaines */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              ⏰ Échéances Prochaines
            </h2>
            <Link href="/dettes">
              <Button variant="outline" size="sm">Voir tout</Button>
            </Link>
          </div>
          {echeances.length > 0 ? (
            <div className="space-y-3">
              {echeances.slice(0, 5).map((echeance, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">
                      {echeance.type_echeance === 'Fin de bail' ? '📄' : '🏦'} {echeance.locataire}
                    </div>
                    <div className="text-sm text-gray-500">{echeance.actif}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      echeance.jours_restants <= 30 ? 'text-red-600' :
                      echeance.jours_restants <= 90 ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {echeance.jours_restants} jours
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(echeance.date_echeance).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Aucune échéance dans les 2 prochaines années
            </p>
          )}
        </Card>
      </div>

      {/* Actions rapides */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          🚀 Actions Rapides
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/patrimoine">
            <Button className="w-full h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-1">🏢</span>
              <span className="text-sm">Gérer Actifs</span>
            </Button>
          </Link>
          <Link href="/locataires">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-1">👥</span>
              <span className="text-sm">Gérer Locataires</span>
            </Button>
          </Link>
          <Link href="/societes">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-1">🏛️</span>
              <span className="text-sm">Gérer Sociétés</span>
            </Button>
          </Link>
          <Link href="/dettes">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-1">🏦</span>
              <span className="text-sm">Gérer Dettes</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Ratios et alertes */}
      {synthese && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📊 Ratios Financiers
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ratio d'endettement (LTV) :</span>
                <span className={`font-bold text-lg ${
                  synthese.ratio_endettement_global <= 50 ? 'text-green-600' :
                  synthese.ratio_endettement_global <= 80 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {formatPercentage(synthese.ratio_endettement_global)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rendement net global :</span>
                <span className="font-bold text-lg text-purple-600">
                  {formatPercentage(synthese.rendement_net_global)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taux de couverture :</span>
                <span className={`font-bold text-lg ${
                  Math.abs(synthese.cash_flow_total) <= synthese.revenus_nets_totaux * 0.3 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {((synthese.revenus_nets_totaux - Math.abs(synthese.cash_flow_total)) / synthese.revenus_nets_totaux * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              🚨 Alertes et Recommandations
            </h3>
            <div className="space-y-3">
              {synthese.ratio_endettement_global > 80 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-600">⚠️</span>
                  <div>
                    <div className="font-medium text-red-800">Endettement élevé</div>
                    <div className="text-sm text-red-600">
                      Le ratio LTV de {formatPercentage(synthese.ratio_endettement_global)} dépasse 80%
                    </div>
                  </div>
                </div>
              )}
              
              {synthese.cash_flow_total < 0 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-yellow-600">💡</span>
                  <div>
                    <div className="font-medium text-yellow-800">Cash Flow négatif</div>
                    <div className="text-sm text-yellow-600">
                      Optimiser la gestion ou renégocier les financements
                    </div>
                  </div>
                </div>
              )}
              
              {echeances.filter(e => e.jours_restants <= 90).length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-600">📅</span>
                  <div>
                    <div className="font-medium text-blue-800">Échéances prochaines</div>
                    <div className="text-sm text-blue-600">
                      {echeances.filter(e => e.jours_restants <= 90).length} échéance(s) dans les 3 mois
                    </div>
                  </div>
                </div>
              )}
              
              {synthese.rendement_net_global > 8 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-600">🎯</span>
                  <div>
                    <div className="font-medium text-green-800">Excellent rendement</div>
                    <div className="text-sm text-green-600">
                      Rendement de {formatPercentage(synthese.rendement_net_global)} au-dessus de la moyenne
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Navigation rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/patrimoine">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-2">🏢</div>
              <h3 className="text-lg font-semibold text-gray-800">Patrimoine</h3>
              <p className="text-sm text-gray-600">
                {synthese?.nb_actifs} actifs
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/locataires">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-2">👥</div>
              <h3 className="text-lg font-semibold text-gray-800">Locataires</h3>
              <p className="text-sm text-gray-600">
                {synthese?.nb_locataires} locataires
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/societes">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-2">🏛️</div>
              <h3 className="text-lg font-semibold text-gray-800">Sociétés</h3>
              <p className="text-sm text-gray-600">
                {synthese?.nb_societes} sociétés
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/dettes">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-2">🏦</div>
              <h3 className="text-lg font-semibold text-gray-800">Dettes</h3>
              <p className="text-sm text-gray-600">
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
