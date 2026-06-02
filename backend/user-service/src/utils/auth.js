const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {BadRequestError} = require('./error');
const {config} = require('../config');
const accessTokenExpiresIn  = config.accessTokenExpiresIn ;
const refreshTokenExpiresIn = config.refreshTokenExpiresIn ;

const JWT_SECRET = config.JWT_SECRET ;

exports.hashToken= (refreshToken)=>{
    return bcrypt.hash(refreshToken,12);
}

exports.generateAccessToken = (userId) => {
    const payload = { 
        id:userId
     };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: accessTokenExpiresIn });
}

exports.generateRefreshToken = (userId) => {
    const payload = { 
        id:userId,
        jti: crypto.randomUUID() // unique identifier for the token
    };
     
    return jwt.sign(payload, JWT_SECRET, { expiresIn:  refreshTokenExpiresIn });
}

exports.verifyToken = (accessToken) => {
    return jwt.verify(accessToken, JWT_SECRET);
}

exports.verifyRefreshToken = (refreshToken) => {
    return jwt.verify(refreshToken, JWT_SECRET);
}

