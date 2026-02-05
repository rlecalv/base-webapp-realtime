'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  CalculatorIcon,
  DocumentTextIcon,
  BanknotesIcon,
  HomeModernIcon,
  ScaleIcon,
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  UsersIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const router = useRouter();

  const useCases = [
    {
      icon: BanknotesIcon,
      title: 'Vendre votre bien',
      description: 'Déterminez le prix de vente optimal pour maximiser vos chances de transaction rapide tout en obtenant le meilleur prix.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: ScaleIcon,
      title: 'Partage ou succession',
      description: 'Estimez la valeur de votre bien pour un partage équitable entre héritiers ou lors d\'une donation.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: HomeModernIcon,
      title: 'Rachat de crédit',
      description: 'Obtenez une estimation précise pour négocier votre rachat de crédit immobilier dans les meilleures conditions.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'Investissement locatif',
      description: 'Évaluez le potentiel de rendement locatif avant d\'investir dans un bien immobilier.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Assurance habitation',
      description: 'Déterminez la valeur de votre bien pour souscrire une assurance habitation adaptée à sa valeur réelle.',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Révision de loyer',
      description: 'Estimez la valeur locative de votre bien pour négocier une révision de loyer équitable.',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const features = [
    {
      icon: ChartBarIcon,
      title: 'Analyse de marché précise',
      description: 'Basée sur des milliers de transactions réelles DVF et annonces immobilières'
    },
    {
      icon: ShieldCheckIcon,
      title: '100% Gratuit et confidentiel',
      description: 'Aucun engagement, aucune donnée personnelle requise pour l\'estimation'
    },
    {
      icon: ClockIcon,
      title: 'Résultat en quelques secondes',
      description: 'Notre algorithme analyse instantanément les comparables de votre secteur'
    },
    {
      icon: MapPinIcon,
      title: 'Géolocalisation précise',
      description: 'Comparaison avec des biens similaires dans un rayon de 2km'
    }
  ];

  const expertise = [
    {
      number: '10 000+',
      label: 'Estimations réalisées',
      description: 'Notre plateforme a déjà aidé des milliers de propriétaires'
    },
    {
      number: '95%',
      label: 'Score de confiance moyen',
      description: 'Grâce à notre algorithme basé sur des données réelles'
    },
    {
      number: '2 min',
      label: 'Temps moyen',
      description: 'Pour obtenir une estimation complète et détaillée'
    },
    {
      number: '100%',
      label: 'Gratuit',
      description: 'Aucun frais caché, aucune obligation d\'achat'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&q=80)'
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Estimation immobilière par intelligence artificielle
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Estimation d'immeubles anciens
              <span className="block text-blue-200 mt-2">Paris & Île-de-France</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Expertise spécialisée dans l'estimation d'<strong className="text-white">immeubles en bloc</strong>, de <strong className="text-white">parts indivises</strong> et de biens anciens parisiens. 
              Estimation précise pour <strong className="text-white">divorce, succession, contrôle fiscal</strong> grâce à notre algorithme d'intelligence artificielle basé sur des milliers de transactions DVF réelles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/estimation')}
                size="lg"
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
              >
                <CalculatorIcon className="w-6 h-6 mr-2" />
                Commencer mon estimation gratuite
              </Button>
              <Button
                onClick={() => {
                  document.getElementById('algorithme')?.scrollIntoView({ behavior: 'smooth' });
                }}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <DocumentTextIcon className="w-6 h-6 mr-2" />
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi avoir besoin d'une estimation ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Que vous souhaitiez vendre, investir ou simplement connaître la valeur de votre bien, 
              une estimation précise est essentielle pour prendre les bonnes décisions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              // Images d'immeubles haussmanniens parisiens
              const images = [
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', // Immeuble haussmannien Paris
                'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', // Immeuble haussmannien Paris
                'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&q=80', // Immeuble haussmannien Paris
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', // Immeuble haussmannien Paris
                'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', // Immeuble haussmannien Paris
                'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&q=80', // Immeuble haussmannien Paris
              ];
              return (
                <Card key={index} className="overflow-hidden p-0 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={images[index]} 
                      alt={useCase.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-4 right-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${useCase.color} shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{useCase.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{useCase.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi choisir MonEstimation ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une technologie de pointe au service de votre projet immobilier
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Notre savoir-faire
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Une expertise reconnue au service de votre projet immobilier
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {expertise.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold mb-2">{item.number}</div>
                <div className="text-lg font-semibold mb-2">{item.label}</div>
                <div className="text-sm text-blue-100">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Algorithm Explanation */}
      <section id="algorithme" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Notre algorithme d'intelligence artificielle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une technologie avancée qui analyse des milliers de données pour vous donner l'estimation la plus précise
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-xl font-semibold mb-3 flex items-center text-gray-900">
                  <BuildingOfficeIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Collecte de données
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Notre système agrège en temps réel des milliers de transactions DVF (Demandes de Valeurs Foncières) 
                  et d'annonces immobilières provenant de plusieurs plateformes pour constituer une base de données exhaustive et à jour.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h3 className="text-xl font-semibold mb-3 flex items-center text-gray-900">
                  <MapPinIcon className="w-6 h-6 mr-2 text-green-600" />
                  Géolocalisation intelligente
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  L'algorithme identifie les biens comparables dans un rayon de 2km autour de votre bien, 
                  en tenant compte de la proximité géographique pour une estimation précise du marché local.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                <h3 className="text-xl font-semibold mb-3 flex items-center text-gray-900">
                  <ChartBarIcon className="w-6 h-6 mr-2 text-purple-600" />
                  Analyse statistique avancée
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Calcul de la médiane et des quartiles des prix au m², avec ajustements selon l'état du bien, 
                  l'année de construction et les caractéristiques spécifiques pour affiner l'estimation.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Méthodologie de calcul</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-400 pl-4 bg-yellow-50 py-3 rounded-r">
                  <h4 className="font-semibold mb-1 text-gray-900">1. Prix de référence</h4>
                  <p className="text-gray-700 text-sm">
                    Médiane des prix au m² des biens comparables trouvés
                  </p>
                </div>
                <div className="border-l-4 border-green-400 pl-4 bg-green-50 py-3 rounded-r">
                  <h4 className="font-semibold mb-1 text-gray-900">2. Ajustements</h4>
                  <p className="text-gray-700 text-sm">
                    Application de coefficients selon l'état général (±10% à ±30%) et l'âge du bien
                  </p>
                </div>
                <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 py-3 rounded-r">
                  <h4 className="font-semibold mb-1 text-gray-900">3. Fourchette de prix</h4>
                  <p className="text-gray-700 text-sm">
                    Calcul basé sur les quartiles (Q1 et Q3) pour déterminer la fourchette minimale et maximale
                  </p>
                </div>
                <div className="border-l-4 border-purple-400 pl-4 bg-purple-50 py-3 rounded-r">
                  <h4 className="font-semibold mb-1 text-gray-900">4. Score de confiance</h4>
                  <p className="text-gray-700 text-sm">
                    Basé sur le nombre de comparables trouvés et leur qualité (transactions DVF = plus fiables)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center space-y-4">
            <Button
              onClick={() => router.push('/estimation')}
              size="lg"
              className="text-lg px-12 py-6"
            >
              Tester l'algorithme maintenant
            </Button>
            <div className="text-sm text-gray-500">
              ⚠️ Pour obtenir une estimation précise, les données DVF doivent être importées. 
              <br />
              Contactez-nous pour lancer l'import des transactions DVF et le scraping des annonces.
            </div>
          </div>
        </div>
      </section>

      {/* Expert Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Expertise Immobilière
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Guides experts sur les spécificités de l'estimation immobilière à Paris et en Île-de-France
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer" onClick={() => router.push('/conseils/parts-indivises')}>
              <BuildingOfficeIcon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Parts indivises</h3>
              <p className="text-gray-600 mb-4">
                Comprendre la valorisation, les décotes d'indivision et les enjeux pour succession et divorce.
              </p>
              <Button variant="outline" className="w-full">En savoir plus</Button>
            </Card>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer" onClick={() => router.push('/conseils/immeubles-bloc')}>
              <BuildingOfficeIcon className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Immeubles en bloc</h3>
              <p className="text-gray-600 mb-4">
                Valorisation, gestion locative, DPE et difficultés de gestion des immeubles anciens.
              </p>
              <Button variant="outline" className="w-full">En savoir plus</Button>
            </Card>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer" onClick={() => router.push('/conseils/dpe-contraintes')}>
              <HomeIcon className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">DPE et contraintes</h3>
              <p className="text-gray-600 mb-4">
                Impact du DPE sur la valorisation, contraintes réglementaires et travaux de rénovation.
              </p>
              <Button variant="outline" className="w-full">En savoir plus</Button>
            </Card>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer" onClick={() => router.push('/conseils/divorce-succession')}>
              <ScaleIcon className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Divorce & Succession</h3>
              <p className="text-gray-600 mb-4">
                Estimation pour répartition équitable, rachat de parts et enjeux fiscaux.
              </p>
              <Button variant="outline" className="w-full">En savoir plus</Button>
            </Card>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer" onClick={() => router.push('/conseils/controle-fiscal')}>
              <BanknotesIcon className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Contrôle fiscal</h3>
              <p className="text-gray-600 mb-4">
                Justifier la valeur déclarée, éviter les redressements et optimiser la fiscalité.
              </p>
              <Button variant="outline" className="w-full">En savoir plus</Button>
            </Card>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer" onClick={() => router.push('/conseils')}>
              <DocumentTextIcon className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tous nos conseils</h3>
              <p className="text-gray-600 mb-4">
                Accédez à tous nos guides experts sur l'estimation immobilière.
              </p>
              <Button variant="outline" className="w-full">Voir tous les articles</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CheckBadgeIcon className="w-16 h-16 mx-auto mb-6 text-blue-200" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Prêt à découvrir la valeur de votre bien ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Estimation gratuite et précise pour immeubles anciens, parts indivises et immeubles en bloc à Paris et en Île-de-France
          </p>
          <Button
            onClick={() => router.push('/estimation')}
            size="lg"
            className="text-lg px-12 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
          >
            <CalculatorIcon className="w-6 h-6 mr-2" />
            Commencer mon estimation gratuite
          </Button>
          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-blue-100">
            <div className="flex items-center">
              <CheckBadgeIcon className="w-5 h-5 mr-2" />
              <span>100% Gratuit</span>
            </div>
            <div className="flex items-center">
              <CheckBadgeIcon className="w-5 h-5 mr-2" />
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center">
              <CheckBadgeIcon className="w-5 h-5 mr-2" />
              <span>Résultat instantané</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
