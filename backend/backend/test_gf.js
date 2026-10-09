const { checkGeofence } = require('./services/geofenceService');
console.log("Testing point 16.8, 82.2 (Should be inside LAND_COASTAL_001):", checkGeofence(16.8, 82.2));
console.log("Testing point 17.0, 82.2 (Should be outside):", checkGeofence(17.0, 82.2));
