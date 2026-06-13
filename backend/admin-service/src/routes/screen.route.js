const router = require("express").Router();
const { createScreen, getAllScreensByTheaterId, configureScreenSeats, getScreenSeatsByScreenId } = require("../controllers/screen.controller");

router.post("/create-screen", createScreen);
router.get("/:id", getAllScreensByTheaterId);
router.post("/:screenId/seats", configureScreenSeats);
router.get("/:screenId/seats", getScreenSeatsByScreenId);
router.get("/seats/:screenId", getScreenSeatsByScreenId);

module.exports = router;