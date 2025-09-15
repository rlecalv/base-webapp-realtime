'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import PatrimoineLayout from '@/components/layouts/PatrimoineLayout';

interface Societe {
  id: number;
  nom: string;
  siret: string;
  forme_juridique: string;
  capital_social: number;
  nb_actifs: number;
  nb_contrats_loyer: number;
  surface_totale_patrimoine: number;
  revenus_bruts_totaux: number;
  revenus_nets_totaux: number;
  cash_flow_total: number;
  valorisation_totale: number;
  dettes_totales: number;
  ratio_endettement_global: number;
  rendement_net_global: number;
}

export default function SocietesPage() {
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSocietes = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/v1/societes');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des sociétés');
        }

        const data = await response.json();
        setSocietes(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadSocietes();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
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
          🏢 Gestion des Sociétés
        </h1>
        <p className="text-gray-600">
          Portfolio de vos {societes.length} sociétés propriétaires
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button className="bg-blue-600 hover:bg-blue-700">
          ➕ Nouvelle Société
        </Button>
        <Button variant="outline">
          📊 Rapport Consolidé
        </Button>
        <Button variant="outline">
          🔍 Filtrer
        </Button>
      </div>

      {/* Grille des sociétés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {societes.map((societe) => (
          <Card key={societe.id} className="p-6 hover:shadow-lg transition-shadow">
            {/* En-tête société */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {societe.nom}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline">{societe.forme_juridique}</Badge>
                {societe.siret && (
                  <Badge variant="outline" className="text-xs">
                    SIRET: {societe.siret}
                  </Badge>
                )}
              </div>
            </div>

            {/* Métriques principales */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenus annuels :</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(societe.revenus_bruts_totaux)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valorisation :</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(societe.valorisation_totale)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cash Flow :</span>
                <span className={`font-bold ${
                  societe.cash_flow_total >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(societe.cash_flow_total)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Endettement :</span>
                <span className={`font-bold ${
                  societe.ratio_endettement_global <= 50 ? 'text-green-600' :
                  societe.ratio_endettement_global <= 80 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {formatPercentage(societe.ratio_endettement_global)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rendement net :</span>
                <span className="font-bold text-purple-600">
                  {formatPercentage(societe.rendement_net_global)}
                </span>
              </div>
            </div>

            {/* Statistiques patrimoine */}
            <div className="border-t pt-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {societe.nb_actifs}
                  </div>
                  <div className="text-xs text-gray-500">Actifs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {societe.nb_contrats_loyer}
                  </div>
                  <div className="text-xs text-gray-500">Contrats</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {societe.surface_totale_patrimoine?.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500">m²</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                👁️ Détail
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                ✏️ Modifier
              </Button>
              <Button size="sm" variant="outline">
                📊
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Résumé global */}
      <Card className="p-6 mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📊 Résumé Global du Portfolio
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(societes.reduce((sum, s) => sum + s.revenus_bruts_totaux, 0))}
            </div>
            <div className="text-sm text-gray-500">Revenus Totaux</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(societes.reduce((sum, s) => sum + s.valorisation_totale, 0))}
            </div>
            <div className="text-sm text-gray-500">Valorisation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(societes.reduce((sum, s) => sum + s.dettes_totales, 0))}
            </div>
            <div className="text-sm text-gray-500">Dettes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {societes.reduce((sum, s) => sum + s.nb_actifs, 0)}
            </div>
            <div className="text-sm text-gray-500">Actifs Totaux</div>
          </div>
        </div>
      </Card>
      </div>
    </PatrimoineLayout>
  );
}
