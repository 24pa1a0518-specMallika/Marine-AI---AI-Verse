# Marine AI — Production Environment & Deployment Guide (Member 6 Part A)

## 1. Production Architecture Overview

The Marine AI production backend is deployed as a resilient Node.js Express service with native CORS controls, structured logging, centralized error handling, and health inspection endpoints.

---

## 2. Environment Variables Specification

All environment settings are defined in `.env` files with sample templates in `.env.example`.

| Variable | Default Value | Purpose | Required? |
| :--- | :--- | :--- | :--- |
| `PORT` | `5000` | HTTP listener port for Express backend | Yes |
| `NODE_ENV` | `production` | Runtime mode (`production`, `development`, `test`) | Yes |
| `CORS_ORIGIN` | `*` (or comma-separated URLs) | Whitelisted domains allowed to access APIs | Yes |
| `BACKEND_URL` | `http://localhost:5000/api` | API Base URL consumed by AI orchestrator | Yes |
| `BACKEND_TIMEOUT_MS` | `15000` | Standard request timeout limit | No |
| `PFZ_TIMEOUT_MS` | `60000` | Timeout allowance for upstream INCOIS WFS calls | No |
| `GEMINI_API_KEY` | *(Optional)* | Google Gemini API key for hybrid LLM planning | Optional |
| `MODEL_NAME` | `gemini-2.5-flash` | Gemini model name when API key is provided | Optional |
| `WEATHER_API_BASE` | `https://api.open-meteo.com/v1` | Open-Meteo atmospheric API base | Yes |
| `MARINE_API_BASE` | `https://marine-api.open-meteo.com/v1` | Open-Meteo physical oceanographic API base | Yes |
| `INCOIS_PFZ_URL` | `https://incois.gov.in/...` | INCOIS WFS GeoServer query URL | Yes |

---

## 3. Production Health Check Endpoints

### Direct Health Probe: `GET /health`
```bash
curl http://localhost:5000/health
```
**Response**:
```json
{
  "status": "ok",
  "service": "Marine AI"
}
```

### Detailed Diagnostics: `GET /api/health`
```bash
curl http://localhost:5000/api/health
```
**Response**:
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

## 4. Production Start Commands

### Install All Dependencies
```bash
# Backend dependencies
cd backend && npm install

# AI Orchestrator dependencies
cd ../ai && npm install

# Root project dependencies
cd .. && npm install
```

### Start Production Backend
```bash
cd backend
npm start
```
*Listens on `http://localhost:5000` with active request logging.*

### Execute Test Suites
```bash
# 1. Multi-turn Conversational AI & Telugu Suite
node ai/test_conversational_multiturn.js

# 2. Safety Alerts & Hazard Test Suite
node backend/test_alerts_hazards.js

# 3. Final Demo Scenarios (Exact Queries 1-8)
node test_demo_scenarios.js
```
