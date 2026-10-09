const { checkGeofence } = require("./backend/services/geofenceService");
const { planMarineRoute } = require("./backend/services/marineRouteService");
const { createGeographicRoute } = require("./backend/services/geoRoute");
const { calculateRisk } = require("./risk-engine/riskCalculator");

function runGeofenceTests() {
    console.log("--- POINT IN POLYGON TESTS ---");
    // Naval area is [16.9 to 17.1] lat, [83.4 to 83.6] lon
    console.log("A. Outside:", checkGeofence(16.5, 83.0).insideRestrictedZone);
    console.log("B. Inside Naval Area:", checkGeofence(17.0, 83.5).insideRestrictedZone);
    console.log("C. On Boundary:", checkGeofence(16.9, 83.5).insideRestrictedZone);
    console.log("D. Invalid Coord:", checkGeofence("NaN", "NaN").success);
}

function runRouteTests() {
    console.log("\n--- ROUTE OPTIMIZER INTEGRATION TESTS ---");
    
    // Start at 16.8, 83.5 (south of naval area)
    // Goal at 17.2, 83.5 (north of naval area)
    // Path strictly crosses 16.9 to 17.1 Naval Firing zone.
    
    const start = { latitude: 16.8, longitude: 83.5 };
    const goal = { latitude: 17.2, longitude: 83.5 };
    
    const marineConditions = {
        wind: 10,
        waveHeight: 1.0,
        rainProbability: 0,
        lightning: 0,
        cyclone: false,
        currentSpeed: 0
    };
    
    const { createGeographicRiskGrid } = require("./backend/services/geographicRiskGrid");

    const geographicRiskGrid = createGeographicRiskGrid({
      rows: 5, cols: 5, start, destination: goal, marineConditions, hazardCells: []
    });

    const enforcedRestrictedCells = [];
    geographicRiskGrid.coordinates.forEach((row) => {
        row.forEach((cell) => {
            const gf = checkGeofence(cell.latitude, cell.longitude);
            if (gf.insideRestrictedZone) {
                enforcedRestrictedCells.push({ row: cell.row, col: cell.col });
            }
        });
    });
    console.log("enforcedRestrictedCells:", enforcedRestrictedCells);

    const routeResult = planMarineRoute({
        rows: 5,
        cols: 5,
        start: {row: 0, col: 0},
        goal: {row: 4, col: 4},
        marineConditions,
        hazardCells: [],
        restrictedCells: enforcedRestrictedCells
    });

    const geoRoute = createGeographicRoute({
        route: routeResult.route,
        start,
        destination: goal
    });

    console.log("Geo Route Points:", geoRoute.length);
    let crossesGeofence = false;
    geoRoute.forEach(pt => {
        const gf = checkGeofence(pt.latitude, pt.longitude);
        if (gf.insideRestrictedZone) crossesGeofence = true;
    });
    
    console.log("Does generated geographic route cross restricted zone?", crossesGeofence);
}

runGeofenceTests();
runRouteTests();
