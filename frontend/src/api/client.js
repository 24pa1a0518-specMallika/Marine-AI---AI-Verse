/**
 * MarineAI Central API Client
 * 
 * Native fetch wrapper for communicating with Express Backend (:5000)
 * Environment Variable: VITE_API_BASE_URL (Default: http://localhost:5000/api)
 * Default Timeout: 15000 ms
 */

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
const DEFAULT_TIMEOUT = 15000;

/**
 * Core HTTP Request Execution Function
 */
export async function apiClient(endpoint, options = {}) {
  const {
    method = 'GET',
    params = null,
    body = null,
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    ...customConfig
  } = options;

  let url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${BASE_URL.replace(/\/$/, '')}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params && typeof params === 'object') {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    signal: controller.signal,
    ...customConfig
  };

  if (body !== null && body !== undefined) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => null);
    }

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data !== null && (data.message || data.error))
          ? (data.message || data.error)
          : `HTTP error ${response.status}: ${response.statusText}`;
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeout}ms`);
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    throw error;
  }
}

/**
 * Standardized Live/Fallback Wrapper
 * Wraps live API calls and gracefully falls back to mock/static data on failure.
 */
export async function withFallback(apiCallFn, fallbackData, serviceName = 'Service') {
  try {
    const liveData = await apiCallFn();

    // Check if liveData is null/undefined or explicitly indicates backend error (e.g. { success: false })
    if (liveData === null || liveData === undefined || (typeof liveData === 'object' && liveData !== null && liveData.success === false)) {
      const errorMsg = (typeof liveData === 'object' && liveData !== null && liveData.error) || `${serviceName} returned empty or invalid response`;
      throw new Error(errorMsg);
    }

    return {
      data: liveData,
      source: 'live',
      isFallback: false,
      error: null
    };
  } catch (error) {
    if (import.meta.env?.DEV || process.env.NODE_ENV !== 'production') {
      console.warn(`[MarineAI] ${serviceName} API unavailable; using fallback data:`, error.message || error);
    }

    const safeError = {
      message: error.isTimeout ? 'Request timed out' : (error.message || 'API unavailable'),
      status: error.status || null
    };

    return {
      data: Array.isArray(fallbackData) ? [] : null,
      source: 'unavailable',
      isFallback: true,
      success: false,
      reason: 'LIVE_DATA_UNAVAILABLE',
      error: safeError
    };
  }
}

export default {
  apiClient,
  withFallback
};
