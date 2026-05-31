require('dotenv').config();
const express = require('express');
const app = express();
const corsMiddleware = require('./middlewares/corsMiddleware')
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require('dotenv').config();
const {log}= require("winston");
const {errorHandler} = require('./middlewares/errorHandler');
// const {validateToken} = require('./middleware/authMiddleware');
const reqLogger = require('./middlewares/reqLogger');
const logger = require('./utils/logger');
const {config} =require('./config');

//Routes import
const authRoutes = require('./routes/auth.route');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//log all incoming requests
app.use(reqLogger);

app.use(helmet());
app.use(corsMiddleware);


app.use(`${config.API_URL}/auth`, authRoutes);

app.get('/', (req, res) => {
    res.send('User Service is running');
});

app.get('/health', (req, res) => {
    res.status(200).json({status: 'ok'});
});

// custom error handler
app.use(errorHandler);

const startServer = async ()=>{
    try{
        const server = app.listen(config.PORT, () => {
            logger.info(`Server is running on port ${config.PORT}`);
        });
    }catch(err){
        logger.error("Failed to start Server", err);
    }
}

startServer();