const logger = require('../utils/logger');
const {AppError} = require('../utils/error');

function errorHandler(err, req, res, next) {
    logger.error(err.stack);

    if(err instanceof AppError) {
        res.status(err.statusCode).json({
                success: false,
                message: err.message,
                code: err.code
            
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }

    next();
}

module.exports = {errorHandler};