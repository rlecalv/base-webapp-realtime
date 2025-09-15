'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { socketManager } from '@/lib/socket';
import { useAuth } from './AuthContext';
import { Message, WebSocketMessage, TypingUser } from '@/types';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  typingUsers: TypingUser[];
  connectedUsers: { userId: number; username: string }[];
  sendMessage: (content: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  sendPrivateMessage: (targetUserId: number, message: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  deleteMessage: (messageId: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket doit être utilisé dans un SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<{ userId: number; username: string }[]>([]);

  // Connexion/déconnexion WebSocket
  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  const connectSocket = async () => {
    try {
      const socketInstance = await socketManager.connect();
      setSocket(socketInstance);
      setIsConnected(true);
      
      // Écouter les événements
      setupSocketListeners(socketInstance);
      
      console.log('✅ Socket connecté et événements configurés');
    } catch (error) {
      console.error('❌ Erreur de connexion socket:', error);
      setIsConnected(false);
      toast.error('Erreur de connexion temps réel');
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socketManager.disconnect();
      setSocket(null);
      setIsConnected(false);
      setTypingUsers([]);
      setConnectedUsers([]);
      // Réinitialiser les messages lors de la déconnexion pour éviter les doublons
      setMessages([]);
    }
  };

  const setupSocketListeners = (socketInstance: Socket) => {
    // Connexion établie
    socketInstance.on('connection', (data: WebSocketMessage) => {
      console.log('🔌 Connexion WebSocket confirmée:', data.message);
      toast.success('Connexion temps réel établie');
    });

    // Nouveau message reçu
    socketInstance.on('new_message', (data: WebSocketMessage) => {
      if (data.id && data.content && data.user) {
        const newMessage: Message = {
          id: data.id,
          content: data.content,
          user_id: data.user.id,
          user: data.user,
          message_type: 'text',
          is_edited: false,
          created_at: data.timestamp || new Date().toISOString(),
          updated_at: data.timestamp || new Date().toISOString(),
        };
        
        setMessages(prev => {
          // Vérifier si le message existe déjà pour éviter les doublons
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) {
            return prev;
          }
          return [...prev, newMessage];
        });
        
        // Notification si ce n'est pas notre message
        if (user && data.user.id !== user.id) {
          toast.success(`Nouveau message de ${data.user.username}`);
        }
      }
    });

    // Message mis à jour
    socketInstance.on('message_updated', (updatedMessage: Message) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      );
      toast.info('Message modifié');
    });

    // Message supprimé
    socketInstance.on('message_deleted', (data: { id: number }) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.id));
      toast.info('Message supprimé');
    });

    // Utilisateur connecté
    socketInstance.on('user_connected', (data: WebSocketMessage) => {
      if (data.userId && data.username) {
        setConnectedUsers(prev => {
          const exists = prev.some(u => u.userId === data.userId);
          if (!exists) {
            return [...prev, { userId: data.userId, username: data.username }];
          }
          return prev;
        });
        
        if (user && data.userId !== user.id) {
          toast.success(`${data.username} s'est connecté`);
        }
      }
    });

    // Utilisateur déconnecté
    socketInstance.on('user_disconnected', (data: WebSocketMessage) => {
      if (data.userId && data.username) {
        setConnectedUsers(prev => prev.filter(u => u.userId !== data.userId));
        
        if (user && data.userId !== user.id) {
          toast.info(`${data.username} s'est déconnecté`);
        }
      }
    });

    // Utilisateur en train de taper
    socketInstance.on('user_typing', (data: WebSocketMessage) => {
      if (data.userId && data.username && user && data.userId !== user.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          if (data.isTyping) {
            return [...filtered, { 
              userId: data.userId, 
              username: data.username, 
              isTyping: true 
            }];
          }
          return filtered;
        });
      }
    });

    // Message privé reçu
    socketInstance.on('private_message', (data: WebSocketMessage) => {
      if (data.from && data.message) {
        toast.success(`Message privé de ${data.from.username}: ${data.message}`);
      }
    });

    // Erreurs
    socketInstance.on('error', (data: WebSocketMessage) => {
      console.error('❌ Erreur WebSocket:', data.message);
      toast.error(data.message || 'Erreur WebSocket');
    });

    // Déconnexion
    socketInstance.on('disconnect', (reason: string) => {
      console.log('🔌 Socket déconnecté:', reason);
      setIsConnected(false);
      toast.warning('Connexion temps réel interrompue');
    });
  };

  // Méthodes pour interagir avec le socket
  const sendMessage = (content: string) => {
    if (socket && isConnected) {
      socketManager.sendMessage(content);
    }
  };

  const startTyping = () => {
    if (socket && isConnected) {
      socketManager.startTyping();
    }
  };

  const stopTyping = () => {
    if (socket && isConnected) {
      socketManager.stopTyping();
    }
  };

  const sendPrivateMessage = (targetUserId: number, message: string) => {
    if (socket && isConnected) {
      socketManager.sendPrivateMessage(targetUserId, message);
    }
  };

  // Méthodes pour gérer les messages localement
  const addMessage = (message: Message) => {
    setMessages(prev => {
      // Vérifier si le message existe déjà pour éviter les doublons
      const exists = prev.some(msg => msg.id === message.id);
      if (exists) {
        return prev;
      }
      return [...prev, message];
    });
  };

  const updateMessage = (message: Message) => {
    setMessages(prev => 
      prev.map(msg => msg.id === message.id ? message : msg)
    );
  };

  const deleteMessage = (messageId: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    messages,
    typingUsers,
    connectedUsers,
    sendMessage,
    startTyping,
    stopTyping,
    sendPrivateMessage,
    addMessage,
    updateMessage,
    deleteMessage,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};