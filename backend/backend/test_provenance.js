const { findBestFishingRoute } = require("./services/fishingRouteService");
const marineWarningService = require("./services/marineWarningService");

async function runProvenanceTest() {
    console.log("--- E2E ROUTE PROVENANCE TEST ---");
    const latitude = 17.68;
    const longitude = 83.21;
    
    // Mock IMD to fail
    const originalGetWarnings = marineWarningService.getMarineWarnings;
    marineWarningService.getMarineWarnings = async () => {
        return {
            level: "UNAVAILABLE",
            warning: null,
            advisoryText: "IMD Service Failed"
        };
    };

    console.log(`Starting routing with UNAVAILABLE IMD Data...`);
    
    const result = await findBestFishingRoute({
        latitude,
        longitude,
        rows: 5,
        cols: 5,
        hazardCells: [],
        restrictedCells: []
    });

    console.log("Risk Status:", result.safetyStatus);
    console.log("Route Success:", result.success);
    console.log("Route Length:", result.geographicRoute.length);
    console.log("Explanation:", result.explanation);

    marineWarningService.getMarineWarnings = originalGetWarnings;
}

runProvenanceTest().catch(console.error);
