/**
 * Safe Route Optimization API Service
 * 
 * Interacts with Express Route Solver (/api/route/marine, /api/route/optimize, /api/fishing-route/find).
 * Reuses existing frontend route fixture for fallback.
 */

import { withFallback } from './client';
import * as endpoints from './endpoints';
import { adaptRouteRepresentation } from './adapters';

// Existing frontend hardcoded route fixture
const MOCK_ROUTE_FALLBACK = {
  waypoints: [
    { lat: 16.98, lon: 82.24 },
    { lat: 16.90, lon: 82.35 },
    { lat: 16.82, lon: 82.42 },
    { lat: 16.742, lon: 82.491 }
  ],
  geoJsonCoordinates: [
    [82.24, 16.98],
    [82.35, 16.90],
    [82.42, 16.82],
    [82.491, 16.742]
  ],
  distanceKm: 36.4,
  totalRiskCost: 12.5,
  geofenceStatus: 'ROUTE_SAFE',
  summary: 'Safe route around Coringa protected boundary to PFZ-001.'
};

/**
 * Calculate Safe Marine Route between 2 points
 * @param {Object} routeInput - { startLat, startLon, destLat, destLon }
 */
export async function calculateMarineRoute(routeInput = {}) {
  return withFallback(
    async () => {
      const res = await endpoints.routeMarine(routeInput);
      return adaptRouteRepresentation(res);
    },
    MOCK_ROUTE_FALLBACK,
    'MarineRoute'
  );
}

/**
 * Optimize Route via A* Grid Solver
 * @param {Object} routeInput - { grid, start, goal, restrictedCells, marineConditions }
 */
export async function optimizeRoute(routeInput = {}) {
  return withFallback(
    async () => {
      const res = await endpoints.routeOptimize(routeInput);
      return adaptRouteRepresentation(res);
    },
    MOCK_ROUTE_FALLBACK,
    'OptimizeRoute'
  );
}

/**
 * Find Safe Fishing Route to Target PFZ
 * @param {Object} routeInput - { startLat, startLon, targetPfzId }
 */
export async function findFishingRoute(routeInput = {}) {
  try {
    const res = await endpoints.fishingRouteFind(routeInput);
    // Safety-blocked responses (DO_NOT_SAIL, UNKNOWN) legitimately return success: false.
    // These are valid live responses — not network failures — so we pass them through as
    // live data and never flag isFallback for a structured safetyStatus response.
    const adapted = adaptRouteRepresentation(res);
    return {
      data: adapted,
      source: 'live',
      isFallback: false,
      error: null
    };
  } catch (error) {
    console.warn('[MarineAI] FishingRoute API unavailable:', error.message || error);
    return {
      data: null,
      source: 'unavailable',
      isFallback: true,
      success: false,
      reason: 'LIVE_DATA_UNAVAILABLE',
      error: { message: error.isTimeout ? 'Request timed out' : (error.message || 'API unavailable'), status: error.status || null }
    };
  }
}
