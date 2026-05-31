const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        logger.warn(`Access attempt without valid token`);

        return res.status(401).json({
            status: false,
            message: `Authentication required`
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        logger.warn(`Access attempt without valid token`);

        return res.status(401).json({
            status: false,
            message: `Authentication required`
        })
    }

    const isValid = jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({
                status: false,
                message: `Invalid Token!`
            });
        }

        req.user = user;
        next();
    });
};

module.exports = { validateToken };