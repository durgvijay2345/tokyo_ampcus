const redis = require('redis');
const NodeCache = require('node-cache');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let client;
let isRedisAvailable = false;
let connectionAttempted = false;


const memoryCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

(async () => {
    try {
        client = redis.createClient({ 
            url: REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 2) {
                        if (!connectionAttempted) {
                            console.warn(' Redis unreachable. Using in-memory fallback cache.');
                            connectionAttempted = true;
                        }
                        return false; 
                    }
                    return 500;
                }
            }
        });

        client.on('error', (err) => {
            if (!err.message.includes('ECONNREFUSED') || !connectionAttempted) {
                console.error(' Redis Client Error:', err.message);
            }
            isRedisAvailable = false;
        });

        await client.connect();
        console.log(' Connected to Redis');
        isRedisAvailable = true;
    } catch (err) {
        if (!connectionAttempted) {
            console.error(' Failed to connect to Redis:', err.message);
            console.log(' Using in-memory fallback cache.');
            connectionAttempted = true;
        }
        isRedisAvailable = false;
    }
})();

module.exports = {
    async get(key) {
        if (isRedisAvailable) {
            try {
                const val = await client.get(key);
                return val ? JSON.parse(val) : null;
            } catch {
                return memoryCache.get(key);
            }
        }
        return memoryCache.get(key);
    },

    async set(key, value, ttl = 600) {
        memoryCache.set(key, value, ttl);
        if (isRedisAvailable) {
            try {
                await client.set(key, JSON.stringify(value), { EX: ttl });
            } catch {
               
            }
        }
    },

    async has(key) {
        if (isRedisAvailable) {
            try {
                const count = await client.exists(key);
                return count > 0 || memoryCache.has(key);
            } catch {
                return memoryCache.has(key);
            }
        }
        return memoryCache.has(key);
    },

    async clear() {
        memoryCache.flushAll();
        if (isRedisAvailable) {
            try {
                await client.flushAll();
            } catch {
                
            }
        }
    }
};