'use client';

import React from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';

export const UserList: React.FC = () => {
  const { connectedUsers, isConnected } = useSocket();
  const { user } = useAuth();

  return (
    <div className="bg-white border-l border-gray-200 w-64 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Utilisateurs connectés</h3>
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
      </div>

      <div className="space-y-2">
        {/* Utilisateur actuel */}
        {user && (
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-800">
              {user.username} (vous)
            </span>
          </div>
        )}

        {/* Autres utilisateurs connectés */}
        {connectedUsers
          .filter(connectedUser => user && connectedUser.userId !== user.id)
          .map((connectedUser) => (
            <div key={connectedUser.userId} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                {connectedUser.username}
              </span>
            </div>
          ))}

        {connectedUsers.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            Aucun autre utilisateur connecté
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Statut: {isConnected ? (
            <span className="text-green-600 font-medium">Connecté</span>
          ) : (
            <span className="text-red-600 font-medium">Déconnecté</span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {connectedUsers.length + (user ? 1 : 0)} utilisateur{connectedUsers.length + (user ? 1 : 0) > 1 ? 's' : ''} en ligne
        </div>
      </div>
    </div>
  );
};