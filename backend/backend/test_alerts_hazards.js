/**
 * Marine AI — Safety Alerts & Hazard Test Suite (Member 5 Deliverable)
 * Validates Scenarios 1 to 6, Alert Pipeline, Deduplication, Severities, and Overrides
 */

const { detectHazards } = require("./src/hazardDetector");
const {
  evaluateAlerts,
  getActiveAlerts,
  getAlertHistory,
  clearAlerts,
} = require("./src/alertEngine");

console.log("================================================================================");
console.log("🚨 MARINE AI — SAFETY ALERTS & HAZARD TEST SUITE (MEMBER 5)");
console.log("================================================================================");

let total = 0;
let passed = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runAlertTestSuite() {
  clearAlerts();

  const mockLocation = { latitude: 17.6868, longitude: 83.2185 };

  // ============================================================================
  // SCENARIO 1 — NORMAL CONDITIONS
  // ============================================================================
  console.log("\n🧪 SCENARIO 1 — Normal Conditions (No Critical Alert)");
  const normalData = {
    location: mockLocation,
    weather: { windSpeed: 12, windGust: 18, precipitationProbability: 10, weatherCode: 0 },
    ocean: { waveHeight: 1.0, wavePeriod: 6.5, sst: 28.0 },
    warning: { level: "LOW", warning: false, lightningWarning: false, squallWarning: false },
    cyclone: { active: false },
    geofence: { insideRestrictedZone: false, crossesRestricted: false, status: "ALLOWED" },
    safety: { riskLevel: "LOW", riskScore: 10, status: "PROCEED" },
  };

  const hazards1 = detectHazards(normalData);
  const alerts1 = evaluateAlerts(hazards1, mockLocation);

  assert(hazards1.length === 0, "Scenario 1: Detected 0 hazards under calm, normal conditions");
  assert(alerts1.length === 0, "Scenario 1: Generated 0 active alerts");
  assert(!alerts1.some((a) => a.severity === "CRITICAL"), "Scenario 1: Confirmed no critical alert present");

  // ============================================================================
  // SCENARIO 2 — STRONG WIND (HIGH WIND WARNING)
  // ============================================================================
  console.log("\n🧪 SCENARIO 2 — Strong Wind (Warning Alert)");
  clearAlerts();
  const strongWindData = {
    location: mockLocation,
    weather: { windSpeed: 42, windGust: 52, precipitationProbability: 25, weatherCode: 0 },
    ocean: { waveHeight: 1.8 },
    warning: { level: "MODERATE", warning: true },
    cyclone: { active: false },
    geofence: { insideRestrictedZone: false },
    safety: { riskLevel: "MODERATE", riskScore: 45 },
  };

  const hazards2 = detectHazards(strongWindData);
  const alerts2 = evaluateAlerts(hazards2, mockLocation);

  const windHazard = hazards2.find((h) => h.type === "STRONG_WIND");
  const gustHazard = hazards2.find((h) => h.type === "DANGEROUS_WIND_GUST");

  assert(windHazard !== undefined, "Scenario 2: STRONG_WIND hazard detected");
  assert(windHazard?.severity === "HIGH", "Scenario 2: Strong wind severity is HIGH (>= 40 km/h)");
  assert(gustHazard?.severity === "CRITICAL", "Scenario 2: Dangerous wind gust severity is CRITICAL (>= 50 km/h)");
  assert(alerts2.some((a) => a.hazard === "STRONG_WIND"), "Scenario 2: Alert Engine generated STRONG_WIND alert");
  assert(windHazard?.recommendation === "DO_NOT_SAIL", "Scenario 2: Wind speed recommendation is DO_NOT_SAIL");

  // ============================================================================
  // SCENARIO 3 — THUNDERSTORM (HIGH ALERT)
  // ============================================================================
  console.log("\n🧪 SCENARIO 3 — Thunderstorm / Lightning (High Alert)");
  clearAlerts();
  const thunderstormData = {
    location: mockLocation,
    weather: { windSpeed: 25, precipitationProbability: 85, weatherCode: 95 },
    ocean: { waveHeight: 1.5 },
    warning: { level: "HIGH", warning: true, lightningWarning: true },
    cyclone: { active: false },
    geofence: { insideRestrictedZone: false },
    safety: { riskLevel: "HIGH", riskScore: 65 },
  };

  const hazards3 = detectHazards(thunderstormData);
  const alerts3 = evaluateAlerts(hazards3, mockLocation);

  const lightningHazard = hazards3.find((h) => h.type === "LIGHTNING");
  assert(lightningHazard !== undefined, "Scenario 3: LIGHTNING hazard detected");
  assert(lightningHazard?.severity === "HIGH", "Scenario 3: Lightning severity is HIGH");
  assert(lightningHazard?.recommendation === "DO_NOT_SAIL", "Scenario 3: Thunderstorm recommendation is DO_NOT_SAIL");
  assert(alerts3.some((a) => a.hazard === "LIGHTNING" && a.status === "ACTIVE"), "Scenario 3: Active LIGHTNING alert posted");

  // ============================================================================
  // SCENARIO 4 — CYCLONE (CRITICAL ALERT)
  // ============================================================================
  console.log("\n🧪 SCENARIO 4 — Cyclone (Critical Alert)");
  clearAlerts();
  const cycloneData = {
    location: mockLocation,
    weather: { windSpeed: 65, windGust: 85, precipitationProbability: 95 },
    ocean: { waveHeight: 4.5 },
    warning: { level: "HIGH", warning: true, squallWarning: true },
    cyclone: { active: true, name: "Cyclonic Storm ASANI" },
    geofence: { insideRestrictedZone: false },
    safety: { riskLevel: "EXTREME", riskScore: 100 },
  };

  const hazards4 = detectHazards(cycloneData);
  const alerts4 = evaluateAlerts(hazards4, mockLocation);

  const cycloneHazard = hazards4.find((h) => h.type === "CYCLONE");
  assert(cycloneHazard !== undefined, "Scenario 4: CYCLONE hazard detected");
  assert(cycloneHazard?.severity === "CRITICAL", "Scenario 4: Cyclone severity is CRITICAL");
  assert(cycloneHazard?.priority === 0, "Scenario 4: Cyclone priority is 0 (Highest priority)");
  assert(cycloneHazard?.recommendation === "DO_NOT_SAIL", "Scenario 4: Cyclone requires DO_NOT_SAIL");
  assert(alerts4.some((a) => a.type === "CYCLONE" && a.priority === 0), "Scenario 4: Alert engine classified CYCLONE with top priority (Priority 0)");

  // ============================================================================
  // SCENARIO 5 — RESTRICTED ZONE BREACH (GEOFENCE WARNING / CRITICAL ALERT)
  // ============================================================================
  console.log("\n🧪 SCENARIO 5 — Restricted Zone Breach (Route / Point Geofence)");
  clearAlerts();
  const geofenceData = {
    location: { latitude: 16.80, longitude: 82.35 },
    weather: { windSpeed: 15 },
    ocean: { waveHeight: 1.0 },
    warning: { level: "LOW" },
    cyclone: { active: false },
    geofence: {
      insideRestrictedZone: false,
      crossesRestricted: true,
      status: "ROUTE_HAZARD_WARNING",
      warningMessage: "Proposed vessel route crosses Coringa Mangrove Sanctuary buffer zone.",
    },
    safety: { riskLevel: "LOW", riskScore: 15 },
  };

  const hazards5 = detectHazards(geofenceData);
  const alerts5 = evaluateAlerts(hazards5, geofenceData.location);

  const geofenceHazard = hazards5.find((h) => h.type === "RESTRICTED_MARINE_AREA");
  assert(geofenceHazard !== undefined, "Scenario 5: RESTRICTED_MARINE_AREA hazard detected for route breach");
  assert(geofenceHazard?.severity === "CRITICAL", "Scenario 5: Geofence hazard severity is CRITICAL");
  assert(geofenceHazard?.recommendation === "DO_NOT_SAIL", "Scenario 5: Geofence hazard enforces DO_NOT_SAIL");
  assert(alerts5.some((a) => a.hazard === "RESTRICTED_MARINE_AREA"), "Scenario 5: Alert Engine created geofence alert");

  // ============================================================================
  // SCENARIO 6 — PFZ WITH DANGEROUS CONDITIONS (SAFETY OVERRIDE -> DO_NOT_SAIL)
  // ============================================================================
  console.log("\n🧪 SCENARIO 6 — PFZ with Dangerous Marine Conditions (Safety Override)");
  clearAlerts();
  const pfzDangerousData = {
    location: { latitude: 16.82, longitude: 82.62 },
    weather: { windSpeed: 45, windGust: 60, precipitationProbability: 80 },
    ocean: { waveHeight: 3.8, sst: 27.0 },
    warning: { level: "HIGH", warning: true },
    cyclone: { active: false },
    geofence: { insideRestrictedZone: false },
    safety: { riskLevel: "HIGH", riskScore: 85 },
  };

  const hazards6 = detectHazards(pfzDangerousData);
  const alerts6 = evaluateAlerts(hazards6, pfzDangerousData.location);

  const highRiskHazard = hazards6.find((h) => h.type === "HIGH_RISK_MARINE");
  const waveHazard = hazards6.find((h) => h.type === "HIGH_WAVES");

  assert(highRiskHazard !== undefined, "Scenario 6: HIGH_RISK_MARINE detected at PFZ location");
  assert(waveHazard?.severity === "HIGH", "Scenario 6: HIGH_WAVES detected with severity HIGH (3.8m)");
  assert(highRiskHazard?.recommendation === "DO_NOT_SAIL", "Scenario 6: Marine risk triggers DO_NOT_SAIL override");
  assert(hazards6.some((h) => h.recommendation === "DO_NOT_SAIL"), "Scenario 6: Enforces safety override to DO_NOT_SAIL");

  // ============================================================================
  // ADDITIONAL VERIFICATIONS: Deduplication, Timestamps, Multiple Hazards
  // ============================================================================
  console.log("\n🧪 VERIFICATION: Duplicate Alerts Prevention");
  // Re-evaluating the same hazards must NOT create duplicate entries
  const initialAlertCount = alerts6.length;
  const reEvaluatedAlerts = evaluateAlerts(hazards6, pfzDangerousData.location);
  assert(reEvaluatedAlerts.length === initialAlertCount, "Deduplication: Re-evaluation kept exact same count without duplicate IDs");

  console.log("\n🧪 VERIFICATION: Alert Timestamps and Expiration");
  const sampleAlert = reEvaluatedAlerts[0];
  assert(sampleAlert.createdAt !== undefined && !isNaN(Date.parse(sampleAlert.createdAt)), "Timestamps: Valid ISO createdAt timestamp");
  assert(sampleAlert.updatedAt !== undefined && !isNaN(Date.parse(sampleAlert.updatedAt)), "Timestamps: Valid ISO updatedAt timestamp");
  assert(sampleAlert.expiresAt !== undefined && new Date(sampleAlert.expiresAt) > new Date(sampleAlert.createdAt), "Timestamps: Valid future expiresAt timestamp");

  console.log("\n🧪 VERIFICATION: Multiple Simultaneous Hazards Priority Ordering");
  const multiHazardData = {
    location: mockLocation,
    weather: { windSpeed: 48, windGust: 62, precipitationProbability: 92, weatherCode: 99 },
    ocean: { waveHeight: 4.2 },
    warning: { level: "HIGH", warning: true, lightningWarning: true },
    cyclone: { active: true },
    geofence: { insideRestrictedZone: true },
    safety: { riskLevel: "EXTREME", riskScore: 100 },
  };

  const multiHazards = detectHazards(multiHazardData);
  const multiAlerts = evaluateAlerts(multiHazards, mockLocation);

  assert(multiHazards.length >= 5, `Simultaneous Hazards: Detected ${multiHazards.length} concurrent hazards`);
  assert(multiAlerts[0].priority === 0, "Priority Sorting: Top alert is Priority 0 (Critical)");
  const isSorted = multiAlerts.every((a, i) => i === 0 || a.priority >= multiAlerts[i - 1].priority);
  assert(isSorted, "Priority Sorting: All active alerts are sorted strictly in ascending priority order (0 = highest)");

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("\n================================================================================");
  console.log(`📊 ALERT SUITE SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  if (passed === total) {
    console.log("🏆 ALL SAFETY ALERT & HAZARD TEST SCENARIOS PASSED 100%!");
  } else {
    console.log("⚠️ SOME ALERT TESTS FAILED.");
  }
  console.log("================================================================================");
}

runAlertTestSuite().catch(console.error);
