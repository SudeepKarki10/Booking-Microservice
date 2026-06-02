const {ConflictError, BadRequestError, ForbiddenError, UnAuthorizedError} = require('../utils/error');
const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const {generateAndStoreOTP, verifyOTP} = require('../utils/otp');
const {generateAccessToken, generateRefreshToken, verifyRefreshToken} = require('../utils/auth');
const jwt = require('jsonwebtoken');
const {config} = require('../config');
const logger = require('../utils/logger');
const notificationProducer = require('../kafka/producer/notification.producer');

const {sendOtpEmail} = require('../utils/email');
const {getInstance} = require('../config/redis');
const redis = getInstance();

const {OAuth2Client, verifyIdToken} = require('google-auth-library');
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

const sendOTPService = async(firstName, lastName, email, password) => {
   try{
     const existingUser = await prisma.user.findUnique({ where: { email } });

    //1. Check if user with the same email already exists
    if(existingUser){
        throw new ConflictError('Email is already registered');
    }
    //2. if user doesn't exist then hash the pasword 
    const hashedPassword = await bcrypt.hash(password, 12);
    const meta = {firstName, lastName, email, hashedPassword};
    //3. generate OTP and save it in redis with a unique session ID
    const {otp, otpSessionId} = await generateAndStoreOTP(meta);
    
    // this was happening in synchronous way and if there is any issue with email service then the user will not receive the OTP but still the OTP session will be created in redis and user will not be able to request for new OTP until the previous OTP session expires. To avoid this we can send the email in asynchronous way and return the otpSessionId to the client immediately after creating the OTP session in redis. This way even if there is an issue with email service, user can still request for new OTP after the previous OTP session expires.
    //await sendOtpEmail(email, otp); instead we use kafka producer to send the email in asynchronous way
    await notificationProducer.sendOtpEmail(email, otp, (config.OTP_TTL / 60)); // passing OTP TTL in minutes to the email template so that user can know how long the OTP is valid for
    logger.info(`OTP email is queued for: ${email}`);
    return {otpSessionId};
   }catch(error){
    logger.error(`Error in sendOTPService for email ${email}: ${error.message}`);
    throw error;
   }

}


const verifyOtpservice = async (otp, otpSessionId) => {
   try{
 //1. verify the OTP using the session ID and retrieve the associated meta data (firstName, lastName, email, hashedPassword)
    const {valid, message, meta} = await verifyOTP(otp, otpSessionId);
    if(!valid){
        throw new BadRequestError(message, "INVALID_OTP");
    }

    //if otp is valid then create the user in the database using the meta data and delete the OTP session from redis
    const user = await prisma.user.create({
        data: {
            name: `${meta.firstName} ${meta.lastName}`,
            email: meta.email,
            password: meta.hashedPassword,
            emailVerified: true
        }
    });
    await sendOtpEmail(meta.email, 'Your account has been created successfully.');
    return user;
   }catch(error){
    logger.error(`Error in verifyOtpservice: ${error.message}`);    
    throw error;
   }
}

const login = async (email, password, deviceId) => {
    try{
        const user = await prisma.user.findUnique({
        where:{email}
    });
    
    if(!user || !password){
        throw new BadRequestError('Email and password are required');
    }   
    
    if(!user.password) {
        throw new BadRequestError('This account is linked to an authentication provider (e.g. Google). Please use that to log in.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if(!passwordMatch){
        throw new BadRequestError('Invalid email or password');
    }
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const {jti} = jwt.decode(refreshToken);
    await redis.set(`refresh:${user.id}:${deviceId}`,  jti, 'EX', config.refreshTokenExpiresInSeconds);

    await redis.set(`user:${user.id}`, JSON.stringify(user), 
    'EX', config.REDIS_USER_TTL);
    const {password: _password, ...safeUser} = user;

    return {accessToken, refreshToken, loggedInUser: safeUser};
    }catch(error){
        logger.error(`Error during login for email ${email}: ${error.message}`);
        throw error;
    }
}

const rotateRefreshToken = async (refreshToken, deviceId)=>{
    try{
        const decoded = await verifyRefreshToken(refreshToken);
        const {id: userId, jti} = decoded;

        const storedJti = await redis.get(`refresh:${userId}:${deviceId}`);

        // if jti is not in redis then it means the refresh token is either invalid or has been revoked (e.g. user logged out from that device)
        if(!storedJti ){
            throw new ForbiddenError('Session Expired. Please log in again.');
        }
        if(storedJti !== jti){
            // if invalid refresh is stored in redis then delete it to prevent any further misuse and force the user to log in again
            await redis.del(`refresh:${userId}:${deviceId}`);
            throw new ForbiddenError('Invalid refresh token. Please log in again.');
        }
        const newAccessToken = generateAccessToken(userId);
        const newRefreshToken = generateRefreshToken(userId);
        const {jti: newJti} = jwt.decode(newRefreshToken);
        //now save it in redis and set the new jti for that user and device
        await redis.set(`refresh:${userId}:${deviceId}`, newJti, 'EX', config.refreshTokenExpiresInSeconds);
       
        return {newAccessToken, newRefreshToken};
    }catch(error){
        logger.error(`Error rotating refresh token: ${error.message}`);
        throw error;
    }
}

const verifyGoogleToken = async (idToken, deviceId) => {  
    try{
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config.GOOGLE_CLIENT_ID
        });
        /**{
             "iss": "https://accounts.google.com",
            "azp": "1234567890-abcdefg.apps.
            content.com",
            "aud": "1234567890-abcdefg.apps.googleusercontent.com",
            "sub": "109876543210987654321", // uniqque identifier for the user provided by google
            "email": "user@example.com",
            "email_verified": true,
            "at_hash": "HK63S93_266_beH969U.as",
            "name": "Jane Doe",
            "picture": "https://googleusercontent.com...",
            "given_name": "Jane",
            "family_name": "Doe",
            "iat": 1596474013,
            "exp": 1596477613,
            "jti": "abcdef1234567890"
} */
        const payload = ticket.getPayload();
        
        if(!payload.sub || !payload.email){
            throw new UnAuthorizedError('Invalid Google token payload');
        }

        const googleUser =  {
            provider: "google", // instead of payload.iss which returns https://accounts.google.com, we can directly set provider as google since this function is specifically for handling google auth
            providerId: payload.sub,
            email: payload.email,
            name: payload.name,
            emailVerified: payload.email_verified || false
        }

        const user = await prisma.$transaction(async (tx)=>{
            let googleAuth = await tx.authProvider.findUnique({
                where: {
                    provider_providerId: {
                        provider: googleUser.provider,
                        providerId: googleUser.providerId
                    }
                },
                include: { user: true }
            });
            // Case 1: If user with the same email already exists  in the AuthProvider table, then return that user
           if(googleAuth){
                return googleAuth.user;       
            }

            let existingUser = await tx.user.findUnique({
                where: {
                    email: googleUser.email
                }
            });

            //Case 2: if user account already exists with the same email in user table but without google auth provider, then link that account with google auth provider
            if(existingUser){
                await tx.authProvider.create({
                    data:{
                        provider: googleUser.provider,
                        providerId: googleUser.providerId,
                        userId: existingUser.id
                    }
                });
                return existingUser;
            }

            //Case 3: if user account doesn't exist neither in user table or authProvider table  , then create a new user and link it with google auth provider
            if(!existingUser){
                existingUser = await tx.user.create({
                    data: {
                        email: googleUser.email,
                        name: googleUser.name,
                        emailVerified: googleUser.emailVerified,
                        authProviders: {
                            create: {
                                provider: googleUser.provider,
                                providerId: googleUser.providerId
                            }
                        }
                    }
                });
                return existingUser;
            }
        });

        //return access and refresh token for the user
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // refreshToken should be encrypted and stored in the redis server
        const {jti} = jwt.decode(refreshToken);
        await redis.set(`refresh:${user.id}:${deviceId}`, jti, 'EX', config.refreshTokenExpiresInSeconds);
        const {password: _password, ...safeUser} = user;
        await redis.set(`user:${user.id}`, JSON.stringify(safeUser), 'EX', config.REDIS_USER_TTL);

        return {accessToken, refreshToken, loggedInUser: safeUser};

    }catch(error){
        logger.error(`Error verifying Google token: ${error.message}`);
        throw error;
    }
}

module.exports = {
    sendOTPService, 
    verifyOtpservice,
    login,
    rotateRefreshToken,
    verifyGoogleToken
}