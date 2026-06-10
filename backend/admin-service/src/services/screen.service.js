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



}

module.exports = new ScreenServices();