'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import PatrimoineLayout from '@/components/layouts/PatrimoineLayout';

interface Locataire {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  profession?: string;
  date_naissance?: string;
  actif: boolean;
  nb_baux?: number;
  loyer_total_mensuel?: number;
  actif_nom?: string;
  ville?: string;
}

export default function LocatairesPage() {
  const router = useRouter();
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
        console.error('Erreur chargement locataires:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLocataires();
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 shadow-lg">
              <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              👥 Gestion des Locataires
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gérez vos locataires et leurs contrats de bail
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto mt-6 rounded-full"></div>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">👥 Total Locataires</h3>
            <p className="text-3xl font-bold text-blue-600">
              {locataires.length}
            </p>
            <p className="text-sm text-gray-500">locataires enregistrés</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">✅ Actifs</h3>
            <p className="text-3xl font-bold text-green-600">
              {locataires.filter(l => l.actif).length}
            </p>
            <p className="text-sm text-gray-500">locataires actifs</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📄 Baux Totaux</h3>
            <p className="text-3xl font-bold text-purple-600">
              {locataires.reduce((sum, l) => sum + (l.nb_baux || 0), 0)}
            </p>
            <p className="text-sm text-gray-500">contrats de bail</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">💰 Revenus Mensuels</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(locataires.reduce((sum, l) => sum + (l.loyer_total_mensuel || 0), 0))}
            </p>
            <p className="text-sm text-gray-500">total des loyers</p>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => router.push('/locataires/new')}
          >
            ➕ Nouveau Locataire
          </Button>
          <Button variant="outline">
            📊 Exporter
          </Button>
          <Button variant="outline">
            🔍 Filtrer
          </Button>
        </div>

        {/* Liste des locataires */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              👥 Locataires ({locataires.length})
            </h2>
          </div>

          {locataires.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold">Locataire</th>
                    <th className="px-4 py-3 text-left font-semibold">Contact</th>
                    <th className="px-4 py-3 text-left font-semibold">Profession</th>
                    <th className="px-4 py-3 text-right font-semibold">Baux</th>
                    <th className="px-4 py-3 text-right font-semibold">Loyer/mois</th>
                    <th className="px-4 py-3 text-left font-semibold">Bien Principal</th>
                    <th className="px-4 py-3 text-center font-semibold">Statut</th>
                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locataires.map((locataire) => (
                    <tr key={locataire.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-800">
                            {locataire.prenom} {locataire.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {locataire.date_naissance ? `Né(e) le ${formatDate(locataire.date_naissance)}` : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="text-gray-800">{locataire.email || 'Email non renseigné'}</div>
                          <div className="text-gray-500">{locataire.telephone || 'Tél. non renseigné'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{locataire.profession || 'Non renseignée'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge>{locataire.nb_baux || 0}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">
                        {formatCurrency(locataire.loyer_total_mensuel)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium">{locataire.actif_nom || '-'}</div>
                          <div className="text-gray-500">{locataire.ville || ''}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={locataire.actif ? "success" : "secondary"}>
                          {locataire.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/locataires/${locataire.id}`)}
                          >
                            👁️ Voir
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/locataires/${locataire.id}/edit`)}
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
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Aucun locataire enregistré</h3>
              <p className="mb-6">Commencez par ajouter votre premier locataire</p>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => router.push('/locataires/new')}
              >
                ➕ Ajouter un locataire
              </Button>
            </div>
          )}
        </Card>
      </div>
    </PatrimoineLayout>
  );
}