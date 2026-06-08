const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine( //This dictates exactly how each log entry is written
        winston.format.timestamp(), //Stamps the exact date and time on the entry
        winston.format.errors({ stack: true }),//If your app crashes, this tells Winston to write down the exact file and line number that caused the crash (the "stack trace").
        winston.format.splat(), //A utility that lets you format strings easily (like using %s to inject variables into your messages).
        winston.format.json() //Writes the log entries in a structured JSON format, which is great for machines to read and analyze.
    ),
    defaultMeta: { service: 'api-gateway' }, //It automatically attaches {"service": "identity-service"} to every single log entry.

    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

module.exports = logger;