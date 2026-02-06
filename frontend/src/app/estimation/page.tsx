'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { estimationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { Building2, Loader2, ArrowRight, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EstimationRapidePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<'immeuble_bloc' | 'part_indivise'>('immeuble_bloc');
  const [adresse, setAdresse] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [ville, setVille] = useState('');
  const [lat, setLat] = useState<number | undefined>();
  const [lon, setLon] = useState<number | undefined>();
  const [surface, setSurface] = useState('');
  const [quotePart, setQuotePart] = useState('');

  const canSubmit = adresse && codePostal && ville && parseFloat(surface) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);

    try {
      const departement = codePostal.substring(0, 2);
      const response = await estimationsApi.createEstimation({
        type,
        adresse,
        code_postal: codePostal,
        ville,
        departement,
        surface_totale: parseFloat(surface),
        etat_general: 'bon',
        methode: 'mixte',
        latitude: lat,
        longitude: lon,
        ...(type === 'part_indivise' && quotePart ? { quote_part: parseFloat(quotePart) } : {}),
      });

      if (response.data) {
        toast.success('Estimation calculee');
        router.push(`/estimation/${response.data.id}`);
      } else {
        toast.error(response.error || 'Erreur lors de l\'estimation');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || 'Erreur';
      if (msg.includes('Aucun comparable') || msg.includes('Aucun')) {
        toast.error('Aucun comparable trouve dans cette zone. Verifiez l\'adresse ou essayez l\'estimation professionnelle.', { duration: 6000 });
      } else {
        toast.error(msg, { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Estimation rapide</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Obtenez une estimation en quelques secondes
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type */}
              <div className="space-y-2">
                <Label>Type de bien</Label>
                <RadioGroup
                  value={type}
                  onValueChange={(v) => setType(v as 'immeuble_bloc' | 'part_indivise')}
                  className="grid grid-cols-2 gap-3"
                >
                  <Label
                    htmlFor="type-bloc"
                    className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                      type === 'immeuble_bloc' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                    }`}
                  >
                    <RadioGroupItem value="immeuble_bloc" id="type-bloc" />
                    <div>
                      <div className="text-sm font-medium">Immeuble entier</div>
                    </div>
                  </Label>
                  <Label
                    htmlFor="type-indivise"
                    className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                      type === 'part_indivise' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                    }`}
                  >
                    <RadioGroupItem value="part_indivise" id="type-indivise" />
                    <div>
                      <div className="text-sm font-medium">Part indivise</div>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              {/* Adresse */}
              <AddressAutocomplete
                label="Adresse de l'immeuble"
                value={adresse}
                onChange={(address, postcode, city, latitude, longitude) => {
                  setAdresse(address);
                  if (postcode) setCodePostal(postcode);
                  if (city) setVille(city);
                  if (latitude) setLat(latitude);
                  if (longitude) setLon(longitude);
                }}
                required
                placeholder="Ex: 15 rue de Rivoli, Paris"
              />

              {/* Surface */}
              <div className="space-y-1.5">
                <Label htmlFor="surface">Surface totale (m2)</Label>
                <Input
                  id="surface"
                  type="number"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  placeholder="350"
                  min="1"
                  step="1"
                  required
                />
              </div>

              {/* Quote-part conditionnel */}
              {type === 'part_indivise' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <Label htmlFor="quote-part">Quote-part (ex: 0.5 = 50%)</Label>
                  <Input
                    id="quote-part"
                    type="number"
                    value={quotePart}
                    onChange={(e) => setQuotePart(e.target.value)}
                    placeholder="0.5"
                    min="0.01"
                    max="1"
                    step="0.01"
                  />
                </div>
              )}

              {/* Submit */}
              <Button type="submit" className="w-full" size="lg" disabled={!canSubmit || loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    Estimer mon immeuble
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lien vers pro */}
        <div className="mt-6 text-center">
          <Link
            href="/estimation/pro"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings2 className="size-3.5" />
            Estimation professionnelle avec details locatifs
          </Link>
        </div>

        {/* Indicateurs de confiance */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-muted-foreground">
          <span>100% gratuit</span>
          <span>Sans engagement</span>
          <span>Resultat instantane</span>
        </div>
      </div>
    </div>
  );
}
