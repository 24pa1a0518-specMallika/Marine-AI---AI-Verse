/**
 * Data Transformation & Normalization Adapters
 * Pure functions converting raw backend responses into frontend UI models.
 */

/**
 * 1. Convert PFZ score to UI Tier badge
 * @param {number} score 
 * @returns {'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW'}
 */
export function adaptPfzTier(score = 0) {
  if (score >= 80) return 'VERY_HIGH';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

/**
 * 2. Combine Weather & Ocean responses into Unified Telemetry Model
 * @param {Object} weatherData - Response from /api/weather
 * @param {Object} oceanData - Response from /api/ocean
 * @returns {Object} Unified telemetry
 */
export function adaptTelemetry(weatherData = {}, oceanData = {}) {
  const w = weatherData || {};
  const o = oceanData || {};

  return {
    wind: {
      speed: w.windSpeed ?? null,
      gust: w.windGust ?? null,
      direction: w.windDirection || 'NE',
      unit: 'kt',
      label: w.windSpeed != null ? (w.windSpeed > 25 ? 'High' : w.windSpeed > 15 ? 'Moderate' : 'Low') : 'Unknown'
    },
    waves: {
      height: o.waveHeight ?? null,
      period: o.wavePeriod ?? null,
      unit: 'm',
      label: o.waveHeight != null ? (o.waveHeight > 2.5 ? 'High' : o.waveHeight > 1.5 ? 'Moderate' : 'Low') : 'Unknown'
    },
    sst: {
      value: o.sst ?? null,
      unit: '°C',
      label: o.sst != null ? (o.sst > 30 ? 'High' : 'Normal') : 'Unknown'
    },
    chlorophyll: {
      value: o.chlorophyll ?? null,
      unit: 'mg/m³',
      label: o.chlorophyll != null ? 'High' : 'Unavailable'
    },
    current: {
      speed: o.currentSpeed ?? null,
      direction: o.currentDirection || 'NE',
      unit: 'm/s',
      label: o.currentSpeed != null ? (o.currentSpeed > 1.0 ? 'Strong' : 'Moderate') : 'Unknown'
    },
    visibility: {
      value: w.visibility ?? null,
      unit: 'km',
      label: w.visibility != null ? 'Good' : 'Unknown'
    },
    weatherCode: w.weatherCode ?? null,
    precipitation: w.precipitation ?? null,
    source: w.source || o.source || 'unavailable'
  };
}

/**
 * 3. Normalize single PFZ item into Frontend PFZ Model
 * @param {Object} pfz 
 * @returns {Object}
 */
export function adaptPfzModel(pfz) {
  if (!pfz) return null;
  const hasConfidence = pfz.score != null || pfz.pfz_score != null || pfz.confidence != null;
  const score = hasConfidence ? (pfz.score ?? pfz.pfz_score ?? pfz.confidence) : null;
  const tier = score != null ? adaptPfzTier(score) : 'INCOIS PFZ';

  return {
    id: pfz.id || pfz.pfz_id || `PFZ-${Math.random().toString(36).substr(2, 5)}`,
    name: pfz.name || pfz.location_name || `PFZ Zone (${pfz.latitude?.toFixed(2) || 'Unknown'}, ${pfz.longitude?.toFixed(2) || 'Unknown'})`,
    latitude: pfz.latitude ?? pfz.lat ?? null,
    longitude: pfz.longitude ?? pfz.lon ?? null,
    score,
    hasConfidence,
    category: pfz.category || tier,
    tier,
    sector: pfz.sector || pfz.properties?.sector || null,
    length: pfz.length || pfz.properties?.length || null,
    distanceKm: pfz.distanceKm ?? pfz.distance_km ?? pfz.distance ?? null,
    depth: pfz.depth ?? pfz.depth_m ?? null,
    sst: pfz.sst ?? pfz.water_temp ?? null,
    chlorophyll: pfz.chlorophyll ?? pfz.chla ?? null,
    bearing: pfz.bearing ?? pfz.bearing_deg ?? null,
    validUntil: pfz.validUntil || pfz.valid_until || null,
    source: pfz.source || 'INCOIS'
  };
}

/**
 * 4. Normalize Backend Risk Score (0-250+) into 0-100 Gauge Representation
 * @param {Object|number} backendRisk 
 * @returns {Object}
 */
export function adaptRiskScore(backendRisk) {
  if (!backendRisk) {
    return {
      rawScore: null,
      score: null,
      level: 'Unavailable',
      factors: [],
      perFactorBreakdown: {},
      confidenceScore: null,
      explainability: 'Risk data unavailable.'
    };
  }

  const rawScore = typeof backendRisk === 'number'
    ? backendRisk
    : (backendRisk.score ?? backendRisk.riskScore ?? backendRisk.riskIndex ?? null);

  const gaugeScore = typeof backendRisk.gaugeScore === 'number'
    ? backendRisk.gaugeScore
    : (rawScore !== null ? Math.min(100, Math.max(0, Math.round(rawScore))) : null);

  let level = backendRisk.level;
  if (!level) {
    if (gaugeScore >= 75) level = 'Severe';
    else if (gaugeScore >= 60) level = 'High';
    else if (gaugeScore >= 30) level = 'Moderate';
    else level = 'Low';
  }

  return {
    rawScore,
    score: gaugeScore,
    level,
    factors: backendRisk.factors || [],
    perFactorBreakdown: backendRisk.perFactorBreakdown || {},
    confidenceScore: backendRisk.confidenceScore ?? 0.9,
    explainability: typeof backendRisk.explainability === 'object' ? (backendRisk.explainability.summary || '') : (backendRisk.explainability || '')
  };
}

/**
 * 5. Convert { latitude, longitude } or [lat, lon] to GeoJSON [longitude, latitude]
 * @param {Object|Array} point 
 * @returns {[number, number]} [lon, lat]
 */
export function toGeoJSONCoords(point) {
  if (!point) return [0, 0];
  if (Array.isArray(point)) {
    return [point[1], point[0]];
  }
  const lat = point.latitude ?? point.lat ?? 0;
  const lon = point.longitude ?? point.lon ?? 0;
  return [lon, lat];
}

/**
 * 6. Normalize Backend Agentic AI Response into UI Structure
 * @param {Object} aiResult 
 * @returns {Object}
 */
export function adaptAiResponse(raw) {
  if (!raw) return null;
  const aiResult = raw.data || raw;
  const intentObj = aiResult.intent || {};
  const intent = typeof intentObj === 'string' ? intentObj : (intentObj.intent || 'GENERAL_QUERY');
  const isSafety = Boolean(
    aiResult.isSafetyQuery ?? 
    (intent === 'FISHING_SAFETY' || intent === 'RISK' || intent === 'SAFE_ROUTE' || intent === 'HAZARD_ALERT')
  );
  const decisionStatus = aiResult.deterministicDecision?.safetyStatus || aiResult.decisionStatus || aiResult.safety?.status || aiResult.decision?.status || null;
  const answer = aiResult.synthesis || aiResult.formattedAnswer || aiResult.answer || aiResult.decision?.summary || aiResult.response || aiResult.text || 'Telemetry analysis complete.';

  const getToolData = (toolName) => aiResult.toolCalls?.find(t => t.tool === toolName)?.output?.data || aiResult.toolCalls?.find(t => t.tool === toolName)?.output;
  const findSafeRouteData = getToolData('findSafeRoute') || {};
  const riskMapData = getToolData('getRiskMap') || {};
  const pfzData = getToolData('getNearbyPFZ') || {};
  
  const extractedRiskScore = findSafeRouteData.totalRiskCost ?? riskMapData.maxRiskCost ?? null;
  const extractedRiskLevel = extractedRiskScore > 30 ? 'HIGH' : (extractedRiskScore > 10 ? 'MODERATE' : 'LOW');

  return {
    ...aiResult,
    intent,
    answer,
    formattedAnswer: answer,
    recommendation: aiResult.recommendation || aiResult.safety?.reason || '',
    evidence: aiResult.evidence || {
      riskScore: aiResult.safety?.riskScore ?? aiResult.risk?.score ?? extractedRiskScore,
      riskLevel: aiResult.safety?.riskLevel ?? aiResult.risk?.level ?? extractedRiskLevel,
      nearestPfzKm: aiResult.pfz?.recommendedZone?.distanceKm ?? findSafeRouteData.distanceKm ?? pfzData.pfzs?.[0]?.distanceKm,
      weather: getToolData('getWeather'),
      ocean: getToolData('getOceanConditions'),
      geofence: getToolData('checkGeofence'),
      warning: getToolData('getWarnings')
    },
    context: aiResult.context || null,
    confidence: aiResult.confidenceScore ?? aiResult.confidence ?? intentObj.confidence ?? 0.95,
    plannerPlan: aiResult.plan || aiResult.plannerPlan || null,
    isSafetyQuery: isSafety,
    decisionStatus: isSafety ? decisionStatus : null,
    safetyScore: isSafety ? (aiResult.safetyScore ?? (extractedRiskScore != null ? Math.max(0, 100 - extractedRiskScore) : null)) : null,
    riskScore: isSafety ? (aiResult.riskScore ?? aiResult.safety?.riskScore ?? aiResult.decision?.riskScore ?? extractedRiskScore ?? null) : null,
    riskLevel: isSafety ? (aiResult.riskLevel ?? aiResult.safety?.riskLevel ?? aiResult.decision?.riskLevel ?? extractedRiskLevel ?? null) : null,
    nearestPfz: aiResult.pfz?.recommendedZone?.name || aiResult.nearestPfz || pfzData.pfzs?.[0]?.name || null,
    pfzDistance: aiResult.pfz?.recommendedZone?.distanceKm || aiResult.pfzDistance || findSafeRouteData.distanceKm || null,
    reason: isSafety ? (aiResult.decision?.reason || aiResult.safety?.reason || aiResult.reason || findSafeRouteData.explanation || '') : '',
    geofence: aiResult.geofence || getToolData('checkGeofence') || null
  };
}

/**
 * 7. Normalize Backend Waypoints / Path into Frontend Route Representation
 * @param {Object} backendRoute 
 * @returns {Object}
 */
export function adaptRouteRepresentation(backendRoute) {
  if (!backendRoute) {
    return {
      waypoints: [],
      geoJsonCoordinates: [],
      distanceKm: 0,
      totalRiskCost: 0,
      geofenceStatus: 'CLEAR',
      summary: ''
    };
  }

  const routeObj = backendRoute.route || backendRoute;
  const rawWaypoints = backendRoute.geographicRoute || routeObj.waypoints || routeObj.path || [];

  const waypoints = rawWaypoints.map((wp) => {
    if (Array.isArray(wp)) {
      return { lat: wp[0], lon: wp[1] };
    }
    return {
      lat: wp.lat ?? wp.latitude ?? 0,
      lon: wp.lon ?? wp.longitude ?? 0
    };
  });

  const geoJsonCoordinates = waypoints.map((wp) => [wp.lon, wp.lat]);

  return {
    waypoints,
    geoJsonCoordinates,
    distanceKm: backendRoute.distanceKm ?? routeObj.distanceKm ?? routeObj.distance_km ?? 0,
    totalRiskCost: backendRoute.totalRiskCost ?? routeObj.totalRiskCost ?? routeObj.totalCost ?? routeObj.riskScore ?? 0,
    geofenceStatus: backendRoute.geofenceStatus ?? routeObj.geofenceStatus ?? routeObj.geofence_status ?? 'CLEAR',
    summary: backendRoute.summary ?? routeObj.summary ?? '',
    safetyStatus: backendRoute.safetyStatus || null,
    explanation: backendRoute.explanation || ''
  };
}

export function normalizeSeverity(severity) {
  if (!severity) return 'Info';
  const s = String(severity).trim().toUpperCase();
  if (s === 'CRITICAL' || s === 'SEVERE') return 'Critical';
  if (s === 'HIGH') return 'High';
  if (s === 'MEDIUM' || s === 'MODERATE') return 'Medium';
  if (s === 'LOW') return 'Low';
  if (s === 'INFO') return 'Info';
  return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
}

/**
 * 8. Normalize Backend Alert object into Frontend Alert Model
 * @param {Object} alert 
 * @returns {Object}
 */
export function adaptAlertModel(alert) {
  if (!alert) return null;

  let locStr = 'Bay of Bengal, India';
  if (typeof alert.location === 'string') {
    locStr = alert.location;
  } else if (alert.location && typeof alert.location === 'object') {
    const lat = alert.location.latitude ?? alert.location.lat;
    const lon = alert.location.longitude ?? alert.location.lon;
    if (lat != null && lon != null) {
      locStr = `${Number(lat).toFixed(4)}° N, ${Number(lon).toFixed(4)}° E`;
    }
  } else if (alert.area) {
    locStr = alert.area;
  }

  let timeStr = 'Just now';
  if (alert.timestamp) {
    timeStr = alert.timestamp;
  } else if (alert.updatedAt || alert.createdAt || alert.issuedAt) {
    try {
      const d = new Date(alert.updatedAt || alert.createdAt || alert.issuedAt);
      timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
    } catch (e) {
      timeStr = 'Recently';
    }
  }

  return {
    id: alert.id || `alt-${Math.random().toString(36).substr(2, 5)}`,
    title: alert.title || alert.event || alert.name || 'Maritime Advisory',
    severity: normalizeSeverity(alert.severity || alert.level || 'Medium'),
    description: alert.description || alert.message || alert.details || '',
    location: locStr,
    timestamp: timeStr,
    source: alert.source || 'Marine AI Alert Engine',
    type: alert.type || 'HAZARD'
  };
}

/**
 * 9. Normalize Backend Geofence Zone object into Frontend Model
 * @param {Object} zone 
 * @returns {Object}
 */
export function adaptGeofenceModel(zone) {
  if (!zone) return null;
  const rawCoords = zone.coordinates || zone.polygonLatLon || [];
  const coords = Array.isArray(rawCoords) ? rawCoords : [];

  return {
    ...zone,
    id: zone.id || zone._id || `geo_${Math.random().toString(36).substr(2, 6)}`,
    name: zone.name || 'Restricted Maritime Zone',
    category: zone.category || 'RESTRICTED',
    type: zone.type || (zone.category === 'PROTECTED_ZONE' ? 'SANCTUARY' : 'RESTRICTED'),
    status: zone.status || 'Active',
    alerts: zone.alerts ?? (zone.severity === 'CRITICAL' ? 3 : 1),
    severity: zone.severity || 'HIGH',
    riskLevel: zone.riskLevel || zone.severity || 'HIGH',
    coordinates: coords,
    polygonLatLon: coords,
    description: zone.description || zone.reason || 'Restricted marine navigational area.',
    reason: zone.reason || zone.description || 'Restricted zone according to maritime regulations.'
  };
}

/**
 * 10. Convert numeric wind/current bearing (degrees) to Cardinal direction
 * @param {number|string} deg 
 * @returns {string} Cardinal direction (e.g. 'NE', 'SSW')
 */
export function degreesToCardinal(deg) {
  if (deg === null || deg === undefined || deg === '') return 'NE';
  if (typeof deg === 'string' && isNaN(Number(deg))) return deg;
  const num = Number(deg);
  if (isNaN(num)) return 'NE';
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const val = Math.floor((num / 22.5) + 0.5);
  return dirs[val % 16];
}

/**
 * 11. Map WMO Weather Code to UI Weather Condition Icon Type
 * @param {number} code 
 * @returns {'sun'|'sun-cloud'|'cloud'|'rain'|'night'}
 */
export function weatherCodeToCondition(code) {
  if (code === null || code === undefined) return 'sun-cloud';
  if (code === 0) return 'sun';
  if (code === 1 || code === 2) return 'sun-cloud';
  if (code === 3 || code === 45 || code === 48) return 'cloud';
  if (code >= 50) return 'rain';
  return 'sun-cloud';
}

/**
 * 12. Normalize Backend Weather Response into Frontend Weather Model
 * @param {Object} rawWeather 
 * @returns {Object}
 */
export function adaptWeatherModel(rawWeather = {}) {
  const w = rawWeather || {};
  const speed = w.windSpeed ?? null;
  const gust = w.windGust ?? null;
  const dir = degreesToCardinal(w.windDirection || 'NE');

  const temp = w.temperature ?? w.temp ?? w.temperature_2m ?? null;
  const hum = w.humidity ?? w.relative_humidity_2m ?? null;
  const precip = w.precipitation ?? 0;
  const precipProb = w.precipitationProbability ?? w.rainProbability ?? 0;

  return {
    windSpeed: typeof speed === 'number' ? Math.round(speed) : speed,
    windGust: typeof gust === 'number' ? Math.round(gust) : gust,
    windDirection: dir,
    windSpeedLabel: speed != null ? (speed > 25 ? 'High' : speed > 12 ? 'Moderate' : 'Low') : 'Unknown',
    windGustLabel: gust != null ? (gust > 30 ? 'Severe' : gust > 18 ? 'Moderate' : 'Low') : 'Unknown',
    temperature: typeof temp === 'number' ? Math.round(temp * 10) / 10 : temp,
    tempLabel: temp != null ? (temp > 32 ? 'High' : temp < 20 ? 'Cool' : 'Normal') : 'Unknown',
    humidity: typeof hum === 'number' ? Math.round(hum) : hum,
    humidityLabel: hum != null ? (hum > 75 ? 'High' : hum > 50 ? 'Moderate' : 'Optimal') : 'Unknown',
    precipitation: precip,
    precipitationProbability: precipProb,
    precipitationLabel: precip > 0 ? `${precip} mm (Active)` : (precipProb > 40 ? 'High Chance' : 'Low'),
    visibility: w.visibility ?? 10,
    visibilityLabel: 'Good',
    pressure: w.pressure ?? 1012,
    uvIndex: w.uvIndex ?? 6,
    dewPoint: w.dewPoint ?? 23,
    weatherCode: w.weatherCode ?? null,
    condition: weatherCodeToCondition(w.weatherCode),
    hourly: Array.isArray(w.hourly) ? w.hourly : [],
    source: w.source || 'Unavailable'
  };
}

/**
 * 13. Normalize Backend Ocean Response into Frontend Ocean Model
 * @param {Object} rawOcean 
 * @returns {Object}
 */
export function adaptOceanModel(rawOcean = {}) {
  const o = rawOcean || {};
  const waveHeight = o.waveHeight ?? null;
  const wavePeriod = o.wavePeriod ?? null;
  const sst = o.sst ?? null;
  const chlorophyll = o.chlorophyll ?? null;
  const currentSpeed = o.currentSpeed ?? null;
  const currentDirection = degreesToCardinal(o.currentDirection || 'NE');

  return {
    waveHeight,
    waveLabel: waveHeight != null ? (waveHeight > 2.5 ? 'High' : waveHeight > 1.2 ? 'Moderate' : 'Low') : 'Unknown',
    wavePeriod,
    sst,
    sstLabel: sst != null ? (sst > 30 ? 'High' : 'Normal') : 'Unknown',
    chlorophyll,
    currentSpeed,
    currentDirection,
    currentLabel: currentSpeed != null ? (currentSpeed > 1.0 ? 'Strong' : 'Moderate') : 'Unknown',
    seaState: o.seaState || (waveHeight != null ? (waveHeight > 2.0 ? 'Rough' : 'Moderate') : 'Unknown'),
    source: o.source || 'Unavailable'
  };
}

/**
 * 14. Normalize Warnings Response into Frontend Warnings Model
 * @param {Object} rawWarnings 
 * @returns {Object}
 */
export function adaptWarningsModel(rawWarnings = {}) {
  const w = rawWarnings || {};
  const hasWarning = !!(w.warning || (w.factors && w.factors.length > 0) || (w.warnings && w.warnings.length > 0));
  
  let list = [];
  if (Array.isArray(w.warnings) && w.warnings.length > 0) {
    list = w.warnings;
  } else if (Array.isArray(w.factors) && w.factors.length > 0) {
    list = w.factors.map((factor, idx) => ({
      id: `warn-${idx}`,
      title: factor,
      severity: w.level || 'UNKNOWN',
      description: `Advisory for ${w.region || 'Coastal area'}.`,
      area: w.region || 'Coastal area'
    }));
  }

  return {
    hasWarning,
    count: list.length,
    level: w.level || (hasWarning ? 'UNKNOWN' : 'UNAVAILABLE'),
    region: w.region || 'Unknown',
    source: w.source || 'Unavailable',
    warnings: list
  };
}

/**
 * 15. Normalize Backend Report object into Frontend Report Model
 * @param {Object} report 
 * @returns {Object}
 */
export function adaptReportModel(report) {
  if (!report) return null;
  return {
    id: report.id || `rep-${Math.random().toString(36).substr(2, 5)}`,
    name: report.name || report.title || 'Operational Report',
    description: report.description || report.summary || 'Marine AI analytical report',
    type: report.type || 'Risk Report',
    typeCategory: report.typeCategory || report.category || 'Risk Reports',
    generatedOn: report.generatedOn || report.createdAt || 'Today 09:00 AM',
    location: report.location || report.area || 'Bay of Bengal, India',
    areaDetail: report.areaDetail || report.coverage || '1200 km²',
    format: report.format || 'PDF',
    size: report.size || '2.1 MB',
    status: report.status || 'Completed',
    downloadUrl: report.downloadUrl || '#'
  };
}

