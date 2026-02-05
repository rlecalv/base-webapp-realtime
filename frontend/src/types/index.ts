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

// Types pour l'estimation immobilière
export interface Bien {
  id: number;
  type: 'immeuble_bloc' | 'appartement' | 'maison' | 'part_indivise';
  adresse: string;
  code_postal: string;
  ville: string;
  departement: string;
  surface_totale: number;
  nombre_lots?: number;
  quote_part?: number;
  annee_construction?: number;
  etat_general: 'excellent' | 'bon' | 'moyen' | 'a_renover';
  caracteristiques: Record<string, any>;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface Estimation {
  id: number;
  bien_id: number;
  user_id?: number;
  valeur_estimee: number;
  valeur_min: number;
  valeur_max: number;
  methode: 'comparables_dvf' | 'comparables_offres' | 'mixte';
  nombre_comparables: number;
  confiance: number;
  details: Record<string, any>;
  bien?: Bien;
  created_at: string;
  updated_at: string;
}

export interface Comparable {
  id: number;
  type: 'transaction' | 'offre';
  source: 'dvf' | 'seloger' | 'leboncoin' | 'pap' | 'bienici' | 'logic-immo' | 'autre';
  adresse: string;
  code_postal: string;
  ville: string;
  surface: number;
  prix: number;
  prix_m2: number;
  date_transaction?: string;
  date_publication?: string;
  url_source?: string;
  caracteristiques: Record<string, any>;
  distance_bien?: number;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: number;
  estimation_id: number;
  email: string;
  telephone?: string;
  nom?: string;
  prenom?: string;
  type_bien_interesse?: string;
  budget_max?: number;
  statut: 'nouveau' | 'contacte' | 'convertis' | 'perdu';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EstimationFormData {
  type: 'immeuble_bloc' | 'appartement' | 'maison' | 'part_indivise';
  adresse: string;
  code_postal: string;
  ville: string;
  departement: string;
  surface_totale: number;
  nombre_lots?: number;
  quote_part?: number;
  annee_construction?: number;
  etat_general: 'excellent' | 'bon' | 'moyen' | 'a_renover';
  caracteristiques?: Record<string, any>;
  latitude?: number;
  longitude?: number;
  methode?: 'comparables_dvf' | 'comparables_offres' | 'mixte';
}

export interface LeadFormData {
  estimation_id: number;
  email: string;
  telephone?: string;
  nom?: string;
  prenom?: string;
  type_bien_interesse?: string;
  budget_max?: number;
}