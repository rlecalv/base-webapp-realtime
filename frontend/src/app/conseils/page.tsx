'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  DocumentTextIcon,
  BuildingOfficeIcon,
  ScaleIcon,
  BanknotesIcon,
  HomeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function ConseilsPage() {
  const router = useRouter();

  const articles = [
    {
      id: 'parts-indivises',
      title: 'Les parts indivises : comprendre la valorisation et les enjeux',
      icon: BuildingOfficeIcon,
      excerpt: 'L\'estimation d\'une part indivise nécessite une approche spécifique qui tient compte de la quote-part, des droits des autres indivisaires et des contraintes de gestion.',
      content: `
        <h2>Qu'est-ce qu'une part indivise ?</h2>
        <p>Une part indivise correspond à une fraction de propriété d'un bien immobilier détenue en commun par plusieurs personnes (indivisaires). Chaque indivisaire possède une quote-part exprimée en pourcentage ou en fraction (ex: 1/3, 50%).</p>
        
        <h3>Spécificités de l'estimation d'une part indivise</h3>
        <p>L'estimation d'une part indivise ne se limite pas à multiplier la valeur totale du bien par la quote-part. Plusieurs facteurs doivent être pris en compte :</p>
        <ul>
          <li><strong>Décote de l'indivision</strong> : Une part indivise se vend généralement avec une décote de 20% à 40% par rapport à sa valeur théorique, car l'acheteur acquiert une copropriété avec d'autres indivisaires</li>
          <li><strong>Droits des autres indivisaires</strong> : Le droit de préemption des autres indivisaires peut réduire l'attractivité de la vente</li>
          <li><strong>Difficultés de gestion</strong> : Les conflits entre indivisaires, les décisions à prendre en commun, et les contraintes de gestion réduisent la valeur</li>
          <li><strong>Quote-part des charges</strong> : L'acheteur devra assumer sa part des charges et travaux</li>
        </ul>
        
        <h3>Cas d'usage : succession et divorce</h3>
        <p>L'estimation d'une part indivise est particulièrement importante dans le cadre d'une succession ou d'un divorce pour :</p>
        <ul>
          <li>Répartir équitablement les biens entre héritiers</li>
          <li>Déterminer la valeur du patrimoine pour le calcul des droits de succession</li>
          <li>Évaluer la part de chacun dans le cadre d'un divorce</li>
          <li>Négocier un rachat de parts ou une vente globale</li>
        </ul>
      `
    },
    {
      id: 'immeubles-bloc',
      title: 'Immeubles en bloc : valorisation et gestion locative',
      icon: BuildingOfficeIcon,
      excerpt: 'L\'estimation d\'un immeuble en bloc à Paris et en Île-de-France nécessite une analyse approfondie du potentiel locatif, des charges et de la réglementation.',
      content: `
        <h2>Qu'est-ce qu'un immeuble en bloc ?</h2>
        <p>Un immeuble en bloc est un bâtiment comprenant plusieurs lots (appartements, locaux commerciaux) détenus par un même propriétaire. C'est un investissement immobilier privilégié à Paris et en Île-de-France.</p>
        
        <h3>Facteurs d'estimation spécifiques</h3>
        <ul>
          <li><strong>Potentiel locatif</strong> : Le rendement locatif brut et net après charges est un critère majeur</li>
          <li><strong>Nombre de lots</strong> : Plus le nombre de lots est élevé, plus la diversification du risque est importante</li>
          <li><strong>État général du bâtiment</strong> : Les travaux de rénovation à prévoir impactent directement la valeur</li>
          <li><strong>Localisation</strong> : La situation géographique détermine la demande locative et les prix au m²</li>
          <li><strong>Charges de copropriété</strong> : Les charges courantes et les provisions pour travaux futurs</li>
          <li><strong>DPE (Diagnostic de Performance Énergétique)</strong> : Les immeubles classés F ou G sont soumis à des contraintes réglementaires qui peuvent réduire leur valeur</li>
        </ul>
        
        <h3>Difficultés de gestion</h3>
        <p>La gestion d'un immeuble en bloc présente des défis spécifiques :</p>
        <ul>
          <li><strong>Gestion locative</strong> : Gérer plusieurs locataires, les entrées/sorties, les impayés</li>
          <li><strong>Travaux et maintenance</strong> : Anticiper et financer les travaux de rénovation (ravalement, toiture, plomberie)</li>
          <li><strong>Réglementation</strong> : Respecter les obligations légales (DPE, sécurité, accessibilité)</li>
          <li><strong>Fiscalité</strong> : Optimiser la fiscalité (LMNP, SCI, déficit foncier)</li>
        </ul>
        
        <h3>Cas d'usage : contrôle fiscal et transmission</h3>
        <p>Une estimation précise est essentielle pour :</p>
        <ul>
          <li>Déclarer la valeur réelle lors d'un contrôle fiscal</li>
          <li>Transmettre le patrimoine dans le cadre d'une succession</li>
          <li>Évaluer le patrimoine pour un divorce</li>
          <li>Négocier un rachat ou une vente</li>
        </ul>
      `
    },
    {
      id: 'dpe-contraintes',
      title: 'DPE et contraintes réglementaires : impact sur la valorisation',
      icon: HomeIcon,
      excerpt: 'Le Diagnostic de Performance Énergétique (DPE) devient un critère majeur d\'estimation, surtout pour les immeubles anciens parisiens.',
      content: `
        <h2>L'impact du DPE sur la valorisation</h2>
        <p>Depuis 2023, les immeubles classés F ou G au DPE sont soumis à des restrictions de location et de vente qui impactent directement leur valeur.</p>
        
        <h3>Contraintes réglementaires</h3>
        <ul>
          <li><strong>Interdiction de location</strong> : Depuis 2023, les biens classés G ne peuvent plus être loués. Les biens classés F seront interdits à partir de 2028</li>
          <li><strong>Obligation de travaux</strong> : Les propriétaires doivent réaliser des travaux de rénovation énergétique pour pouvoir continuer à louer</li>
          <li><strong>Décote de valeur</strong> : Un bien classé F ou G peut voir sa valeur baisser de 10% à 30% selon l'ampleur des travaux nécessaires</li>
        </ul>
        
        <h3>Estimation avec DPE dégradé</h3>
        <p>Pour un immeuble ancien à Paris ou en Île-de-France avec un DPE F ou G :</p>
        <ul>
          <li>Estimation de la valeur actuelle avec décote DPE</li>
          <li>Estimation du coût des travaux de rénovation énergétique</li>
          <li>Estimation de la valeur après travaux</li>
          <li>Calcul du retour sur investissement</li>
        </ul>
        
        <h3>Cas d'usage spécifiques</h3>
        <p>Une estimation précise est cruciale pour :</p>
        <ul>
          <li><strong>Contrôle fiscal</strong> : Justifier la valeur déclarée en tenant compte du DPE</li>
          <li><strong>Succession</strong> : Évaluer le patrimoine avec les contraintes réglementaires</li>
          <li><strong>Divorce</strong> : Déterminer la valeur réelle du bien en tenant compte des travaux à prévoir</li>
          <li><strong>Vente</strong> : Négocier le prix en fonction du DPE et des travaux nécessaires</li>
        </ul>
      `
    },
    {
      id: 'divorce-succession',
      title: 'Estimation immobilière dans le cadre d\'un divorce ou d\'une succession',
      icon: ScaleIcon,
      excerpt: 'L\'estimation immobilière est un enjeu majeur dans les procédures de divorce et de succession, nécessitant une expertise indépendante et objective.',
      content: `
        <h2>Estimation dans le cadre d'un divorce</h2>
        <p>Lors d'un divorce, l'estimation des biens immobiliers est essentielle pour :</p>
        <ul>
          <li><strong>Répartition du patrimoine</strong> : Déterminer la valeur de chaque bien pour une répartition équitable</li>
          <li><strong>Rachat de parts</strong> : Évaluer le montant nécessaire pour racheter la part de l'ex-conjoint</li>
          <li><strong>Vente</strong> : Fixer un prix de vente acceptable pour les deux parties</li>
          <li><strong>Prestation compensatoire</strong> : Calculer la prestation compensatoire en fonction de la valeur du patrimoine</li>
        </ul>
        
        <h3>Spécificités pour les immeubles en bloc et parts indivises</h3>
        <p>Pour un immeuble en bloc ou une part indivise :</p>
        <ul>
          <li>Estimation de la valeur totale de l'immeuble</li>
          <li>Répartition selon les quotes-parts de chacun</li>
          <li>Prise en compte des décotes d'indivision si applicable</li>
          <li>Évaluation des charges et travaux à prévoir</li>
        </ul>
        
        <h2>Estimation dans le cadre d'une succession</h2>
        <p>Lors d'une succession, l'estimation immobilière permet de :</p>
        <ul>
          <li><strong>Calculer les droits de succession</strong> : Déterminer la valeur taxable du patrimoine</li>
          <li><strong>Répartir entre héritiers</strong> : Évaluer chaque bien pour une répartition équitable</li>
          <li><strong>Rachat de parts</strong> : Permettre à un héritier de racheter les parts des autres</li>
          <li><strong>Vente</strong> : Fixer un prix de vente pour le partage</li>
        </ul>
        
        <h3>Enjeux fiscaux</h3>
        <p>Une estimation précise est cruciale pour :</p>
        <ul>
          <li>Éviter une surévaluation qui augmenterait les droits de succession</li>
          <li>Éviter une sous-évaluation qui pourrait déclencher un contrôle fiscal</li>
          <li>Bénéficier des abattements et réductions légaux</li>
        </ul>
      `
    },
    {
      id: 'controle-fiscal',
      title: 'Estimation immobilière et contrôle fiscal',
      icon: BanknotesIcon,
      excerpt: 'En cas de contrôle fiscal, une estimation précise et documentée est essentielle pour justifier la valeur déclarée de vos biens immobiliers.',
      content: `
        <h2>Pourquoi une estimation précise est cruciale</h2>
        <p>L'administration fiscale peut contrôler la valeur déclarée de vos biens immobiliers dans plusieurs cas :</p>
        <ul>
          <li><strong>Déclaration de succession</strong> : Vérification de la valeur déclarée des biens</li>
          <li><strong>Donation</strong> : Contrôle de la valeur des biens donnés</li>
          <li><strong>ISF/IFI</strong> : Vérification de la valeur du patrimoine immobilier</li>
          <li><strong>Plus-value immobilière</strong> : Contrôle de la valeur de cession</li>
        </ul>
        
        <h3>Risques d'une sous-évaluation</h3>
        <p>Une sous-évaluation peut entraîner :</p>
        <ul>
          <li>Redressement fiscal avec majorations et intérêts de retard</li>
          <li>Amendes pouvant aller jusqu'à 80% des droits éludés</li>
          <li>Contrôle approfondi de l'ensemble du patrimoine</li>
        </ul>
        
        <h3>Risques d'une surévaluation</h3>
        <p>Une surévaluation peut entraîner :</p>
        <ul>
          <li>Paiement de droits de succession ou d'IFI excessifs</li>
          <li>Difficultés pour justifier la valeur en cas de contrôle</li>
        </ul>
        
        <h3>Notre méthode d'estimation</h3>
        <p>Notre algorithme d'intelligence artificielle analyse :</p>
        <ul>
          <li>Les transactions DVF réelles dans votre secteur</li>
          <li>Les annonces immobilières actuelles</li>
          <li>Les caractéristiques spécifiques de votre bien (DPE, état, localisation)</li>
          <li>Les comparables dans un rayon de 2km</li>
        </ul>
        <p>Cette méthode objective et documentée vous permet de justifier la valeur déclarée en cas de contrôle fiscal.</p>
      `
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-8"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Retour
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Conseils et Expertise Immobilière
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos guides experts sur l'estimation immobilière, les parts indivises, 
            les immeubles en bloc, et les enjeux fiscaux et juridiques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => {
            const Icon = article.icon;
            return (
              <Card
                key={article.id}
                className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/conseils/${article.id}`)}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{article.title}</h2>
                </div>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                <Button variant="outline" className="w-full">
                  Lire l'article
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

