const { findBestFishingRoute } = require("./services/fishingRouteService");

async function runE2E() {
    console.log("--- E2E ROUTE TEST: CURRENT ---");
    const latitude = 17.68;
    const longitude = 83.21;
    
    const result = await findBestFishingRoute({
        latitude,
        longitude,
        rows: 5,
        cols: 5,
        hazardCells: [],
        restrictedCells: []
    });

    console.log("Current Data Source:", result.dataQuality.marineData);

    console.log("\n--- E2E ROUTE TEST: TOMORROW ---");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toISOString().slice(0, 10);
    
    const result2 = await findBestFishingRoute({
        latitude,
        longitude,
        targetDate,
        rows: 5,
        cols: 5,
        hazardCells: [],
        restrictedCells: []
    });

    console.log("Tomorrow Data Source:", result2.dataQuality.marineData);
    console.log("Forecast Date Used:", result2.liveWeatherData.forecastDate);
    console.log("Forecast Timestamp:", result2.liveWeatherData.timestamp);
    console.log("Risk Status:", result2.safetyStatus);
    console.log("Route Generated Points:", result2.geographicRoute.length);
}

runE2E().catch(console.error);
