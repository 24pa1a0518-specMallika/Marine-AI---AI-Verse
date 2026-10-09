const { getMarineWarnings } = require("./backend/services/marineWarningService");
const { getCycloneStatus } = require("./backend/services/cycloneService");
const { calculateRisk } = require("./risk-engine/riskCalculator");

async function run() {
  console.log("Testing Live Services...");
  try {
    console.log("\n--- IMD Warning ---");
    const warnings = await getMarineWarnings(16.92, 82.24);
    console.log(JSON.stringify(warnings, null, 2));

    console.log("\n--- Cyclone ---");
    const cyclone = await getCycloneStatus(16.92, 82.24);
    console.log(JSON.stringify(cyclone, null, 2));

    console.log("\n--- Risk Calculation (Unavailable conditions) ---");
    const conditions = {
      wind: 12,
      windGust: 15,
      waveHeight: 1.2,
      rainProbability: 0,
      lightning: null,
      officialWarning: warnings.level,
      cyclone: cyclone.active,
    };
    const risk = calculateRisk(conditions);
    console.log(JSON.stringify(risk, null, 2));

  } catch (err) {
    console.error("Error:", err);
  }
}
run();
