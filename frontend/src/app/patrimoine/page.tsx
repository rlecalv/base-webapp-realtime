'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import PatrimoineLayout from '@/components/layouts/PatrimoineLayout';

interface ActifPatrimoine {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  type_bien: string;
  societe_proprietaire: string;
  surface_totale: number;
  nb_locataires: number;
  revenus_annuels: number;
  valorisation: number;
  ratio_endettement: number;
  rendement_brut: number;
  cash_flow_net: number;
}

interface SyntheseGlobale {
  nb_actifs: number;
  nb_locataires: number;
  nb_societes: number;
  revenus_bruts_totaux: number;
  valorisation_totale: number;
  dettes_totales: number;
  ratio_endettement_global: number;
  rendement_net_global: number;
}

export default function PatrimoinePage() {
  const [actifs, setActifs] = useState<ActifPatrimoine[]>([]);
  const [synthese, setSynthese] = useState<SyntheseGlobale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les données depuis l'API backend
        const [actifsRes, syntheseRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/patrimoine'),
          fetch('http://localhost:8000/api/v1/synthese')
        ]);

        if (!actifsRes.ok || !syntheseRes.ok) {
          throw new Error('Erreur lors du chargement des données');
        }

        const actifsData = await actifsRes.json();
        const syntheseData = await syntheseRes.json();

        setActifs(actifsData.data || []);
        setSynthese(syntheseData.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        console.error('Erreur chargement données:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Réessayer
          </Button>
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
          📊 Patrimoine Immobilier
        </h1>
        <p className="text-gray-600">
          Gestion et suivi de votre portefeuille immobilier
        </p>
      </div>

      {/* Indicateurs globaux */}
      {synthese && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">💵 Revenus Totaux</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(synthese.revenus_bruts_totaux)}
            </p>
            <p className="text-sm text-gray-500">par an</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">🏠 Valorisation</h3>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(synthese.valorisation_totale)}
            </p>
            <p className="text-sm text-gray-500">portefeuille total</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">🏦 Dettes</h3>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(synthese.dettes_totales)}
            </p>
            <p className="text-sm text-gray-500">capital restant dû</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📈 Endettement</h3>
            <p className="text-3xl font-bold text-orange-600">
              {formatPercentage(synthese.ratio_endettement_global)}
            </p>
            <p className="text-sm text-gray-500">ratio LTV</p>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button className="bg-blue-600 hover:bg-blue-700">
          ➕ Nouvel Actif
        </Button>
        <Button variant="outline">
          👥 Gestion Locataires
        </Button>
        <Button variant="outline">
          🏢 Gestion Sociétés
        </Button>
        <Button variant="outline">
          🏦 Gestion Dettes
        </Button>
      </div>

      {/* Liste des actifs */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🏢 Actifs Immobiliers ({actifs.length})
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              📊 Exporter
            </Button>
            <Button variant="outline" size="sm">
              🔍 Filtrer
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left font-semibold">Actif</th>
                <th className="px-4 py-3 text-left font-semibold">Société</th>
                <th className="px-4 py-3 text-right font-semibold">Surface</th>
                <th className="px-4 py-3 text-right font-semibold">Locataires</th>
                <th className="px-4 py-3 text-right font-semibold">Revenus/an</th>
                <th className="px-4 py-3 text-right font-semibold">Valorisation</th>
                <th className="px-4 py-3 text-right font-semibold">Rendement</th>
                <th className="px-4 py-3 text-right font-semibold">Endettement</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {actifs.map((actif) => (
                <tr key={actif.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-800">{actif.nom}</div>
                      <div className="text-sm text-gray-500">{actif.ville}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{actif.societe_proprietaire}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {actif.surface_totale ? `${Number(actif.surface_totale).toFixed(0)} m²` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge>{actif.nb_locataires}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">
                    {formatCurrency(actif.revenus_annuels)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(actif.valorisation)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${
                      actif.rendement_brut >= 8 ? 'text-green-600' :
                      actif.rendement_brut >= 5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(actif.rendement_brut)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${
                      actif.ratio_endettement <= 50 ? 'text-green-600' :
                      actif.ratio_endettement <= 80 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(actif.ratio_endettement)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" variant="outline">
                        👁️ Voir
                      </Button>
                      <Button size="sm" variant="outline">
                        ✏️ Modifier
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </PatrimoineLayout>
  );
}
