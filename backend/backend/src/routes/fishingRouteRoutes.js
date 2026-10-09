const express = require("express");

const {
  getFishingRoute,
} = require("../controllers/fishingRouteController");

const router = express.Router();

router.post("/find", getFishingRoute);

module.exports = router;
