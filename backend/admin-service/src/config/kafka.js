const {Kafka, logLevel} = require('kafkajs');
const {config} = require('./index');
const logger  = require('../utils/logger');

const kafka = new Kafka({
    clientId: config.KAFKA_CLIENT_ID,
    brokers: [config.KAFKA_BROKERS || 'localhost:9093'],
    logLevel: logLevel.ERROR,
    retry:{
        initialRetryTime: 300,
        retries: 10,
        maxRetryTime: 30000,
    }
});

const producer = kafka.producer(
    {
        allowAutoTopicCreation: true,
        idempotent: true, //ensures exactly-once delivery semantics
        maxInFlightRequests: 5, //required for idempotent producer to maintain message order
        retry: {
            initialRetryTime: 300,
            retries: 5,
            maxRetryTime: 30000,
        }

    }
);

const consumer = kafka.consumer({ 
    groupId: `notification-service-group`,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
});


let isConnected = false;
const connectProducer = async () => {
    try{
        if(!isConnected){
            await producer.connect();   
            isConnected = true;
            logger.info('Kafka producer connected successfully');
        }
    }catch(error){
        logger.error(`Error connecting Kafka producer: ${error.message}`);
    }
}

const disconnectProducer = async () => {
    try{
        if(isConnected){
            await producer.disconnect();
            isConnected = false;
            logger.info('Kafka producer disconnected successfully');
        }
    }catch(error){
        logger.error(`Error disconnecting Kafka producer: ${error.message}`);
    }
}

//graceful shutdown
process.on('SIGINT', disconnectProducer);
process.on('SIGTERM', disconnectProducer);

module.exports = { kafka, producer, connectProducer, disconnectProducer };