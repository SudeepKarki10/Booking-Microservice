const express = require('express');
require("dotenv").config();
const {config} = require('./config');

const logger = require('./utils/logger');

const app = express();

const emailConsumer = require('./kafka/consumer/email.consumer')

app.use(express.json());
app.use(express.urlencoded({extended: true}));

async function startNotificationService(){
    try{
        await emailConsumer.start();
        logger.info(`Notification service started successfully`);
    }catch(error){
        logger.error(`Failed to start notification service: ${error.message}`);
        process.exit(1);
    }
}

app.listen(config.PORT, () => {
    logger.info(`Notification service is running on port ${config.PORT}`);
    startNotificationService();
});