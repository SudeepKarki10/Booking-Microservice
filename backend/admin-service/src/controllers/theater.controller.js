const { BadRequestError } = require("../utils/error");
const asyncHandler = require("../utils/asyncHandler");

const TheaterServices = require("../services/theater.service");

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
    const { name, code, district, location } = req.body;

    if (!name || !code || !district || !location) {
        throw new BadRequestError(400, "All fields like name, code, district,and location are required");
    }

    const threater = await TheaterServices.createTheater({
        name,
        code: code.toUpperCase(),
        district,
        location
    });

    return res.status(200).json({
        success: true,
        message: "Theater created successfully",
        data: threater
    });

});

const getAllTheaters = asyncHandler(async (req, res) => {
    // /admin/theaters?page=1&limit=10 
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const theaters = await TheaterServices.getAllTheaters({
        page,
        limit
    });

    return res.status(200).json({
        success: true,
        message: "Theaters fetched successfully",
        data: theaters
    });
});

const deleteTheaterById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new BadRequestError(400, "Theater id is required");

    }


    const theater = await TheaterServices.deleteTheaterById(id);

    return res.status(200).json({
        success: true,
        message: `Theater deleted successfully with id: ${id}`,
        data: theater
    });
});

// --- Remaining Controllers ---

const getTheaterById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new BadRequestError(400, "Theater id is required");
    }

    const theater = await TheaterServices.getTheaterById(id);

    return res.status(200).json({
        success: true,
        message: "Theater fetched successfully",
        data: theater
    });
});

const updateTheaterById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
        throw new BadRequestError(400, "Theater id is required");
    }

    if (Object.keys(updateData).length === 0) {
        throw new BadRequestError(400, "Update data is required");
    }

    const updatedTheater = await TheaterServices.updateTheaterById(id, updateData);

    return res.status(200).json({
        success: true,
        message: "Theater updated successfully",
        data: updatedTheater
    });
});

const searchTheaters = asyncHandler(async (req, res) => {
    // Example route: /admin/theaters/search?q=cinema
    const { q } = req.query;

    if (!q || q.trim() === "") {
        throw new BadRequestError(400, "Search query is required");
    }

    const theaters = await TheaterServices.searchTheaters(q);

    return res.status(200).json({
        success: true,
        message: "Theaters searched successfully",
        data: theaters
    });
});

const toggleTheaterStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new BadRequestError(400, "Theater id is required");
    }

    const updatedTheater = await TheaterServices.toggleTheaterStatus(id);

    return res.status(200).json({
        success: true,
        message: `Theater status updated to ${updatedTheater.isActive ? "active" : "inactive"} successfully`,
        data: updatedTheater
    });
});

// --- Updated Module Exports ---
module.exports = {
    createTheater,
    getAllTheaters,
    getTheaterById,
    deleteTheaterById,
    updateTheaterById,
    searchTheaters,
    toggleTheaterStatus
};


