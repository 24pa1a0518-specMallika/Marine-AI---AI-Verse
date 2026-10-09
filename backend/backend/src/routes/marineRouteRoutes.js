const express = require("express");
const { planRoute } = require("../controllers/marineRouteController");

const router = express.Router();

router.post("/marine", planRoute);

module.exports = router;
