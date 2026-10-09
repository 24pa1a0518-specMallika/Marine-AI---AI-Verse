const { calculateRisk } = require("./risk-engine/riskCalculator");

function evaluateSafety(warningLevel, cycloneActive, riskLevel, weather, ocean) {
    let safetyStatus = "PROCEED";
    if (
      warningLevel === "HIGH" ||
      riskLevel === "EXTREME" ||
      (weather?.windSpeed && weather.windSpeed > 28) ||
      (ocean?.waveHeight && ocean.waveHeight > 3.0)
    ) {
      safetyStatus = "DO_NOT_SAIL";
    } else if (
      riskLevel === "HIGH" ||
      riskLevel === "MODERATE" ||
      warningLevel === "MODERATE" ||
      (weather?.windSpeed && weather.windSpeed > 18) ||
      (ocean?.waveHeight && ocean.waveHeight > 1.8) ||
      (weather?.precipitationProbability && weather.precipitationProbability > 60)
    ) {
      safetyStatus = "CAUTION";
    }

    let decisionStatus = "SAFE";
    if (safetyStatus === "DO_NOT_SAIL") {
      decisionStatus = "NOT SAFE";
    } else if (safetyStatus === "CAUTION") {
      decisionStatus = "CAUTION";
    } else if (warningLevel === "UNAVAILABLE" || cycloneActive === null) {
      safetyStatus = "UNKNOWN";
      decisionStatus = "UNKNOWN";
    }

    return { safetyStatus, decisionStatus };
}

console.log("--- IMD UNKNOWN ---");
const r1 = calculateRisk({ officialWarning: "UNAVAILABLE", cyclone: false, wind: 12, waveHeight: 1.0 });
console.log(evaluateSafety("UNAVAILABLE", false, r1.level, {windSpeed: 12}, {waveHeight: 1.0}));

console.log("--- CYCLONE UNKNOWN ---");
const r2 = calculateRisk({ officialWarning: "NONE", cyclone: null, wind: 12, waveHeight: 1.0 });
console.log(evaluateSafety("NONE", null, r2.level, {windSpeed: 12}, {waveHeight: 1.0}));

console.log("--- BOTH UNKNOWN ---");
const r3 = calculateRisk({ officialWarning: "UNAVAILABLE", cyclone: null, wind: 12, waveHeight: 1.0 });
console.log(evaluateSafety("UNAVAILABLE", null, r3.level, {windSpeed: 12}, {waveHeight: 1.0}));

console.log("--- CONFIRMED CLEAR WARNING ---");
const r5 = calculateRisk({ officialWarning: "NONE", cyclone: false, wind: 12, waveHeight: 1.0 });
console.log(evaluateSafety("NONE", false, r5.level, {windSpeed: 12}, {waveHeight: 1.0}));

console.log("--- CONFIRMED NO CYCLONE ---");
const r6 = calculateRisk({ officialWarning: "NONE", cyclone: false, wind: 12, waveHeight: 1.0 });
console.log(evaluateSafety("NONE", false, r6.level, {windSpeed: 12}, {waveHeight: 1.0}));

console.log("--- HIGH WARNING ---");
const r4 = calculateRisk({ officialWarning: "HIGH", cyclone: false, wind: 12, waveHeight: 1.0 });
console.log(evaluateSafety("HIGH", false, r4.level, {windSpeed: 12}, {waveHeight: 1.0}));
