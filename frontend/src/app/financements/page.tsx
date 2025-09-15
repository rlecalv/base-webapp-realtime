'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import PatrimoineLayout from '@/components/layouts/PatrimoineLayout';

interface Financement {
  id: number;
  actif_nom: string;
  actif_ville: string;
  societe_nom: string;
  organisme_preteur: string;
  montant_emprunte: number;
  capital_restant_du: number;
  taux_interet: number;
  duree_mois: number;
  mensualite: number;
  date_debut: string;
  date_fin_prevue: string;
  statut: 'actif' | 'soldé' | 'suspendu';
  pourcentage_rembourse: number;
}

export default function FinancementsPage() {
  const router = useRouter();
  const [financements, setFinancements] = useState<Financement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFinancements = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/v1/financements');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des financements');
        }

        const data = await response.json();
        setFinancements(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        console.error('Erreur chargement financements:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFinancements();
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00%';
    }
    return `${Number(value).toFixed(2)}%`;
  };

  // Calculs des statistiques
  const totalEmprunte = financements.reduce((sum, f) => sum + f.montant_emprunte, 0);
  const totalRestantDu = financements.reduce((sum, f) => sum + f.capital_restant_du, 0);
  const totalMensualites = financements.filter(f => f.statut === 'actif').reduce((sum, f) => sum + f.mensualite, 0);
  const financementsActifs = financements.filter(f => f.statut === 'actif').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <PatrimoineLayout>
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
      </PatrimoineLayout>
    );
  }

  return (
    <PatrimoineLayout>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-6 shadow-lg">
              <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              🏦 Gestion des Financements
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Suivez vos emprunts et leurs remboursements
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-red-600 mx-auto mt-6 rounded-full"></div>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">💰 Total Emprunté</h3>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(totalEmprunte)}
            </p>
            <p className="text-sm text-gray-500">montant initial</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">🏦 Capital Restant</h3>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(totalRestantDu)}
            </p>
            <p className="text-sm text-gray-500">à rembourser</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📅 Mensualités</h3>
            <p className="text-3xl font-bold text-orange-600">
              {formatCurrency(totalMensualites)}
            </p>
            <p className="text-sm text-gray-500">par mois</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">✅ Financements Actifs</h3>
            <p className="text-3xl font-bold text-green-600">
              {financementsActifs}
            </p>
            <p className="text-sm text-gray-500">sur {financements.length} total</p>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => router.push('/financements/new')}
          >
            ➕ Nouveau Financement
          </Button>
          <Button variant="outline">
            📊 Exporter
          </Button>
          <Button variant="outline">
            📈 Tableau d'amortissement
          </Button>
        </div>

        {/* Liste des financements */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🏦 Financements ({financements.length})
            </h2>
          </div>

          {financements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold">Bien Financé</th>
                    <th className="px-4 py-3 text-left font-semibold">Organisme</th>
                    <th className="px-4 py-3 text-right font-semibold">Montant Initial</th>
                    <th className="px-4 py-3 text-right font-semibold">Capital Restant</th>
                    <th className="px-4 py-3 text-right font-semibold">Taux</th>
                    <th className="px-4 py-3 text-right font-semibold">Mensualité</th>
                    <th className="px-4 py-3 text-right font-semibold">% Remboursé</th>
                    <th className="px-4 py-3 text-center font-semibold">Statut</th>
                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {financements.map((financement) => (
                    <tr key={financement.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-800">{financement.actif_nom}</div>
                          <div className="text-sm text-gray-500">{financement.actif_ville}</div>
                          <div className="text-xs text-gray-400">{financement.societe_nom}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{financement.organisme_preteur}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(financement.montant_emprunte)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">
                        {formatCurrency(financement.capital_restant_du)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatPercentage(financement.taux_interet)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-orange-600">
                        {formatCurrency(financement.mensualite)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(financement.pourcentage_rembourse, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {formatPercentage(financement.pourcentage_rembourse)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge 
                          variant={
                            financement.statut === 'actif' ? 'success' :
                            financement.statut === 'soldé' ? 'secondary' : 'warning'
                          }
                        >
                          {financement.statut}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/financements/${financement.id}`)}
                          >
                            👁️ Voir
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/financements/${financement.id}/edit`)}
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
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🏦</div>
              <h3 className="text-xl font-semibold mb-2">Aucun financement enregistré</h3>
              <p className="mb-6">Commencez par ajouter votre premier financement</p>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => router.push('/financements/new')}
              >
                ➕ Ajouter un financement
              </Button>
            </div>
          )}
        </Card>
      </div>
    </PatrimoineLayout>
  );
}
