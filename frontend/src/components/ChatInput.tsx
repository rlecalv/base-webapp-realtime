'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Send } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { debounce } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { startTyping, stopTyping } = useSocket();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce pour arrêter l'indicateur de frappe
  const debouncedStopTyping = debounce(() => {
    if (isTyping) {
      stopTyping();
      setIsTyping(false);
    }
  }, 1000);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Gérer l'indicateur de frappe
    if (value.trim() && !isTyping) {
      startTyping();
      setIsTyping(true);
    } else if (!value.trim() && isTyping) {
      stopTyping();
      setIsTyping(false);
    }

    // Redémarrer le timer pour arrêter la frappe
    if (value.trim()) {
      debouncedStopTyping();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Arrêter l'indicateur de frappe
      if (isTyping) {
        stopTyping();
        setIsTyping(false);
      }
      
      // Refocus sur l'input
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Nettoyer l'indicateur de frappe au démontage
  useEffect(() => {
    return () => {
      if (isTyping) {
        stopTyping();
      }
    };
  }, [isTyping, stopTyping]);

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 p-4 border-t bg-white">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Tapez votre message..."
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex-1"
        maxLength={1000}
      />
      <Button
        type="submit"
        disabled={!message.trim() || disabled}
        size="icon"
        className="shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};