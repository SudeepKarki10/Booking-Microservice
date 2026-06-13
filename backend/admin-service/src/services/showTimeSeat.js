const logger = require("../utils/logger");
const prisma = require("../config/prisma");
const { NotFoundError } = require("../utils/error");

class ShowtimeSeatService {

    async generateShowtimeSeats(showtimeId) {
        //fetch seat layout from screenId and then create showtime seat
        const showtime = await prisma.showtime.findUnique({
            where: { id: showtimeId },
            include: { priceRules: true }
        });

        if (!showtime) {
            logger.error("Showtime not found", { showtimeId });
            throw new NotFoundError("Showtime not found");
        }

        const screen = await prisma.screen.findUnique({
            where: { id: showtime.screenId }
        });

        if (!screen) {
            logger.error("Screen not found", { screenId: showtime.screenId });
            throw new NotFoundError("Screen not found");
        }

        const seats = await prisma.seat.findMany({
            where: { screenId: screen.id }
        });

        // Map price rules for easy lookup (e.g. { PLATINUM: 350.00, REGULAR: 200.00 })
        const priceMap = {};
        showtime.priceRules.forEach(rule => {
            priceMap[rule.seatType] = rule.price;
        });

        const showtimeSeats = await prisma.showtimeSeat.createMany({
            data: seats.map(seat => {
                // Determine seat price: matching price rule or fallback to basePrice
                const seatPrice = priceMap[seat.type] !== undefined ? priceMap[seat.type] : showtime.basePrice;
                return {
                    showtimeId,
                    seatId: seat.id,
                    price: seatPrice
                };
            })
        });

        logger.info("Showtime seats generated", { showtimeId });
        return showtimeSeats;
    }
}

module.exports = new ShowtimeSeatService();