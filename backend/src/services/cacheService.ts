import redisClient from '../config/redis';

class CacheService {
  private defaultTTL: number;

  constructor() {
    this.defaultTTL = 3600; // 1 heure par défaut
  }

  // Méthodes de base
  async get(key: string): Promise<any> {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<boolean> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise en cache:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Erreur lors de la vérification du cache:', error);
      return false;
    }
  }

  // Méthodes spécialisées
  async cacheUser(userId: string | number, userData: any, ttl: number = 1800): Promise<boolean> {
    const key = `user:${userId}`;
    return await this.set(key, userData, ttl);
  }

  async getCachedUser(userId: string | number): Promise<any> {
    const key = `user:${userId}`;
    return await this.get(key);
  }

  async cacheMessages(roomId: string | number, messages: any[], ttl: number = 600): Promise<boolean> {
    const key = `messages:${roomId}`;
    return await this.set(key, messages, ttl);
  }

  async getCachedMessages(roomId: string | number): Promise<any> {
    const key = `messages:${roomId}`;
    return await this.get(key);
  }

  async invalidateUserCache(userId: string | number): Promise<void> {
    const patterns = [
      `user:${userId}`,
      `user:${userId}:*`,
      `messages:*:user:${userId}`
    ];

    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        // Pour les patterns avec wildcards, on supprime juste les clés connues
        await this.del(pattern.replace('*', ''));
      } else {
        await this.del(pattern);
      }
    }
  }

  // Sessions utilisateur
  async setUserSession(userId: string | number, sessionData: any, ttl: number = 86400): Promise<boolean> {
    const key = `session:${userId}`;
    return await this.set(key, sessionData, ttl);
  }

  async getUserSession(userId: string | number): Promise<any> {
    const key = `session:${userId}`;
    return await this.get(key);
  }

  async deleteUserSession(userId: string | number): Promise<boolean> {
    const key = `session:${userId}`;
    return await this.del(key);
  }

  // Rate limiting
  async incrementRateLimit(identifier: string, window: number = 900, limit: number = 100): Promise<any> {
    const key = `rate_limit:${identifier}`;
    
    try {
      const current = await redisClient.incr(key);
      
      if (current === 1) {
        await redisClient.expire(key, window);
      }
      
      return {
        current,
        remaining: Math.max(0, limit - current),
        resetTime: Date.now() + (window * 1000)
      };
    } catch (error) {
      console.error('Erreur lors du rate limiting:', error);
      return null;
    }
  }

  // Statistiques
  async incrementCounter(key: string, ttl: number = 86400): Promise<number> {
    try {
      const count = await redisClient.incr(key);
      if (count === 1) {
        await redisClient.expire(key, ttl);
      }
      return count;
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation:', error);
      return 0;
    }
  }

  async getStats(): Promise<any> {
    try {
      const info = await redisClient.info('memory');
      const keyspace = await redisClient.info('keyspace');
      
      return {
        memory: info,
        keyspace: keyspace,
        isReady: redisClient.isReady
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      return null;
    }
  }
}

export default new CacheService();