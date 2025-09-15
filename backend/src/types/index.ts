import { Request } from 'express';

// Types pour l'authentification
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    is_active: boolean;
  };
}

// Types pour les modèles
export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  is_active: boolean;
  is_admin: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MessageAttributes {
  id: number;
  content: string;
  user_id: number;
  message_type: 'text' | 'image' | 'file' | 'system';
  is_edited: boolean;
  edited_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Types pour les exports
export interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  userId?: number;
  messageType?: 'text' | 'image' | 'file' | 'system';
}

export interface ExportResult {
  success: boolean;
  filename: string;
  filepath: string;
  buffer?: Buffer;
}

export interface ExportFormat {
  key: string;
  name: string;
  description: string;
  mimeType: string;
}

// Types pour les statistiques
export interface UserStatistics {
  total_utilisateurs: number;
  utilisateurs_actifs: number;
  administrateurs: number;
  nouveaux_utilisateurs_30j: number;
}

export interface MessageStatistics {
  total_messages: number;
  messages_30j: number;
  [key: string]: number; // Pour les types de messages dynamiques
}

// Types pour la configuration
export interface AppConfig {
  app: {
    port: number;
    env: string;
    apiVersion: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  redis: {
    host: string;
    port: number;
    db: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

// Types pour les WebSocket
export interface SocketUser {
  id: number;
  username: string;
  socketId: string;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  userId?: number;
  timestamp: Date;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les validations
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Types pour les tâches asynchrones
export interface QueueJob {
  id: string;
  type: string;
  data: any;
  priority?: number;
  delay?: number;
  attempts?: number;
}

export interface EmailJob extends QueueJob {
  type: 'email';
  data: {
    to: string;
    subject: string;
    template: string;
    variables: Record<string, any>;
  };
}

export interface NotificationJob extends QueueJob {
  type: 'notification';
  data: {
    userId: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  };
}

// Types pour Puppeteer
export interface PuppeteerOptions {
  format?: 'A4' | 'A3' | 'Letter';
  printBackground?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  landscape?: boolean;
  width?: string;
  height?: string;
}

// Types pour les templates d'export
export interface ExportTemplate {
  name: string;
  description: string;
  supportedFormats: string[];
  generateHTML: (data: any) => string;
}

// Augmentation des types Express pour le middleware d'auth
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        is_admin: boolean;
        is_active: boolean;
      };
    }
  }
}

export {};
