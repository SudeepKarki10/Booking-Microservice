const RedisClient = require('../config/redis');

const redis = RedisClient.getInstance();
const {config} = require('../config');
const {TooManyRequestsError} = require('./error');
const crypto = require('crypto');

const logger = require('./logger');

const RATE_LIMIT_MAX = parseInt(config.OTP_RATE_MAX_PER_HOUR, 10) || 5;
const OTP_TTL = parseInt(config.OTP_TTL, 10) || 300; // default to 5 minutes

function hmacFor(email, otp){
    return crypto.createHmac('sha256', config.HMAC_SECRET).update(`${email}:${otp}`).digest('hex');
}

const generateAndStoreOTP = async(meta)=>{

    try{
        //rate limit OTP generation per email 
    const rateKey = `otp:rate:${meta.email}`;
    const sentCount = parseInt(await redis.get(rateKey) || 0, 10);

    if (sentCount >= RATE_LIMIT_MAX) {
        logger.warn(`Rate limit exceeded for OTP generation for email ${meta.email}`);
        throw new TooManyRequestsError('Too many OTP requests. Please try again later.');
    }
    //1. Generate a random 6 digit OTP i.e. with Shifts the range to 100,000–999,999
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpSessionId = crypto.randomUUID();
    //2. Store the OTP in Redis with a unique session ID
    const hashedOtpSessionId = hmacFor(meta.email, otp);
    await redis.set(`otp:session:${otpSessionId}`, JSON.stringify({
        hashedOtp: hashedOtpSessionId,
        meta
    }), 'EX', config.OTP_TTL); // OTP valid for 5 minutes
    //3. Increment the rate limit counter
    await redis.incr(rateKey);
    await redis.expire(rateKey, 3600); // reset count after 1 hour
    logger.info(`Generated OTP for email ${meta.email} with session ID ${otpSessionId}`);
    return { otp, otpSessionId };
    }catch(error){  
        logger.error(`Error generating OTP for email ${meta.email}: ${error.message}`);
        throw error;
    }
}

const verifyOTP = async (otp, otpSessionId) => {
  try{
  //1. Retrieve the OTP session from Redis using the session ID
    const otpSessionDataFromRedis = await redis.get(`otp:session:${otpSessionId}`);

    if(!otpSessionDataFromRedis){
        return { valid: false, message: 'OTP session not found or expired' };
    }

    //2.if session exists in redis then compare the provided OTP with the stored OTP
    const {hashedOtp, meta} = JSON.parse(otpSessionDataFromRedis);
    const hashedProvidedOtp = hmacFor(meta.email, otp);

    const rateKey = `otp:rate:${meta.email}`;
    const sentCount = parseInt(await redis.get(rateKey) || 0, 10);

    if(sentCount >= config.OTP_RATE_MAX_VERIFY_ATTEMPTS){
         logger.error(`Too many OTP verification attempts for email ${meta.email}`);

        throw new TooManyRequestsError('Too many OTP verification attempts. Please try again later.');
       
    }

    if(hashedProvidedOtp === hashedOtp){
        // OTP is valid
        //1. delete the OTP session from Redis to prevent reuse
        await redis.del(`otp:session:${otpSessionId}`);
        await redis.decr(rateKey);

        logger.info(`OTP verified successfully for email ${meta.email}`);
        return { valid: true, message: 'OTP verified successfully', meta };
        
    } else {
        // OTP is invalid
        await redis.incr(rateKey);
        await redis.expire(rateKey, config.OTP_TTL); 
        logger.warn(`Invalid OTP provided for email ${meta.email}`);
        return { valid: false, message: 'Invalid OTP' };
    }
  }catch(error){
    const emailStr = (typeof meta !== 'undefined' && meta && meta.email) ? meta.email : 'unknown';
    logger.error(`Error occurred while verifying OTP for email ${emailStr}: ${error.message}`);
    throw error;
  }
}

module.exports = {
    generateAndStoreOTP,
    verifyOTP
};