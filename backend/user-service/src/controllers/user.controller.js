const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');
const logger = require('../utils/logger');

const getProfile = asyncHandler(async (req, res) => {
    try{
        const userId = req.user.id;
        const user = await userService.getProfile(userId);
        res.status(200).json({
            status: true,
            data: user
        });
    }catch(error){
        logger.error(`Error fetching user profile: ${error.message}`);
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
});

module.exports = {
    getProfile
}
