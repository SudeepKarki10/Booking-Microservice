const { ConflictError } = require("../utils/error");
const logger = require("../utils/logger");
const adminProducer = require("../kafka/producer/admin.producer");
const prisma = require("../config/prisma");


class TheaterServices {

    async createTheater(data) {
        const { name, code, district, location } = data;

        const existingTheater = await prisma.theater.findUnique({
            where: { code }
        });

        if (existingTheater) {
            throw new ConflictError("Theater with code exists already");
        }

        const theater = await prisma.theater.create({
            data
        });

        logger.info("New theater created", { id: theater.id, code: theater.code });

        await adminProducer.publishTheaterCreated(theater).catch((err) => {
            logger.error("Failed to publish theater created", err);
        })

        return theater;
    }


    async getAllTheaters(data) {
        const { page, limit } = data;

        const theaters = await prisma.theater.findMany({
            take: limit,  // if page = 1, limit =10 take 10 record 
            skip: (page - 1) * limit, // if page =1 then skip = (1-1) * 10 = 0 so skip 0 records from start  
            // if page =2 then skip = (2-1) * 10 = 10 so skip 10 records from start
            orderBy: {
                createdAt: "desc"  // latest created theater first
            },
        });

        if (!theaters) {
            logger.info(`No theater found for given page:${page} and limit:${limit}`);
            throw new NotFoundError("No theaters found");
        }

        logger.info(`Theaters fetched successfully page:${page} and limit:${limit}`, theaters);
        return theaters;
    }

    async getTheaterById(id) {
        const theater = await prisma.theater.findUnique({
            where: { id }
        });

        if (!theater) {
            throw new NotFoundError("Theater not found");
        }
        return theater;
    }

    async deleteTheaterById(id) {
        const theater = await prisma.theater.findUnique({
            where: { id }
        });

        const softDeletedTheater = await prisma.theater.update({
            where: { id },
            data: { isActive: !theater.isActive }
        });

        if (!theater) {
            throw new NotFoundError("Theater not found");
        }


        logger.info("Theater deleted", { id: theater.id, code: theater.code });

        // await adminProducer.publishTheaterDeleted(theater).catch((err) => {
        //     logger.error("Failed to publish theater deleted", err);
        // })

        return theater;
    }

    async updateTheaterById(id, updateData) {
        const updatedtTheater = await prisma.theater.update({
            where: { id },
            data: updateData
        });

        if (!updatedtTheater) {
            throw new NotFoundError("Theater couldn't be updated ");
        }

        logger.info("Theater updated", { id: updatedtTheater.id, code: updatedtTheater.code });

        // await adminProducer.publishTheaterDeleted(theater).catch((err) => {
        //     logger.error("Failed to publish theater deleted", err);
        // })

        return updatedtTheater;
    }

    //To ensure the search works perfectly whether the user types "cinema", "CINEMA", or "Cinema", added the mode: 'insensitive' modifier to  Prisma query.
    async searchTheaters(query) {
        // searching by name, code or location 
        const theaters = await prisma.theater.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { code: { contains: query, mode: "insensitive" } },
                    { location: { contains: query, mode: "insensitive" } },
                ],
            },
        });

        if (!theaters) {
            logger.info(`No theater found for given query: ${query}`);
            throw new NotFoundError("No theaters found");
        }

        logger.info(`Theaters fetched successfully for query: ${query}`, theaters);
        return theaters;
    }

    async toggleTheaterStatus(id) {
        const theater = await prisma.theater.findUnique({
            where: { id }
        });

        if (!theater) {
            throw new NotFoundError(`Theater with id: ${id} couldn't be found`);
        }

        const updatedStatusTheater = await prisma.theater.update({
            where: { id },
            data: { isActive: !theater.isActive }
        });

        logger.info(`Theater with id: ${id} is now ${updatedStatusTheater.isActive ? "active" : "inactive"}`);
        return updatedStatusTheater;
    }

}

module.exports = new TheaterServices();