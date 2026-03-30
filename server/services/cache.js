const { createClient } = require('redis');
const NodeCache = require('node-cache');

// Fallback in-memory cache with 10 minute TTL
const memoryCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Redis client setup
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

let isRedisReady = false;

redisClient.on('error', (err) => {
  if (isRedisReady) {
    console.warn('⚠️ Redis Connection Error:', err.message);
    isRedisReady = false;
  }
});

redisClient.on('ready', () => {
  console.log('✅ Connected to Redis successfully');
  isRedisReady = true;
});

// Start the connection without blocking
redisClient.connect().catch((err) => {
  console.warn('⚠️ Failed to connect to Redis initially. Falling back to memory cache:', err.message);
});

module.exports = {
  async get(key) {
    if (isRedisReady) {
      try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : undefined;
      } catch (e) {
        console.warn('Cache GET error:', e.message);
        return memoryCache.get(key); // fallback if redis get fails
      }
    }
    return memoryCache.get(key);
  },

  async set(key, value) {
    if (isRedisReady) {
      try {
        await redisClient.setEx(key, 600, JSON.stringify(value));
        return;
      } catch (e) {
        console.warn('Cache SET error:', e.message);
      }
    }
    memoryCache.set(key, value);
  },

  async has(key) {
    if (isRedisReady) {
      try {
        const exists = await redisClient.exists(key);
        return exists === 1;
      } catch (e) {
        console.warn('Cache HAS error:', e.message);
        return memoryCache.has(key);
      }
    }
    return memoryCache.has(key);
  },

  async clear() {
    if (isRedisReady) {
      try {
        await redisClient.flushDb();
      } catch (e) {}
    }
    memoryCache.flushAll();
  }
};
