'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { User, AuthResponse } from '@/types';
import { authApi, setAuthToken, removeAuthToken } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  register: (userData: { username: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = Cookies.get('auth_token');
        const savedUser = Cookies.get('user');

        if (token && savedUser) {
          // Vérifier si le token est toujours valide
          try {
            const response = await authApi.verifyToken();
            if (response.valid) {
              setUser(response.user);
              Cookies.set('user', JSON.stringify(response.user), { expires: 7 });
            } else {
              removeAuthToken();
            }
          } catch (error) {
            console.error('Token invalide:', error);
            removeAuthToken();
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        removeAuthToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authApi.login(credentials);
      
      setUser(response.user);
      setAuthToken(response.token);
      Cookies.set('user', JSON.stringify(response.user), { expires: 7 });
      
      toast.success(`Bienvenue ${response.user.username} !`);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la connexion';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { username: string; email: string; password: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authApi.register(userData);
      
      setUser(response.user);
      setAuthToken(response.token);
      Cookies.set('user', JSON.stringify(response.user), { expires: 7 });
      
      toast.success(`Compte créé avec succès ! Bienvenue ${response.user.username} !`);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'inscription';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    removeAuthToken();
    toast.success('Déconnexion réussie');
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response.user);
      Cookies.set('user', JSON.stringify(response.user), { expires: 7 });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};