const prisma = require("../config/prisma");
const { NotFoundError, ConflictError } = require('../utils/error')

class ScreenServices {

    async createScreen(data) {
        const { theaterId, name } = data;
        const existingTheater = await prisma.screen.findUnique({
            where: { theaterId }
        });

        if (existingTheater) {
            throw new NotFoundError("Theater is not found!");
        }

        // if theater exists then we check if the screen exists if not create a new screen for that theater
        const existingScreen = await prisma.screen.findUnique({
            where: { name }
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

    async getAllScreens(theaterId) {
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