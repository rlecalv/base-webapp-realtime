'use client';

import React from 'react';
import { TypingUser } from '@/types';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    const usernames = typingUsers.map(user => user.username);
    
    if (usernames.length === 1) {
      return `${usernames[0]} est en train d'écrire...`;
    } else if (usernames.length === 2) {
      return `${usernames[0]} et ${usernames[1]} sont en train d'écrire...`;
    } else {
      return `${usernames.slice(0, -1).join(', ')} et ${usernames[usernames.length - 1]} sont en train d'écrire...`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-gray-500 italic">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span>{getTypingText()}</span>
      </div>
    </div>
  );
};