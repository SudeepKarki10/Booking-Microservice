const router = require("express").Router();
const { createScreen, getAllScreensByTheaterId } = require("../controllers/screen.controller");

router.post("/create-screen", createScreen);
router.get("/:id", getAllScreensByTheaterId)

module.exports = router;