const {BadRequestError, NotFoundError, UnAuthorizedError} = require('../utils/error');
const asyncHandler = require('../utils/asyncHandler');
const {config}= require('../config');
const authService = require('../services/auth.service');
const prisma = require('../config/prisma');
const {generateAccessToken, generateRefreshToken} = require('../utils/auth');
const {getDeviceFingerprint} = require('../utils/deviceFingerprint');

const sendOTP = asyncHandler(async (req, res) => {
    const {firstName, lastName, email, password, confirmPassword} = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        throw new BadRequestError('All fields are required');
    }

    if (password !== confirmPassword) {
        throw new BadRequestError('Passwords did not match!');
    }

    const {otpSessionId} = await authService.sendOTPService(firstName, lastName, email, password);
    res.cookie('otpSessionId', otpSessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 5 * 60 * 1000 // 5 minutes
    }).status(200).json({
        status: true,
        message: 'OTP sent successfully. Please check your email.',
        otpSessionId
    });
});

const verifyOTP = asyncHandler(async (req, res) => {
    const {otp} = req.body;
    const otpSessionId = req.cookies.otpSessionId;
    if (!otp || !otpSessionId) {
        throw new BadRequestError('OTP and session ID are required');
    }
    const user = await authService.verifyOtpservice(otp, otpSessionId);
    res.clearCookie('otpSessionId');
    res.status(200).json({
        status: true,
        message: 'OTP verified successfully',
        user
    });
});

const login = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
    
    //1. firstly check if the user with the provided email exists in the database
    if(!email || !password){
        throw new BadRequestError('Email and password are required');
    }

    const deviceId = getDeviceFingerprint(req);

    const {accessToken, refreshToken, loggedInUser}= await authService.login(email,password,deviceId);

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.accessTokenExpiresInSeconds * 1000 // convert to milliseconds
    })
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.refreshTokenExpiresInSeconds * 1000 // convert to milliseconds
    }).status(200).json({
        status: true,
        message: 'Logged in successful',
        user: loggedInUser
    });

});

const rotateRefreshToken = asyncHandler(async(req,res)=>{
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        throw new UnAuthorizedError('Refresh token is required');
    }

    const deviceId = getDeviceFingerprint(req);
    const {newAccessToken, newRefreshToken} = await authService.rotateRefreshToken(refreshToken, deviceId);

    res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.accessTokenExpiresInSeconds * 1000 // convert to milliseconds
    });
    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.refreshTokenExpiresInSeconds * 1000 // convert to milliseconds
    }).status(200).json({
        status: true,
        message: 'Token refreshed successfully'
    });
});

const verifyGoogleToken = asyncHandler(async(req,res)=>{
    const {idToken} = req.body;
    
    if(!idToken){
        throw new BadRequestError('Invalid Google ID token!');
    }

    const deviceId = getDeviceFingerprint(req);

    const {accessToken, refreshToken, loggedInUser} = await authService.verifyGoogleToken(idToken, deviceId);

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.accessTokenExpiresInSeconds * 1000 // convert to milliseconds
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.refreshTokenExpiresInSeconds * 1000 // convert to milliseconds
    }).status(200).json({
        status: true,
        message: 'Logged in with Google successfully',
        loggedInUser
    });
});



module.exports = {
    sendOTP,
    verifyOTP,
    login,
    rotateRefreshToken,
    verifyGoogleToken
};