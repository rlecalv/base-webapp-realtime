export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Message {
  id: number;
  content: string;
  user_id: number;
  user: {
    id: number;
    username: string;
  };
  message_type: 'text' | 'image' | 'file' | 'system';
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
  details?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WebSocketMessage {
  type: 'connection' | 'new_message' | 'message_updated' | 'message_deleted' | 'user_connected' | 'user_disconnected' | 'user_typing' | 'private_message' | 'error';
  id?: number;
  content?: string;
  user?: {
    id: number;
    username: string;
  };
  userId?: number;
  username?: string;
  message?: string;
  timestamp?: string;
  isTyping?: boolean;
  from?: {
    userId: number;
    username: string;
  };
}

export interface TypingUser {
  userId: number;
  username: string;
  isTyping: boolean;
}