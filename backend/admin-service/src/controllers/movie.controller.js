const asyncHandler = require("../utils/asyncHandler");
const { BadRequestError } = require("../utils/error");

const MovieService = require("../services/movie.service")

/**
 model Movie {
  id            String @id @default(uuid())

  title         String
  description   String?

  language      String

  genre         String

  durationMins  Int

  contentRating String

  posterUrl     String?

  releaseDate   DateTime?

  active        Boolean @default(true)

  showtimes     Showtime[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
 */

const createMovie = asyncHandler(async (req, res) => {
    const { title, description, language, genre, durationMins, contentRating, posterUrl, releaseDate } = req.body;


    if (!title || !language || !genre || !durationMins || !contentRating || !posterUrl || !releaseDate) {
        throw new BadRequestError(`All fields like title,language,genre,durationMins,contentRating,posterUrl,releaseDate are required`);
    }

    const movie = await MovieService.createMovie({
        title,
        description,
        language,
        genre,
        durationMins,
        contentRating,
        posterUrl,
        releaseDate,
    });

    return res.status(200).json({
        success: true,
        message: "Movie created successfully",
        data: movie
    });
});


const getMovieById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new BadRequestError(`Movie id is required`);
    }
    const movie = await MovieService.getMovieById(id);
    return res.status(200).json({
        success: true,
        message: "Movie fetched successfully",
        data: movie
    });
});

const getAllMovies = asyncHandler(async (req, res) => {
    const movies = await MovieService.getAllMovies();
    return res.status(200).json({
        success: true,
        message: "All Movies fetched successfully",
        data: movies
    });
});

module.exports = { createMovie, getMovieById, getAllMovies }