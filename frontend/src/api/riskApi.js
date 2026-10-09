/**
 * Marine Safety & Risk API Service
 * 
 * Calls Express backend Phase 8 Risk Engine (/api/marine/risk).
 * Uses existing frontend risk mock values for fallback.
 */

import { withFallback } from './client';
import * as endpoints from './endpoints';
import { adaptRiskScore } from './adapters';

// Canonical frontend risk mock model
export const MOCK_RISK_FALLBACK = {
  rawScore: null,
  score: null,
  level: 'Unavailable',
  factors: [
    { label: 'Wind', value: 0, status: 'Unknown', color: 'bg-slate-500' },
    { label: 'Waves', value: 0, status: 'Unknown', color: 'bg-slate-500' },
    { label: 'Lightning', value: 0, status: 'Unknown', color: 'bg-slate-500' },
    { label: 'Cyclone', value: 0, status: 'Unknown', color: 'bg-slate-500' },
    { label: 'Current', value: 0, status: 'Unknown', color: 'bg-slate-500' }
  ],
  perFactorBreakdown: {
    windRisk: 0,
    waveRisk: 0,
    rainRisk: 0,
    lightningRisk: 0,
    cycloneRisk: 0
  },
  confidenceScore: 0,
  explainability: 'Risk data is currently unavailable.'
};

/**
 * Calculate Marine Risk Score & Factor Breakdown
 * @param {Object} riskInput - { windSpeed, windGust, waveHeight, rainProbability, lightning, cyclone }
 */
export async function calculateMarineRisk(riskInput = {}) {
  return withFallback(
    async () => {
      const res = await endpoints.marineRisk(riskInput);
      const riskData = res.risk || res.data || res;
      return adaptRiskScore(riskData);
    },
    MOCK_RISK_FALLBACK,
    'MarineRisk'
  );
}
