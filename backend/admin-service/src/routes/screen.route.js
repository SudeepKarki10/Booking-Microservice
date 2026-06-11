const router = require("express").Router();
const { createScreen, getAllScreensByTheaterId, configureScreenSeats } = require("../controllers/screen.controller");

router.post("/create-screen", createScreen);
router.get("/:id", getAllScreensByTheaterId);
router.post("/:screenId/seats", configureScreenSeats);

module.exports = router;