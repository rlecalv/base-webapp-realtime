'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import PatrimoineLayout from '@/components/layouts/PatrimoineLayout';

interface DetailPatrimoine {
  actif_id: number;
  actif_nom: string;
  adresse: string;
  ville: string;
  type_bien: string;
  surface_totale: number;
  surface_louable: number;
  nombre_lots: number;
  date_acquisition: string;
  prix_acquisition: number;
  valeur_actuelle: number;
  societe_nom: string;
  forme_juridique: string;
  locataire_nom: string;
  profession: string;
  type_bail: string;
  duree_bail: number;
  montant_loyer_mensuel: number;
  loyer_annuel: number;
  taux_capitalisation: number;
  bail_statut: string;
  valeur_estimee: number;
  methode_evaluation: string;
  prix_m2: number;
  montant_emprunte: number;
  capital_restant_du: number;
  taux_interet: number;
  organisme_preteur: string;
  revenus_locatifs_bruts: number;
  cash_flow_net: number;
  rentabilite_nette: number;
  ratio_endettement_calcule: number;
}

export default function DetailPatrimoinePage() {
  const params = useParams();
  const [details, setDetails] = useState<DetailPatrimoine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/v1/patrimoine/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Actif non trouvé');
        }

        const data = await response.json();
        setDetails(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadDetail();
    }
  }, [params.id]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error || details.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Actif non trouvé</h2>
          <p className="text-gray-600">{error}</p>
          <Button 
            onClick={() => window.history.back()} 
            className="mt-4"
          >
            ← Retour
          </Button>
        </Card>
      </div>
    );
  }

  const actif = details[0]; // Premier enregistrement pour les infos générales

  return (
    <PatrimoineLayout>
      <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🏢 {actif.actif_nom}
          </h1>
          <p className="text-gray-600">{actif.adresse}</p>
          <Badge className="mt-2">{actif.societe_nom}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">✏️ Modifier</Button>
          <Button variant="outline">📊 Exporter</Button>
          <Button onClick={() => window.history.back()}>← Retour</Button>
        </div>
      </div>

      {/* Informations générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">🏠 Informations Bien</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Type :</span>
              <span className="font-medium">{actif.type_bien}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Surface totale :</span>
              <span className="font-medium">{actif.surface_totale ? Number(actif.surface_totale).toFixed(0) : '0'} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Surface louable :</span>
              <span className="font-medium">{actif.surface_louable ? Number(actif.surface_louable).toFixed(0) : '0'} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nombre de lots :</span>
              <span className="font-medium">{actif.nombre_lots}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date acquisition :</span>
              <span className="font-medium">
                {actif.date_acquisition ? formatDate(actif.date_acquisition) : '-'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">💰 Financier</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Prix acquisition :</span>
              <span className="font-medium">{formatCurrency(actif.prix_acquisition || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valeur actuelle :</span>
              <span className="font-medium">{formatCurrency(actif.valeur_estimee || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prix au m² :</span>
              <span className="font-medium">{actif.prix_m2 ? Number(actif.prix_m2).toFixed(0) : '0'} €/m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Revenus bruts :</span>
              <span className="font-medium text-green-600">{formatCurrency(actif.revenus_locatifs_bruts)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cash Flow net :</span>
              <span className={`font-medium ${actif.cash_flow_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(actif.cash_flow_net)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">📈 Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Rentabilité nette :</span>
              <span className="font-medium text-green-600">
                {actif.rentabilite_nette ? Number(actif.rentabilite_nette).toFixed(2) : '0.00'}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ratio endettement :</span>
              <span className={`font-medium ${
                actif.ratio_endettement_calcule <= 50 ? 'text-green-600' :
                actif.ratio_endettement_calcule <= 80 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {actif.ratio_endettement_calcule ? Number(actif.ratio_endettement_calcule).toFixed(2) : '0.00'}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Méthode évaluation :</span>
              <span className="font-medium">{actif.methode_evaluation}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Locataires */}
      <Card className="p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          👥 Locataires ({details.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Locataire</th>
                <th className="px-4 py-2 text-left">Profession</th>
                <th className="px-4 py-2 text-left">Type Bail</th>
                <th className="px-4 py-2 text-right">Durée</th>
                <th className="px-4 py-2 text-right">Loyer/mois</th>
                <th className="px-4 py-2 text-right">Loyer/an</th>
                <th className="px-4 py-2 text-right">Taux Cap.</th>
                <th className="px-4 py-2 text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2 font-medium">{detail.locataire_nom}</td>
                  <td className="px-4 py-2">{detail.profession || '-'}</td>
                  <td className="px-4 py-2">
                    <Badge variant="outline">{detail.type_bail}</Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {detail.duree_bail ? `${detail.duree_bail} mois` : '-'}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(detail.montant_loyer_mensuel)}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-green-600">
                    {formatCurrency(detail.loyer_annuel)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {detail.taux_capitalisation ? `${detail.taux_capitalisation}%` : '-'}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Badge 
                      className={
                        detail.bail_statut === 'actif' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {detail.bail_statut}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Financement */}
      {actif.montant_emprunte > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🏦 Financement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Organisme prêteur :</span>
                <span className="font-medium">{actif.organisme_preteur}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant emprunté :</span>
                <span className="font-medium">{formatCurrency(actif.montant_emprunte)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Capital restant dû :</span>
                <span className="font-medium text-red-600">{formatCurrency(actif.capital_restant_du)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Taux d&apos;intérêt :</span>
                <span className="font-medium">{actif.taux_interet ? Number(actif.taux_interet).toFixed(2) : '0.00'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">% remboursé :</span>
                <span className="font-medium text-green-600">
                  {actif.capital_restant_du && actif.montant_emprunte ? 
                    ((1 - actif.capital_restant_du / actif.montant_emprunte) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
      </div>
    </PatrimoineLayout>
  );
}
