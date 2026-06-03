const {getProfile} = require('../controllers/user.controller');
const {authMiddleware} = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.get('/profile',authMiddleware, getProfile);

module.exports = router;