'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  MapPin,
  BarChart3,
  Zap,
  ArrowRight,
  Scale,
  TrendingUp,
  ShieldCheck,
  FileText,
} from 'lucide-react';

const steps = [
  { icon: MapPin, title: 'Entrez l\'adresse', desc: 'Saisissez l\'adresse de votre immeuble' },
  { icon: BarChart3, title: 'Analyse instantanee', desc: 'Notre algorithme croise DVF, BDNB et cadastre' },
  { icon: FileText, title: 'Resultat detaille', desc: 'Valeur estimee, fourchette et comparables' },
];

const stats = [
  { value: '< 30s', label: 'Estimation rapide' },
  { value: 'DVF', label: 'Transactions reelles' },
  { value: '100%', label: 'Gratuit' },
  { value: 'IDF', label: 'Paris & banlieue' },
];

const useCases = [
  { icon: TrendingUp, title: 'Projet de vente', desc: 'Determinez le juste prix de votre immeuble avant mise en vente' },
  { icon: Scale, title: 'Succession & partage', desc: 'Estimez la valeur pour un partage equitable entre heritiers' },
  { icon: ShieldCheck, title: 'Controle fiscal', desc: 'Justifiez la valeur declaree avec des donnees officielles DVF' },
  { icon: Building2, title: 'Investissement', desc: 'Evaluez le potentiel d\'un immeuble de rapport' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-4">
            <Zap className="size-3 mr-1" />
            Estimation gratuite en 30 secondes
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Estimez votre immeuble
            <span className="block text-primary mt-1">Paris & Ile-de-France</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Algorithme base sur les transactions DVF reelles et les donnees BDNB.
            Pour immeubles en bloc et parts indivises.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/estimation">
                Estimation rapide
                <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="/estimation/pro">
                Estimation professionnelle
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* Comment ca marche */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold text-foreground mb-10">Comment ca marche</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <step.icon className="size-6 text-primary" />
              </div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Etape {i + 1}</div>
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chiffres cles */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cas d'usage */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold text-foreground mb-10">Pourquoi estimer votre immeuble</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {useCases.map((uc, i) => (
            <Card key={i} className="border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <uc.icon className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{uc.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-primary/5 border-t border-border">
        <div className="mx-auto max-w-2xl px-4 py-14 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Pret a connaitre la valeur de votre immeuble ?
          </h2>
          <p className="text-muted-foreground mb-6">
            Gratuit, sans engagement, resultat instantane
          </p>
          <Button asChild size="lg">
            <Link href="/estimation">
              Commencer l'estimation
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
