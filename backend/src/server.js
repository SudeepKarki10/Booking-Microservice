const express = require('express');
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
require('dotenv').config();
const {log}= require("winston");
const errorHandler = require('./middleware/errorHandler');
const {validateToken} = require('./middleware/authMiddleware');
const logger = require('./utils/logger');


app.use(express.json());
app.use((req, res, next) => {
    logger.info(`${req.method} url:: ${req.url}`);
    next();
});
app.use(errorHandler);
app.use(helmet());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
    res.send('Booking Service is running');
});

app.get('/health', (req, res) => {
    res.status(200).json({status: 'ok'});
});

const startServer = async ()=>{
    try{
        const server = app.listen(config.PORT || 4001, () => {
            logger.info(`Server is running on port ${config.PORT}`);
        });
    }catch(err){
        logger.error("Failed to start Server", error);
    }
}

startServer();