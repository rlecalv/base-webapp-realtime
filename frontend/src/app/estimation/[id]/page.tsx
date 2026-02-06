'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Estimation, Comparable, LeadFormData } from '@/types';
import { estimationsApi, leadsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { PriceChart } from '@/components/charts/PriceChart';
import { ConfidenceGauge } from '@/components/charts/ConfidenceGauge';
import {
  CheckCircle2, MapPin, BarChart3, Building2,
  ShieldCheck, ArrowRight, Loader2, ChevronDown, ChevronUp,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

export default function EstimationResultPage() {
  const params = useParams();
  const router = useRouter();
  const estimationId = parseInt(params.id as string);

  const [estimation, setEstimation] = useState<Estimation | null>(null);
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDecotes, setShowDecotes] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadTel, setLeadTel] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [estRes, compRes] = await Promise.all([
          estimationsApi.getEstimation(estimationId),
          estimationsApi.getComparables(estimationId),
        ]);
        if (estRes.data) setEstimation(estRes.data);
        if (compRes.data) setComparables(compRes.data);
      } catch {
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [estimationId]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadLoading(true);
    try {
      await leadsApi.createLead({ email: leadEmail, telephone: leadTel, estimation_id: estimationId });
      toast.success('Demande enregistree');
      setShowLead(false);
    } catch {
      toast.error('Erreur');
    } finally {
      setLeadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Calcul en cours...</p>
        </div>
      </div>
    );
  }

  if (!estimation) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="p-6 text-center max-w-sm">
          <h2 className="text-lg font-semibold mb-3">Estimation non trouvee</h2>
          <Button asChild>
            <Link href="/estimation">Nouvelle estimation</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const confiance = estimation.confiance;
  const confianceColor = confiance >= 80 ? 'text-green-600' : confiance >= 60 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="size-6 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Votre estimation est prete</h1>
        {estimation.bien && (
          <p className="mt-1 text-sm text-muted-foreground flex items-center justify-center gap-1">
            <MapPin className="size-3.5" />
            {estimation.bien.adresse}, {estimation.bien.code_postal} {estimation.bien.ville}
          </p>
        )}
      </div>

      {/* Valeur principale */}
      <Card className="mb-6 border-primary/20">
        <CardContent className="pt-6 text-center">
          <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
            {formatPrice(estimation.valeur_estimee)}
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            Fourchette : {formatPrice(estimation.valeur_min)} - {formatPrice(estimation.valeur_max)}
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className={confianceColor}>
              <ShieldCheck className="size-3 mr-1" />
              Confiance {confiance}%
            </Badge>
            <Badge variant="outline">
              <BarChart3 className="size-3 mr-1" />
              {estimation.nombre_comparables} comparables
            </Badge>
            {estimation.bien && (
              <Badge variant="outline">
                <Building2 className="size-3 mr-1" />
                {estimation.bien.surface_totale} m2
              </Badge>
            )}
          </div>

          {/* Prix au m2 */}
          {estimation.bien && (
            <div className="mt-4 text-sm text-muted-foreground">
              Prix au m2 : <span className="font-semibold text-foreground">
                {formatPrice(Math.round(estimation.valeur_estimee / (estimation.bien.surface_totale || 1)))}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grille stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold">{estimation.nombre_comparables}</div>
            <div className="text-xs text-muted-foreground">Biens analyses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold capitalize">
              {estimation.methode === 'mixte' ? 'Mixte' : estimation.methode === 'comparables_dvf' ? 'DVF' : 'Offres'}
            </div>
            <div className="text-xs text-muted-foreground">Methode utilisee</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className={`text-2xl font-bold ${confianceColor}`}>{confiance}%</div>
            <div className="text-xs text-muted-foreground">Score de confiance</div>
          </CardContent>
        </Card>
      </div>

      {/* Decotes */}
      {estimation.details?.ajustements && (
        <Card className="mb-6">
          <CardContent className="pt-4">
            <button
              onClick={() => setShowDecotes(!showDecotes)}
              className="flex items-center justify-between w-full text-sm font-medium"
            >
              <span>Details des ajustements et decotes</span>
              {showDecotes ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            {showDecotes && (
              <div className="mt-3 space-y-2 animate-fadeIn">
                {Object.entries(estimation.details.ajustements).map(([key, val]: [string, any]) => {
                  if (typeof val !== 'number') return null;
                  const pct = ((val - 1) * 100).toFixed(0);
                  const isNeg = val < 1;
                  return (
                    <div key={key} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className={isNeg ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
                        {isNeg ? '' : '+'}{pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Carte */}
      {estimation.bien && (estimation.bien.latitude || comparables.length > 0) && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Carte des comparables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyMap
              propertyLat={estimation.bien.latitude || undefined}
              propertyLon={estimation.bien.longitude || undefined}
              propertyAddress={`${estimation.bien.adresse}, ${estimation.bien.code_postal} ${estimation.bien.ville}`}
              comparables={comparables
                .filter(c => c.latitude && c.longitude)
                .map(c => ({
                  id: c.id,
                  adresse: c.adresse,
                  latitude: c.latitude!,
                  longitude: c.longitude!,
                  prix: c.prix,
                  prix_m2: c.prix_m2,
                  surface: c.surface,
                  distance_bien: c.distance_bien,
                }))}
              className="h-[400px] w-full rounded-lg overflow-hidden"
            />
          </CardContent>
        </Card>
      )}

      {/* Graphiques */}
      {comparables.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <PriceChart
            data={comparables.slice(0, 10).map((c, i) => ({
              name: `#${i + 1}`,
              prix_m2: c.prix_m2,
            }))}
            medianPrice={estimation.details?.prix_m2_median}
          />
          <ConfidenceGauge value={confiance} />
        </div>
      )}

      {/* Comparables */}
      {comparables.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Comparables ({comparables.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {comparables.slice(0, 10).map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{c.adresse}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{c.surface} m2</span>
                      {c.distance_bien && <span>{c.distance_bien.toFixed(1)} km</span>}
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-semibold">{formatPrice(c.prix)}</div>
                    <div className="text-xs text-primary font-medium">{formatPrice(c.prix_m2)}/m2</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Contact */}
      {!showLead ? (
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="font-semibold mb-2">Cette estimation vous interesse ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Laissez-nous vos coordonnees pour etre recontacte
            </p>
            <Button onClick={() => setShowLead(true)}>
              <Mail className="size-4" />
              Nous contacter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleLeadSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} required placeholder="votre@email.fr" />
              </div>
              <div className="space-y-1.5">
                <Label>Telephone</Label>
                <Input type="tel" value={leadTel} onChange={(e) => setLeadTel(e.target.value)} placeholder="06 12 34 56 78" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={leadLoading} className="flex-1">
                  {leadLoading ? <Loader2 className="size-4 animate-spin" /> : 'Envoyer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowLead(false)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild variant="outline">
          <Link href="/estimation">Nouvelle estimation</Link>
        </Button>
        <Button asChild>
          <Link href="/">
            Retour a l'accueil
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
