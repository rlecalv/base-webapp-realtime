const redisClient = require('../config/redis');

class CacheService {
  constructor() {
    this.defaultTTL = 3600; // 1 heure par défaut
  }

  // Méthodes de base
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise en cache:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Erreur lors de la vérification du cache:', error);
      return false;
    }
  }

  // Méthodes spécialisées
  async cacheUser(userId, userData, ttl = 1800) {
    const key = `user:${userId}`;
    return await this.set(key, userData, ttl);
  }

  async getCachedUser(userId) {
    const key = `user:${userId}`;
    return await this.get(key);
  }

  async cacheMessages(roomId, messages, ttl = 600) {
    const key = `messages:${roomId}`;
    return await this.set(key, messages, ttl);
  }

  async getCachedMessages(roomId) {
    const key = `messages:${roomId}`;
    return await this.get(key);
  }

  async invalidateUserCache(userId) {
    const patterns = [
      `user:${userId}`,
      `user:${userId}:*`,
      `messages:*:user:${userId}`
    ];

    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        // Utiliser SCAN pour les patterns avec wildcards
        const keys = await this.getKeysByPattern(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      } else {
        await this.del(pattern);
      }
    }
  }

  async getKeysByPattern(pattern) {
    try {
      const keys = [];
      const stream = redisClient.scanStream({
        match: pattern,
        count: 100
      });

      return new Promise((resolve, reject) => {
        stream.on('data', (resultKeys) => {
          keys.push(...resultKeys);
        });

        stream.on('end', () => {
          resolve(keys);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Erreur lors de la recherche de clés:', error);
      return [];
    }
  }

  // Sessions utilisateur
  async setUserSession(userId, sessionData, ttl = 86400) {
    const key = `session:${userId}`;
    return await this.set(key, sessionData, ttl);
  }

  async getUserSession(userId) {
    const key = `session:${userId}`;
    return await this.get(key);
  }

  async deleteUserSession(userId) {
    const key = `session:${userId}`;
    return await this.del(key);
  }

  // Rate limiting
  async incrementRateLimit(identifier, window = 900, limit = 100) {
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
  async incrementCounter(key, ttl = 86400) {
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

  async getStats() {
    try {
      const info = await redisClient.info('memory');
      const keyspace = await redisClient.info('keyspace');
      
      return {
        memory: info,
        keyspace: keyspace,
        connected: redisClient.connected
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      return null;
    }
  }
}

module.exports = new CacheService();