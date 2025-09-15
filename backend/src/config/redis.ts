import { createClient } from 'redis';
import 'dotenv/config';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  database: parseInt(process.env.REDIS_DB || '0'),
});

redisClient.on('connect', () => {
  console.log('✅ Connexion Redis établie');
});

redisClient.on('error', (err) => {
  console.error('❌ Erreur Redis:', err);
});

export default redisClient;