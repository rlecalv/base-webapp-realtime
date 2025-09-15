'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import PatrimoineLayout from '@/components/layouts/PatrimoineLayout';

interface SocieteDetail {
  id: number;
  nom: string;
  siret?: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  telephone?: string;
  email?: string;
  forme_juridique?: string;
  capital_social?: number;
  date_creation?: string;
  secteur_activite?: string;
  description?: string;
  actif: boolean;
  nb_actifs?: number;
  valeur_totale_actifs?: number;
  revenus_totaux?: number;
}

interface ActifSociete {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  type_bien: string;
  valorisation: number;
  revenus_annuels: number;
  rendement_brut: number;
}

export default function DetailSocietePage() {
  const params = useParams();
  const router = useRouter();
  const [societe, setSociete] = useState<SocieteDetail | null>(null);
  const [actifs, setActifs] = useState<ActifSociete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSocieteDetail = async () => {
      try {
        setLoading(true);
        
        const [societeRes, actifsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/societes/${params.id}`),
          fetch(`http://localhost:8000/api/v1/societes/${params.id}/actifs`)
        ]);

        if (!societeRes.ok) {
          throw new Error('Société non trouvée');
        }

        const societeData = await societeRes.json();
        setSociete(societeData.data);

        if (actifsRes.ok) {
          const actifsData = await actifsRes.json();
          setActifs(actifsData.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadSocieteDetail();
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

  if (error || !societe) {
    return (
      <PatrimoineLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Société non trouvée</h2>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => router.push('/societes')} 
              className="mt-4"
            >
              ← Retour aux sociétés
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🏢 {societe.nom}
            </h1>
            <p className="text-gray-600">
              {societe.adresse && societe.ville ? `${societe.adresse}, ${societe.ville}` : 'Adresse non renseignée'}
            </p>
            <div className="flex gap-2 mt-2">
              <Badge variant={societe.actif ? "success" : "secondary"}>
                {societe.actif ? 'Active' : 'Inactive'}
              </Badge>
              {societe.forme_juridique && (
                <Badge variant="outline">{societe.forme_juridique}</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => router.push(`/societes/${params.id}/edit`)}
            >
              ✏️ Modifier
            </Button>
            <Button variant="outline">📊 Exporter</Button>
            <Button onClick={() => router.push('/societes')}>← Retour</Button>
          </div>
        </div>

        {/* Informations générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📋 Informations légales</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">SIRET :</span>
                <div className="font-medium">{societe.siret || 'Non renseigné'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Forme juridique :</span>
                <div className="font-medium">{societe.forme_juridique || 'Non renseignée'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Capital social :</span>
                <div className="font-medium">{formatCurrency(societe.capital_social)}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Date de création :</span>
                <div className="font-medium">{formatDate(societe.date_creation)}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📞 Contact</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Téléphone :</span>
                <div className="font-medium">{societe.telephone || 'Non renseigné'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Email :</span>
                <div className="font-medium">{societe.email || 'Non renseigné'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Code postal :</span>
                <div className="font-medium">{societe.code_postal || 'Non renseigné'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Secteur d&apos;activité :</span>
                <div className="font-medium">{societe.secteur_activite || 'Non renseigné'}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📈 Statistiques</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Nombre d&apos;actifs :</span>
                <div className="font-medium text-blue-600">{actifs.length}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Valeur totale :</span>
                <div className="font-medium text-green-600">
                  {formatCurrency(actifs.reduce((sum, actif) => sum + actif.valorisation, 0))}
                </div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Revenus totaux :</span>
                <div className="font-medium text-green-600">
                  {formatCurrency(actifs.reduce((sum, actif) => sum + actif.revenus_annuels, 0))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Description */}
        {societe.description && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📝 Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{societe.description}</p>
          </Card>
        )}

        {/* Actifs de la société */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              🏠 Actifs immobiliers ({actifs.length})
            </h3>
            <Button 
              onClick={() => router.push('/patrimoine/new?societe=' + params.id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              ➕ Nouvel actif
            </Button>
          </div>

          {actifs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold">Actif</th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-right font-semibold">Valorisation</th>
                    <th className="px-4 py-3 text-right font-semibold">Revenus/an</th>
                    <th className="px-4 py-3 text-right font-semibold">Rendement</th>
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
                        <Badge variant="outline">{actif.type_bien}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(actif.valorisation)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">
                        {formatCurrency(actif.revenus_annuels)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${
                          actif.rendement_brut >= 8 ? 'text-green-600' :
                          actif.rendement_brut >= 5 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {actif.rendement_brut ? actif.rendement_brut.toFixed(2) : '0.00'}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/patrimoine/${actif.id}`)}
                        >
                          👁️ Voir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🏢</div>
              <p>Aucun actif immobilier pour cette société</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/patrimoine/new?societe=' + params.id)}
              >
                Ajouter le premier actif
              </Button>
            </div>
          )}
        </Card>
      </div>
    </PatrimoineLayout>
  );
}
