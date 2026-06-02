const {consumer} = require('../../config/kafka');
const logger = require('../../utils/logger');
const emailService = require('../../services/email.service');
const {TOPICS} = require('../../utils/constants');

class EmailConsumer{
    async start(){
        try{
            await consumer.connect();
            logger.info('Email consumer connected to Kafkasuccessfully');
            
            await consumer.subscribe({topics: Object.values(TOPICS), fromBeginning: false});

            // reads the message from kafka and processes it
            await consumer.run({
                eachMessage: async ({topic, partition, message})=>{
                   try{
                     const value = JSON.parse(message.value.toString());
                     logger.info(`Received message on topic ${topic} with key ${message.key ? message.key.toString() : 'null'}: ${JSON.stringify(value)}`,{
                        key: message.key ? message.key.toString() : null,
                        partition,
                        offset: message.offset,
                     });
                     
                     // actually process the message
                     await this.handleMessage(topic, value);
                   }catch(error){
                        logger.error(`Failed to parse/process message value: ${error.message}`);
                    }
                }
            });
        }catch(error){
            logger.error(`Error connecting Kafka consumer: ${error.message}`);
            throw error;
        }
    }

    async handleMessage(topic, data){
        switch(topic){
            case TOPICS.OTP_EMAIL:
                await this.handleOtpMail(data);
                break;
            case TOPICS.WELCOME_EMAIL:
                await this.handleWelcomeMail(data);
                break;
        }
    }

    async handleOtpMail(data){
        const {email, otp, ttlMinutes} = data;

        if(!email || !otp ){
            logger.error(`[kafka/consumer/email.consumer./handleOtpMail] Invalid data for OTP email: ${JSON.stringify(data)}`);
            throw new Error('Invalid data for OTP email');
        }

        await emailService.sendOtpEmail(email, otp, ttlMinutes);
        logger.info(`[kafka/consumer/email.consumer./handleOtpMail] OTP email sent to ${email} with OTP ${otp} valid for ${ttlMinutes} minutes`);
    }

    async handleWelcomeMail(data){
        const {email, name} = data;

        if(!email || !name ){
            logger.error(`[kafka/consumer/email.consumer./handleWelcomeMail] Invalid data for welcome email: ${JSON.stringify(data)}`);
            throw new Error('Invalid data for welcome email');
        }

        await emailService.sendWelcomeEmail(email, name);
        logger.info(`[kafka/consumer/email.consumer./handleWelcomeMail] Welcome email sent to ${email} with name ${name}`);
    }
}

module.exports = new EmailConsumer();