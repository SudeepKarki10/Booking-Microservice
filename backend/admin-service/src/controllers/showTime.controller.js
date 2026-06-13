const showTimeService = require("../services/showTime.service");
const asyncHandler = require("../utils/asyncHandler");
const { BadRequestError } = require("../utils/error");

const createShowtime = asyncHandler(async (req, res) => {

    const { movieId, screenId, startTime, basePrice, priceRules } = req.body;

    if (!movieId || !screenId || !startTime || !basePrice) {
        throw new BadRequestError("All fields are required");
    }

    const showtime = await showTimeService.createShowtime(req.body);

    return res.status(200).json({
        success: true,
        message: "Showtime created successfully",
        data: showtime
    });

});

module.exports = { createShowtime }