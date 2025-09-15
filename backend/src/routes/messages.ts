import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { messageLimiter } from '../middleware/rateLimiting';
import { Message, User } from '../models';
import auth from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Middleware de gestion des erreurs de validation
const handleValidationErrors = (req: Request, res: Response, next: any): any => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Données invalides',
      details: errors.array()
    });
  }
  return next();
};

// Validation pour la création de message
const validateMessage = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Le message doit contenir entre 1 et 1000 caractères')
    .trim(),
];

// GET /messages - Récupérer les messages avec pagination
router.get('/', auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100 messages
    const offset = (page - 1) * limit;

    // Compter le total des messages
    const totalMessages = await Message.count();

    // Récupérer les messages avec les informations utilisateur
    const messages = await Message.findAll({
      limit,
      offset,
      order: [['created_at', 'ASC']], // Ordre chronologique
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'is_admin']
      }]
    });

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(totalMessages / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        message_type: msg.message_type || 'text',
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        user: msg.user ? {
          id: msg.user.id,
          username: msg.user.username,
          is_admin: msg.user.is_admin
        } : null
      })),
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /messages - Créer un nouveau message
router.post('/', auth, messageLimiter, validateMessage, handleValidationErrors, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
    }

    // Créer le message
    const message = await Message.create({
      content,
      user_id: userId,
      message_type: 'text'
    } as any);

    // Récupérer le message avec les informations utilisateur
    const messageWithUser = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'is_admin']
      }]
    });

    if (!messageWithUser) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du message'
      });
    }

    const responseData = {
      id: messageWithUser.id,
      content: messageWithUser.content,
      message_type: messageWithUser.message_type || 'text',
      created_at: messageWithUser.created_at,
      updated_at: messageWithUser.updated_at,
      user: messageWithUser.user ? {
        id: messageWithUser.user.id,
        username: messageWithUser.user.username,
        is_admin: messageWithUser.user.is_admin
      } : null
    };

    res.status(201).json({
      success: true,
      message: 'Message créé avec succès',
      data: responseData
    });

  } catch (error: any) {
    console.error('Erreur lors de la création du message:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// PUT /messages/:id - Modifier un message
router.put('/:id', auth, validateMessage, handleValidationErrors, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const messageId = parseInt(req.params.id);
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
    }

    // Trouver le message
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message non trouvé'
      });
    }

    // Vérifier que l'utilisateur peut modifier ce message
    if (message.user_id !== userId && !req.user?.is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Vous ne pouvez modifier que vos propres messages'
      });
    }

    // Mettre à jour le message
    await message.update({ content });

    // Récupérer le message mis à jour avec les informations utilisateur
    const updatedMessage = await Message.findByPk(messageId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'is_admin']
      }]
    });

    const responseData = {
      id: updatedMessage!.id,
      content: updatedMessage!.content,
      message_type: updatedMessage!.message_type || 'text',
      created_at: updatedMessage!.created_at,
      updated_at: updatedMessage!.updated_at,
      user: updatedMessage!.user ? {
        id: updatedMessage!.user.id,
        username: updatedMessage!.user.username,
        is_admin: updatedMessage!.user.is_admin
      } : null
    };

    res.json({
      success: true,
      message: 'Message modifié avec succès',
      data: responseData
    });

  } catch (error: any) {
    console.error('Erreur lors de la modification du message:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// DELETE /messages/:id - Supprimer un message
router.delete('/:id', auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const messageId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
    }

    // Trouver le message
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message non trouvé'
      });
    }

    // Vérifier que l'utilisateur peut supprimer ce message
    if (message.user_id !== userId && !req.user?.is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Vous ne pouvez supprimer que vos propres messages'
      });
    }

    // Supprimer le message
    await message.destroy();

    res.json({
      success: true,
      message: 'Message supprimé avec succès'
    });

  } catch (error: any) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

export default router;
