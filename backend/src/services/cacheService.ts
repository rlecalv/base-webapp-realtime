import redisClient from '../config/redis';
import { User, Message } from '../models';

// Interface pour les options de cache
interface CacheOptions {
  ttl?: number;
  prefix?: string;
  serialize?: boolean;
}

// Service de cache avancé
export class CacheService {
  private static instance: CacheService;
  
  private constructor() {}
  
  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }
  
  // Méthode générique pour mettre en cache
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      const { ttl = 300, prefix = 'app', serialize = true } = options;
      const fullKey = `${prefix}:${key}`;
      
      const data = serialize ? JSON.stringify(value) : value;
      
      if (ttl > 0) {
        await redisClient.setEx(fullKey, ttl, data);
      } else {
        await redisClient.set(fullKey, data);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur cache set:', error);
      return false;
    }
  }
  
  // Méthode générique pour récupérer du cache
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const { prefix = 'app', serialize = true } = options;
      const fullKey = `${prefix}:${key}`;
      
      const data = await redisClient.get(fullKey);
      if (!data) return null;
      
      return serialize ? JSON.parse(data) : (data as any);
    } catch (error) {
      console.error('Erreur cache get:', error);
      return null;
    }
  }
  
  // Supprimer une clé du cache
  async del(key: string, prefix: string = 'app'): Promise<boolean> {
    try {
      const fullKey = `${prefix}:${key}`;
      await redisClient.del(fullKey);
      return true;
    } catch (error) {
      console.error('Erreur cache del:', error);
      return false;
    }
  }
  
  // Cache avec fonction de récupération
  async getOrSet<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T | null> {
    try {
      // Essayer de récupérer depuis le cache
      const cached = await this.get<T>(key, options);
      if (cached !== null) {
        return cached;
      }
      
      // Récupérer les données
      const data = await fetchFn();
      
      // Mettre en cache
      await this.set(key, data, options);
      
      return data;
    } catch (error) {
      console.error('Erreur cache getOrSet:', error);
      return null;
    }
  }
  
  // Cache spécialisé pour les utilisateurs
  async cacheUser(user: User, ttl: number = 600): Promise<boolean> {
    const key = `user:${user.id}`;
    return this.set(key, {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    }, { ttl, prefix: 'users' });
  }
  
  // Récupérer un utilisateur du cache
  async getCachedUser(userId: number): Promise<any | null> {
    return this.get(`user:${userId}`, { prefix: 'users' });
  }
  
  // Cache pour les statistiques
  async cacheStats(stats: any, ttl: number = 300): Promise<boolean> {
    return this.set('global_stats', stats, { ttl, prefix: 'stats' });
  }
  
  // Récupérer les statistiques du cache
  async getCachedStats(): Promise<any | null> {
    return this.get('global_stats', { prefix: 'stats' });
  }
  
  // Cache pour les messages récents
  async cacheRecentMessages(messages: Message[], ttl: number = 180): Promise<boolean> {
    const serializedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      message_type: msg.message_type,
      user_id: msg.user_id,
      created_at: msg.created_at
    }));
    
    return this.set('recent_messages', serializedMessages, { ttl, prefix: 'messages' });
  }
  
  // Récupérer les messages récents du cache
  async getCachedRecentMessages(): Promise<any[] | null> {
    return this.get('recent_messages', { prefix: 'messages' });
  }
  
  // Cache pour les exports en cours
  async cacheExportStatus(exportId: string, status: any, ttl: number = 3600): Promise<boolean> {
    return this.set(`export:${exportId}`, status, { ttl, prefix: 'exports' });
  }
  
  // Récupérer le statut d'un export
  async getExportStatus(exportId: string): Promise<any | null> {
    return this.get(`export:${exportId}`, { prefix: 'exports' });
  }
  
  // Invalider le cache utilisateur
  async invalidateUserCache(userId: number): Promise<boolean> {
    return this.del(`user:${userId}`, 'users');
  }
  
  // Invalider le cache des messages
  async invalidateMessagesCache(): Promise<boolean> {
    return this.del('recent_messages', 'messages');
  }
  
  // Invalider le cache des statistiques
  async invalidateStatsCache(): Promise<boolean> {
    return this.del('global_stats', 'stats');
  }
  
  // Méthode pour les sessions utilisateur
  async setUserSession(sessionId: string, userData: any, ttl: number = 86400): Promise<boolean> {
    return this.set(`session:${sessionId}`, userData, { ttl, prefix: 'sessions' });
  }
  
  // Récupérer une session utilisateur
  async getUserSession(sessionId: string): Promise<any | null> {
    return this.get(`session:${sessionId}`, { prefix: 'sessions' });
  }
  
  // Supprimer une session
  async deleteUserSession(sessionId: string): Promise<boolean> {
    return this.del(`session:${sessionId}`, 'sessions');
  }
  
  // Cache pour les tokens de réinitialisation de mot de passe
  async setPasswordResetToken(token: string, userId: number, ttl: number = 3600): Promise<boolean> {
    return this.set(`reset:${token}`, { userId, createdAt: Date.now() }, { ttl, prefix: 'auth' });
  }
  
  // Vérifier un token de réinitialisation
  async getPasswordResetToken(token: string): Promise<any | null> {
    return this.get(`reset:${token}`, { prefix: 'auth' });
  }
  
  // Supprimer un token de réinitialisation
  async deletePasswordResetToken(token: string): Promise<boolean> {
    return this.del(`reset:${token}`, 'auth');
  }
  
  // Méthodes utilitaires
  async exists(key: string, prefix: string = 'app'): Promise<boolean> {
    try {
      const fullKey = `${prefix}:${key}`;
      const result = await redisClient.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('Erreur cache exists:', error);
      return false;
    }
  }
  
  async expire(key: string, ttl: number, prefix: string = 'app'): Promise<boolean> {
    try {
      const fullKey = `${prefix}:${key}`;
      await redisClient.expire(fullKey, ttl);
      return true;
    } catch (error) {
      console.error('Erreur cache expire:', error);
      return false;
    }
  }
  
  async increment(key: string, prefix: string = 'counters'): Promise<number> {
    try {
      const fullKey = `${prefix}:${key}`;
      return await redisClient.incr(fullKey);
    } catch (error) {
      console.error('Erreur cache increment:', error);
      return 0;
    }
  }
  
  // Nettoyage du cache
  async cleanup(): Promise<void> {
    try {
      // Nettoyer les clés expirées
      const patterns = ['app:*', 'users:*', 'messages:*', 'stats:*', 'exports:*'];
      
      for (const pattern of patterns) {
        const keys = await redisClient.keys(pattern);
        for (const key of keys) {
          const ttl = await redisClient.ttl(key);
          if (ttl === -1) { // Pas d'expiration définie
            await redisClient.expire(key, 3600); // Expirer dans 1 heure
          }
        }
      }
    } catch (error) {
      console.error('Erreur nettoyage cache:', error);
    }
  }
  
  // Statistiques du cache
  async getStats(): Promise<any> {
    try {
      const info = await redisClient.info('memory');
      const keyspace = await redisClient.info('keyspace');
      
      // Compter les clés par préfixe
      const prefixes = ['app', 'users', 'messages', 'stats', 'exports', 'sessions', 'auth'];
      const stats: Record<string, number> = {};
      
      for (const prefix of prefixes) {
        const keys = await redisClient.keys(`${prefix}:*`);
        stats[prefix] = keys.length;
      }
      
      return {
        memory: info,
        keyspace,
        prefixStats: stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur stats cache:', error);
      return null;
    }
  }
}

// Instance singleton
const cacheService = CacheService.getInstance();
export default cacheService;