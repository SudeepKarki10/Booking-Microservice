const {producer, connectProducer} = require('../../config/kafka');
const logger = require('../../utils/logger');

class NotificationProducer{
    constructor(){
        this.isInitialized = false;
    }

    async initialize(){
        if(!this.isInitialized){
            connectProducer();
            this.isInitialized = true;
        }
    }

    async sendMessage(topic, key, value){
        try{
            await this.initialize();

            const message = {
                topic, 
                messages: [
                    {
                    key: key || `${topic}-${Date.now()}`, 
                    value: JSON.stringify(value),
                    timestamp: Date.now().toString(),
                }
                ]
            }

            const result = await producer.send(message);
            logger.info(`Message sent to topic ${topic} with key ${key}: ${JSON.stringify(value)}`,{
                key,
                partition: result[0].partition,
                offset: result[0].offset,
            });
            return result;
        }catch(error){
            logger.error(`Failed to send message to topic ${topic}: ${error.message}`);
            throw error;
        }  
    }
        
    async sendOtpEmail(email, otp, ttlMinutes = 5){
        try{
            return this.sendMessage(
                TOPICS.OTP_EMAIL, //this is the topic name for sending OTP email, we can have different topics for different types of notifications in future
                `otp-${email}`, //key 
                {
                    email,otp, ttlMinutes //value 
                }
            );

        }catch(error){
            logger.error(`Failed to initialize Kafka producer for sending OTP email to ${email}: ${error.message}`);
        }
    }

}

