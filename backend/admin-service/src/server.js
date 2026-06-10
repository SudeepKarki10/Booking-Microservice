require('dotenv').config();
const express = require('express');
const app = express();

const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require('dotenv').config();
const { log } = require("winston");
const { errorHandler } = require('./middlewares/errorHandler');
// const {validateToken} = require('./middleware/authMiddleware');
const reqLogger = require('./middlewares/reqLogger');
const logger = require('./utils/logger');
const { config } = require('./config');

const theaterRoutes = require("./routes/theater.route");
const screenRoutes = require("./routes/screen.route");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//log all incoming requests
app.use(reqLogger);


app.use(`${config.API_URL}/theater`, theaterRoutes);

//for theaters 
app.use(`${config.API_URL}`, theaterRoutes);

//for screens
app.use(`${config.API_URL}/screen`, screenRoutes);


app.get('/', (req, res) => {
    res.send('Admin Service is running');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// custom error handler
app.use(errorHandler);

const startServer = async () => {
    try {
        const server = app.listen(config.PORT, () => {
            logger.info(`Admin Service is running on port ${config.PORT}`);
        });
    } catch (err) {
        logger.error("Failed to start Admin Service", err);
    }
}

startServer();