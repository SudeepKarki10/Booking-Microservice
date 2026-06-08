const logger = require('../utils/logger');
// Ensure this matches how you exported it in config/index.js!
const { config } = require('../config'); 
const Redis = require('ioredis');

class RedisClient {
    static instance;
    static isConnected = false; // Fixed typo (was inConnected)
    
    constructor() {
        // Enforce Singleton: Throw an error if someone tries to use 'new RedisClient()'
        throw new Error("Use RedisClient.getInstance() to get the Redis instance.");
    }

    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis(config.REDIS_URL, {
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    logger.warn(`Redis connection lost. Retrying in ${delay}ms...`);
                    return delay;
                },
                // we use this limiter as our retry strategy will handle reconnection attempts, 
                // so we don't want ioredis to keep retrying indefinitely on failed commands
                maxRetriesPerRequest: 3 
            });

            RedisClient.instance.on('error', (err) => {
                logger.error('Redis error', err);
            });

            RedisClient.instance.on('reconnecting', (delay) => {
                logger.warn(`Attempting to reconnect to Redis in ${delay}ms...`);
            });

            RedisClient.instance.on('end', () => {
                RedisClient.isConnected = false; // Fixed typo
                logger.warn('Redis connection closed');
            });

            RedisClient.instance.on('ready', () => {
                logger.info('Redis connection is ready');
            });

            RedisClient.instance.on('connect', () => {
                RedisClient.isConnected = true; // Fixed typo
                logger.info('Connected to Redis');
            });
        }

        // CRITICAL FIX: You must return the instance!
        return RedisClient.instance;
    }
}

// CRITICAL FIX: Export the class so other files can use it!
module.exports = RedisClient;