const { ConflictError } = require("../utils/error");
const logger = require("../utils/logger");
const adminProducer = require("../kafka/producer/admin.producer");
const prisma = require("../config/prisma");

const createTheater = async (data) => {
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

module.exports = { createTheater }