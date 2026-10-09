const https = require("https");

const agent = new https.Agent({
  rejectUnauthorized: false,
});

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https
      .get(url, { agent, timeout: 5000 }, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          if (response.statusCode !== 200) {
            return reject(
              new Error(
                `Weather API returned status ${response.statusCode}: ${data}`,
              ),
            );
          }

          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error("Failed to parse weather API response"));
          }
        });
      })
      .on("timeout", () => req.destroy(new Error("Weather API request timed out")))
      .on("error", reject);
  });
}

async function getWeatherConditions(lat, lon) {
  const latitude = Number(lat);
  const longitude = Number(lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid latitude or longitude");
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "weather_code"
    ].join(","),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation_probability",
      "precipitation",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "weather_code"
    ].join(","),
    forecast_hours: "24",
    timezone: "Asia/Kolkata"
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  console.log("Requesting live weather data from Open-Meteo:", url);

  try {
    const result = await fetchJSON(url);
    const current = result.current || {};
  const hourly = result.hourly || {};

  const hourlyList = (hourly.time || []).map((tStr, idx) => {
    const d = new Date(tStr);
    const hourLabel = isNaN(d.getTime())
      ? tStr
      : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    return {
      time: idx === 0 ? "NOW" : hourLabel,
      isoTime: tStr,
      temperature: hourly.temperature_2m?.[idx] ?? null,
      humidity: hourly.relative_humidity_2m?.[idx] ?? null,
      precipitationProbability: hourly.precipitation_probability?.[idx] ?? 0,
      precipitation: hourly.precipitation?.[idx] ?? 0,
      windSpeed: hourly.wind_speed_10m?.[idx] ?? null,
      windDirection: hourly.wind_direction_10m?.[idx] ?? null,
      weatherCode: hourly.weather_code?.[idx] ?? 0
    };
  });

    return {
      latitude: result.latitude,
      longitude: result.longitude,
      timestamp: current.time || new Date().toISOString(),
      temperature: current.temperature_2m ?? null,
      humidity: current.relative_humidity_2m ?? null,
      precipitation: current.precipitation ?? 0,
      windSpeed: current.wind_speed_10m ?? null,
      windDirection: current.wind_direction_10m ?? null,
      windGust: current.wind_gusts_10m ?? null,
      precipitationProbability: hourly.precipitation_probability?.[0] ?? 0,
      weatherCode: current.weather_code ?? null,
      hourly: hourlyList,
      source: "Open-Meteo Realtime Forecast API",
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("Weather API Limit reached or failed. Returning mock data.", error.message);
    return {
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      temperature: 28.5,
      humidity: 78,
      precipitation: 0,
      windSpeed: 12.5,
      windDirection: 145,
      windGust: 18,
      precipitationProbability: 10,
      weatherCode: 2,
      hourly: [],
      source: "Mock Fallback (API Limit Exceeded)",
      updatedAt: new Date().toISOString(),
    };
  }
}

async function getWeatherForecast(lat, lon, targetDate) {
  const latitude = Number(lat);
  const longitude = Number(lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid latitude or longitude");
  }

  if (!targetDate) {
    throw new Error("Target forecast date is required");
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),

    hourly: [
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "precipitation_probability",
      "precipitation",
      "weather_code",
    ].join(","),

    start_date: targetDate,
    end_date: targetDate,

    timezone: "GMT",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  console.log("Requesting forecast weather data:");
  console.log(url);

  try {
    const result = await fetchJSON(url);

    const hourly = result.hourly || {};

  if (!hourly.time || hourly.time.length === 0) {
    throw new Error(`No weather forecast available for ${targetDate}`);
  }

  // Find the representative daytime forecast.
  // Around 12:00 UTC is useful for a simple prototype.
  let selectedIndex = hourly.time.findIndex((time) => time.includes("12:00"));

  // If 12:00 is unavailable, use the middle forecast point.
  if (selectedIndex === -1) {
    selectedIndex = Math.floor(hourly.time.length / 2);
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude,

    forecastDate: targetDate,

    timestamp: hourly.time[selectedIndex] || null,

    windSpeed: hourly.wind_speed_10m?.[selectedIndex] ?? null,

    windDirection: hourly.wind_direction_10m?.[selectedIndex] ?? null,

    windGust: hourly.wind_gusts_10m?.[selectedIndex] ?? null,

    precipitation: hourly.precipitation?.[selectedIndex] ?? null,

    precipitationProbability:
      hourly.precipitation_probability?.[selectedIndex] ?? null,

    weatherCode: hourly.weather_code?.[selectedIndex] ?? null,

    source: "Open-Meteo Weather API",

    status: "FORECAST",

    updatedAt: new Date().toISOString(),
  };
} catch (error) {
  console.warn("Weather API Limit reached or failed for forecast. Returning mock data.", error.message);
  return {
    latitude: lat,
    longitude: lon,
    forecastDate: targetDate,
    timestamp: new Date().toISOString(),
    windSpeed: 10.5,
    windDirection: 120,
    windGust: 15,
    precipitation: 0,
    precipitationProbability: 15,
    weatherCode: 1,
    source: "Mock Fallback Forecast API",
    status: "FORECAST",
    updatedAt: new Date().toISOString(),
  };
}
}

async function getSevenDayWeatherForecast(lat, lon) {
  const latitude = Number(lat);
  const longitude = Number(lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid latitude or longitude");
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "wind_direction_10m_dominant"
    ].join(","),
    forecast_days: "7",
    timezone: "auto"
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  console.log("Requesting 7-day forecast weather data:", url);
  try {
    const result = await fetchJSON(url);
    const daily = result.daily || {};

  if (!daily.time || daily.time.length === 0) {
    throw new Error("No 7-day forecast data returned");
  }

  const days = daily.time.map((dateStr, idx) => {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const formattedDate = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    const maxT = Math.round(daily.temperature_2m_max?.[idx] ?? 30);
    const minT = Math.round(daily.temperature_2m_min?.[idx] ?? 25);
    const windSpeed = Math.round((daily.wind_speed_10m_max?.[idx] ?? 14) * 0.539957); // km/h to knots
    const precipProb = daily.precipitation_probability_max?.[idx] ?? 10;
    const weatherCode = daily.weather_code?.[idx] ?? 0;
    const windDir = daily.wind_direction_10m_dominant?.[idx] ?? 60;

    let icon = "sun";
    if (weatherCode >= 51) icon = "rain";
    else if (weatherCode >= 1 && weatherCode <= 3) icon = "sun-cloud";

    return {
      date: dateStr,
      day: `${dayName}, ${formattedDate}`,
      dayShort: dayName,
      tempMax: maxT,
      tempMin: minT,
      temp: `${minT}° / ${maxT}°`,
      windSpeed,
      wind: `${windSpeed} kt`,
      windDirection: windDir,
      precip: `${precipProb} %`,
      rainProb: precipProb,
      weatherCode,
      icon,
      source: "Open-Meteo 7-Day Forecast"
    };
  });

    return {
      latitude: result.latitude,
      longitude: result.longitude,
      count: days.length,
      days,
      source: "Open-Meteo Weather API",
      status: "FORECAST_7DAY",
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.warn("Weather API Limit reached or failed (7 day). Returning mock data.", error.message);
    return {
      latitude,
      longitude,
      count: 7,
      days: Array.from({ length: 7 }).map((_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString().split("T")[0],
        day: "Mock Day",
        dayShort: "Mock",
        tempMax: 30,
        tempMin: 25,
        temp: "25° / 30°",
        windSpeed: 15,
        wind: "15 kt",
        windDirection: 90,
        precip: "10 %",
        rainProb: 10,
        weatherCode: 1,
        icon: "sun-cloud",
        source: "Mock Fallback",
      })),
      source: "Mock Fallback Weather API",
      status: "FORECAST_7DAY",
      updatedAt: new Date().toISOString()
    };
  }
}

module.exports = {
  getWeatherConditions,
  getWeatherForecast,
  getSevenDayWeatherForecast,
};

