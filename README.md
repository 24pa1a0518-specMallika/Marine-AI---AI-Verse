# 🌊 MarineAI (AI-Verse) — Ocean Current Intelligence, Agentic AI & GIS Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6-purple.svg)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS-brightgreen.svg)](https://leafletjs.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://ai.google.dev/)
[![Open-Meteo](https://img.shields.io/badge/Weather-Open--Meteo%20API-blue.svg)](https://open-meteo.com/)

---

## 📋 Abstract & System Overview

**MarineAI (AI-Verse)** is a comprehensive, multi-agent AI oceanographic intelligence platform, geospatial GIS navigation engine, and real-time marine advisory suite designed to empower fishermen, vessel captains, oceanographers, and maritime safety agencies.

Modern artisanal fishing and commercial marine navigation face critical operational hurdles: unpredictable sea state shifts, high-velocity ocean current drift, accidental land/border incursions, inefficient fuel expenditure, and fragmented weather advisories.

MarineAI solves these challenges through six integrated core pillars:

1. **🌊 Ocean Current Intelligence Engine**: Hydrodynamic velocity vectors ($u, v$), surface speed heatmaps, Random Forest ML current regressions, historical persistence comparisons, and model evaluations using NASA PO.DAAC OSCAR V2.0 satellite telemetry.
2. **📊 PDF & CSV Analytical Report Generator**: Publication-ready PDF document rendering engine (`PDFKit`) providing executive summary metrics, operational navigation risk distributions, physical formulations, and tabular grid records.
3. **🌤️ Real-Time Open-Meteo Weather Engine**: Live telemetry for temperature (`temperature_2m`), relative humidity (`relative_humidity_2m`), precipitation (`precipitation`), and 24-hour forecast trends under `Asia/Kolkata` timezone.
4. **🚢 Safe Maritime Routing & Pathfinder**: A* grid solver with land-avoidance polygon boundaries (`LAND_COASTAL_001`), ensuring vessels remain 100% in open sea waters when navigating to Potential Fishing Zones.
5. **🐟 Potential Fishing Zone (PFZ) Advisory**: Satellite thermal and biological ocean data integration (INCOIS / Open-Meteo) matching high-yield pelagic aggregation fronts.
6. **🤖 Agentic Multi-Agent AI Pipeline**: Dual-language (English & Telugu) conversational assistant powered by Google Gemini with deterministic rule-based safety fallbacks.

---

## ✨ Key Features & Navigation Modules

### 1. Ocean Current Intelligence Suite
- **Current Overview**: Domain metrics, mean flow direction, average/peak velocity magnitude ($m/s$ and knots), and model operational status.
- **Current Map**: Severity-based surface velocity heatmaps, dynamic directional flow vector arrows, coordinate tooltips, and map style controls.
- **Current Prediction**: Physics-guided Random Forest Machine Learning regressor forecasting 24h-72h surface current vector velocity ($u$ eastward, $v$ northward).
- **Historical Comparison**: Time-series analysis comparing observed OSCAR satellite currents against Random Forest predictions and persistence baselines.
- **Model Evaluation**: MAE, RMSE, and performance gain metrics comparing ML model accuracy vs persistence baselines.
- **Current Data Explorer**: Filterable spatial grid table with search controls and one-click **PDF & CSV Analytical Intelligence Report Generation**.

### 2. PDF & CSV Report Generator
- **PDF Intelligence Document**: Automatically computes executive metrics, 6-box key parameters grid, 4-tier operational severity distribution (<0.10 m/s Safe, 0.10-0.20 m/s Normal, 0.20-0.35 m/s Caution, >0.35 m/s Severe Hazard), methodology documentation, and multi-page styled observation records.
- **Raw CSV Data Export**: Unformatted CSV table export for GIS and ML workflow integration.

### 3. Weather & Telemetry Engine
- **Live Open-Meteo API Querying**: Real-time integration of Open-Meteo forecast API (`latitude=16.71&longitude=81.10&timezone=Asia/Kolkata`).
- **Live Metrics**: Real-time temperature (°C), relative humidity (%), precipitation (mm), precipitation probability (%), wind speed (kt), and 24-hour hourly trend slider.

### 4. Safe Routes & Coastal Land Avoidance
- **Land Boundary Enforcement**: Expanded GeoJSON land polygons preventing paths from intersecting Coringa/Kakinada coastal land masses.
- **A* Pathfinder**: Calculates optimal open-sea waypoints connecting departure ports to target PFZ fishing grounds.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Leaflet & React-Leaflet, Recharts, Lucide Icons.
- **Backend**: Node.js, Express.js (v5), PDFKit, Axios, CORS, Dotenv.
- **Machine Learning & Modeling**: Python 3.10+, Scikit-Learn (Random Forest Regressor), NumPy, Pandas, NASA PO.DAAC OSCAR V2.0 dataset.
- **AI Engine**: Node-based Multi-Agent Orchestrator, `@google/generative-ai` (Gemini 2.5 Flash).
- **GIS Algorithms**: Haversine distance calculations, GeoJSON Layer Generators, Point-in-Polygon spatial algorithms.

---

## 📁 Repository Structure

```
MARINE_AI/
├── frontend/                     # React + Vite Frontend Application
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── api/                  # API clients for backend endpoints & Open-Meteo
│   │   ├── components/           # UI, currents, & GIS map components
│   │   ├── context/              # Auth & Location Contexts
│   │   ├── pages/                # Currents, Weather, PFZ, Safe Routes, Explorer pages
│   │   └── App.jsx               # Router & Sidebar Layout
│   └── package.json
│
├── backend/                      # Node.js + Express Backend Services & AI Core
│   ├── ai/                       # Agentic AI orchestration framework
│   ├── backend/                  # Express REST API application
│   │   ├── src/
│   │   │   ├── controllers/      # Currents, LiveData, Route, PFZ controllers
│   │   │   ├── routes/           # REST endpoints (/api/currents, /api/weather, etc.)
│   │   │   └── server.js
│   │   ├── services/             # Weather, Ocean, Geofence, PFZ services
│   │   └── package.json
│   ├── currents_ml/              # Python Random Forest ML models & data pipelines
│   │   ├── data/                 # OSCAR surface currents dataset
│   │   ├── models/               # Trained RF model artifacts & evaluation JSONs
│   │   └── predict.py            # ML prediction script
│   ├── risk-engine/              # Marine risk scoring formulas
│   └── package.json
│
├── .gitignore                    # Git ignore rules for node_modules, .env, build outputs
└── README.md                     # Root project documentation
```

---

## 🔑 Environment Setup

### 1. Frontend Environment (`frontend/.env`)
Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Backend Environment (`backend/backend/.env`)
Create `backend/backend/.env`:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Optional: Google Gemini API Key for AI assistant
GEMINI_API_KEY=your_gemini_api_key_here
MODEL_NAME=gemini-2.5-flash
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Python**: `v3.10+` (for Machine Learning prediction scripts)

### 1. Clone the Repository
```bash
git clone https://github.com/Gurupraneeth03/Marine-AI---AI-Verse.git
cd Marine-AI---AI-Verse
```

### 2. Start Backend API Server
```bash
cd backend/backend
npm install
npm start
```
*The backend server will run on `http://localhost:5000`.*

### 3. Start Frontend Application
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The React application will launch on `http://localhost:3000` or `http://localhost:5173`.*

---

## 🧪 Verification & Build Suite

### Run Frontend Production Build
```bash
cd frontend
npm run build
```

### Test Backend Endpoints
```bash
# Test Weather API (Open-Meteo Integration)
curl http://localhost:5000/api/weather?lat=16.71&lon=81.10

# Test PDF Report Endpoint
curl -I http://localhost:5000/api/currents/export-pdf
```

---

## ⚠️ Disclaimer

> **`⚠️ Disclaimer: This application is a prototype developed for maritime safety research. Maritime boundaries, geofence polygons, and risk scores are provided for decision support. Not intended as a sole source for open-sea vessel navigation without official INCOIS / IMD verification.`**

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
