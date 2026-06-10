const { BadRequestError } = require("../utils/error");
const asyncHandler = require("../utils/asyncHandler");

const ScreenServices = require("../services/screen.service");


/**
 * 
 * model Screen {
  id          String @id @default(uuid())

  name        String  //3d or laserMX
  theaterId   String  // QFX -> 3d or laserMX while EyePlex-> Standard or premium

  theater     Theater @relation(fields: [theaterId], references: [id], onDelete: Cascade)

  seats       Seat[]
  showtimes   Showtime[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([theaterId,name])
}
 */



const createScreen = asyncHandler(async (req, res) => {
    const { theaterId, name } = req.body;

    if (!theaterId || !name) {
        throw new BadRequestError(`All fields like theaterId and name are required`);
    }

    const screen = await ScreenServices.createScreen({ theaterId, name });

    return res.status(200).json({
        success: true,
        message: "Screen created successfully",
        data: screen
    });
});

const getAllScreensByTheaterId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new BadRequestError(`Theater id is required`);
    }
    const screens = await ScreenServices.getAllScreensByTheaterId(id);
    return res.status(200).json({
        success: true,
        message: "Screens fetched successfully",
        data: screens
    });
})


module.exports = { createScreen, getAllScreensByTheaterId };