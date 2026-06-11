const router = require("express").Router();

const { createMovie, getMovieById, getAllMovies } = require("../controllers/movie.controller");

router.post("/create", createMovie);
router.get("/:id", getMovieById);
router.get("/:screenId/seats", getAllMovies);

module.exports = router;

