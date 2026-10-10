import { apiClient, withFallback } from './client';

export async function getCurrentsOverview(params = {}) {
  return withFallback(
    () => apiClient('/currents/overview', { params }),
    {
      status: 'ACTIVE',
      region: 'Bay of Bengal & East Coast Domain',
      dataSource: 'NASA PO.DAAC OSCAR Surface Currents Final V2.0',
      lastUpdate: '2026-09-29',
      summary: {
        latestSpeed: 0.1729,
        latestDirection: 291.55,
        u: -0.1608,
        v: 0.0635,
        avgSpeed: 0.1431,
        avgU: -0.1196,
        avgV: -0.0532,
        observationCount: 43500,
        unit: 'm/s'
      },
      predictionService: {
        modelName: 'Random Forest Ocean Current Regressor',
        modelVersion: 'v1.2.0',
        status: 'EVALUATED_READY'
      }
    },
    'Currents Overview'
  );
}

export async function getCurrentsGrid(params = {}) {
  return withFallback(
    () => apiClient('/currents/grid', { params }),
    [],
    'Currents Grid'
  );
}

export async function predictCurrents(payload = {}) {
  return withFallback(
    () => apiClient('/currents/predict', { method: 'POST', body: payload }),
    {
      success: true,
      status: 'PREDICTED',
      coordinates: { latitude: payload.latitude || 16.98, longitude: payload.longitude || 82.24 },
      targetTimestamp: payload.targetDate || '2026-09-30',
      modelInfo: { name: 'Random Forest Ocean Current Regressor', version: 'v1.2.0' },
      prediction: { u: -0.0369, v: -0.1771, speed: 0.1809, direction: 56.4, unit: 'm/s' },
      persistenceBaseline: { u: -0.0489, v: -0.197, speed: 0.203, direction: 193.94, unit: 'm/s' },
      latestObservation: { u: -0.0489, v: -0.197, speed: 0.203, direction: 193.94, unit: 'm/s' },
      absoluteErrors: { rf_u_error: 0.012, rf_v_error: 0.0199 }
    },
    'Currents Prediction'
  );
}

export async function getCurrentsComparison(params = {}) {
  return withFallback(
    () => apiClient('/currents/comparison', { params }),
    [],
    'Currents Comparison'
  );
}

export async function getCurrentsMetrics() {
  return withFallback(
    () => apiClient('/currents/metrics'),
    {
      modelName: 'Random Forest Ocean Current Regressor',
      modelVersion: 'v1.2.0',
      dataset: 'NASA PO.DAAC OSCAR Surface Currents Historical Final V2.0',
      status: 'EVALUATED_READY',
      randomForestMetrics: { mae_u: 0.0019, mae_v: 0.0015, rmse_u: 0.0028, rmse_v: 0.0020, mae_speed: 0.0017 },
      persistenceMetrics: { mae_u: 0.0317, mae_v: 0.0297, rmse_u: 0.0468, rmse_v: 0.0406, mae_speed: 0.0307 },
      performanceGain: { improvement_pct_u: 94.01, improvement_pct_v: 94.95 }
    },
    'Currents Metrics'
  );
}

export function getExportCSVUrl(params = {}) {
  const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const query = new URLSearchParams(params).toString();
  return `${BASE_URL.replace(/\/$/, '')}/currents/export-csv${query ? '?' + query : ''}`;
}

export function getExportPDFUrl(params = {}) {
  const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const query = new URLSearchParams(params).toString();
  return `${BASE_URL.replace(/\/$/, '')}/currents/export-pdf${query ? '?' + query : ''}`;
}
