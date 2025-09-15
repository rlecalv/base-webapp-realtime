const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { syncDatabase } = require('./models');
const { initializeSocket } = require('./websocket/socketManager');
const redisClient = require('./config/redis');

// Import des routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

// Créer l'application Express
const app = express();
const server = http.createServer(app);

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

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

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
    await require('./config/database').authenticate();
    
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
      error: error.message
    });
  }
});

// Routes API
app.use(`/api/${config.app.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.app.apiVersion}/messages`, messageRoutes);

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
app.use((error, req, res, next) => {
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

module.exports = { app, server, io };