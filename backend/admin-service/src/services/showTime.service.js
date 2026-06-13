const logger = require("../utils/logger");
const { BadRequestError } = require("../utils/error");
const prisma = require("../config/prisma");
const showtimeSeatService = require("./showTimeSeat");

class ShowTimeServices {
    async createShowtime(data) {

        const {
            movieId,
            screenId,
            startTime,
            basePrice,
            priceRules = []
        }
            =
            data;



        const movie =
            await prisma.movie.findUnique({

                where: {
                    id: movieId
                }

            });


        if (!movie) {

            throw new NotFoundError(
                "Movie not found"
            );

        }



        const screen =
            await prisma.screen.findUnique({

                where: {
                    id: screenId
                }

            });


        if (!screen) {

            throw new NotFoundError(
                "Screen not found"
            );

        }



        const start =
            new Date(
                startTime
            );



        const endTime =
            new Date(

                start.getTime()

                +

                movie.durationMins

                *

                60000

            );



        const existingShowtime =
            await prisma.showtime.findFirst({

                where: {

                    screenId,

                    startTime: {
                        lt: endTime
                    },

                    endTime: {
                        gt: start
                    }

                }

            });



        if (existingShowtime) {

            throw new BadRequestError(

                "Screen already occupied during this time"

            );

        }



        const createdShowtime =
            await prisma.showtime.create({

                data: {

                    movieId,

                    screenId,

                    startTime: start,

                    endTime,

                    basePrice

                }

            });


        if (priceRules.length) {

            await prisma.showtimePriceRule.createMany({

                data:

                    priceRules.map(

                        rule => ({

                            showtimeId:
                                createdShowtime.id,

                            seatType:
                                rule.seatType,

                            price:
                                rule.price

                        })

                    )

            });

        }



        await showtimeSeatService.generateShowtimeSeats(createdShowtime.id);



        logger.info(

            "Showtime created",

            {

                showtimeId:
                    createdShowtime.id

            }

        );



        return createdShowtime;

    }

    async createShowtimePricing(showtimeId, rules) {
        const showtime = await prisma.showtime.findUnique({
            where: { id: showtimeId }
        });

        if (!showtime) {
            throw new NotFoundError("Showtime not found");
        }

        const showtimePricing = await prisma.showtimePriceRule.createMany({

            data:

                rules.map(r => ({

                    showtimeId,

                    seatType: r.seatType,

                    price: r.price

                }))

        });
        return showtimePricing;

    }


}

module.exports = new ShowTimeServices();