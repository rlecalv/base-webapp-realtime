'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import PatrimoineLayout from '@/components/layouts/PatrimoineLayout';

interface Dette {
  id: number;
  numero_contrat: string;
  type_financement: string;
  organisme_preteur: string;
  actif_nom: string;
  actif_adresse: string;
  societe_nom: string;
  montant_emprunte: number;
  capital_restant_du: number;
  taux_interet: number;
  duree_mois: number;
  mensualite: number;
  charge_annuelle: number;
  date_debut: string;
  date_fin: string;
  annees_restantes: number;
  pourcentage_restant: number;
  ratio_service_dette: number;
  statut: string;
}

export default function DettesPage() {
  const [dettes, setDettes] = useState<Dette[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDettes = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/v1/dettes');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des dettes');
        }

        const data = await response.json();
        setDettes(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadDettes();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'rembourse': return 'bg-blue-100 text-blue-800';
      case 'suspendu': return 'bg-yellow-100 text-yellow-800';
      case 'defaillant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRisqueColor = (pourcentage: number) => {
    if (pourcentage <= 30) return 'text-green-600';
    if (pourcentage <= 70) return 'text-yellow-600';
    return 'text-red-600';
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

  const totalDettes = dettes.reduce((sum, dette) => sum + dette.capital_restant_du, 0);
  const totalMensualites = dettes.reduce((sum, dette) => sum + dette.mensualite, 0);

  return (
    <PatrimoineLayout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Gestion des Dettes"
          description={`Suivi de vos ${dettes.length} financements et échéances`}
        />

      {/* Résumé global */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">💰 Capital Restant</h3>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(totalDettes)}
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">📅 Mensualités</h3>
          <p className="text-3xl font-bold text-orange-600">
            {formatCurrency(totalMensualites)}
          </p>
          <p className="text-sm text-gray-500">par mois</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">📊 Charge Annuelle</h3>
          <p className="text-3xl font-bold text-purple-600">
            {formatCurrency(totalMensualites * 12)}
          </p>
          <p className="text-sm text-gray-500">par an</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">🏦 Financements</h3>
          <p className="text-3xl font-bold text-blue-600">
            {dettes.length}
          </p>
          <p className="text-sm text-gray-500">actifs</p>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button className="bg-blue-600 hover:bg-blue-700">
          ➕ Nouveau Financement
        </Button>
        <Button variant="outline">
          📊 Tableau d'Amortissement
        </Button>
        <Button variant="outline">
          ⏰ Échéances Prochaines
        </Button>
      </div>

      {/* Liste des dettes */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left font-semibold">Actif</th>
                <th className="px-4 py-3 text-left font-semibold">Organisme</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-right font-semibold">Emprunté</th>
                <th className="px-4 py-3 text-right font-semibold">CRD</th>
                <th className="px-4 py-3 text-right font-semibold">% Restant</th>
                <th className="px-4 py-3 text-right font-semibold">Taux</th>
                <th className="px-4 py-3 text-right font-semibold">Mensualité</th>
                <th className="px-4 py-3 text-right font-semibold">Échéance</th>
                <th className="px-4 py-3 text-center font-semibold">Statut</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dettes.map((dette) => (
                <tr key={dette.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-800">{dette.actif_nom}</div>
                      <div className="text-sm text-gray-500">{dette.societe_nom}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{dette.organisme_preteur}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {dette.type_financement.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(dette.montant_emprunte)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">
                    {formatCurrency(dette.capital_restant_du)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${getRisqueColor(dette.pourcentage_restant)}`}>
                      {dette.pourcentage_restant ? Number(dette.pourcentage_restant).toFixed(1) : '0.0'}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {dette.taux_interet ? Number(dette.taux_interet).toFixed(2) : '0.00'}%
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(dette.mensualite)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <div className="font-medium">{formatDate(dette.date_fin)}</div>
                      <div className="text-sm text-gray-500">
                        {dette.annees_restantes > 0 ? `${dette.annees_restantes} ans` : 'Échu'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={getStatutColor(dette.statut)}>
                      {dette.statut}
                    </Badge>
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
