'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import PatrimoineLayout from '@/components/layouts/PatrimoineLayout';

interface Locataire {
  id: number;
  nom: string;
  type_locataire: string;
  profession: string;
  raison_sociale: string;
  nb_contrats: number;
  total_loyers_annuels: number;
  premier_bail: string;
  dernier_bail: string;
  villes_biens: string[];
  types_bail: string[];
  societes_bailleresses: string[];
}

export default function LocatairesPage() {
  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLocataires = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/v1/locataires');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des locataires');
        }

        const data = await response.json();
        setLocataires(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadLocataires();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return dateString ? new Date(dateString).toLocaleDateString('fr-FR') : '-';
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
          👥 Gestion des Locataires
        </h1>
        <p className="text-gray-600">
          Liste de vos {locataires.length} locataires et leurs contrats
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button className="bg-blue-600 hover:bg-blue-700">
          ➕ Nouveau Locataire
        </Button>
        <Button variant="outline">
          📊 Exporter Liste
        </Button>
        <Button variant="outline">
          🔍 Filtrer
        </Button>
      </div>

      {/* Liste des locataires */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left font-semibold">Locataire</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Profession</th>
                <th className="px-4 py-3 text-right font-semibold">Contrats</th>
                <th className="px-4 py-3 text-right font-semibold">Loyers/an</th>
                <th className="px-4 py-3 text-left font-semibold">Villes</th>
                <th className="px-4 py-3 text-left font-semibold">Types Bail</th>
                <th className="px-4 py-3 text-right font-semibold">Premier Bail</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locataires.map((locataire) => (
                <tr key={locataire.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-800">{locataire.nom}</div>
                      {locataire.raison_sociale && (
                        <div className="text-sm text-gray-500">{locataire.raison_sociale}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={locataire.type_locataire === 'entreprise' ? 'default' : 'outline'}>
                      {locataire.type_locataire}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {locataire.profession || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge>{locataire.nb_contrats}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">
                    {formatCurrency(locataire.total_loyers_annuels)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {locataire.villes_biens?.slice(0, 2).map((ville, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {ville}
                        </Badge>
                      ))}
                      {locataire.villes_biens?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{locataire.villes_biens.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {locataire.types_bail?.slice(0, 2).map((type, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {formatDate(locataire.premier_bail)}
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
