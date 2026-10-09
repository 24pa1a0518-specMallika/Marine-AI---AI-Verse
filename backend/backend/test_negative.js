const warningServicePath = require.resolve("./services/marineWarningService");
require(warningServicePath).getMarineWarnings = async () => {
    return { level: "HIGH", warning: true, source: "MOCK" };
};
// Now require fishingRouteService
const { findBestFishingRoute } = require("./services/fishingRouteService");

async function runE2ENegative() {
    console.log("\n--- NEGATIVE TEST: IMD HIGH ---");
    const latitude = 17.68;
    const longitude = 83.21;
    
    const result2 = await findBestFishingRoute({
        latitude,
        longitude,
        rows: 5,
        cols: 5,
        hazardCells: [],
        restrictedCells: []
    });

    console.log("\n=== RISK & SAFETY ===");
    console.log("Status:", result2.safetyStatus);
    console.log("Explanation:", result2.explanation);

    console.log("\n=== ROUTE RESULT ===");
    console.log("Success:", result2.success);
    console.log("Geo Route Points:", result2.geographicRoute.length);

    // Restore
    require(warningServicePath).getMarineWarnings = originalWarning;
}

runE2ENegative().catch(console.error);
