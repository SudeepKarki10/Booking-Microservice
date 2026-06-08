
const corsMiddleware = (req, res, next) => {
    const allowedOrigins = [
        "*",
        'https://localhost:3000',
        'http://localhost:3000',
        'https://booking-frontend.onrender.com',
        'http://booking-frontend.onrender.com',
    ];

    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }


    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

    const allowedHeadersList = [
        'content-type',
        'authorization',
        'x-requested-with',
        'x-custom-header'
    ];

    const requestedHeaders = req.headers['access-control-request-headers'];

    if (requestedHeaders) {
        res.setHeader('Access-Control-Allow-Headers', requestedHeaders);
    } else {
        res.setHeader('Access-Control-Allow-Headers', allowedHeadersList.join(', '));
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
};

module.exports = corsMiddleware;