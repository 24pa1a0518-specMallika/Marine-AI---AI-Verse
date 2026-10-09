const express = require("express");

const { getMarineSST } = require("../controllers/sstController");

const router = express.Router();

router.get("/", getMarineSST);

module.exports = router;
