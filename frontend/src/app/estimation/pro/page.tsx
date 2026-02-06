'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { estimationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import {
  Building2, MapPin, Settings, Wallet,
  Loader2, ArrowRight, ArrowLeft, Check, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Localisation', icon: MapPin },
  { id: 2, label: 'Caracteristiques', icon: Settings },
  { id: 3, label: 'Revenus', icon: Wallet },
];

export default function EstimationProPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [type, setType] = useState<'immeuble_bloc' | 'part_indivise'>('immeuble_bloc');
  const [adresse, setAdresse] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [ville, setVille] = useState('');
  const [lat, setLat] = useState<number | undefined>();
  const [lon, setLon] = useState<number | undefined>();
  const [nbLots, setNbLots] = useState('');
  const [quotePart, setQuotePart] = useState('');

  // Step 2
  const [surface, setSurface] = useState('');
  const [surfaceHab, setSurfaceHab] = useState('');
  const [surfaceCom, setSurfaceCom] = useState('');
  const [surfaceBur, setSurfaceBur] = useState('');
  const [surfacePark, setSurfacePark] = useState('');
  const [annee, setAnnee] = useState('');
  const [etat, setEtat] = useState('bon');
  const [dpe, setDpe] = useState('');
  const [occupe, setOccupe] = useState(false);
  const [typeBail, setTypeBail] = useState('');
  const [locataireAge, setLocataireAge] = useState('');
  const [coproDifficulte, setCoproDifficulte] = useState(false);

  // Step 3
  const [loyerHab, setLoyerHab] = useState('');
  const [loyerCom, setLoyerCom] = useState('');
  const [loyerBur, setLoyerBur] = useState('');
  const [loyerPark, setLoyerPark] = useState('');

  const canStep2 = adresse && codePostal && ville;
  const canStep3 = parseFloat(surface) > 0;

  const handleSubmit = async () => {
    if (!canStep3) return;
    setLoading(true);

    try {
      const departement = codePostal.substring(0, 2);
      const data: Record<string, any> = {
        type,
        adresse,
        code_postal: codePostal,
        ville,
        departement,
        surface_totale: parseFloat(surface),
        etat_general: etat,
        methode: 'mixte',
        latitude: lat,
        longitude: lon,
      };

      if (nbLots) data.nb_lots = parseInt(nbLots);
      if (type === 'part_indivise' && quotePart) data.quote_part = parseFloat(quotePart);
      if (annee) data.annee_construction = parseInt(annee);
      if (dpe) data.dpe = dpe;
      if (occupe) data.occupe = true;
      if (typeBail) data.type_bail = typeBail;
      if (locataireAge) data.locataire_age = parseInt(locataireAge);
      if (coproDifficulte) data.copro_difficulte = true;
      if (loyerHab) data.loyer_habitation = parseFloat(loyerHab);
      if (loyerCom) data.loyer_commerce = parseFloat(loyerCom);
      if (loyerBur) data.loyer_bureau = parseFloat(loyerBur);
      if (loyerPark) data.loyer_parking = parseFloat(loyerPark);

      // Surface details
      if (surfaceHab || surfaceCom || surfaceBur || surfacePark) {
        data.caracteristiques = {};
        if (surfaceHab) data.caracteristiques.surface_habitation = parseFloat(surfaceHab);
        if (surfaceCom) data.caracteristiques.surface_commerce = parseFloat(surfaceCom);
        if (surfaceBur) data.caracteristiques.surface_bureaux = parseFloat(surfaceBur);
        if (surfacePark) data.caracteristiques.surface_parking = parseFloat(surfacePark);
      }

      const response = await estimationsApi.createEstimation(data);

      if (response.data) {
        toast.success('Estimation professionnelle calculee');
        router.push(`/estimation/${response.data.id}`);
      } else {
        toast.error(response.error || 'Erreur lors de l\'estimation');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || 'Erreur';
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-3">
          <Settings className="size-3 mr-1" />
          Analyse approfondie
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Estimation professionnelle</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Croisement DVF, BDNB, capitalisation des loyers pour une valorisation precise
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (s.id < step) setStep(s.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step === s.id
                  ? 'bg-primary text-primary-foreground'
                  : step > s.id
                  ? 'bg-primary/10 text-primary cursor-pointer'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s.id ? <Check className="size-3" /> : <s.icon className="size-3" />}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.id}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px ${step > s.id ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Step 1 : Localisation */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-2">
                <Label>Type de bien</Label>
                <RadioGroup
                  value={type}
                  onValueChange={(v) => setType(v as 'immeuble_bloc' | 'part_indivise')}
                  className="grid grid-cols-2 gap-3"
                >
                  <Label
                    htmlFor="pro-bloc"
                    className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                      type === 'immeuble_bloc' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                    }`}
                  >
                    <RadioGroupItem value="immeuble_bloc" id="pro-bloc" />
                    <span className="text-sm font-medium">Immeuble entier</span>
                  </Label>
                  <Label
                    htmlFor="pro-indivise"
                    className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                      type === 'part_indivise' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                    }`}
                  >
                    <RadioGroupItem value="part_indivise" id="pro-indivise" />
                    <span className="text-sm font-medium">Part indivise</span>
                  </Label>
                </RadioGroup>
              </div>

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
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Nombre de lots</Label>
                  <Input
                    type="number"
                    value={nbLots}
                    onChange={(e) => setNbLots(e.target.value)}
                    placeholder="10"
                    min="1"
                  />
                </div>
                {type === 'part_indivise' && (
                  <div className="space-y-1.5">
                    <Label>Quote-part (0 a 1)</Label>
                    <Input
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
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!canStep2}>
                  Suivant <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 : Caracteristiques */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1.5">
                <Label>Surface totale (m2) *</Label>
                <Input
                  type="number"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  placeholder="350"
                  min="1"
                  required
                />
              </div>

              {/* Repartition surfaces */}
              <div>
                <Label className="text-muted-foreground text-xs">Repartition des surfaces (optionnel)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Habitation</Label>
                    <Input type="number" value={surfaceHab} onChange={(e) => setSurfaceHab(e.target.value)} placeholder="0" min="0" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Commerce</Label>
                    <Input type="number" value={surfaceCom} onChange={(e) => setSurfaceCom(e.target.value)} placeholder="0" min="0" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bureau</Label>
                    <Input type="number" value={surfaceBur} onChange={(e) => setSurfaceBur(e.target.value)} placeholder="0" min="0" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Parking</Label>
                    <Input type="number" value={surfacePark} onChange={(e) => setSurfacePark(e.target.value)} placeholder="0" min="0" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Annee de construction</Label>
                  <Input type="number" value={annee} onChange={(e) => setAnnee(e.target.value)} placeholder="1920" min="1000" max={new Date().getFullYear()} />
                </div>
                <div className="space-y-1.5">
                  <Label>Etat general</Label>
                  <select
                    value={etat}
                    onChange={(e) => setEtat(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="neuf">Neuf / renove</option>
                    <option value="bon">Bon etat</option>
                    <option value="moyen">Moyen</option>
                    <option value="travaux">A renover</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>DPE</Label>
                  <select
                    value={dpe}
                    onChange={(e) => setDpe(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Non renseigne</option>
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Occupation</Label>
                  <select
                    value={occupe ? 'true' : 'false'}
                    onChange={(e) => setOccupe(e.target.value === 'true')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="false">Libre</option>
                    <option value="true">Occupe</option>
                  </select>
                </div>
              </div>

              {occupe && (
                <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                  <div className="space-y-1.5">
                    <Label>Type de bail</Label>
                    <select
                      value={typeBail}
                      onChange={(e) => setTypeBail(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Non precise</option>
                      <option value="nu">Nu</option>
                      <option value="meuble">Meuble</option>
                      <option value="commercial">Commercial</option>
                      <option value="loi_48">Loi 48</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Age du locataire</Label>
                    <Input type="number" value={locataireAge} onChange={(e) => setLocataireAge(e.target.value)} placeholder="55" min="0" />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="copro"
                  checked={coproDifficulte}
                  onChange={(e) => setCoproDifficulte(e.target.checked)}
                  className="rounded border-input"
                />
                <Label htmlFor="copro" className="text-sm cursor-pointer">Copropriete en difficulte</Label>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="size-4" /> Precedent
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canStep3}>
                  Suivant <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 : Revenus locatifs */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-lg bg-muted/50 border border-border p-4">
                <p className="text-sm text-muted-foreground">
                  Les revenus locatifs permettent une estimation par capitalisation, plus precise pour les immeubles de rapport.
                  <span className="block mt-1 font-medium text-foreground">Ces champs sont optionnels.</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Loyer habitation (annuel)</Label>
                  <Input type="number" value={loyerHab} onChange={(e) => setLoyerHab(e.target.value)} placeholder="45000" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Loyer commerce (annuel)</Label>
                  <Input type="number" value={loyerCom} onChange={(e) => setLoyerCom(e.target.value)} placeholder="0" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Loyer bureau (annuel)</Label>
                  <Input type="number" value={loyerBur} onChange={(e) => setLoyerBur(e.target.value)} placeholder="0" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Loyer parking (annuel)</Label>
                  <Input type="number" value={loyerPark} onChange={(e) => setLoyerPark(e.target.value)} placeholder="0" min="0" />
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="size-4" /> Precedent
                </Button>
                <Button onClick={handleSubmit} disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      Obtenir l'estimation
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lien vers rapide */}
      <div className="mt-6 text-center">
        <Link
          href="/estimation"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Zap className="size-3.5" />
          Estimation rapide (3 champs)
        </Link>
      </div>
    </div>
  );
}
