const {
  getWeatherConditions,
  getWeatherForecast,
  getSevenDayWeatherForecast,
} = require("../../services/weatherService");

const {
  getMarineConditions,
  getMarineForecast,
} = require("../../services/marineDataService");
const { getMarineWarnings } = require("../../services/marineWarningService");
const { fetchChlorophyll } = require("../../services/chlorophyllService");

function getCoordinates(req) {
  const latitude = Number(req.query.latitude ?? req.query.lat);
  const longitude = Number(req.query.longitude ?? req.query.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

async function getWeather(req, res) {
  try {
    const coordinates = getCoordinates(req);

    if (!coordinates) {
      return res.status(400).json({
        success: false,
        error: "Valid latitude and longitude are required",
      });
    }

    const data = await getWeatherConditions(
      coordinates.latitude,
      coordinates.longitude,
    );

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Weather API error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to retrieve live weather data",
    });
  }
}

async function getOcean(req, res) {
  try {
    const coordinates = getCoordinates(req);

    if (!coordinates) {
      return res.status(400).json({
        success: false,
        error: "Valid latitude and longitude are required",
      });
    }

    const data = await getMarineConditions(
      coordinates.latitude,
      coordinates.longitude,
    );
    
    try {
      const chlData = await fetchChlorophyll(coordinates.latitude, coordinates.longitude);
      data.chlorophyll = chlData.chlorophyll;
    } catch (e) {
      console.warn("Chlorophyll fetch failed:", e.message);
      data.chlorophyll = null;
    }

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Marine data API error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to retrieve live marine data",
    });
  }
}

async function getWarnings(req, res) {
  try {
    const coordinates = getCoordinates(req);

    if (!coordinates) {
      return res.status(400).json({
        success: false,
        error: "Valid latitude and longitude are required",
      });
    }

    const data = await getMarineWarnings(
      coordinates.latitude,
      coordinates.longitude,
    );

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Marine warning API error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to retrieve marine warning data",
    });
  }
}
async function getWeatherForecastData(req, res) {
  try {
    const coordinates = getCoordinates(req);
    const targetDate = req.query.targetDate || new Date().toISOString().split("T")[0];

    if (!coordinates) {
      return res.status(400).json({
        success: false,
        error: "Valid latitude and longitude are required",
      });
    }

    if (req.query.days === "7" || req.query.weekly === "true") {
      const data = await getSevenDayWeatherForecast(
        coordinates.latitude,
        coordinates.longitude
      );
      return res.json({
        success: true,
        ...data,
      });
    }

    const data = await getWeatherForecast(
      coordinates.latitude,
      coordinates.longitude,
      targetDate,
    );

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Weather forecast API error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to retrieve weather forecast data",
    });
  }
}

async function getMarineForecastData(req, res) {
  try {
    const coordinates = getCoordinates(req);
    const targetDate = req.query.targetDate || new Date().toISOString().split("T")[0];

    if (!coordinates) {
      return res.status(400).json({
        success: false,
        error: "Valid latitude and longitude are required",
      });
    }

    const data = await getMarineForecast(
      coordinates.latitude,
      coordinates.longitude,
      targetDate,
    );

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Marine forecast API error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to retrieve marine forecast data",
    });
  }
}

module.exports = {
  getWeather,
  getOcean,
  getWarnings,
  getWeatherForecast: getWeatherForecastData,
  getMarineForecast: getMarineForecastData,
};
