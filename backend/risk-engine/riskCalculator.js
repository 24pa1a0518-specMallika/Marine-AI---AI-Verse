const THRESHOLDS = require("./thresholds");

function calculateRisk(data) {
  let score = 0;
  const factors = [];

  // Official warning severity is treated as a high-priority
  // safety factor, but the final safety override remains
  // responsible for the actual sailing recommendation.
  if (data.officialWarning === "HIGH") {
    score += 60;
    factors.push("Official high marine warning");
  } else if (data.officialWarning === "MODERATE") {
    score += 30;
    factors.push("Official marine warning");
  }

  // Wind
  if (data.wind > THRESHOLDS.wind.high) {
    score += 40;
    factors.push("Strong wind");
  } else if (data.wind > THRESHOLDS.wind.moderate) {
    score += 25;
    factors.push("Moderate-high wind");
  } else if (data.wind > THRESHOLDS.wind.low) {
    score += 10;
    factors.push("Moderate wind");
  }

  //wind gust
  if (data.windGust > THRESHOLDS.windGust.high) {
    score += 40;
    factors.push("Dangerous wind gusts");
  } else if (data.windGust > THRESHOLDS.windGust.moderate) {
    score += 25;
    factors.push("Strong wind gusts");
  } else if (data.windGust > THRESHOLDS.windGust.low) {
    score += 10;
    factors.push("Moderate wind gusts");
  }

  // Wave height
  if (data.waveHeight > THRESHOLDS.waveHeight.high) {
    score += 40;
    factors.push("High waves");
  } else if (data.waveHeight > THRESHOLDS.waveHeight.moderate) {
    score += 25;
    factors.push("Moderately high waves");
  } else if (data.waveHeight > THRESHOLDS.waveHeight.low) {
    score += 10;
    factors.push("Moderate waves");
  }

  // Rain
  if (data.rainProbability > THRESHOLDS.rainProbability.high) {
    score += 15;
    factors.push("Heavy rain probability");
  } else if (data.rainProbability > THRESHOLDS.rainProbability.moderate) {
    score += 10;
    factors.push("High rain probability");
  }

  // Lightning
  if (data.lightning >= 3) {
    score += 20;
    factors.push("Frequent lightning");
  } else if (data.lightning >= 1) {
    score += 10;
    factors.push("Lightning detected");
  }

  // Cyclone
  if (data.cyclone === true) {
    score += 100;
    factors.push("Cyclone hazard");
  }

  let level;

  if (score >= 100) {
    level = "EXTREME";
  } else if (score >= 60) {
    level = "HIGH";
  } else if (score >= 30) {
    level = "MODERATE";
  } else {
    level = "LOW";
  }

  // Per-factor risk score contribution breakdown
  const perFactorBreakdown = {
    officialWarning: {
      points: data.officialWarning === "HIGH" ? 60 : data.officialWarning === "MODERATE" ? 30 : 0,
      maxPoints: 60,
      value: data.officialWarning || "NONE",
      detail: data.officialWarning === "UNAVAILABLE" ? "Marine warning data unavailable" : (data.officialWarning ? `Official ${data.officialWarning} marine warning` : "No official warning"),
    },
    wind: {
      points: data.wind > THRESHOLDS.wind.high ? 40 : data.wind > THRESHOLDS.wind.moderate ? 25 : data.wind > THRESHOLDS.wind.low ? 10 : 0,
      maxPoints: 40,
      value: `${data.wind || 0} km/h`,
      detail: data.wind === null || data.wind === undefined ? "Wind data unavailable" : `Wind speed ${data.wind} km/h`,
    },
    windGust: {
      points: data.windGust > THRESHOLDS.windGust.high ? 40 : data.windGust > THRESHOLDS.windGust.moderate ? 25 : data.windGust > THRESHOLDS.windGust.low ? 10 : 0,
      maxPoints: 40,
      value: `${data.windGust || 0} km/h`,
      detail: data.windGust === null || data.windGust === undefined ? "Wind gust data unavailable" : `Wind gust ${data.windGust} km/h`,
    },
    waveHeight: {
      points: data.waveHeight > THRESHOLDS.waveHeight.high ? 40 : data.waveHeight > THRESHOLDS.waveHeight.moderate ? 25 : data.waveHeight > THRESHOLDS.waveHeight.low ? 10 : 0,
      maxPoints: 40,
      value: `${data.waveHeight || 0} m`,
      detail: data.waveHeight === null || data.waveHeight === undefined ? "Wave height data unavailable" : `Wave height ${data.waveHeight} m`,
    },
    rainProbability: {
      points: data.rainProbability > THRESHOLDS.rainProbability.high ? 15 : data.rainProbability > THRESHOLDS.rainProbability.moderate ? 10 : 0,
      maxPoints: 15,
      value: `${data.rainProbability || 0}%`,
      detail: data.rainProbability === null || data.rainProbability === undefined ? "Precipitation data unavailable" : `Precipitation probability ${data.rainProbability}%`,
    },
    lightning: {
      points: data.lightning >= 3 ? 20 : data.lightning >= 1 ? 10 : 0,
      maxPoints: 20,
      value: data.lightning !== null && data.lightning !== undefined ? (data.lightning > 0 ? `${data.lightning} strikes/alerts` : "NONE") : "UNKNOWN",
      detail: data.lightning !== null && data.lightning !== undefined ? (data.lightning > 0 ? `Lightning detected (${data.lightning})` : "No lightning detected") : "Lightning data unavailable",
    },
    cyclone: {
      points: data.cyclone === true ? 100 : 0,
      maxPoints: 100,
      value: data.cyclone === true ? "ACTIVE" : (data.cyclone === false ? "NONE" : "UNKNOWN"),
      detail: data.cyclone === true ? "Active cyclone warning in area" : (data.cyclone === false ? "No active cyclone" : "Cyclone data unavailable"),
    },
  };

  // Calculate confidence score based on input availability
  let evaluatedInputs = 0;
  let totalInputs = 6;
  if (data.wind !== undefined && data.wind !== null) evaluatedInputs++;
  if (data.waveHeight !== undefined && data.waveHeight !== null) evaluatedInputs++;
  if (data.rainProbability !== undefined && data.rainProbability !== null) evaluatedInputs++;
  if (data.lightning !== undefined && data.lightning !== null) evaluatedInputs++;
  if (data.officialWarning !== undefined) evaluatedInputs++;
  if (data.cyclone !== undefined) evaluatedInputs++;
  
  const confidenceScore = Math.round((evaluatedInputs / totalInputs) * 100);

  return {
    score,
    level,
    factors,
    perFactorBreakdown,
    confidenceScore,
    explainability: {
      summary: `Overall marine risk level: ${level} (risk score ${score}/100 based on ${factors.length > 0 ? factors.join(", ") : "favorable conditions"})`,
      primaryRiskDriver: factors[0] || "No major hazard detected",
      confidenceScore,
    },
  };
}

module.exports = { calculateRisk };
