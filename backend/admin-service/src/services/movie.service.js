const logger = require("../utils/logger");
const prisma = require("../config/prisma");
const { ConflictError } = require("../utils/error");

class MovieService {
    async createMovie(data) {
        const { title, description, language, genre, durationMins, contentRating, posterUrl, releaseDate } = data;

        // check if the movie already exists 
        const existingMovie = await prisma.movie.findFirst({
            where: { title: title }
        })

        if (existingMovie) {
            throw new BadRequestError("Movie already exists");
        }

        //if movie exists , return error 
        if (existingMovie) {
            logger.info(`Movie already exists with title ${title}`);
            throw new ConflictError("Movie with this title already exists!")
        }

        const movie = await prisma.movie.create({
            data: {
                title,
                description,
                language,
                genre,
                durationMins,
                contentRating,
                posterUrl,
                releaseDate,
            }
        });

        logger.info("Movie created successfully")
        return movie;
    }

    async getMovieById(id) {
        const movie = await prisma.movie.findUnique({
            where: { id: id },
        });

        if (!movie) {
            logger.info(`Movie not found with id ${id}`);
            throw new BadRequestError("Movie not found");
        }

        logger.info(`Movie with id: ${id} and title: ${movie.title} fetched successfully`);
        return movie;
    }

    async getAllMovies() {
        const movies = await prisma.movie.findMany({});

        if (movies.length === 0) {
            logger.info("No movies found");
            throw new BadRequestError("No movies found");
        }

        logger.info("All movies fetched successfully");
        return movies;
    }
}

module.exports = new MovieService();