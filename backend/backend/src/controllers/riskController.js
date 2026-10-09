const { calculateRisk } = require("../../../risk-engine/riskCalculator");

function getMarineRisk(req, res) {
  try {
    const body = req.body || {};
    const windSpeed = body.windSpeed ?? body.wind ?? null;
    const windGust = body.windGust ?? (windSpeed != null ? Number(windSpeed) * 1.25 : null);
    const waveHeight = body.waveHeight ?? null;
    const rainProbability = body.rainProbability ?? null;
    const lightning = body.lightning ?? null;
    const cyclone = body.cyclone ?? null;

    // Convert API field names to risk-engine field names
    const result = calculateRisk({
      wind: windSpeed != null ? Number(windSpeed) : null,
      windGust: windGust != null ? Number(windGust) : null,
      waveHeight: waveHeight != null ? Number(waveHeight) : null,
      rainProbability: rainProbability != null ? Number(rainProbability) : null,
      lightning: lightning != null ? Number(lightning) : null,
      cyclone: cyclone != null ? Boolean(cyclone) : null,
      officialWarning: body.officialWarning,
    });

    res.json({
      success: true,
      risk: result,
    });
  } catch (error) {
    console.error("Risk calculation error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to calculate marine risk",
    });
  }
}

module.exports = {
  getMarineRisk,
};
