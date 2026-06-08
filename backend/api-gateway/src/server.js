require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const Redis = require('ioredis');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const proxy = require('express-http-proxy');
const logger = require('./utils/logger');
const errorHandler = require("./middleware/errorhandler");
const { authMiddleware } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body: ${req.body}`);
    next();
});

const redisClient = new Redis(process.env.REDIS_URL);

const ratelimitOptions = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        return res.status(429).json({ success: false, message: "Too many requests" });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    })
});

app.use(ratelimitOptions);

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, "/api")
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy error: ${err.message}`);
        return res.status(500).json({
            status: false,
            message: `Internal server errror: ${err.message}`
        });
    }
}


// setting proxy for user service 
app.use('/v1/users', proxy(process.env.USER_SERVICE_URL, {
    ...proxyOptions,
    // Override the path resolver to remove "/users" and map /v1/users/* to /api/v1/*
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1\/users/, '/api/v1');
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-type'] = "application/json";
        // Ensure user exists before accessing id to prevent crashes
        if (srcReq.user) {
            proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        }

        return proxyReqOpts;
    },
    proxyReqBodyDecorator: (bodyContent, srcReq) => {
        return srcReq.body ? JSON.stringify(srcReq.body) : bodyContent;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response received from user service: ${proxyRes.statusCode}`);

        return proxyResData;
    }
}))



app.use(errorHandler);

app.use('/health', (req, res) => {
    return res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    logger.info(`API gateway is running on port ${process.env.URL}`);
    logger.info(`User service is running on port ${process.env.USER_SERVICE_URL || 'unknown'}`);

    console.log(`API GATEWAY service running on port: 3000`);
});
