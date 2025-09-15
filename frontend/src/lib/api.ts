import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthResponse, User, Message, ApiResponse, PaginatedResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = 'v1';

// Configuration d'Axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      Cookies.remove('auth_token');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API d'authentification
export const authApi = {
  register: async (userData: { username: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  verifyToken: async (): Promise<{ valid: boolean; user: User }> => {
    const response = await api.post('/auth/verify-token');
    return response.data;
  },
};

// API des messages
export const messagesApi = {
  getMessages: async (page = 1, limit = 50): Promise<PaginatedResponse<Message>> => {
    const response = await api.get(`/messages?page=${page}&limit=${limit}`);
    return response.data;
  },

  createMessage: async (content: string): Promise<ApiResponse<Message>> => {
    const response = await api.post('/messages', { content });
    return response.data;
  },

  updateMessage: async (id: number, content: string): Promise<ApiResponse<Message>> => {
    const response = await api.put(`/messages/${id}`, { content });
    return response.data;
  },

  deleteMessage: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },
};

// Types pour les exports
export interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  userId?: number;
  messageType?: 'text' | 'image' | 'file' | 'system';
}

export interface ExportFormat {
  key: string;
  name: string;
  description: string;
  mimeType: string;
}

// API des exports
export const exportsApi = {
  // Obtenir les formats d'export disponibles
  getFormats: async (): Promise<{ formats: ExportFormat[] }> => {
    const response = await api.get('/exports/formats');
    return response.data;
  },

  // Export des utilisateurs
  exportUsers: async (format: string = 'excel', filters: ExportFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.isAdmin !== undefined) params.append('isAdmin', filters.isAdmin.toString());

    const response = await api.get(`/exports/users?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export des messages
  exportMessages: async (format: string = 'excel', filters: ExportFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.userId) params.append('userId', filters.userId.toString());
    if (filters.messageType) params.append('messageType', filters.messageType);

    const response = await api.get(`/exports/messages?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export des statistiques
  exportStatistics: async (format: string = 'pdf'): Promise<Blob> => {
    const response = await api.get(`/exports/statistics?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export personnalisé
  exportCustom: async (data: any, format: string, template?: string, filename?: string): Promise<Blob> => {
    const payload = {
      data,
      format,
      template,
      filename,
    };

    const response = await api.post('/exports/custom', payload, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Vérifier l'état du service d'export
  checkHealth: async (): Promise<{ status: any }> => {
    const response = await api.get('/exports/health');
    return response.data;
  },

  // Nettoyer les anciens fichiers d'export
  cleanup: async (days: number = 7): Promise<{ message: string }> => {
    const response = await api.delete(`/exports/cleanup?days=${days}`);
    return response.data;
  },
};

// Utilitaires
export const setAuthToken = (token: string) => {
  Cookies.set('auth_token', token, { expires: 7, secure: true, sameSite: 'strict' });
};

export const removeAuthToken = () => {
  Cookies.remove('auth_token');
  Cookies.remove('user');
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get('auth_token');
};

export default api;