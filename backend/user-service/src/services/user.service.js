const logger = require('../utils/logger');
const prisma = require('../config/prisma');
const { NotFoundError } = require('../utils/error');
const RedisClient = require('../config/redis');
const { config } = require('../config');

const redis = RedisClient.getInstance();

const getProfile = async (userId) => {
    const cacheKey = `user:${userId}`;
    
    // 1. Check Redis Cache
    const cachedUserRaw = await redis.get(cacheKey);
    if (cachedUserRaw) {
        logger.info(`Cache hit for user profile with id ${userId}`);
        return JSON.parse(cachedUserRaw);
    }
    
    logger.info(`Cache miss for user profile with id ${userId}; Fetching from DB`);

    // 2. Fetch from Database
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    // 3. Handle Edge Case: User doesn't exist in DB
    if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // 4. Strip sensitive data & Cache the result
    const { password: _password, ...safeUser } = user;
    await redis.setex(cacheKey, config.REDIS_USER_TTL, JSON.stringify(safeUser)); 

    return safeUser;
};

module.exports = {
    getProfile
};
