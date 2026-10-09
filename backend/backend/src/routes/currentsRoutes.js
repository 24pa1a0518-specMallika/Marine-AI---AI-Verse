const express = require("express");
const router = express.Router();
const currentsController = require("../controllers/currentsController");

router.get("/overview", currentsController.getCurrentsOverview);
router.get("/observations", currentsController.getCurrentsGrid);
router.get("/grid", currentsController.getCurrentsGrid);
router.post("/predict", currentsController.predictCurrents);
router.get("/comparison", currentsController.getCurrentsComparison);
router.get("/metrics", currentsController.getCurrentsMetrics);
router.get("/export-csv", currentsController.exportCurrentsCSV);
router.get("/export-pdf", currentsController.exportCurrentsPDF);

module.exports = router;
