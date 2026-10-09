const { createGeographicRoute } = require("./geoRoute");
const { getMarineWarnings } = require("./marineWarningService");
const { getBestFishingZones } = require("./pfzRecommendationService");
const { getWeatherConditions, getWeatherForecast } = require("./weatherService");
const { getMarineConditions, getMarineForecast } = require("./marineDataService");
const { getCycloneStatus } = require("./cycloneService");
const { planMarineRoute } = require("./marineRouteService");
const { createGeographicRiskGrid } = require("./geographicRiskGrid");
const { checkGeofence } = require("./geofenceService");
const { calculateDistanceKm } = require("./pfzService");
const { getElevationRestrictedCells } = require("./elevationService");

async function findBestFishingRoute({
  latitude,
  longitude,
  targetDate = null,
  rows = 5,
  cols = 5,
  hazardCells = [],
  restrictedCells = [],
  targetPfzId = null,
}) {
  // 0. Check whether the fisherman's current location
  // is inside an actual restricted geofence.
  const geofence = checkGeofence(latitude, longitude);

  if (!geofence.success) {
    return {
      success: false,
      message: geofence.message,
    };
  }

  // Never allow route planning from inside a restricted zone.
  if (
    geofence.status === "RESTRICTED" ||
    geofence.insideRestrictedZone === true
  ) {
    return {
      success: false,
      message:
        "Route planning blocked: current location is inside a restricted zone.",
      safetyStatus: "DO_NOT_SAIL",
      geofence,
    };
  }

  // 1. Get official IMD marine warnings and cyclone status FIRST
  const marineWarnings = await getMarineWarnings(latitude, longitude);
  const cycloneStatus = await getCycloneStatus(latitude, longitude);

  let finalSafetyStatus = "SAFE";
  if (marineWarnings.level === "HIGH") {
    finalSafetyStatus = "DO_NOT_SAIL";
  } else if (marineWarnings.level === "MODERATE") {
    finalSafetyStatus = "CAUTION";
  } else if (marineWarnings.level === "UNAVAILABLE") {
    finalSafetyStatus = "UNKNOWN";
  }

  // Fast fail for DO_NOT_SAIL or UNKNOWN
  if (finalSafetyStatus === "DO_NOT_SAIL" || finalSafetyStatus === "UNKNOWN") {
    return {
      success: false,
      fishermanLocation: { latitude, longitude },
      geofence,
      recommendedFishingZone: null,
      liveMarineData: null,
      liveWeatherData: null,
      marineWarning: marineWarnings,
      cyclone: cycloneStatus,
      safetyStatus: finalSafetyStatus,
      geographicRiskGrid: [],
      geographicRiskCoordinates: [],
      route: [],
      geographicRoute: [],
      distance: null,
      risk: { score: 0, level: finalSafetyStatus === 'DO_NOT_SAIL' ? 'HIGH' : 'UNKNOWN', factors: [] },
      totalRiskCost: null,
      totalCost: null,
      explanation: finalSafetyStatus === "DO_NOT_SAIL"
        ? `Route calculation blocked. DO NOT SAIL: Official IMD ${marineWarnings.level} warning is active.`
        : `Route calculation blocked. SAFETY UNKNOWN: Critical intelligence (IMD or Cyclone data) is unavailable.`,
      avoidedHazards: [],
      restrictedCells,
      dataQuality: {
        marineWarning: 'LIVE_IMD',
        cyclone: cycloneStatus.status === 'NOT_AVAILABLE' ? 'NOT_AVAILABLE' : 'LIVE_IMD',
        geofence: 'PROTOTYPE'
      }
    };
  }

  // 2. Find the best fishing zone (Expensive).
  const pfzResult = await getBestFishingZones({
  latitude,
  longitude,
  targetPfzId,
  });

  if (!pfzResult.success) {
    return {
      success: false,
      message: pfzResult.message,
      geofence,
    };
  }

  const destination = pfzResult.recommendedZone;

  // 3. Get marine conditions.
  let marineData;
  try {
    marineData = targetDate 
      ? await getMarineForecast(latitude, longitude, targetDate) 
      : await getMarineConditions(latitude, longitude);
  } catch (error) {
    console.warn("[FishingRouteService] Marine data unavailable:", error.message);
    marineData = {
      latitude,
      longitude,
      forecastDate: targetDate,
      timestamp: null,
      waveHeight: null,
      wavePeriod: null,
      sst: null,
      currentSpeed: null,
      currentDirection: null,
      source: "Open-Meteo Marine API",
      status: "UNAVAILABLE",
      updatedAt: new Date().toISOString()
    };
  }

  // 4. Get weather conditions.
  let weatherData;
  try {
    weatherData = targetDate
      ? await getWeatherForecast(latitude, longitude, targetDate)
      : await getWeatherConditions(latitude, longitude);
  } catch (error) {
    console.warn("[FishingRouteService] Weather data unavailable:", error.message);
    weatherData = {
      latitude,
      longitude,
      forecastDate: targetDate,
      timestamp: null,
      windSpeed: null,
      windDirection: null,
      windGust: null,
      precipitation: null,
      precipitationProbability: null,
      weatherCode: null,
      source: "Open-Meteo Weather API",
      status: "UNAVAILABLE",
      updatedAt: new Date().toISOString()
    };
  }

  // 5. Safety-critical missing data check
  if (weatherData.windSpeed == null || marineData.waveHeight == null) {
    finalSafetyStatus = "UNKNOWN";
  }

  // Fast fail again if missing data escalated status to UNKNOWN
  if (finalSafetyStatus === "UNKNOWN") {
    return {
      success: false,
      fishermanLocation: { latitude, longitude },
      geofence,
      recommendedFishingZone: destination,
      liveMarineData: marineData,
      liveWeatherData: weatherData,
      marineWarning: marineWarnings,
      cyclone: cycloneStatus,
      safetyStatus: finalSafetyStatus,
      geographicRiskGrid: [],
      geographicRiskCoordinates: [],
      route: [],
      geographicRoute: [],
      distance: null,
      distanceKm: null,
      risk: { score: 0, level: 'UNKNOWN', factors: [] },
      totalRiskCost: null,
      totalCost: null,
      explanation: "Route calculation blocked. SAFETY UNKNOWN: Required live weather/marine data is unavailable.",
      avoidedHazards: [],
      restrictedCells,
      dataQuality: {
        marineWarning: 'LIVE_IMD',
        cyclone: cycloneStatus.status === 'NOT_AVAILABLE' ? 'NOT_AVAILABLE' : 'LIVE_IMD',
        geofence: 'PROTOTYPE'
      }
    };
  }

  // 6. Combine live data for the existing risk engine.
  const marineConditions = {
    wind: weatherData.windSpeed,
    windGust: weatherData.windGust ?? null,
    waveHeight: marineData.waveHeight,
    rainProbability: weatherData.precipitationProbability ?? null,
    lightning: marineWarnings.lightningWarning ? 1 : 0,
    cyclone: cycloneStatus?.active ?? null,
    currentSpeed: marineData.currentSpeed ?? null,
  };

  // 6. Convert geographic start/destination
  // into prototype grid positions.
  const start = {
    row: 0,
    col: 0,
  };

  const goal = {
    row: rows - 1,
    col: cols - 1,
  };

  // 7. Create geographic risk grid.
  const geographicRiskGrid = createGeographicRiskGrid({
    rows,
    cols,
    start: {
      latitude,
      longitude,
    },
    destination: {
      latitude: destination.latitude,
      longitude: destination.longitude,
    },
    marineConditions,
    hazardCells,
  });

  // 8. Enforce backend geofence restrictions into the pathfinder
  const enforcedRestrictedCells = [...restrictedCells];
  geographicRiskGrid.coordinates.forEach((row) => {
    row.forEach((cell) => {
      const gf = checkGeofence(cell.latitude, cell.longitude);
      if (gf.insideRestrictedZone) {
        enforcedRestrictedCells.push({ row: cell.row, col: cell.col });
      }
    });
  });

  // 8.5 Dynamic Bathymetry/Elevation Check
  const elevationRestricted = await getElevationRestrictedCells(geographicRiskGrid.coordinates);
  // Strictly restrict land cells, unless they are the start or goal (to prevent failing if port is marked as land)
  elevationRestricted.forEach((cell) => {
    if ((cell.row === start.row && cell.col === start.col) || (cell.row === goal.row && cell.col === goal.col)) {
      geographicRiskGrid.grid[cell.row][cell.col] += 1000; // Penalize instead of completely restricting start/goal
    } else {
      enforcedRestrictedCells.push({ row: cell.row, col: cell.col });
    }
  });

  // 9. Generate risk-aware route.
  let routeResult = {
    success: false,
    route: [],
    distance: null,
    risk: geographicRiskGrid.risk,
    totalRiskCost: null,
    totalCost: null,
    avoidedHazards: [],
    explanation: ''
  };
  let geographicRoute = [];

  if (finalSafetyStatus !== "DO_NOT_SAIL" && finalSafetyStatus !== "UNKNOWN") {
    routeResult = planMarineRoute({
      rows,
      cols,
      start,
      goal,
      marineConditions,
      hazardCells,
      restrictedCells: enforcedRestrictedCells,
      customRiskGrid: geographicRiskGrid.grid,
    });

    // 11. Convert grid route into geographic coordinates.
    geographicRoute = routeResult.success
      ? routeResult.route.map(cell => ({
          row: cell.row,
          col: cell.col,
          latitude: geographicRiskGrid.coordinates[cell.row][cell.col].latitude,
          longitude: geographicRiskGrid.coordinates[cell.row][cell.col].longitude,
        }))
      : [];
  }

  // Calculate actual geographic distance
  let totalGeographicDistanceKm = null;
  if (geographicRoute.length > 1) {
    totalGeographicDistanceKm = 0;
    for (let i = 0; i < geographicRoute.length - 1; i++) {
      totalGeographicDistanceKm += calculateDistanceKm(
        geographicRoute[i].latitude,
        geographicRoute[i].longitude,
        geographicRoute[i + 1].latitude,
        geographicRoute[i + 1].longitude
      );
    }
    // Round to 1 decimal place
    totalGeographicDistanceKm = Math.round(totalGeographicDistanceKm * 10) / 10;
  }

  // 12. Final response.
  return {
    success: routeResult.success,

    fishermanLocation: {
      latitude,
      longitude,
    },

    // Geofence information.
    geofence,

    recommendedFishingZone: {
      id: destination.id,
      name: destination.name,
      latitude: destination.latitude,
      longitude: destination.longitude,
      pfzScore: destination.pfz_score,
      confidence: destination.confidence,
      distance: destination.distance,
    },

    // LIVE marine data.
    liveMarineData: marineData,

    // LIVE weather data.
    liveWeatherData: weatherData,

    // OFFICIAL IMD warning.
    marineWarning: marineWarnings,

    // Cyclone status.
    cyclone: cycloneStatus,

    // Final safety decision.
    safetyStatus: finalSafetyStatus,

    // Geographic risk grid.
    geographicRiskGrid: geographicRiskGrid.grid,

    geographicRiskCoordinates: geographicRiskGrid.coordinates,

    // A* route.
    route: routeResult.route || [],

    // Geographic route.
    geographicRoute,

    // Route metrics.
    distance: routeResult.distance ?? null,
    distanceKm: totalGeographicDistanceKm,

    risk: routeResult.risk || geographicRiskGrid.risk,

    totalRiskCost: routeResult.totalRiskCost ?? null,

    totalCost: routeResult.totalCost ?? null,

    explanation:
      finalSafetyStatus === "DO_NOT_SAIL"
        ? `Route calculation blocked. DO NOT SAIL: Official IMD ${marineWarnings.level} warning is active.`
        : finalSafetyStatus === "UNKNOWN"
          ? `Route calculation blocked. SAFETY UNKNOWN: Critical intelligence (IMD or Cyclone data) is unavailable.`
          : finalSafetyStatus === "CAUTION"
            ? `Route optimized with marine risk awareness. CAUTION: Official IMD ${marineWarnings.level} warning is active.`
            : routeResult.explanation || routeResult.message,

    avoidedHazards: routeResult.avoidedHazards || [],

    restrictedCells,

    // Data provenance.
    dataQuality: {
      marineData: targetDate ? "FORECAST" : "LIVE",
      weatherData: targetDate ? "FORECAST" : "LIVE",
      wind: targetDate ? "FORECAST" : "LIVE",
      rainProbability: targetDate ? "FORECAST" : "LIVE",

      // Lightning is obtained from IMD.
      lightning: "LIVE_IMD",

      // Structured cyclone track integration is
      // not available yet.
      cyclone: cycloneStatus?.status ?? "NOT_AVAILABLE",

      marineWarning: "LIVE_IMD",

      // Current geofence dataset is prototype data.
      geofence:
        geofence?.source === "Prototype Geofence Dataset"
          ? "PROTOTYPE"
          : "UNKNOWN",
    },
  };
}

module.exports = {
  findBestFishingRoute,
};
