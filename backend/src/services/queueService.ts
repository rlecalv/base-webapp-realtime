import Queue from 'bull';
import redisClient from '../config/redis';

// Configuration Redis pour Bull
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: parseInt(process.env.REDIS_DB || '0')
};

// Configuration des queues
const emailQueue = new Queue('email processing', {
  redis: redisConfig
});

const notificationQueue = new Queue('notification processing', {
  redis: redisConfig
});

const dataProcessingQueue = new Queue('data processing', {
  redis: redisConfig
});

const scrapingQueue = new Queue('scraping', {
  redis: redisConfig
});

// Jobs pour les emails
emailQueue.process('send_welcome_email', async (job) => {
  const { userEmail, username } = job.data;
  
  console.log(`📧 Envoi d'email de bienvenue à ${userEmail}`);
  
  // Simulation d'envoi d'email
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log(`✅ Email de bienvenue envoyé à ${username}`);
  
  return { success: true, email: userEmail };
});

emailQueue.process('send_notification_email', async (job) => {
  const { userEmail, subject, content } = job.data;
  
  console.log(`📧 Envoi de notification email à ${userEmail}`);
  
  // Simulation d'envoi d'email
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log(`✅ Email de notification envoyé`);
  
  return { success: true, email: userEmail };
});

// Jobs pour les notifications
notificationQueue.process('send_push_notification', async (job) => {
  const { userId, title, message } = job.data;
  
  console.log(`📱 Envoi de notification push à l'utilisateur ${userId}`);
  
  // Simulation d'envoi de notification push
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`✅ Notification push envoyée`);
  
  return { success: true, userId };
});

// Jobs pour le traitement de données
dataProcessingQueue.process('process_user_analytics', async (job) => {
  const { userId, action, metadata } = job.data;
  
  console.log(`📊 Traitement des analytics pour l'utilisateur ${userId}`);
  
  // Simulation de traitement d'analytics
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Stocker les résultats dans Redis
  const analyticsKey = `analytics:user:${userId}`;
  const analyticsData = {
    action,
    metadata,
    processedAt: new Date().toISOString(),
    userId
  };
  
  await redisClient.lPush(analyticsKey, JSON.stringify(analyticsData));
  await redisClient.expire(analyticsKey, 86400); // Expire après 24h
  
  console.log(`✅ Analytics traités pour l'utilisateur ${userId}`);
  
  return { success: true, userId, action };
});

dataProcessingQueue.process('cleanup_old_data', async (job) => {
  console.log(`🧹 Nettoyage des anciennes données`);
  
  // Simulation de nettoyage
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log(`✅ Nettoyage terminé`);
  
  return { success: true, cleanedAt: new Date().toISOString() };
});

// Gestion des erreurs
emailQueue.on('failed', (job, err) => {
  console.error(`❌ Job email échoué: ${job.id}`, err);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`❌ Job notification échoué: ${job.id}`, err);
});

dataProcessingQueue.on('failed', (job, err) => {
  console.error(`❌ Job traitement données échoué: ${job.id}`, err);
});

// Événements de succès
emailQueue.on('completed', (job, result) => {
  console.log(`✅ Job email terminé: ${job.id}`);
});

notificationQueue.on('completed', (job, result) => {
  console.log(`✅ Job notification terminé: ${job.id}`);
});

dataProcessingQueue.on('completed', (job, result) => {
  console.log(`✅ Job traitement données terminé: ${job.id}`);
});

// Jobs pour le scraping
scrapingQueue.process('scraping', async (job) => {
  const { jobId, site, type, parametres } = job.data;
  
  console.log(`🕷️ Exécution du job de scraping ${jobId} pour ${site}`);
  
  // Importer dynamiquement pour éviter les dépendances circulaires
  const { executeScrapingJob } = await import('./scrapingService');
  await executeScrapingJob(jobId);
  
  console.log(`✅ Job de scraping ${jobId} terminé`);
  
  return { success: true, jobId, site };
});

scrapingQueue.on('failed', (job, err) => {
  console.error(`❌ Job scraping échoué: ${job.id}`, err);
});

scrapingQueue.on('completed', (job, result) => {
  console.log(`✅ Job scraping terminé: ${job.id}`);
});

// Fonction helper pour ajouter un job
export const addJob = async (queueName: string, jobData: any): Promise<any> => {
  const queues: Record<string, any> = {
    email: emailQueue,
    notification: notificationQueue,
    'data-processing': dataProcessingQueue,
    scraping: scrapingQueue
  };

  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} non trouvée`);
  }

  return await queue.add(jobData);
};

export {
  emailQueue,
  notificationQueue,
  dataProcessingQueue,
  scrapingQueue
};