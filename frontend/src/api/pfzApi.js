/**
 * Potential Fishing Zone (PFZ) API Service
 * 
 * Interacts with INCOIS-backed Express endpoints (/api/pfz, /api/pfz/nearby, /api/pfz/ranked).
 * Reuses existing frontend PFZ mock data for fallback.
 */

import { withFallback } from './client';
import * as endpoints from './endpoints';
import { adaptPfzModel } from './adapters';

// Existing frontend PFZ mock dataset
const MOCK_PFZ_FALLBACK = [
  {
    id: 'PFZ-001',
    name: 'Godavari Estuary Outer Sector',
    latitude: 16.742,
    longitude: 82.491,
    score: 82,
    category: 'HIGH',
    tier: 'HIGH',
    distanceKm: 31.8,
    depth: 42,
    sst: null,
    chlorophyll: null,
    bearing: 'SE',
    validUntil: 'Today 18:00 IST',
    source: 'INCOIS'
  },
  {
    id: 'PFZ-002',
    name: 'Kakinada Deep Sea Trench',
    latitude: 16.85,
    longitude: 82.55,
    score: 88,
    category: 'VERY_HIGH',
    tier: 'VERY_HIGH',
    distanceKm: 24.5,
    depth: 58,
    sst: null,
    chlorophyll: null,
    bearing: 'E',
    validUntil: 'Today 18:00 IST',
    source: 'INCOIS'
  },
  {
    id: 'PFZ-003',
    name: 'Coromandel South Edge',
    latitude: 16.62,
    longitude: 82.38,
    score: 65,
    category: 'MODERATE',
    tier: 'MODERATE',
    distanceKm: 42.1,
    depth: 35,
    sst: null,
    chlorophyll: null,
    bearing: 'S',
    validUntil: 'Today 18:00 IST',
    source: 'INCOIS'
  }
];

/**
 * Fetch All / Filtered PFZs
 * @param {Object} params - { category, limit }
 */
export async function getPFZs(params = {}) {
  return withFallback(
    async () => {
      const res = await endpoints.pfz(params);
      const rawList = res.pfzs || res.data || (Array.isArray(res) ? res : []);
      const normalized = rawList.map(adaptPfzModel);
      return normalized;
    },
    MOCK_PFZ_FALLBACK.map(adaptPfzModel),
    'PFZ'
  );
}

/**
 * Fetch Nearby PFZs relative to vessel location
 * @param {Object} params - { latitude, longitude, limit }
 */
export async function getNearbyPFZs(params = {}) {
  return withFallback(
    async () => {
      const res = await endpoints.pfzNearby(params);
      const rawList = res.pfzs || res.data || [];
      return rawList.map(adaptPfzModel);
    },
    MOCK_PFZ_FALLBACK.map(adaptPfzModel),
    'NearbyPFZ'
  );
}

/**
 * Fetch Ranked PFZs (Sorted by score/distance)
 * @param {Object} params - { latitude, longitude }
 */
export async function getRankedPFZs(params = {}) {
  return withFallback(
    async () => {
      const res = await endpoints.pfzRanked(params);
      const rawList = res.rankedPfzs || res.pfzs || res.data || [];
      return rawList.map(adaptPfzModel);
    },
    MOCK_PFZ_FALLBACK.map(adaptPfzModel),
    'RankedPFZ'
  );
}
