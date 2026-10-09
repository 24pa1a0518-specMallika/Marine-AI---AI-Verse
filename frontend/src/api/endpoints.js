/**
 * Centralized REST API Endpoint Definitions
 * Express API (Port 5000)
 */

import { apiClient } from './client';

export const ENDPOINTS = {
  HEALTH: '/health',
  LIVE_DATA: '/live-data',
  WEATHER: '/weather',
  WEATHER_FORECAST: '/weather/forecast',
  OCEAN: '/ocean',
  OCEAN_FORECAST: '/ocean/forecast',
  WARNINGS: '/warnings',
  PFZ: '/pfz',
  PFZ_NEARBY: '/pfz/nearby',
  PFZ_RANKED: '/pfz/ranked',
  MARINE_SST: '/marine/sst',
  MARINE_RISK: '/marine/risk',
  MARINE_GEOFENCE: '/marine/geofence',
  MARINE_GEOFENCE_CHECK: '/marine/geofence/check',
  ROUTE_MARINE: '/route/marine',
  ROUTE_OPTIMIZE: '/route/optimize',
  FISHING_ROUTE_FIND: '/fishing-route/find',
  MARINE_ANALYZE: '/ai/query',
  ALERTS: '/alerts',
  ALERTS_EVALUATE: '/alerts/evaluate'
};

/**
 * Health Check
 */
export function health() {
  return apiClient(ENDPOINTS.HEALTH);
}

/**
 * Aggregated Live Data
 */
export function liveData() {
  return apiClient(ENDPOINTS.LIVE_DATA);
}

/**
 * Live Weather API
 * @param {Object} params - { lat, lon }
 */
export function weather({ lat, lon } = {}) {
  return apiClient(ENDPOINTS.WEATHER, { params: { lat, lon } });
}

/**
 * Weather Forecast API
 * @param {Object} params - { lat, lon, targetDate }
 */
export function weatherForecast({ lat, lon, targetDate, days, weekly } = {}) {
  return apiClient(ENDPOINTS.WEATHER_FORECAST, { params: { lat, lon, targetDate, days, weekly } });
}

/**
 * Live Ocean API
 * @param {Object} params - { lat, lon }
 */
export function ocean({ lat, lon } = {}) {
  return apiClient(ENDPOINTS.OCEAN, { params: { lat, lon } });
}

/**
 * Ocean Forecast API
 * @param {Object} params - { lat, lon, targetDate }
 */
export function oceanForecast({ lat, lon, targetDate } = {}) {
  return apiClient(ENDPOINTS.OCEAN_FORECAST, { params: { lat, lon, targetDate } });
}

/**
 * IMD Cyclone Warnings
 * @param {Object} params - { lat, lon }
 */
export function warnings({ lat, lon } = {}) {
  return apiClient(ENDPOINTS.WARNINGS, { params: { lat, lon } });
}

/**
 * PFZ List
 * @param {Object} params - { category, limit }
 */
export function pfz({ category, limit } = {}) {
  return apiClient(ENDPOINTS.PFZ, { params: { category, limit } });
}

/**
 * Nearby PFZ Search
 * @param {Object} params - { latitude, longitude, limit }
 */
export function pfzNearby({ latitude, longitude, limit } = {}) {
  return apiClient(ENDPOINTS.PFZ_NEARBY, { params: { latitude, longitude, limit } });
}

/**
 * Ranked PFZ Search
 * @param {Object} params - { latitude, longitude }
 */
export function pfzRanked({ latitude, longitude } = {}) {
  return apiClient(ENDPOINTS.PFZ_RANKED, { params: { latitude, longitude } });
}

/**
 * Sea Surface Temperature (INCOIS ERDDAP)
 * @param {Object} params - { minLat, maxLat, minLon, maxLon }
 */
export function marineSst({ minLat, maxLat, minLon, maxLon } = {}) {
  return apiClient(ENDPOINTS.MARINE_SST, { params: { minLat, maxLat, minLon, maxLon } });
}

/**
 * Calculate Marine Safety Risk
 * @param {Object} body - { windSpeed, windGust, waveHeight, rainProbability, lightning, cyclone }
 */
export function marineRisk(body = {}) {
  return apiClient(ENDPOINTS.MARINE_RISK, { method: 'POST', body });
}

/**
 * Fetch Geofence Zones
 * @param {Object} params - { latitude, longitude }
 */
export function geofence({ latitude, longitude } = {}) {
  return apiClient(ENDPOINTS.MARINE_GEOFENCE, { params: { latitude, longitude } });
}

/**
 * Check Geofence Violation
 * @param {Object} body - { latitude, longitude, waypoints, pfzs }
 */
export function geofenceCheck(body = {}) {
  return apiClient(ENDPOINTS.MARINE_GEOFENCE_CHECK, { method: 'POST', body });
}

/**
 * Calculate Marine Route
 * @param {Object} body - { startLat, startLon, destLat, destLon }
 */
export function routeMarine(body = {}) {
  return apiClient(ENDPOINTS.ROUTE_MARINE, { method: 'POST', body });
}

/**
 * Optimize Route (A* Grid Solver)
 * @param {Object} body - { grid, start, goal, restrictedCells, marineConditions }
 */
export function routeOptimize(body = {}) {
  return apiClient(ENDPOINTS.ROUTE_OPTIMIZE, { method: 'POST', body });
}

/**
 * Find Fishing Route to PFZ
 * @param {Object} body - { startLat, startLon, targetPfzId }
 */
export function fishingRouteFind(body = {}) {
  return apiClient(ENDPOINTS.FISHING_ROUTE_FIND, { method: 'POST', body });
}

/**
 * Agentic AI Query Analysis
 * @param {Object} body - { query, userLocation, language }
 */
export function marineAnalyze(body = {}) {
  return apiClient(ENDPOINTS.MARINE_ANALYZE, { method: 'POST', body });
}

/**
 * Fetch Active Alerts
 */
export function alerts() {
  return apiClient(ENDPOINTS.ALERTS);
}

/**
 * Evaluate Dynamic Alerts
 * @param {Object} body - { weather, ocean, location }
 */
export function alertsEvaluate(body = {}) {
  return apiClient(ENDPOINTS.ALERTS_EVALUATE, { method: 'POST', body });
}
