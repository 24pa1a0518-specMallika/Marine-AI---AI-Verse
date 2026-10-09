# Marine AI — Live Data Sources & Integrations

Marine AI ingests, normalizes, and correlates operational marine data across 5 distinct authoritative providers.

---

## 1. INCOIS (Indian National Centre for Ocean Information Services)
- **Role**: Primary provider for Potential Fishing Zone (PFZ) lines and Ocean State Forecasts (OSF).
- **Service Endpoint**: WFS (Web Feature Service) GeoServer
  `https://incois.gov.in/geoserver/PFZ_Automation/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=PFZ_Automation:pfzlines&outputFormat=application/json`
- **Data Extracted**:
  - Identified pelagic aggregation lines
  - Depth contours (bathymetry: 20–100m)
  - Direction and bearing from designated landing centres (e.g. Visakhapatnam, Kakinada, Machilipatnam)
  - Validation: Real-time telemetry fallback with verified prototype vectors.

---

## 2. NASA / JPL (Jet Propulsion Laboratory) & Satellite Oceanography
- **Role**: High-resolution Sea Surface Temperature (SST) & Ocean Color (Chlorophyll-a).
- **Products**:
  - GHRSST (Group for High Resolution Sea Surface Temperature) Level 4 Analysis
  - MODIS-Aqua / Sentinel-3 OLCI (Ocean and Land Colour Instrument) Chlorophyll concentration ($mg/m^3$)
- **Significance**: Identifies chlorophyll fronts and ocean thermal boundaries representing high nutrient upwelling zones.

---

## 3. Weather API (Open-Meteo High-Resolution Global Forecast)
- **Role**: Real-time and forecasted atmospheric parameters.
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Parameters Sampled**:
  - Wind speed ($km/h$) at 10m height
  - Dangerous wind gusts ($km/h$)
  - Wind direction (azimuth degrees)
  - Precipitation rate ($mm$) and probability ($0-100\%$)
  - WMO Weather Codes (distinguishing rain, thunderstorms 95/96/99, squalls)
- **Temporal Modes**: Current live readings and 24–48 hour forecast horizons.

---

## 4. Marine API (Open-Meteo ECMWF / NOAA Wave Model)
- **Role**: High-seas wave dynamics and physical ocean state.
- **Endpoint**: `https://marine-api.open-meteo.com/v1/marine`
- **Parameters Sampled**:
  - Significant wave height ($m$)
  - Dominant wave period ($seconds$)
  - Swell wave height and direction
  - Ocean surface current velocity ($m/s$) and direction ($degrees$)
  - Sea surface temperature ($^\circ C$)

---

## 5. IMD (India Meteorological Department)
- **Role**: Official government meteorological and marine disaster warnings.
- **Bulletins Ingested**:
  - Coastal and High Sea Fishermen Warnings
  - Cyclone Tracking Bulletins (Deep Depression, Cyclonic Storm, Severe Cyclonic Storm)
  - Squally Weather Alerts (winds $\ge 45-55\text{ km/h}$)
  - Lightning & Thunderstorm Warnings
- **Priority**: IMD HIGH warnings trigger immediate deterministic `DO_NOT_SAIL` overrides across all AI recommendations.
