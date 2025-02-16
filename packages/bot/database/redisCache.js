const Redis = require('ioredis');

// Cache configuration
const CACHE_CONFIG = {
    TTL: 3600, // 1 hour in seconds
    PREFIXES: {
        GUILD_ACTIVE: 'guild:active:',
        GUILD_SETTINGS: 'guild:settings:',
    }
};

class RedisCache {
    constructor() {
        this.client = new Redis({
            host: process.env.NODE_ENV === 'production' ? process.env.REDIS_HOST : "localhost",
            port: process.env.REDIS_PORT,
            keyPrefix: 'cache:'
        });

        this.client.on('error', (err) => {
            console.error('[Redis Cache Error]:', err);
        });
    }

    async set(key, value, ttl = CACHE_CONFIG.TTL) {
        try {
            await this.client.set(key, JSON.stringify(value), 'EX', ttl);
        } catch (error) {
            console.error('[Cache Set Error]:', error);
        }
    }

    async get(key) {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('[Cache Get Error]:', error);
            return null;
        }
    }

    async delete(key) {
        try {
            await this.client.del(key);
        } catch (error) {
            console.error('[Cache Delete Error]:', error);
        }
    }

    async clear() {
        try {
            const keys = await this.client.keys('cache:*');
            if (keys.length) {
                await this.client.del(keys);
            }
        } catch (error) {
            console.error('[Cache Clear Error]:', error);
        }
    }
}

module.exports = {
    RedisCache: new RedisCache(),
    CACHE_CONFIG
};