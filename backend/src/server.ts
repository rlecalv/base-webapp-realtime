import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { generalLimiter, abuseDetection } from './middleware/rateLimiting';

import config from './config';
import { syncDatabase } from './models';
import { initializeSocket } from './websocket/socketManager';
import redisClient from './config/redis';

// Import des routes
import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import exportRoutes from './routes/exports';
import patrimoineRoutes from './routes/patrimoine';

// Créer l'application Express
const app = express();
const server = createServer(app);

// Initialiser Socket.IO
const io = initializeSocket(server);

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Détection d'abus et rate limiting
app.use(abuseDetection);
app.use('/api/', generalLimiter);

// Middlewares généraux
app.use(compression());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', async (req, res) => {
  try {
    // Vérifier la connexion à la base de données
    const { sequelize } = await import('./config/database');
    await sequelize.authenticate();
    
    // Vérifier la connexion Redis
    await redisClient.ping();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        websocket: 'active'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: (error as Error).message
    });
  }
});

// Routes API
app.use(`/api/${config.app.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.app.apiVersion}/messages`, messageRoutes);
app.use(`/api/${config.app.apiVersion}/exports`, exportRoutes);
app.use(`/api/${config.app.apiVersion}`, patrimoineRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    name: 'Base WebApp API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: `/api/${config.app.apiVersion}/auth`,
      messages: `/api/${config.app.apiVersion}/messages`,
      exports: `/api/${config.app.apiVersion}/exports`,
      patrimoine: `/api/${config.app.apiVersion}/patrimoine`,
      locataires: `/api/${config.app.apiVersion}/locataires`,
      societes: `/api/${config.app.apiVersion}/societes`,
      dettes: `/api/${config.app.apiVersion}/dettes`,
      synthese: `/api/${config.app.apiVersion}/synthese`,
      echeances: `/api/${config.app.apiVersion}/echeances`,
      websocket: '/socket.io'
    }
  });
});

// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de gestion des erreurs globales
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Erreur globale:', error);
  
  res.status(error.status || 500).json({
    error: config.app.env === 'production' 
      ? 'Erreur interne du serveur' 
      : error.message,
    ...(config.app.env !== 'production' && { stack: error.stack })
  });
});

// Fonction de démarrage du serveur
const startServer = async () => {
  try {
    // Synchroniser la base de données
    await syncDatabase();
    
    // Connecter Redis
    await redisClient.connect();
    
    // Démarrer le serveur
    server.listen(config.app.port, () => {
      console.log(`
🚀 Serveur démarré avec succès !
📍 Port: ${config.app.port}
🌍 Environnement: ${config.app.env}
📡 API: http://localhost:${config.app.port}/api/${config.app.apiVersion}
🔌 WebSocket: http://localhost:${config.app.port}/socket.io
💾 Base de données: PostgreSQL connectée
🔴 Redis: connecté
      `);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', async () => {
  console.log('🛑 Arrêt du serveur en cours...');
  
  server.close(async () => {
    try {
      await redisClient.quit();
      console.log('✅ Serveur arrêté proprement');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt:', error);
      process.exit(1);
    }
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 Interruption du serveur...');
  
  server.close(async () => {
    try {
      await redisClient.quit();
      console.log('✅ Serveur interrompu proprement');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erreur lors de l\'interruption:', error);
      process.exit(1);
    }
  });
});

// Démarrer le serveur
if (require.main === module) {
  startServer();
}

export { app, server, io };