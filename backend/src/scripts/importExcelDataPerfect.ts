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

interface LoyerData {
  locataire: string;
  loyerAnnuel: number;
  dateEffetBail?: number;
  typeBail?: string;
  dateFinBail?: number;
}

interface DonneesFinancieres {
  prixAchat?: number;
  pourcentageDetention?: number;
  montantPret?: number;
  crd?: number;
  crdFindev?: number;
  echeanceCredit?: number;
  chargeAnnuelleDette?: number;
  banque?: string;
  cashFlow?: number;
  ltv?: number;
  dscr?: number;
}

interface ActifDataComplete {
  societeNom: string;
  siren: string;
  adresse: string;
  natureBien: string;
  surface: number;
  anneeAcquisition: number;
  loyers: LoyerData[];
  loyerGlobalAdresse: number;
  tauxCapitalisation: number;
  donneesFinancieres: DonneesFinancieres;
}

const parseExcelDate = (excelDate: number): Date | null => {
  if (!excelDate || isNaN(excelDate)) return null;
  const excelEpoch = new Date(1900, 0, 1);
  const date = new Date(excelEpoch.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000);
  return date;
};

const extractCompleteDataPerfect = async (): Promise<ActifDataComplete[]> => {
  try {
    console.log('📊 Extraction PARFAITE avec gestion avancée des cellules fusionnées...');
    
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const worksheet = workbook.Sheets['Etat Patrimonial'];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    const actifs: ActifDataComplete[] = [];
    let currentSociete = '';
    let currentSiren = '';
    let currentActif: ActifDataComplete | null = null;
    let bufferDonneesFinancieres: DonneesFinancieres | null = null;
    
    // Parcourir les lignes à partir de la ligne 3 (index 2)
    for (let row = 2; row <= range.e.r; row++) {
      const rowData: any[] = [];
      
      // Extraire toutes les valeurs de la ligne
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        rowData.push(cell ? cell.v : '');
      }
      
      const societe = rowData[1]; // Colonne B
      const siren = rowData[2]; // Colonne C
      const adresse = rowData[3]; // Colonne D
      const natureBien = rowData[4]; // Colonne E
      const surface = rowData[5]; // Colonne F
      const anneeAcquisition = rowData[6]; // Colonne G
      const prixAchat = parseFloat(rowData[7]) || 0; // Colonne H
      const locataire = rowData[8]; // Colonne I
      const loyerAnnuel = parseFloat(rowData[12]) || 0; // Colonne M
      const loyerGlobalAdresse = parseFloat(rowData[14]) || 0; // Colonne O
      const tauxCapitalisation = parseFloat(rowData[15]) || 0; // Colonne P
      const pourcentageDetention = parseFloat(rowData[17]) || 0; // Colonne R
      const montantPret = parseFloat(rowData[19]) || 0; // Colonne T
      const crd = parseFloat(rowData[20]) || 0; // Colonne U
      const crdFindev = parseFloat(rowData[21]) || 0; // Colonne V
      const echeanceCredit = parseInt(rowData[22]) || 0; // Colonne W
      const chargeAnnuelleDette = parseFloat(rowData[23]) || 0; // Colonne X
      const banque = rowData[24] || ''; // Colonne Y
      const cashFlow = parseFloat(rowData[25]) || 0; // Colonne Z
      const ltv = parseFloat(rowData[26]) || 0; // Colonne AA
      const dscr = parseFloat(rowData[27]) || 0; // Colonne AB
      
      // Détecter ligne de totaux (prix > 20M ou %détention > 5)
      if (prixAchat > 20000000 || pourcentageDetention > 5) {
        console.log(`⏭️  Ligne ${row + 1}: Ligne de totaux ignorée (Prix: ${prixAchat}, %Det: ${pourcentageDetention})`);
        continue;
      }
      
      // Mettre à jour la société courante si elle est renseignée
      if (societe && typeof societe === 'string' && societe.trim() !== '') {
        currentSociete = societe.trim();
        currentSiren = siren ? siren.toString().replace(/\s/g, '') : '';
        console.log(`🏢 Ligne ${row + 1}: Nouvelle société détectée: ${currentSociete} (SIREN: ${currentSiren})`);
      }
      
      // Créer un objet données financières si présentes
      let donneesFinancieres: DonneesFinancieres = {};
      if (prixAchat || pourcentageDetention || montantPret || crd || banque) {
        donneesFinancieres = {
          prixAchat: prixAchat || undefined,
          pourcentageDetention: pourcentageDetention || undefined,
          montantPret: montantPret || undefined,
          crd: crd || undefined,
          crdFindev: crdFindev || undefined,
          echeanceCredit: echeanceCredit || undefined,
          chargeAnnuelleDette: chargeAnnuelleDette || undefined,
          banque: banque || undefined,
          cashFlow: cashFlow || undefined,
          ltv: ltv || undefined,
          dscr: dscr || undefined
        };
        console.log(`💰 Ligne ${row + 1}: Données financières détectées (Prix: ${prixAchat}, Prêt: ${montantPret})`);
      }
      
      // Si on a une nouvelle adresse (nouvel actif)
      if (adresse && typeof adresse === 'string' && adresse.trim() !== '') {
        // Finaliser l'actif précédent
        if (currentActif) {
          actifs.push(currentActif);
        }
        
        // Utiliser les données financières de cette ligne ou du buffer
        const donneesFinancieresActif = Object.keys(donneesFinancieres).length > 0 ? 
          donneesFinancieres : 
          (bufferDonneesFinancieres || {});
        
        // Créer un nouvel actif avec la société courante
        currentActif = {
          societeNom: currentSociete,
          siren: currentSiren,
          adresse: adresse.trim(),
          natureBien: natureBien || 'Local commercial',
          surface: parseFloat(surface) || 0,
          anneeAcquisition: parseInt(anneeAcquisition) || 0,
          loyers: [],
          loyerGlobalAdresse: loyerGlobalAdresse,
          tauxCapitalisation: tauxCapitalisation,
          donneesFinancieres: donneesFinancieresActif
        };
        
        console.log(`  🏠 Ligne ${row + 1}: Nouvel actif: ${adresse.trim()} → ${currentSociete}`);
        if (bufferDonneesFinancieres && Object.keys(donneesFinancieres).length === 0) {
          console.log(`    🔄 Utilisation du buffer financier pour cet actif`);
        }
        
        // Vider le buffer si utilisé
        if (bufferDonneesFinancieres && Object.keys(donneesFinancieres).length === 0) {
          bufferDonneesFinancieres = null;
        }
      }
      // Si pas d'adresse mais des données financières, les mettre en buffer
      else if (Object.keys(donneesFinancieres).length > 0 && !adresse) {
        bufferDonneesFinancieres = donneesFinancieres;
        console.log(`📦 Ligne ${row + 1}: Données financières mises en buffer (Prix: ${prixAchat}, Prêt: ${montantPret})`);
      }
      
      // Ajouter le loyer si on a un locataire et un montant
      if (currentActif && locataire && loyerAnnuel > 0) {
        currentActif.loyers.push({
          locataire: locataire.toString(),
          loyerAnnuel: loyerAnnuel,
          dateEffetBail: rowData[9] || undefined,
          typeBail: rowData[10] || '3/6/9',
          dateFinBail: rowData[11] || undefined
        });
        console.log(`    💰 Ligne ${row + 1}: Loyer ajouté: ${locataire} - ${loyerAnnuel}€/an`);
      }
    }
    
    // Finaliser le dernier actif
    if (currentActif) {
      actifs.push(currentActif);
    }
    
    console.log(`📋 Total: ${actifs.length} actifs extraits avec gestion parfaite des cellules fusionnées`);
    
    // Afficher le résumé par société avec données financières
    const societeStats = new Map<string, {count: number, avecFinancement: number}>();
    for (const actif of actifs) {
      const current = societeStats.get(actif.societeNom) || {count: 0, avecFinancement: 0};
      current.count++;
      if (actif.donneesFinancieres.montantPret || actif.donneesFinancieres.prixAchat) {
        current.avecFinancement++;
      }
      societeStats.set(actif.societeNom, current);
    }
    
    console.log('\n📊 RÉPARTITION PAR SOCIÉTÉ:');
    for (const [societe, stats] of societeStats.entries()) {
      console.log(`   🏢 ${societe}: ${stats.count} actif(s) (${stats.avecFinancement} avec financement)`);
    }
    
    return actifs;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    throw error;
  }
};

const clearAndImportPerfect = async (): Promise<void> => {
  try {
    console.log('🚀 Import PARFAIT avec gestion complète des cellules fusionnées...');
    
    // Connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');
    
    // Nettoyer les données existantes
    console.log('🧹 Nettoyage des données existantes...');
    await CalculActifImmobilier.destroy({ where: {}, force: true });
    await CalculLoyer.destroy({ where: {}, force: true });
    await CalculFinancement.destroy({ where: {}, force: true });
    await Financement.destroy({ where: {}, force: true });
    await Valorisation.destroy({ where: {}, force: true });
    await Loyer.destroy({ where: {}, force: true });
    await ActifImmobilier.destroy({ where: {}, force: true });
    await Locataire.destroy({ where: {}, force: true });
    await Societe.destroy({ where: {}, force: true });
    
    // Réinitialiser les séquences
    await sequelize.query('ALTER SEQUENCE societes_id_seq RESTART WITH 1');
    await sequelize.query('ALTER SEQUENCE actifs_immobiliers_id_seq RESTART WITH 1');
    await sequelize.query('ALTER SEQUENCE locataires_id_seq RESTART WITH 1');
    await sequelize.query('ALTER SEQUENCE loyers_id_seq RESTART WITH 1');
    
    console.log('✅ Nettoyage terminé');
    
    // Extraction des données parfaites
    const actifs = await extractCompleteDataPerfect();
    
    // Import des sociétés
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
    
    // Import des locataires (tous)
    console.log('👥 Import des locataires...');
    const locataires = new Map<string, number>();
    const tousLocataires = actifs.flatMap(a => a.loyers.map(l => l.locataire));
    const locatairesUniques = [...new Set(tousLocataires.filter(loc => loc))];
    
    for (const nomLocataire of locatairesUniques) {
      try {
        const [locataire] = await Locataire.findOrCreate({
          where: { nom: nomLocataire },
          defaults: {
            type_locataire: 'entreprise',
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
    
    // Import des actifs avec leurs données financières complètes
    console.log('🏢 Import des actifs immobiliers avec données financières complètes...');
    let totalLoyersImportes = 0;
    let actifsAvecFinancement = 0;
    let actifsAvecDetention = 0;
    
    for (const actifData of actifs) {
      try {
        // Déterminer l'ID de la société
        const societeId = societes.get(actifData.societeNom);
        if (!societeId) {
          console.error(`❌ Société introuvable: ${actifData.societeNom}`);
          continue;
        }
        
        // Extraire ville et code postal
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
        
        // Calculer le loyer total de l'actif
        const loyerTotalActif = actifData.loyers.reduce((sum, loyer) => sum + loyer.loyerAnnuel, 0);
        
        // Créer l'actif immobilier avec toutes les données
        const actif = await ActifImmobilier.create({
          societe_id: societeId,
          nom: `${actifData.natureBien} - ${ville}`,
          type_bien: actifData.natureBien.toLowerCase().includes('commercial') ? 'commerce' : 'autre',
          adresse: actifData.adresse,
          code_postal: codePostal,
          ville: ville,
          surface_totale: actifData.surface || undefined,
          surface_louable: actifData.surface || undefined,
          nombre_lots: actifData.loyers.length || 1,
          date_acquisition: actifData.anneeAcquisition ? new Date(actifData.anneeAcquisition, 0, 1) : undefined,
          prix_acquisition: actifData.donneesFinancieres.prixAchat || undefined,
          valeur_actuelle: actifData.donneesFinancieres.prixAchat || undefined,
          rendement_brut: actifData.donneesFinancieres.prixAchat && loyerTotalActif > 0 ? (loyerTotalActif / actifData.donneesFinancieres.prixAchat) * 100 : undefined,
          pourcentage_detention: actifData.donneesFinancieres.pourcentageDetention ? actifData.donneesFinancieres.pourcentageDetention * 100 : undefined,
          actif: true
        });
        
        console.log(`   ✅ Actif créé: ${actif.nom} (ID: ${actif.id}) → ${actifData.societeNom}`);
        
        if (actifData.donneesFinancieres.pourcentageDetention) {
          console.log(`     📊 Pourcentage détention FINDEV: ${(actifData.donneesFinancieres.pourcentageDetention * 100).toFixed(1)}%`);
          actifsAvecDetention++;
        }
        
        if (actifData.donneesFinancieres.prixAchat) {
          console.log(`     💰 Prix d'achat: ${actifData.donneesFinancieres.prixAchat.toLocaleString()}€`);
        }
        
        // Créer tous les loyers pour cet actif
        for (const loyerData of actifData.loyers) {
          const locataireId = locataires.get(loyerData.locataire);
          if (locataireId) {
            const dateDebut = parseExcelDate(loyerData.dateEffetBail!) || new Date();
            const dateFin = parseExcelDate(loyerData.dateFinBail!) || undefined;
            
            await Loyer.create({
              actif_immobilier_id: actif.id,
              locataire_id: locataireId,
              date_debut: dateDebut,
              date_fin: dateFin,
              type_bail: 'commercial',
              montant_loyer_mensuel: loyerData.loyerAnnuel / 12,
              periodicite_paiement: 'mensuel',
              jour_echeance: 1,
              statut: 'actif',
              actif: true
            });
            
            totalLoyersImportes += loyerData.loyerAnnuel;
            console.log(`     💰 Loyer: ${loyerData.locataire} - ${loyerData.loyerAnnuel.toFixed(2)}€/an`);
          }
        }
        
        // Créer la valorisation si on a un prix d'achat
        if (actifData.donneesFinancieres.prixAchat && actifData.donneesFinancieres.prixAchat > 0) {
          await Valorisation.create({
            actif_immobilier_id: actif.id,
            date_evaluation: new Date(),
            valeur_estimee: actifData.donneesFinancieres.prixAchat,
            methode_evaluation: 'cout_remplacement',
            prix_m2: actifData.surface > 0 ? actifData.donneesFinancieres.prixAchat / actifData.surface : undefined,
            taux_capitalisation: actifData.tauxCapitalisation > 0 ? actifData.tauxCapitalisation * 100 : undefined,
            statut: 'finalisee',
            actif: true
          });
          
          console.log(`     📈 Valorisation créée: ${actifData.donneesFinancieres.prixAchat.toFixed(2)}€`);
        }
        
        // Créer le financement si nécessaire
        if (actifData.donneesFinancieres.montantPret && actifData.donneesFinancieres.montantPret > 0) {
          const dateDebut = new Date();
          const dateFin = actifData.donneesFinancieres.echeanceCredit && actifData.donneesFinancieres.echeanceCredit > 0 ? 
            new Date(actifData.donneesFinancieres.echeanceCredit, 11, 31) : 
            new Date(dateDebut.getFullYear() + 20, 11, 31);
          const dureeAnnees = Math.max(1, dateFin.getFullYear() - dateDebut.getFullYear());
          const mensualite = actifData.donneesFinancieres.chargeAnnuelleDette ? actifData.donneesFinancieres.chargeAnnuelleDette / 12 : 0;
          
          await Financement.create({
            actif_immobilier_id: actif.id,
            type_financement: 'credit_immobilier',
            organisme_preteur: actifData.donneesFinancieres.banque || 'Banque inconnue',
            montant_emprunte: actifData.donneesFinancieres.montantPret,
            taux_interet: 3.5,
            duree_mois: dureeAnnees * 12,
            date_debut: dateDebut,
            date_fin: dateFin,
            mensualite: mensualite,
            capital_restant_du: actifData.donneesFinancieres.crd || actifData.donneesFinancieres.montantPret,
            type_taux: 'fixe',
            periodicite_remboursement: 'mensuel',
            date_echeance: 1,
            statut: 'actif',
            actif: true
          });
          
          console.log(`     🏦 Financement créé: ${actifData.donneesFinancieres.montantPret.toFixed(2)}€ (CRD: ${(actifData.donneesFinancieres.crd || 0).toFixed(2)}€)`);
          actifsAvecFinancement++;
        }
        
        // Créer le calcul d'actif avec le bon total de loyers
        const charges = loyerTotalActif * 0.25;
        const revenusNets = loyerTotalActif - charges;
        const serviceDetteAnnuel = actifData.donneesFinancieres.chargeAnnuelleDette || 0;
        const cashFlowNet = revenusNets - serviceDetteAnnuel;
        
        await CalculActifImmobilier.create({
          actif_immobilier_id: actif.id,
          date_calcul: new Date(),
          periode_calcul: 'annuel',
          revenus_locatifs_bruts: loyerTotalActif,
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
          cash_flow_brut: loyerTotalActif,
          cash_flow_net: cashFlowNet,
          rentabilite_brute: actifData.donneesFinancieres.prixAchat && loyerTotalActif > 0 ? (loyerTotalActif / actifData.donneesFinancieres.prixAchat) * 100 : 0,
          rentabilite_nette: actifData.donneesFinancieres.prixAchat && revenusNets > 0 ? (revenusNets / actifData.donneesFinancieres.prixAchat) * 100 : 0,
          taux_occupation_calcule: 100,
          valeur_actuelle_calculee: actifData.donneesFinancieres.prixAchat || 0,
          plus_value_latente: 0,
          amortissement_cumule: 0,
          valeur_comptable_nette: actifData.donneesFinancieres.prixAchat || 0,
          ratio_endettement: actifData.donneesFinancieres.prixAchat && actifData.donneesFinancieres.crd ? (actifData.donneesFinancieres.crd / actifData.donneesFinancieres.prixAchat) * 100 : 0,
          couverture_dette: serviceDetteAnnuel > 0 ? revenusNets / serviceDetteAnnuel : 0,
          statut_calcul: 'calcule',
          actif: true
        });
        
        console.log(`     📊 Total loyers actif: ${loyerTotalActif.toFixed(2)}€/an, Cash Flow: ${cashFlowNet.toFixed(2)}€`);
        
      } catch (error) {
        console.error(`❌ Erreur import actif ${actifData.adresse}:`, error);
      }
    }
    
    // Calculer les statistiques de détention
    const detentionMoyenne = actifsAvecDetention > 0 ? 
      actifs.filter(a => a.donneesFinancieres.pourcentageDetention).reduce((sum, a) => sum + (a.donneesFinancieres.pourcentageDetention || 0), 0) / actifsAvecDetention : 0;
    
    console.log(`\n🎯 RÉSUMÉ DE L'IMPORT PARFAIT:`);
    console.log(`   - Total loyers importés: ${totalLoyersImportes.toFixed(2)}€/an`);
    console.log(`   - Nombre d'actifs: ${actifs.length}`);
    console.log(`   - Actifs avec financement: ${actifsAvecFinancement}/${actifs.length}`);
    console.log(`   - Actifs avec détention FINDEV: ${actifsAvecDetention}/${actifs.length}`);
    console.log(`   - Détention moyenne FINDEV: ${(detentionMoyenne * 100).toFixed(1)}%`);
    console.log(`   - Nombre de locataires: ${locatairesUniques.length}`);
    console.log(`   - Nombre de sociétés: ${societesUniques.length}`);
    
    console.log('\n✅ Import PARFAIT terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import parfait:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Exécuter l'import
if (require.main === module) {
  clearAndImportPerfect()
    .then(() => {
      console.log('🎉 Import parfait terminé !');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export { clearAndImportPerfect };
