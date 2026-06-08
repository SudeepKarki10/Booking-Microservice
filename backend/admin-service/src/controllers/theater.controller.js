const { BadRequestError } = require("../utils/error");
const asyncHandler = require("../utils/asyncHandler");

const { createThreater } = require("../services/threater.service");

/**
 *
 threater model 
id          String @id @default(uuid())

  name        String  // QFXCinema
  code        String @unique  // QFX

  district    String  //kathmandu
  location    String  //Baneshwor

  screens     Screen[]  // 3d, laserMX

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
 */

const createTheater = asyncHandler(async (req, res) => {
    const { name, code, district, location, screens } = req.body;

    if (!name || !code || !district || !location || !screens) {
        throw new BadRequestError(400, "All fields like name, code, district,location, and screen are required");
    }

    const threater = await createThreater({
        name,
        code: code.toUpperCase(),
        district,
        location,
        screens
    });

    return res.status(200).json({
        success: true,
        message: "Theater created successfully",
        data: threater
    });

});

module.exports = { createTheater }