'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { messagesApi } from '@/lib/api';
import { ChatMessage, ChatInput, TypingIndicator, UserList } from '@/components/features/chat';
import { Button, FormInput, Avatar } from '@/components/ui';
import { ExportButton } from '@/components/features/admin';
import { LogOut, MessageCircle, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { 
    messages, 
    typingUsers, 
    isConnected, 
    addMessage, 
    updateMessage, 
    deleteMessage 
  } = useSocket();
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Rediriger si non authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Charger les messages existants
  useEffect(() => {
    const loadMessages = async () => {
      if (isAuthenticated) {
        try {
          const response = await messagesApi.getMessages(1, 50);
          // Les messages sont déjà dans l'ordre chronologique
          response.messages.forEach(message => addMessage(message));
        } catch (error) {
          console.error('Erreur lors du chargement des messages:', error);
          toast.error('Erreur lors du chargement des messages');
        } finally {
          setIsLoadingMessages(false);
        }
      }
    };

    loadMessages();
  }, [isAuthenticated, addMessage]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await messagesApi.createMessage(content);
      if (response.data) {
        // Le message sera ajouté via WebSocket
        console.log('Message envoyé avec succès');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'envoi du message';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = async (messageId: number, newContent: string) => {
    try {
      const response = await messagesApi.updateMessage(messageId, newContent);
      if (response.data) {
        updateMessage(response.data);
        toast.success('Message modifié');
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification du message:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la modification';
      toast.error(errorMessage);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await messagesApi.deleteMessage(messageId);
      deleteMessage(messageId);
      toast.success('Message supprimé');
    } catch (error: any) {
      console.error('Erreur lors de la suppression du message:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression';
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Éviter le flash pendant la redirection
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Chat Temps Réel</h1>
              <p className="text-sm text-gray-500">
                Connecté en tant que <span className="font-medium">{user?.username}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>{isConnected ? 'En ligne' : 'Hors ligne'}</span>
            </div>
            
            <ExportButton 
              exportType="messages" 
              variant="outline"
              size="sm"
            />
            
            {user?.is_admin && (
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Administration</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Chargement des messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Aucun message pour le moment</p>
                  <p className="text-sm">Soyez le premier à envoyer un message !</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Typing indicator */}
          <TypingIndicator typingUsers={typingUsers} />

          {/* Message input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={!isConnected || isSending}
          />
        </div>

        {/* User list sidebar */}
        <UserList />
      </div>
    </div>
  );
}