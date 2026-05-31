const logger = require('../utils/logger');

const reqLogger = (req, res, next) => {
    const start = Date.now();

    // wait unit the response is finished
    res.on('finish', ()=>{
        const duration = Date.now() - start;
        const message = `Method:${req.method} | URL: ${req.originalUrl} | StatusCode: ${res.statusCode} | Duration: ${duration}ms`;

        if(res.statusCode >= 400 && res.statusCode < 500){
            logger.warn(message + " | 400 Client Error");
        }else if(res.statusCode >= 500){
            logger.error(message + " | 500 Internal Server Error");
        }
    });

    next();
}

module.exports = reqLogger;