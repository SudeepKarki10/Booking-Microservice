const logger = require('../utils/logger');
const { verifyToken } = require('../utils/auth');

const authMiddleware = async(req, res, next) => {
    try{
    const header  = req.headers['authorization'];
    const accessToken = header && header.split(' ')[1];
    if(!accessToken){
        logger.warn('[authMiddleware] Unauthorized access attempt: No token provided');
        return res.status(401).json({
            status: false,
            message: 'Unauthorized access or invalid token'
        });
    }

    const decoded = verifyToken(accessToken);
    req.user = decoded; 
    if(!decoded){
        logger.warn('[authMiddleware] Unauthorized access attempt: Invalid token');
        return res.status(401).json({
            status: false,
            message: 'Unauthorized access or invalid token'
        });
    }

    logger.info('[authMiddleware]Access token found in request header, proceeding to next middleware');
    next();
    }catch(error){
        logger.error(`Error in auth middleware: ${error.message}`);
        return res.status(500).json({
            status: false,
            message: '[authMiddleware] Internal server error'
        });
    }
}

module.exports = {authMiddleware};