'use client';

import React, { useState } from 'react';
import { Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatTime } from '@/lib/utils';
import { Button, Input } from '../../ui';
import { Edit2, Trash2, Check, X } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onEdit?: (messageId: number, newContent: string) => void;
  onDelete?: (messageId: number) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isOwnMessage = user?.id === message.user_id;
  const canModify = isOwnMessage || user?.is_admin;

  const handleEdit = () => {
    if (onEdit && editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      onDelete(message.id);
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwnMessage 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-800'
      }`}>
        {!isOwnMessage && (
          <div className="text-xs font-semibold mb-1 opacity-75">
            {message.user.username}
          </div>
        )}
        
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEdit();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              className="text-sm"
              autoFocus
            />
            <div className="flex space-x-1">
              <Button
                size="sm"
                onClick={handleEdit}
                className="h-6 px-2 text-xs"
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                className="h-6 px-2 text-xs"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm break-words">
              {message.content}
              {message.is_edited && (
                <span className="text-xs opacity-75 ml-2">(modifié)</span>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs opacity-75">
                {formatTime(message.created_at)}
              </div>
              
              {canModify && (
                <div className="flex space-x-1 ml-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="h-5 w-5 opacity-75 hover:opacity-100"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleDelete}
                    className="h-5 w-5 opacity-75 hover:opacity-100 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};