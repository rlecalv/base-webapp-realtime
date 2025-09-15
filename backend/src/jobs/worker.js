const { emailQueue, notificationQueue, dataProcessingQueue } = require('../services/queueService');
const { syncDatabase } = require('../models');
const redisClient = require('../config/redis');

console.log('🚀 Démarrage du worker Bull...');

// Fonction de démarrage du worker
const startWorker = async () => {
  try {
    // Synchroniser la base de données
    await syncDatabase();
    console.log('✅ Base de données synchronisée');
    
    // Connecter Redis
    await redisClient.connect();
    console.log('✅ Redis connecté');
    
    console.log('✅ Worker Bull démarré avec succès');
    console.log('📋 Queues actives:');
    console.log('  - Email Queue');
    console.log('  - Notification Queue');
    console.log('  - Data Processing Queue');
    
    // Programmer des tâches périodiques
    schedulePeriodicTasks();
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du worker:', error);
    process.exit(1);
  }
};

// Programmer des tâches périodiques
const schedulePeriodicTasks = () => {
  // Nettoyage quotidien à 2h du matin
  dataProcessingQueue.add(
    'cleanup_old_data',
    {},
    {
      repeat: { cron: '0 2 * * *' },
      removeOnComplete: 5,
      removeOnFail: 3
    }
  );
  
  console.log('📅 Tâches périodiques programmées');
};

// Gestion propre de l'arrêt du worker
process.on('SIGTERM', async () => {
  console.log('🛑 Arrêt du worker en cours...');
  
  try {
    await emailQueue.close();
    await notificationQueue.close();
    await dataProcessingQueue.close();
    await redisClient.quit();
    
    console.log('✅ Worker arrêté proprement');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'arrêt:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('🛑 Interruption du worker...');
  
  try {
    await emailQueue.close();
    await notificationQueue.close();
    await dataProcessingQueue.close();
    await redisClient.quit();
    
    console.log('✅ Worker interrompu proprement');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'interruption:', error);
    process.exit(1);
  }
});

// Démarrer le worker
startWorker();