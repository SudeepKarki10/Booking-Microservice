const router = require("express").Router();

const { createTheater, getAllTheaters, deleteTheaterById, updateTheaterById, searchTheaters, toggleTheaterStatus, getTheaterById } = require("../controllers/theater.controller");

router.post("/create", createTheater);

router.get("/theaters", getAllTheaters);

router.get("/:id", getTheaterById);

router.delete("/delete/:id", deleteTheaterById);

router.put("/update/:id", updateTheaterById);

router.get("/search", searchTheaters);

router.put("/toggle/:id", toggleTheaterStatus);

module.exports = router;