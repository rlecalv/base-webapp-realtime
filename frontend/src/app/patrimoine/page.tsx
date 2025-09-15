'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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
      {/* En-tête élégant */}
      <div className="mb-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
            <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Patrimoine Immobilier
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gestion et suivi de votre portefeuille immobilier
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>
      </div>

      {/* Indicateurs globaux */}
      {synthese && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300">
            <div className="p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-bl-full opacity-10"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">Revenus</Badge>
              </div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Revenus Totaux</h3>
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
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">Portfolio</Badge>
              </div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Valorisation</h3>
              <p className="text-2xl font-bold text-blue-800 mb-1">
                {formatCurrency(synthese.valorisation_totale)}
              </p>
              <p className="text-sm text-blue-600">portefeuille total</p>
            </div>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300">
            <div className="p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-bl-full opacity-10"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
                </div>
                <Badge className="bg-red-100 text-red-700 border-red-200">Dettes</Badge>
              </div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Dettes</h3>
              <p className="text-2xl font-bold text-red-700 mb-1">
                {formatCurrency(synthese.dettes_totales)}
              </p>
              <p className="text-sm text-blue-600">capital restant dû</p>
            </div>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300">
            <div className="p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-bl-full opacity-10"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">LTV</Badge>
              </div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Endettement</h3>
              <p className="text-2xl font-bold text-yellow-700 mb-1">
                {formatPercentage(synthese.ratio_endettement_global)}
              </p>
              <p className="text-sm text-blue-600">ratio LTV</p>
            </div>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => router.push('/patrimoine/new')}
        >
          <div className="w-4 h-4 bg-white rounded-sm opacity-90 mr-2"></div>
          Nouvel Actif
        </Button>
        <Button 
          variant="outline" 
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => router.push('/locataires')}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-sm opacity-90 mr-2"></div>
          Gestion Locataires
        </Button>
        <Button 
          variant="outline" 
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => router.push('/societes')}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-sm opacity-90 mr-2"></div>
          Gestion Sociétés
        </Button>
        <Button 
          variant="outline" 
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => router.push('/financements')}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-sm opacity-90 mr-2"></div>
          Gestion Financements
        </Button>
      </div>

      {/* Liste des actifs */}
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
              </div>
              <h2 className="text-2xl font-bold text-blue-900">
                Actifs Immobiliers ({actifs.length})
              </h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-90 mr-2"></div>
                Exporter
              </Button>
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-90 mr-2"></div>
                Filtrer
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/patrimoine/${actif.id}`)}
                          >
                            👁️ Voir
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/patrimoine/${actif.id}/edit`)}
                          >
                            ✏️ Modifier
                          </Button>
                        </div>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </Card>
      </div>
    </PatrimoineLayout>
  );
}
