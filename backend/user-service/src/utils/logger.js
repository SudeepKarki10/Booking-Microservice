const winston = require('winston');
const {config} = require('../config');
const logger = winston.createLogger({
    level: config.NODE_ENV === 'production'?'info':'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({stack: true}),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta : { service: config.SERVICE_NAME },
    transports:[
        new winston.transports.Console(
            {
               format: winston.format.combine(  
                winston.format.colorize(),
                winston.format.simple()
               )
            }
        ),
        new winston.transports.File({filename: 'logs/error.log', level: 'error'}),
        new winston.transports.File({filename: 'logs/combined.log'})
    ]
});

module.exports = logger;