const crypto = require('crypto');

function getDeviceFingerprint(req) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || '';
    const accept = req.headers['accept'] || '';

    const rawData = `${userAgent}|${ip}|${accept}`;

    return crypto.createHash('sha256').update(rawData).digest('hex');
}

module.exports = {
    getDeviceFingerprint
}