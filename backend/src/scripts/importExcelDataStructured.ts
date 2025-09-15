import 'dotenv/config';
import * as XLSX from 'xlsx';
import path from 'path';
import { 
  sequelize, 
  Societe, 
  ActifImmobilier, 
  Locataire, 
  Loyer, 
  Valorisation, 
  Financement,
  CalculActifImmobilier,
  CalculLoyer,
  CalculFinancement
} from '../models';

const EXCEL_FILE_PATH = path.join(__dirname, '../../../FINDEV - Etat patrimonial.xlsx');

interface ActifData {
  societeNom: string;
  siren: string;
  adresse: string;
  natureBien: string;
  surface: number;
  anneeAcquisition: number;
  prixAchat: number;
  locataire: string;
  dateEffetBail: number;
  typeBail: string;
  dateFinBail: number;
  loyerAnnuelHT: number;
  loyerM2: number;
  tauxCapitalisation: number;
  pourcentageDetention: number;
  montantPret: number;
  crd: number;
  crdFindev: number;
  echeanceCredit: number;
  chargeAnnuelleDette: number;
  banque: string;
  cashFlow: number;
  ltv: number;
  dscr: number;
}

const parseExcelDate = (excelDate: number): Date | null => {
  if (!excelDate || isNaN(excelDate)) return null;
  // Excel utilise le 1er janvier 1900 comme date de référence (avec un bug sur 1900 qui n'est pas bissextile)
  const excelEpoch = new Date(1900, 0, 1);
  const date = new Date(excelEpoch.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000);
  return date;
};

const extractStructuredData = async (): Promise<ActifData[]> => {
  try {
    console.log('📊 Extraction des données structurées du fichier Excel...');
    
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const worksheet = workbook.Sheets['Etat Patrimonial'];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    const actifs: ActifData[] = [];
    
    // Parcourir les lignes à partir de la ligne 3 (index 2) car les 2 premières sont des en-têtes
    for (let row = 2; row <= range.e.r; row++) {
      const rowData: any[] = [];
      
      // Extraire toutes les valeurs de la ligne
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        rowData.push(cell ? cell.v : '');
      }
      
      // Vérifier si cette ligne contient des données d'actif (adresse non vide)
      const adresse = rowData[3]; // Colonne D
      if (!adresse || typeof adresse !== 'string' || adresse.trim() === '') {
        continue;
      }
      
      try {
        const actif: ActifData = {
          societeNom: rowData[1] || '', // Colonne B
          siren: rowData[2] ? rowData[2].toString().replace(/\s/g, '') : '', // Colonne C
          adresse: adresse.trim(), // Colonne D
          natureBien: rowData[4] || 'Local commercial', // Colonne E
          surface: parseFloat(rowData[5]) || 0, // Colonne F
          anneeAcquisition: parseInt(rowData[6]) || 0, // Colonne G
          prixAchat: parseFloat(rowData[7]) || 0, // Colonne H
          locataire: rowData[8] || '', // Colonne I
          dateEffetBail: rowData[9] || 0, // Colonne J (date Excel)
          typeBail: rowData[10] || '3/6/9', // Colonne K
          dateFinBail: rowData[11] || 0, // Colonne L (date Excel)
          loyerAnnuelHT: parseFloat(rowData[12]) || 0, // Colonne M
          loyerM2: parseFloat(rowData[13]) || 0, // Colonne N
          tauxCapitalisation: parseFloat(rowData[15]) || 0, // Colonne P
          pourcentageDetention: parseFloat(rowData[17]) || 0, // Colonne R
          montantPret: parseFloat(rowData[19]) || 0, // Colonne T
          crd: parseFloat(rowData[20]) || 0, // Colonne U
          crdFindev: parseFloat(rowData[21]) || 0, // Colonne V
          echeanceCredit: parseInt(rowData[22]) || 0, // Colonne W
          chargeAnnuelleDette: parseFloat(rowData[23]) || 0, // Colonne X
          banque: rowData[24] || '', // Colonne Y
          cashFlow: parseFloat(rowData[25]) || 0, // Colonne Z
          ltv: parseFloat(rowData[26]) || 0, // Colonne AA
          dscr: parseFloat(rowData[27]) || 0 // Colonne AB
        };
        
        actifs.push(actif);
        console.log(`   ✅ Actif extrait: ${actif.adresse} (${actif.societeNom})`);
        
      } catch (error) {
        console.error(`❌ Erreur extraction ligne ${row + 1}:`, error);
      }
    }
    
    console.log(`📋 Total: ${actifs.length} actifs extraits`);
    return actifs;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    throw error;
  }
};

const importSocietes = async (actifs: ActifData[]): Promise<Map<string, number>> => {
  console.log('🏢 Import des sociétés...');
  
  const societes = new Map<string, number>();
  const societesUniques = [...new Set(actifs.map(a => a.societeNom).filter(nom => nom))];
  
  for (const nomSociete of societesUniques) {
    try {
      const [societe] = await Societe.findOrCreate({
        where: { nom: nomSociete },
        defaults: {
          nom: nomSociete,
          siret: actifs.find(a => a.societeNom === nomSociete)?.siren?.padEnd(14, '0') || undefined,
          forme_juridique: nomSociete.startsWith('SCI') ? 'SCI' : 
                          nomSociete.startsWith('SAS') ? 'SAS' : 
                          nomSociete.startsWith('SNC') ? 'SNC' : 'Autre',
          secteur_activite: 'Investissement immobilier',
          actif: true
        }
      });
      
      societes.set(nomSociete, societe.id);
      console.log(`   ✅ Société: ${nomSociete} (ID: ${societe.id})`);
      
    } catch (error) {
      console.error(`❌ Erreur création société ${nomSociete}:`, error);
    }
  }
  
  return societes;
};

const importLocataires = async (actifs: ActifData[]): Promise<Map<string, number>> => {
  console.log('👥 Import des locataires...');
  
  const locataires = new Map<string, number>();
  const locatairesUniques = [...new Set(actifs.map(a => a.locataire).filter(loc => loc))];
  
  for (const nomLocataire of locatairesUniques) {
    try {
      const [locataire] = await Locataire.findOrCreate({
        where: { nom: nomLocataire },
        defaults: {
          type_locataire: 'entreprise', // Tous semblent être des entreprises
          nom: nomLocataire,
          actif: true
        }
      });
      
      locataires.set(nomLocataire, locataire.id);
      console.log(`   ✅ Locataire: ${nomLocataire} (ID: ${locataire.id})`);
      
    } catch (error) {
      console.error(`❌ Erreur création locataire ${nomLocataire}:`, error);
    }
  }
  
  return locataires;
};

const importActifsEtDonnees = async (
  actifs: ActifData[], 
  societes: Map<string, number>, 
  locataires: Map<string, number>
): Promise<void> => {
  console.log('🏢 Import des actifs immobiliers et données associées...');
  
  for (const actifData of actifs) {
    try {
      // Déterminer l'ID de la société
      let societeId = 1; // Société par défaut
      if (actifData.societeNom && societes.has(actifData.societeNom)) {
        societeId = societes.get(actifData.societeNom)!;
      }
      
      // Extraire ville et code postal de l'adresse
      const adresseParts = actifData.adresse.split(',');
      const dernierePartie = adresseParts[adresseParts.length - 1]?.trim() || '';
      const codePostalMatch = dernierePartie.match(/(\d{5})\s+(.+)/);
      
      let codePostal = '00000';
      let ville = 'Ville inconnue';
      
      if (codePostalMatch) {
        codePostal = codePostalMatch[1];
        ville = codePostalMatch[2];
      } else if (dernierePartie) {
        ville = dernierePartie;
      }
      
      // Créer l'actif immobilier
      const actif = await ActifImmobilier.create({
        societe_id: societeId,
        nom: `${actifData.natureBien} - ${ville}`,
        type_bien: actifData.natureBien.toLowerCase().includes('commercial') ? 'commerce' : 'autre',
        adresse: actifData.adresse,
        code_postal: codePostal,
        ville: ville,
        surface_totale: actifData.surface || undefined,
        surface_louable: actifData.surface || undefined,
        nombre_lots: 1,
        date_acquisition: actifData.anneeAcquisition ? new Date(actifData.anneeAcquisition, 0, 1) : undefined,
        prix_acquisition: actifData.prixAchat || undefined,
        valeur_actuelle: actifData.prixAchat || undefined,
        rendement_brut: actifData.prixAchat > 0 ? (actifData.loyerAnnuelHT / actifData.prixAchat) * 100 : undefined,
        actif: true
      });
      
      console.log(`   ✅ Actif créé: ${actif.nom} (ID: ${actif.id})`);
      
      // Créer le loyer si on a un locataire
      if (actifData.locataire && actifData.loyerAnnuelHT > 0) {
        const locataireId = locataires.get(actifData.locataire);
        if (locataireId) {
          const dateDebut = parseExcelDate(actifData.dateEffetBail) || new Date();
          const dateFin = parseExcelDate(actifData.dateFinBail) || undefined;
          
          const loyer = await Loyer.create({
            actif_immobilier_id: actif.id,
            locataire_id: locataireId,
            date_debut: dateDebut,
            date_fin: dateFin,
            type_bail: 'commercial',
            montant_loyer_mensuel: actifData.loyerAnnuelHT / 12,
            periodicite_paiement: 'mensuel',
            jour_echeance: 1,
            statut: 'actif',
            actif: true
          });
          
          console.log(`     💰 Loyer créé: ${actifData.loyerAnnuelHT.toFixed(2)}€/an`);
        }
      }
      
      // Créer la valorisation
      if (actifData.prixAchat > 0) {
        await Valorisation.create({
          actif_immobilier_id: actif.id,
          date_evaluation: new Date(),
          valeur_estimee: actifData.prixAchat,
          methode_evaluation: 'cout_remplacement',
          prix_m2: actifData.surface > 0 ? actifData.prixAchat / actifData.surface : undefined,
          taux_capitalisation: actifData.tauxCapitalisation > 0 ? actifData.tauxCapitalisation * 100 : undefined,
          statut: 'finalisee',
          actif: true
        });
        
        console.log(`     📈 Valorisation créée: ${actifData.prixAchat.toFixed(2)}€`);
      }
      
      // Créer le financement si on a un prêt
      if (actifData.montantPret > 0) {
        const dateDebut = new Date();
        const dateFin = actifData.echeanceCredit > 0 ? new Date(actifData.echeanceCredit, 11, 31) : new Date(dateDebut.getFullYear() + 20, 11, 31);
          const dureeAnnees = Math.max(1, dateFin.getFullYear() - dateDebut.getFullYear());
        const mensualite = actifData.chargeAnnuelleDette / 12;
        
        await Financement.create({
          actif_immobilier_id: actif.id,
          type_financement: 'credit_immobilier',
          organisme_preteur: actifData.banque || 'Banque inconnue',
          montant_emprunte: actifData.montantPret,
          taux_interet: 3.5, // Taux estimé
          duree_mois: dureeAnnees * 12,
          date_debut: dateDebut,
          date_fin: dateFin,
          mensualite: mensualite,
          capital_restant_du: actifData.crd || actifData.montantPret,
          type_taux: 'fixe',
          periodicite_remboursement: 'mensuel',
          date_echeance: 1,
          statut: 'actif',
          actif: true
        });
        
        console.log(`     🏦 Financement créé: ${actifData.montantPret.toFixed(2)}€ (CRD: ${actifData.crd.toFixed(2)}€)`);
      }
      
      // Créer le calcul d'actif
      const revenus = actifData.loyerAnnuelHT;
      const charges = revenus * 0.25; // Estimation 25%
      const revenusNets = revenus - charges;
      const serviceDetteAnnuel = actifData.chargeAnnuelleDette;
      const cashFlowNet = revenusNets - serviceDetteAnnuel;
      
      await CalculActifImmobilier.create({
        actif_immobilier_id: actif.id,
        date_calcul: new Date(),
        periode_calcul: 'annuel',
        revenus_locatifs_bruts: revenus,
        revenus_locatifs_nets: revenusNets,
        charges_totales: charges,
        charges_courantes: charges * 0.8,
        charges_exceptionnelles: charges * 0.2,
        travaux_maintenance: 0,
        travaux_amelioration: 0,
        taxe_fonciere_calculee: 0,
        assurance_calculee: 0,
        frais_gestion_calcules: 0,
        provisions_charges: 0,
        cash_flow_brut: revenus,
        cash_flow_net: cashFlowNet,
        rentabilite_brute: actifData.prixAchat > 0 ? (revenus / actifData.prixAchat) * 100 : 0,
        rentabilite_nette: actifData.prixAchat > 0 ? (revenusNets / actifData.prixAchat) * 100 : 0,
        taux_occupation_calcule: 100,
        valeur_actuelle_calculee: actifData.prixAchat,
        plus_value_latente: 0,
        amortissement_cumule: 0,
        valeur_comptable_nette: actifData.prixAchat,
        ratio_endettement: actifData.prixAchat > 0 ? (actifData.crd / actifData.prixAchat) * 100 : 0,
        couverture_dette: serviceDetteAnnuel > 0 ? revenusNets / serviceDetteAnnuel : 0,
        statut_calcul: 'calcule',
        actif: true
      });
      
      console.log(`     📊 Calculs générés - Cash Flow: ${cashFlowNet.toFixed(2)}€, Rentabilité: ${actifData.prixAchat > 0 ? ((revenusNets / actifData.prixAchat) * 100).toFixed(2) : 0}%`);
      
    } catch (error) {
      console.error(`❌ Erreur import actif ${actifData.adresse}:`, error);
    }
  }
};

const generateSummary = async (): Promise<void> => {
  console.log('\n📊 RÉSUMÉ DES CALCULS GÉNÉRÉS');
  console.log('================================');
  
  try {
    // Statistiques globales
    const totalActifs = await ActifImmobilier.count();
    const totalSocietes = await Societe.count();
    const totalLocataires = await Locataire.count();
    const totalLoyers = await Loyer.count();
    const totalFinancements = await Financement.count();
    
    console.log(`📈 Entités créées:`);
    console.log(`   - ${totalSocietes} sociétés`);
    console.log(`   - ${totalActifs} actifs immobiliers`);
    console.log(`   - ${totalLocataires} locataires`);
    console.log(`   - ${totalLoyers} contrats de loyer`);
    console.log(`   - ${totalFinancements} financements`);
    
    // Calculs par actif
    const calculs = await CalculActifImmobilier.findAll({
      include: [{
        model: ActifImmobilier,
        as: 'actif_immobilier',
        include: [{
          model: Societe,
          as: 'societe'
        }]
      }]
    });
    
    let totalRevenusBruts = 0;
    let totalRevenusNets = 0;
    let totalCashFlow = 0;
    let totalValorisation = 0;
    let totalDettes = 0;
    
    console.log(`\n💰 Détail par actif:`);
    for (const calcul of calculs) {
      const revenus = parseFloat(calcul.revenus_locatifs_bruts.toString());
      const revenusNets = parseFloat(calcul.revenus_locatifs_nets.toString());
      const cashFlow = parseFloat(calcul.cash_flow_net.toString());
      const valorisation = parseFloat(calcul.valeur_actuelle_calculee.toString());
      const ratioEndettement = parseFloat(calcul.ratio_endettement.toString());
      
      totalRevenusBruts += revenus;
      totalRevenusNets += revenusNets;
      totalCashFlow += cashFlow;
      totalValorisation += valorisation;
      totalDettes += (valorisation * ratioEndettement / 100);
      
      console.log(`   🏢 ${(calcul as any).actif_immobilier.nom}:`);
      console.log(`      - Revenus bruts: ${revenus.toFixed(0)}€`);
      console.log(`      - Revenus nets: ${revenusNets.toFixed(0)}€`);
      console.log(`      - Cash Flow: ${cashFlow.toFixed(0)}€`);
      console.log(`      - Valorisation: ${valorisation.toFixed(0)}€`);
      console.log(`      - Endettement: ${ratioEndettement.toFixed(1)}%`);
    }
    
    console.log(`\n🎯 TOTAUX GLOBAUX:`);
    console.log(`   💵 Revenus bruts totaux: ${totalRevenusBruts.toFixed(0)}€`);
    console.log(`   💰 Revenus nets totaux: ${totalRevenusNets.toFixed(0)}€`);
    console.log(`   📊 Cash Flow total: ${totalCashFlow.toFixed(0)}€`);
    console.log(`   🏠 Valorisation totale: ${totalValorisation.toFixed(0)}€`);
    console.log(`   🏦 Dettes totales: ${totalDettes.toFixed(0)}€`);
    console.log(`   📈 Ratio d'endettement global: ${totalValorisation > 0 ? ((totalDettes / totalValorisation) * 100).toFixed(1) : 0}%`);
    console.log(`   💎 Rentabilité nette globale: ${totalValorisation > 0 ? ((totalRevenusNets / totalValorisation) * 100).toFixed(2) : 0}%`);
    
  } catch (error) {
    console.error('❌ Erreur génération résumé:', error);
  }
};

const importStructuredData = async (): Promise<void> => {
  try {
    console.log('🚀 Import structuré des données Excel...');
    
    // Connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');
    
    // Extraction des données
    const actifs = await extractStructuredData();
    if (actifs.length === 0) {
      throw new Error('Aucune donnée extraite du fichier Excel');
    }
    
    // Import des sociétés
    const societes = await importSocietes(actifs);
    
    // Import des locataires
    const locataires = await importLocataires(actifs);
    
    // Import des actifs et données associées
    await importActifsEtDonnees(actifs, societes, locataires);
    
    // Générer le résumé
    await generateSummary();
    
    console.log('\n✅ Import structuré terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import structuré:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Exécuter l'import
if (require.main === module) {
  importStructuredData()
    .then(() => {
      console.log('🎉 Import structuré terminé !');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export { importStructuredData };
