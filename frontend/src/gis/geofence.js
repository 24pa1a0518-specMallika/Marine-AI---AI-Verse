/**
 * Geofencing & Boundary Intersection Engine
 * Member 3 - GIS Module (SIH 2026 Problem ID: 26176)
 *
 * NOTE: Demo boundaries for SIH 2026 prototype visualization.
 * Not official maritime/legal boundaries.
 */

export const DEMO_DISCLAIMER = "⚠️ Demo boundaries for SIH 2026 prototype. Non-official / Not for real navigation.";

export const DEMO_GEOFENCE_ZONES = [
    // 1. International Maritime Boundary Lines (IMBL)
    {
        id: "IMBL_SRI_LANKA",
        name: "International Maritime Boundary Line (India - Sri Lanka)",
        category: "IMBL_RESTRICTED",
        type: "RESTRICTED",
        severity: "CRITICAL",
        description: "Palk Strait & Gulf of Mannar International Border.",
        reason: "Prohibited: Entering Sri Lankan territorial waters. Fishing craft crossing this boundary are subject to detention by foreign coast guard authorities.",
        polygonLatLon: [
            [9.85, 79.52],
            [9.50, 79.70],
            [9.15, 79.85],
            [8.80, 79.95],
            [8.80, 79.40],
            [9.85, 79.40]
        ]
    },
    {
        id: "IMBL_PAKISTAN",
        name: "International Maritime Boundary Line (India - Pakistan)",
        category: "IMBL_RESTRICTED",
        type: "RESTRICTED",
        severity: "CRITICAL",
        description: "Sir Creek & Arabian Sea Maritime Border.",
        reason: "Prohibited: Border security zone. All civilian fishing craft prohibited from crossing IMBL.",
        polygonLatLon: [
            [23.60, 68.00],
            [23.50, 68.20],
            [23.00, 68.10],
            [22.80, 67.80],
            [23.60, 67.50]
        ]
    },
    // 2. Marine Protected Areas (MPAs - Ecosystem & Wildlife Sanctuaries)
    {
        id: "MPA_CORINGA",
        name: "Coringa Wildlife Sanctuary (Marine Protected Area)",
        category: "PROTECTED_ZONE",
        type: "RESTRICTED",
        severity: "HIGH",
        description: "Ecologically sensitive mangrove & estuarine turtle sanctuary near Kakinada.",
        reason: "Prohibited: Protected mangrove ecosystem and Olive Ridley turtle breeding habitat. Commercial trawling and mechanized fishing strictly banned under Wildlife Protection Act.",
        polygonLatLon: [
            [16.85, 82.30],
            [16.85, 82.42],
            [16.70, 82.42],
            [16.70, 82.30]
        ]
    },
    {
        id: "MPA_GULF_OF_MANNAR",
        name: "Gulf of Mannar Biosphere Reserve & Marine National Park",
        category: "PROTECTED_ZONE",
        type: "RESTRICTED",
        severity: "HIGH",
        description: "Coral reef & Dugong marine national park sanctuary.",
        reason: "Prohibited: Coral reef protection zone. Commercial fishing and anchor dropping prohibited to protect endangered Dugong and marine flora.",
        polygonLatLon: [
            [9.25, 79.10],
            [9.25, 79.30],
            [9.00, 79.30],
            [9.00, 79.10]
        ]
    },
    // 3. No-Fishing & Ecologically Sensitive Zones (Seasonal Breeding)
    {
        id: "NO_FISH_GAHIRMATHA",
        name: "Gahirmatha Turtle Sanctuary & No-Fishing Zone",
        category: "NO_FISHING_ZONE",
        type: "RESTRICTED",
        severity: "HIGH",
        description: "Odisha Coast Mass Olive Ridley Nesting Grounds.",
        reason: "Prohibited: Seasonal & permanent no-fishing zone declared to protect mass arribada nesting of Olive Ridley sea turtles.",
        polygonLatLon: [
            [20.75, 86.90],
            [20.75, 87.15],
            [20.40, 87.15],
            [20.40, 86.90]
        ]
    },
    // 4. Shipping & Commercial Navigation Channels
    {
        id: "SHIP_VISAKHAPATNAM",
        name: "Visakhapatnam Harbor Approach & Shipping Channel",
        category: "SHIPPING_CHANNEL",
        type: "CAUTION",
        severity: "MODERATE",
        description: "Active deep-water cargo & tanker vessel navigation channel.",
        reason: "Caution: High vessel collision risk. Fishing craft must maintain continuous watch and yield right-of-way to commercial cargo ships.",
        polygonLatLon: [
            [17.72, 83.28],
            [17.72, 83.42],
            [17.65, 83.42],
            [17.65, 83.28]
        ]
    },
    // 5. Cyclone & Extreme Weather Danger Zones
    {
        id: "CYCLONE_HAZARD_BUFFER",
        name: "Active Storm / Cyclone High-Wave Hazard Zone",
        category: "CYCLONE_DANGER_ZONE",
        type: "RESTRICTED",
        severity: "CRITICAL",
        description: "IMD Severe Storm Warning Area with Wave Heights > 4.0m.",
        reason: "Prohibited: IMD severe storm alert active. High risk of vessel capsizing due to extreme wave height and storm surge.",
        polygonLatLon: [
            [18.20, 85.00],
            [18.20, 86.50],
            [16.80, 86.50],
            [16.80, 85.00]
        ]
    },
    // 6. Temporary Hazard & Naval Defense Zones
    {
        id: "NAVAL_DEFENSE_ZONE",
        name: "Eastern Naval Command Firing & Defense Exercise Zone",
        category: "TEMPORARY_HAZARD",
        type: "RESTRICTED",
        severity: "CRITICAL",
        description: "Active naval defense exercise and live firing zone.",
        reason: "Prohibited: Active naval defense exercise. All civilian fishing and transport vessels strictly prohibited from entering during exercise window.",
        polygonLatLon: [
            [17.10, 83.40],
            [17.10, 83.60],
            [16.90, 83.60],
            [16.90, 83.40]
        ]
    },
    {
        id: "CHENNAI_PORT_SECURITY_001",
        name: "Chennai Port Security & Defense Corridor",
        category: "RESTRICTED",
        type: "RESTRICTED",
        severity: "CRITICAL",
        description: "Designated naval surveillance & deep-water shipping security fairway.",
        reason: "Restricted perimeter: Mechanized trawlers require automated clearance.",
        polygonLatLon: [
            [13.0627, 80.3007],
            [13.0627, 80.4307],
            [12.9627, 80.4307],
            [12.9627, 80.3007]
        ]
    }
];

/**
 * Point-in-Polygon check (Ray-Casting Algorithm)
 * Accepts lat, lon (or object {lat, lon})
 */
export function checkPointGeofence(lat, lon) {
    if (typeof lat === 'object' && lat !== null) {
        lon = lat.lon || lat.longitude;
        lat = lat.lat || lat.latitude;
    }

    for (const zone of DEMO_GEOFENCE_ZONES) {
        if (isPointInPolygon(lat, lon, zone.polygonLatLon)) {
            return {
                isInside: true,
                status: "BLOCKED",
                zone: zone,
                warningMessage: `⚠️ GEOFENCE BREACH: Inside ${zone.name} (${zone.type}). ${zone.description}`,
                isDemoBoundary: true,
                disclaimer: DEMO_DISCLAIMER
            };
        }
    }

    return {
        isInside: false,
        status: "ALLOWED",
        zone: null,
        warningMessage: null,
        isDemoBoundary: true,
        disclaimer: DEMO_DISCLAIMER
    };
}

/**
 * Checks if a proposed vessel route (array of [{lat, lon}]) intersects any restricted polygon
 */
export function checkRouteGeofence(waypoints) {
    if (!waypoints || waypoints.length < 2) {
        return { crossesRestricted: false, breachedZones: [], warningMessage: null };
    }

    const breachedMap = new Map();

    for (let i = 0; i < waypoints.length - 1; i++) {
        const p1 = waypoints[i];
        const p2 = waypoints[i + 1];

        for (const zone of DEMO_GEOFENCE_ZONES) {
            // Check if end points or segment intersects polygon
            const p1Inside = isPointInPolygon(p1.lat, p1.lon, zone.polygonLatLon);
            const p2Inside = isPointInPolygon(p2.lat, p2.lon, zone.polygonLatLon);
            const intersects = lineIntersectsPolygon(p1, p2, zone.polygonLatLon);

            if (p1Inside || p2Inside || intersects) {
                breachedMap.set(zone.id, zone);
            }
        }
    }

    const breachedZones = Array.from(breachedMap.values());
    const crossesRestricted = breachedZones.length > 0;

    return {
        crossesRestricted,
        status: crossesRestricted ? "ROUTE_HAZARD_WARNING" : "ROUTE_SAFE",
        breachedZones,
        warningMessage: crossesRestricted
            ? `⚠️ HAZARD ALERT: Proposed route crosses ${breachedZones.length} restricted demo zone(s): ${breachedZones.map(z => z.name).join(', ')}.`
            : "✅ ROUTE SAFE: Route is clear of all demo restricted boundaries.",
        isDemoBoundary: true,
        disclaimer: DEMO_DISCLAIMER
    };
}

// Ray-Casting Point-in-Polygon helper
function isPointInPolygon(lat, lon, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];

        const intersect = ((yi > lon) !== (yj > lon)) &&
            (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Line segment intersection helper
function lineIntersectsPolygon(p1, p2, polygon) {
    for (let i = 0; i < polygon.length; i++) {
        const q1 = { lat: polygon[i][0], lon: polygon[i][1] };
        const nextIdx = (i + 1) % polygon.length;
        const q2 = { lat: polygon[nextIdx][0], lon: polygon[nextIdx][1] };

        if (segmentsIntersect(p1, p2, q1, q2)) {
            return true;
        }
    }
    return false;
}

function segmentsIntersect(p1, p2, q1, q2) {
    function ccw(a, b, c) {
        return (c.lon - a.lon) * (b.lat - a.lat) > (b.lon - a.lon) * (c.lat - a.lat);
    }
    return (ccw(p1, q1, q2) !== ccw(p2, q1, q2)) && (ccw(p1, p2, q1) !== ccw(p1, p2, q2));
}
