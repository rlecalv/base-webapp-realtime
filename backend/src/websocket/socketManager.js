const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: config.cors.origin,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Middleware d'authentification pour Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Token d\'authentification requis'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findByPk(decoded.userId);

      if (!user || !user.is_active) {
        return next(new Error('Utilisateur non trouvé ou inactif'));
      }

      socket.userId = user.id;
      socket.username = user.username;
      next();
    } catch (error) {
      console.error('Erreur d\'authentification WebSocket:', error);
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Utilisateur connecté: ${socket.username} (ID: ${socket.userId})`);

    // Rejoindre une room personnelle pour les messages privés
    socket.join(`user_${socket.userId}`);

    // Notifier les autres utilisateurs de la connexion
    socket.broadcast.emit('user_connected', {
      userId: socket.userId,
      username: socket.username,
      timestamp: new Date().toISOString()
    });

    // Gérer les messages en temps réel
    socket.on('send_message', async (data) => {
      try {
        // Le message sera créé via l'API REST
        // Ici on peut juste confirmer la réception
        socket.emit('message_received', {
          success: true,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        socket.emit('error', {
          message: 'Erreur lors de l\'envoi du message'
        });
      }
    });

    // Gérer la frappe en cours
    socket.on('typing_start', () => {
      socket.broadcast.emit('user_typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping: true
      });
    });

    socket.on('typing_stop', () => {
      socket.broadcast.emit('user_typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping: false
      });
    });

    // Gérer les messages privés
    socket.on('private_message', (data) => {
      const { targetUserId, message } = data;
      
      io.to(`user_${targetUserId}`).emit('private_message', {
        from: {
          userId: socket.userId,
          username: socket.username
        },
        message,
        timestamp: new Date().toISOString()
      });
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
      console.log(`❌ Utilisateur déconnecté: ${socket.username} (ID: ${socket.userId})`);
      
      // Notifier les autres utilisateurs de la déconnexion
      socket.broadcast.emit('user_disconnected', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date().toISOString()
      });
    });

    // Gérer les erreurs
    socket.on('error', (error) => {
      console.error('Erreur WebSocket:', error);
    });
  });

  return io;
};

const getSocketIO = () => {
  return io;
};

module.exports = {
  initializeSocket,
  getSocketIO
};