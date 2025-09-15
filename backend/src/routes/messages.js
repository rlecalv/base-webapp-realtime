const express = require('express');
const { Message, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateMessage } = require('../middleware/validation');
const { getSocketIO } = require('../websocket/socketManager');

const router = express.Router();

// Récupérer les messages
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const messages = await Message.findAndCountAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      messages: messages.rows.reverse(), // Inverser pour avoir les plus anciens en premier
      pagination: {
        total: messages.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(messages.count / limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Créer un nouveau message
router.post('/', authenticateToken, validateMessage, async (req, res) => {
  try {
    const { content } = req.body;

    const message = await Message.create({
      content,
      user_id: req.user.id
    });

    // Récupérer le message avec les informations utilisateur
    const messageWithUser = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }]
    });

    // Diffuser le message via WebSocket
    const io = getSocketIO();
    if (io) {
      io.emit('new_message', {
        id: messageWithUser.id,
        content: messageWithUser.content,
        user: messageWithUser.user,
        created_at: messageWithUser.created_at,
        message_type: messageWithUser.message_type
      });
    }

    res.status(201).json({
      message: 'Message créé avec succès',
      data: messageWithUser
    });

  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Modifier un message
router.put('/:id', authenticateToken, validateMessage, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({
        error: 'Message non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire du message
    if (message.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({
        error: 'Vous n\'êtes pas autorisé à modifier ce message'
      });
    }

    await message.update({
      content,
      is_edited: true,
      edited_at: new Date()
    });

    // Récupérer le message mis à jour avec les informations utilisateur
    const updatedMessage = await Message.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }]
    });

    // Diffuser la modification via WebSocket
    const io = getSocketIO();
    if (io) {
      io.emit('message_updated', updatedMessage);
    }

    res.json({
      message: 'Message modifié avec succès',
      data: updatedMessage
    });

  } catch (error) {
    console.error('Erreur lors de la modification du message:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Supprimer un message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({
        error: 'Message non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire du message ou admin
    if (message.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({
        error: 'Vous n\'êtes pas autorisé à supprimer ce message'
      });
    }

    await message.destroy();

    // Diffuser la suppression via WebSocket
    const io = getSocketIO();
    if (io) {
      io.emit('message_deleted', { id: parseInt(id) });
    }

    res.json({
      message: 'Message supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;