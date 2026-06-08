const router = require("express").Router();

const { createTheater } = require("../controllers/theater.controller")


router.post("/create", createTheater);

module.exports = router;