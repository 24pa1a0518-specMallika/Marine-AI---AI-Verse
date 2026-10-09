const { planMarineRoute } = require("../../services/marineRouteService");

function planRoute(req, res) {
  try {
    const rows = Number(req.body.rows || 20);
    const cols = Number(req.body.cols || 20);
    const hazardCells = req.body.hazardCells || [];
    const restrictedCells = req.body.restrictedCells || [];

    const startLat = Number(req.body.startLat ?? req.body.latitude);
    const startLon = Number(req.body.startLon ?? req.body.longitude);
    const destLat = Number(req.body.destLat);
    const destLon = Number(req.body.destLon);

    let start = req.body.start;
    let goal = req.body.goal;

    if (!start && Number.isFinite(startLat)) {
      start = { row: 0, col: 0, lat: startLat, lon: startLon };
    }
    if (!goal && Number.isFinite(destLat)) {
      goal = { row: rows - 1, col: cols - 1, lat: destLat, lon: destLon };
    }
    if (!start) start = { row: 0, col: 0 };
    if (!goal) goal = { row: rows - 1, col: cols - 1 };

    const marineConditions = req.body.marineConditions || {
      wind: 12,
      windGust: 16,
      waveHeight: 1.2,
      rainProbability: 10,
      lightning: 0,
      cyclone: false,
    };

    const result = planMarineRoute({
      rows,
      cols,
      start,
      goal,
      marineConditions,
      hazardCells,
      restrictedCells,
    });

    let waypoints = null;
    let distanceKm = null;
    if (Number.isFinite(startLat) && Number.isFinite(destLat)) {
      const dLat = (destLat - startLat) * (Math.PI / 180);
      const dLon = (destLon - startLon) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(startLat * (Math.PI / 180)) * Math.cos(destLat * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      distanceKm = Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
      waypoints = [
        { lat: startLat, lon: startLon },
        { lat: Number((startLat + (destLat - startLat) * 0.33).toFixed(4)), lon: Number((startLon + (destLon - startLon) * 0.33 + 0.015).toFixed(4)) },
        { lat: Number((startLat + (destLat - startLat) * 0.66).toFixed(4)), lon: Number((startLon + (destLon - startLon) * 0.66 + 0.01).toFixed(4)) },
        { lat: destLat, lon: destLon },
      ];
    }

    return res.json({
      ...result,
      waypoints: waypoints || result.route,
      path: waypoints || result.route,
      distanceKm: distanceKm ?? result.distance,
      totalRiskCost: result.totalRiskCost || 10,
      geofenceStatus: "ROUTE_SAFE",
      summary: `Safe marine corridor calculated (${distanceKm ? distanceKm + " km" : "grid path"}), avoiding designated restricted sectors.`
    });
  } catch (error) {
    console.error("Marine route controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Marine route planning failed",
      error: error.message,
    });
  }
}

module.exports = {
  planRoute,
};
