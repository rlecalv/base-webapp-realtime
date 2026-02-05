# 🔍 Audit & Préconisations - Transformation en Site d'Estimation Immobilière

**Date :** Septembre 2025  
**Objectif :** Transformer la base d'application en site d'estimation immobilière performant avec données DVF et scraping d'annonces

---

## 📊 État Actuel de l'Application

### ✅ Points Forts à Conserver
- **Architecture solide** : Backend Node.js/Express + Frontend Next.js 14
- **Base de données PostgreSQL** avec Sequelize ORM
- **Cache Redis** pour optimiser les performances
- **Système d'authentification JWT** fonctionnel
- **WebSocket** pour les mises à jour en temps réel
- **Système de queues Bull** pour les tâches asynchrones
- **Sécurité niveau entreprise** (rate limiting, validation, etc.)
- **Docker** avec environnement de développement et production

### 🔄 Éléments à Adapter
- **Modèles de données** : Remplacer Message par des modèles immobiliers
- **Routes API** : Adapter pour les fonctionnalités d'estimation
- **Services** : Ajouter services DVF, scraping, estimation
- **Frontend** : Refondre l'interface pour l'estimation immobilière

---

## 🎯 Objectifs Fonctionnels

### 1. Estimation d'Immeubles en Bloc
- Formulaire de saisie des caractéristiques du bien
- Calcul automatique basé sur les comparables DVF
- Affichage des résultats avec détails et méthodologie

### 2. Estimation de Parts Indivises
- Support pour parts indivises sur immeuble en bloc
- Support pour parts indivises sur appartement/maison
- Calcul proportionnel basé sur la quote-part

### 3. Intégration Données DVF (Etalab)
- Récupération des transactions réelles via API DVF
- Filtrage par localisation, type de bien, période
- Utilisation comme comparables de transaction

### 4. Scraping Sites d'Annonces
- Scraping respectueux des robots.txt et CGU
- Sites cibles : SeLoger, LeBonCoin, PAP, etc.
- Extraction des comparables d'offre (prix demandés)
- Stockage et mise à jour périodique

### 5. Génération de Leads
- Collecte des informations utilisateur lors de l'estimation
- Stockage des leads dans la base de données
- Export pour le fonds d'investissement
- Suivi des conversions

---

## 🏗️ Architecture Proposée

### Modèles de Données

#### 1. Bien (Property)
```typescript
- id: number
- type: 'immeuble_bloc' | 'appartement' | 'maison' | 'part_indivise'
- adresse: string
- code_postal: string
- ville: string
- departement: string
- surface_totale: number (m²)
- nombre_lots: number
- annee_construction: number
- etat_general: 'excellent' | 'bon' | 'moyen' | 'a_renover'
- caracteristiques: JSON (parking, ascenseur, etc.)
- created_at: Date
- updated_at: Date
```

#### 2. Estimation (Estimation)
```typescript
- id: number
- bien_id: number (FK)
- user_id: number (FK, nullable pour visiteurs anonymes)
- valeur_estimee: number (€)
- valeur_min: number (€)
- valeur_max: number (€)
- methode: 'comparables_dvf' | 'comparables_offres' | 'mixte'
- nombre_comparables: number
- confiance: number (0-100)
- details: JSON (méthodologie détaillée)
- created_at: Date
```

#### 3. Comparable (Comparable)
```typescript
- id: number
- type: 'transaction' | 'offre'
- source: 'dvf' | 'seloger' | 'leboncoin' | 'pap' | 'autre'
- adresse: string
- code_postal: string
- ville: string
- surface: number (m²)
- prix: number (€)
- prix_m2: number (€/m²)
- date_transaction?: Date (pour transactions)
- date_publication?: Date (pour offres)
- url_source?: string
- caracteristiques: JSON
- distance_bien: number (km, calculé)
- created_at: Date
- updated_at: Date
```

#### 4. Lead (Lead)
```typescript
- id: number
- estimation_id: number (FK)
- email: string
- telephone?: string
- nom?: string
- prenom?: string
- type_bien_interesse?: string
- budget_max?: number
- statut: 'nouveau' | 'contacte' | 'convertis' | 'perdu'
- notes: TEXT
- created_at: Date
- updated_at: Date
```

#### 5. ScrapingJob (ScrapingJob)
```typescript
- id: number
- site: string
- type: 'annonces' | 'transactions'
- statut: 'en_attente' | 'en_cours' | 'termine' | 'erreur'
- parametres: JSON
- resultats: JSON
- erreur?: TEXT
- started_at?: Date
- completed_at?: Date
- created_at: Date
```

### Services à Créer

#### 1. DVFService
- Récupération des données via API DVF d'Etalab
- Filtrage par géolocalisation (rayon)
- Cache des résultats pour éviter les appels répétés
- Formatage et normalisation des données

#### 2. ScrapingService
- Gestion des jobs de scraping
- Respect des robots.txt
- Rate limiting pour éviter le bannissement
- Parsing des pages d'annonces
- Détection de doublons

#### 3. EstimationService
- Calcul de l'estimation basé sur les comparables
- Algorithme de pondération (distance, date, similarité)
- Calcul de la fourchette de prix
- Score de confiance

#### 4. LeadService
- Création et gestion des leads
- Export en CSV/Excel
- Suivi des conversions
- Statistiques

### Routes API

```
POST   /api/v1/estimations          - Créer une estimation
GET    /api/v1/estimations/:id      - Récupérer une estimation
GET    /api/v1/estimations/:id/comparables - Comparables utilisés
POST   /api/v1/leads                - Créer un lead
GET    /api/v1/leads                - Liste des leads (admin)
GET    /api/v1/dvf/search           - Recherche DVF (interne)
POST   /api/v1/scraping/jobs        - Créer un job de scraping (admin)
GET    /api/v1/scraping/jobs        - Liste des jobs (admin)
```

---

## 🔧 Préconisations Techniques

### 1. Intégration API DVF

**Source :** https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/

**Approche :**
- Utiliser l'API DVF+ d'Etalab si disponible
- Sinon, télécharger les fichiers CSV mensuels et les indexer
- Créer un index géospatial PostgreSQL (PostGIS) pour les recherches par rayon
- Cache Redis pour les requêtes fréquentes

**Bibliothèques :**
- `axios` pour les appels API
- `csv-parser` pour parser les fichiers CSV DVF
- `pg-postgis` pour les requêtes géospatiales

### 2. Scraping Respectueux

**Principes :**
- Toujours vérifier robots.txt avant scraping
- Rate limiting strict (max 1 requête/seconde par site)
- User-Agent identifié et contact fourni
- Respect des délais entre requêtes
- Utilisation de proxies rotatifs si nécessaire

**Bibliothèques :**
- `puppeteer` (déjà installé) pour le scraping JavaScript
- `cheerio` pour le parsing HTML
- `robots-parser` pour vérifier robots.txt
- `bull` (déjà installé) pour gérer les queues de scraping

**Sites Cibles :**
- SeLoger.com
- LeBonCoin.fr
- PAP.fr
- BienIci.com
- Logic-immo.com

### 3. Algorithme d'Estimation

**Méthodologie :**
1. Récupération des comparables (DVF + offres)
2. Filtrage par distance (rayon configurable, défaut 2km)
3. Pondération selon :
   - Distance (plus proche = plus important)
   - Date (plus récent = plus important)
   - Similarité des caractéristiques (surface, état, etc.)
4. Calcul de la médiane et des quartiles
5. Ajustement selon caractéristiques spécifiques du bien

**Formule de base :**
```
Valeur estimée = Médiane(prix_m2_comparables) × Surface × Coefficient_ajustement
```

### 4. Performance & Cache

**Stratégie de cache :**
- Cache Redis pour les estimations récentes (24h)
- Cache des résultats DVF par zone géographique (7 jours)
- Cache des comparables par adresse (1 jour)
- Index PostgreSQL sur code_postal, ville, type

**Optimisations :**
- Pagination sur toutes les listes
- Lazy loading des comparables
- Calculs asynchrones pour les estimations complexes

### 5. Sécurité & Conformité

**RGPD :**
- Consentement explicite pour la collecte de données
- Droit à l'oubli pour les leads
- Chiffrement des données sensibles
- Logs d'accès aux données personnelles

**Scraping Légal :**
- Respect strict des CGU des sites
- Contact préalable si nécessaire
- Limitation du volume de données scrapées
- Attribution de la source

---

## 📋 Plan d'Implémentation

### Phase 1 : Fondations (Semaine 1)
- [ ] Créer les modèles de données (Bien, Estimation, Comparable, Lead, ScrapingJob)
- [ ] Créer les migrations Sequelize
- [ ] Mettre à jour les types TypeScript
- [ ] Créer les services de base (EstimationService, LeadService)

### Phase 2 : Intégration DVF (Semaine 1-2)
- [ ] Étudier l'API DVF d'Etalab
- [ ] Créer DVFService avec récupération des données
- [ ] Implémenter le cache Redis pour DVF
- [ ] Créer les routes API pour recherche DVF

### Phase 3 : Scraping (Semaine 2-3)
- [ ] Créer ScrapingService avec respect robots.txt
- [ ] Implémenter le scraping pour SeLoger (premier site)
- [ ] Ajouter LeBonCoin et PAP
- [ ] Gérer les queues Bull pour le scraping asynchrone
- [ ] Détection de doublons

### Phase 4 : Algorithme d'Estimation (Semaine 3)
- [ ] Implémenter l'algorithme de calcul
- [ ] Créer les routes API pour les estimations
- [ ] Tests unitaires de l'algorithme
- [ ] Validation avec des cas réels

### Phase 5 : Frontend (Semaine 4)
- [ ] Créer le formulaire de saisie du bien
- [ ] Page de résultats d'estimation
- [ ] Affichage des comparables
- [ ] Formulaire de génération de lead
- [ ] Page admin pour gestion des leads

### Phase 6 : Tests & Optimisations (Semaine 5)
- [ ] Tests d'intégration complets
- [ ] Optimisation des performances
- [ ] Tests de charge
- [ ] Documentation utilisateur

---

## ⚠️ Points d'Attention

### Légal
- **Scraping** : Vérifier la légalité du scraping pour chaque site
- **RGPD** : Mise en conformité pour la collecte de leads
- **Données DVF** : Vérifier les conditions d'utilisation

### Technique
- **Rate Limiting** : Respecter les limites des APIs externes
- **Fiabilité** : Gérer les erreurs et timeouts
- **Performance** : Optimiser les requêtes géospatiales
- **Scalabilité** : Prévoir la montée en charge

### Métier
- **Précision** : L'estimation reste indicative, pas une garantie
- **Transparence** : Afficher la méthodologie et les sources
- **Mise à jour** : Maintenir les comparables à jour

---

## 📊 Métriques de Succès

- **Temps de réponse** : < 3s pour une estimation
- **Précision** : Fourchette de confiance affichée
- **Taux de conversion** : % de visiteurs devenant leads
- **Qualité des comparables** : Nombre et pertinence
- **Disponibilité** : > 99% uptime

---

## 🚀 Prochaines Étapes

1. **Validation** de cette architecture avec le client
2. **Démarrage Phase 1** : Création des modèles de données
3. **Mise en place** de l'environnement de développement
4. **Intégration progressive** des fonctionnalités

---

**Document créé le :** Septembre 2025  
**Dernière mise à jour :** Septembre 2025

