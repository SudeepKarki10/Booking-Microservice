const router = require("express").Router();
const { createShowtime } = require("../controllers/showTime.controller");



router.post("/create", createShowtime);

module.exports = router;
