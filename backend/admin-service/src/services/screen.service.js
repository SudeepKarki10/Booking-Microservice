const prisma = require("../config/prisma");
const { NotFoundError, ConflictError } = require('../utils/error');
const logger = require("../utils/logger");

class ScreenServices {

    async createScreen(data) {
        const { theaterId, name } = data;

        // 1. Check if the theater actually exists (querying Theater model)
        const theaterExists = await prisma.theater.findUnique({
            where: { id: theaterId }
        });
        if (!theaterExists) {
            throw new NotFoundError("Theater is not found to link the screen!");
        }
        // 2. Check if a screen with this name already exists in this specific theater
        const existingScreen = await prisma.screen.findUnique({
            where: {
                theaterId_name: {
                    theaterId,
                    name
                }
            }
        });
        if (existingScreen) {
            throw new ConflictError("Screen already exists!");
        }
        const createdScreen = await prisma.screen.create({
            data: { theaterId, name }
        });
        logger.info(`Screen created for the theater id:${theaterId}`, { id: createdScreen.id });
        return createdScreen;
    }


    async getAllScreensByTheaterId(theaterId) {
        const theater = await prisma.theater.findUnique({
            where: { id: theaterId }
        });

        if (!theater) {
            throw new NotFoundError("Theater not found");
        }

        const existingScreens = await prisma.screen.findMany();

        if (existingScreens.length === 0) {
            throw new NotFoundError("Screen doesn't exists for given theater!");
        }

        logger.info(`Existing screens for theater id:${theaterId}`, { existingScreens });
        return existingScreens;
    }

    async configureScreenSeats(screenId, layout) {
        const seatsArray = [];

        // 1. Loop through ALL configurations to fully build the array
        for (const rowConfig of layout) {

            for (let seatNum = 1; seatNum <= rowConfig.totalSeats; seatNum++) {

                seatsArray.push({
                    screenId,
                    type: rowConfig.type,
                    row: rowConfig.row,
                    number: seatNum
                });
            }
        }

        // 2. Run the database transaction ONCE with the complete array
        return await prisma.$transaction(async (tx) => {
            // Clear any old physical configurations for this screen
            await tx.seat.deleteMany({
                where: { screenId }
            });

            // Bulk insert all generated seats at once
            return await tx.seat.createMany({
                data: seatsArray,
                skipDuplicates: true
            });
        });
    }

}

module.exports = new ScreenServices();