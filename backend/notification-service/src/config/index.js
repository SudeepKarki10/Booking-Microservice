require('dotenv').config();

const config = () =>{
    return{
        PORT: process.env.PORT || 3000,
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/postgres',
        JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
        accessTokenExpiresIn: process.env.accessTokenExpiresIn || '15m',
        refreshTokenExpiresIn: process.env.refreshTokenExpiresIn || '7d',
        accessTokenExpiresInSeconds: process.env.accessTokenExpiresInSeconds || 900, // 15 minutes
        refreshTokenExpiresInSeconds: process.env.refreshTokenExpiresInSeconds || 604800, // 7 days

        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        NODE_ENV: process.env.NODE_ENV || 'development',
        API_GATEWAY_URL: process.env.API_GATEWAY_URL || 'http://localhost:3001',
        IDENTITY_SERVICE_URL: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001',
        POST_SERVICE_URL: process.env.POST_SERVICE_URL || 'http://localhost:3002',
        MEDIA_SERVICE_URL: process.env.MEDIA_SERVICE_URL || 'http://localhost:3003',
        REDIS_URL: process.env.REDIS_URL || 'redis://:mySecretPassword@redis:6379',
        REDIS_USER_TTL: Number(process.env.REDIS_USER_TTL) || 604800, // 7 days in seconds
        OTP_TTL: process.env.OTP_TTL || 300, // 5 minutes or 300 seconds
        OTP_LENGTH: process.env.OTP_LENGTH || 6,
        OTP_RATE_MAX_PER_HOUR: process.env.OTP_RATE_MAX_PER_HOUR || 5,
        OTP_RATE_MAX_VERIFY_ATTEMPTS: process.env.OTP_RATE_MAX_VERIFY_ATTEMPTS || 5,
        HMAC_SECRET: process.env.HMAC_SECRET || 'hmac_secret',
        API_URL: process.env.API_URL || '/api/v1',
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],

        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,


        KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID || 'user-service',
        KAFKA_BROKERS: process.env.KAFKA_BROKERS || 'localhost:9093',

        SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
        SMTP_PORT: process.env.SMTP_PORT || 587,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS
    }
}

if(!config().GOOGLE_CLIENT_ID){
    throw new Error('GOOGLE_CLIENT_ID is required in environment variables');
}

if(!config().SMTP_HOST || !config().SMTP_PORT || !config().SMTP_USER || !config().SMTP_PASS){
    throw new Error('SMTP configuration is required in environment variables');
}

module.exports = { config: config() };