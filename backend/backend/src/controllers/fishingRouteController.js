const { findBestFishingRoute } = require("../../services/fishingRouteService");

async function getFishingRoute(req, res) {
  try {
    const latitude = Number(req.body.latitude ?? req.body.startLat);
    const longitude = Number(req.body.longitude ?? req.body.startLon);
    const rows = Number(req.body.rows || 20);
    const cols = Number(req.body.cols || 20);
    const hazardCells = req.body.hazardCells || [];
    const restrictedCells = req.body.restrictedCells || [];
    const targetDate = req.body.targetDate || null;
    const targetPfzId = req.body.targetPfzId || null;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    const result = await findBestFishingRoute({
      latitude,
      longitude,
      targetDate,
      rows,
      cols,
      hazardCells,
      restrictedCells,
      targetPfzId,
    });

    return res.json(result);
  } catch (error) {
    console.error("Fishing route error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate fishing route",
    });
  }
}

module.exports = {
  getFishingRoute,
};
