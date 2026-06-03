const { sendOtpEmail, sendWelcomeEmail } = require('../templates');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    // Initialize email service retries count 
    this.maxRetries = 3;
  }

  async sendWelcomeEmailWithRetry({email, name}, retries=0) {
    if(retries >= this.maxRetries){
        logger.error(`[email.service.js/sendWelcomeEmailWithRetry] Failed to send welcome email to ${email} after ${retries} attempts`);
        throw new Error(`Failed to send welcome email to ${email} after ${retries} attempts`);
    }

    setTimeout(() => {
        logger.info(`[email.service.js/sendWelcomeEmailWithRetry] Retrying to send welcome email to ${email} with name ${name}. Attempt ${retries + 1}`);
    }, 1000 * retries); // Exponential backoff for retries
    
    return await sendWelcomeEmail(email, name);
    
  }

  async sendOtpEmailWithRetry({email, otp, ttlMinutes}, retries=0) {
    if(retries >= this.maxRetries){
        logger.error(`[email.service.js/sendOtpEmailWithRetry] Failed to send OTP email to ${email} after ${retries} attempts`);
        throw new Error(`Failed to send OTP email to ${email} after ${retries} attempts`);
    }

    setTimeout(() => {
             logger.info(`[email.service.js/sendOtpEmailWithRetry] Sending OTP email to ${email} with OTP ${otp} valid for ${ttlMinutes} minutes`);
        }, 1000 * retries); // Exponential backoff for retries
    this.retries = this.retries + 1;
    return await sendOtpEmail(email, otp);
    
  }
  
  async sendOtpEmail(email, otp, ttlMinutes) {

    // Calling the function from templates/index.js which handles the actual sending
    return this.sendOtpEmailWithRetry({email, otp, ttlMinutes});
  }

  async sendWelcomeEmail(email, name) {

    // Calling the function from templates/index.js which handles the actual sending
    return this.sendWelcomeEmailWithRetry({email, name});
  }
}

module.exports = new EmailService();