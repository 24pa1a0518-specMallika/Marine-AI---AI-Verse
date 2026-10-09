const express = require("express");
const { queryAi } = require("../controllers/aiController");

const router = express.Router();

router.post("/query", queryAi);

module.exports = router;
