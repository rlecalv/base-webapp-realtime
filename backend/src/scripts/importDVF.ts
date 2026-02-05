import { downloadAndIndexDVFIdf } from '../services/dvfService';
import { syncDatabase } from '../models';
import redisClient from '../config/redis';

async function main() {
  try {
    console.log('🚀 Démarrage de l\'importation des données DVF...');
    
    // Synchroniser la base de données
    await syncDatabase();
    console.log('✅ Base de données synchronisée');
    
    // Connecter Redis
    await redisClient.connect();
    console.log('✅ Redis connecté');
    
    // Télécharger et indexer les données DVF
    const nombreComparables = await downloadAndIndexDVFIdf();
    
    console.log(`\n✅ Importation terminée avec succès !`);
    console.log(`📊 ${nombreComparables} comparables importés`);
    
    await redisClient.quit();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'importation:', error);
    process.exit(1);
  }
}

main();

