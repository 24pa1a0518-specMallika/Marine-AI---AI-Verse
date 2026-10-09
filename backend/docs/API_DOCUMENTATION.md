# Marine AI — REST API Documentation

Base URL: `http://localhost:5000`

---

## 1. System Health & Infrastructure

### `GET /health`
Exact Member 6 production health check endpoint.
- **Response**:
```json
{
  "status": "ok",
  "service": "Marine AI"
}
```

### `GET /api/health`
Detailed service status check.
- **Response**:
```json
{
  "status": "ok",
  "service": "Marine AI",
  "message": "Marine AI backend is running",
  "services": {
    "risk": "active",
    "geofence": "active",
    "pfz": "active",
    "alerts": "active",
    "routes": "active"
  },
  "timestamp": "2026-09-06T15:25:00.000Z"
}
```

---

## 2. Potential Fishing Zones (PFZ)

### `GET /api/pfz/nearby`
Finds nearest Potential Fishing Zones from vessel coordinates.
- **Query Params**:
  - `latitude`: `17.6868`
  - `longitude`: `83.2185`
  - `limit`: `5` (default)
- **Response**:
```json
{
  "success": true,
  "count": 5,
  "pfzs": [
    {
      "id": "INCOIS-PFZ-040",
      "name": "INCOIS PFZ 040",
      "latitude": 17.563381,
      "longitude": 83.418411,
      "distanceKm": 25.24,
      "sst": 29.34,
      "chlorophyll": null,
      "source": "INCOIS",
      "sourceStatus": "LIVE"
    }
  ]
}
```

### `GET /api/pfz/ranked`
Ranks PFZs using AI suitability scoring incorporating chlorophyll, SST, distance, and confidence.
- **Query Params**: `latitude`, `longitude`, `limit`
- **Response Structure**: Includes `aiSuitabilityScore`, `perFactorBreakdown`, `selectionExplanation`.

---

## 3. Live Environmental & Warning Data

### `GET /api/weather` & `GET /api/weather/forecast`
- **Query Params**: `latitude`, `longitude`, `targetDate` (YYYY-MM-DD for forecast)
- **Sample Output**:
```json
{
  "success": true,
  "windSpeed": 21.3,
  "windGust": 29.2,
  "precipitationProbability": 6,
  "weatherCode": 0,
  "source": "Open-Meteo Weather API"
}
```

### `GET /api/ocean` & `GET /api/ocean/forecast`
- **Query Params**: `latitude`, `longitude`, `targetDate`
- **Sample Output**:
```json
{
  "success": true,
  "waveHeight": 1.5,
  "wavePeriod": 8.25,
  "sst": 29.5,
  "currentSpeed": 0.6,
  "source": "Open-Meteo Marine API"
}
```

### `GET /api/warnings`
Returns official IMD warnings and thunderstorm/cyclone flags.

---

## 4. Risk & Route Optimization

### `POST /api/marine/risk`
- **Body**:
```json
{
  "windSpeed": 21.3,
  "windGust": 29.2,
  "waveHeight": 1.5,
  "rainProbability": 6,
  "lightning": 0,
  "cyclone": false
}
```
- **Response**:
```json
{
  "score": 10,
  "level": "LOW",
  "factors": [],
  "confidenceScore": 100
}
```

### `POST /api/fishing-route/find`
Computes an obstacle-free A* route avoiding restricted geofence cells and severe risk hotspots.
- **Body**:
```json
{
  "latitude": 17.6868,
  "longitude": 83.2185,
  "rows": 5,
  "cols": 5
}
```

---

## 5. Safety Alerts Engine

### `POST /api/alerts/evaluate`
Ingests telemetry, evaluates hazard detection thresholds, updates active alert registries, and generates deterministic safety actions.
- **Body**:
```json
{
  "location": { "latitude": 17.6868, "longitude": 83.2185 },
  "weather": { "windSpeed": 45, "windGust": 55 },
  "warning": { "level": "HIGH" }
}
```
- **Response**:
```json
{
  "success": true,
  "hazardCount": 2,
  "alertCount": 2,
  "hazards": [ ... ],
  "alerts": [
    {
      "id": "ALT-STRONG_WIND-17.6868-83.2185",
      "type": "STRONG_WIND",
      "severity": "HIGH",
      "priority": 1,
      "status": "ACTIVE",
      "title": "Strong Wind",
      "message": "Strong winds may make fishing and navigation hazardous.",
      "recommendation": "DO_NOT_SAIL",
      "createdAt": "2026-09-06T15:20:00.000Z",
      "expiresAt": "2026-09-06T17:20:00.000Z"
    }
  ]
}
```

### `GET /api/alerts`
Returns all currently active alerts sorted strictly by priority ($0$ = Critical).
