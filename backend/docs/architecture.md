# Marine AI — System Architecture Specification

## 1. End-to-End Operational Pipeline

The Marine AI system implements a decoupled, agentic multi-stage pipeline designed for mission-critical maritime safety, potential fishing zone (PFZ) discovery, hazard alert intelligence, and risk-optimized routing.

```
User Query (Voice/Text: English, Telugu, Hindi)
                     ↓
        Orchestrator (`orchestrator.js`)
                     ↓
    Intent Agent (`intentAgent.js`) + Context Manager (`contextManager.js`)
                     ↓
         Planner Agent (`plannerAgent.js`)
                     ↓
          Tool Registry (`tools.js`)
                     ↓
          Live Data Ingestion Layer
     [INCOIS | Open-Meteo | IMD | Geofences]
                     ↓
   Analytical & Geospatial Processing Engines
  [PFZ Engine | Risk Engine | Route Optimizer | Hazard Detector]
                     ↓
   Alert Engine (`alertEngine.js`) & Safety Override
                     ↓
      Response Synthesis Agent (`synthesisAgent.js`)
                     ↓
           Evidence-Based Response
```

---

## 2. Core Architectural Components

### A. Orchestrator (`ai/orchestrator.js`)
- Acts as the central pipeline controller.
- Accepts raw queries, invokes intent classification, executes scheduled tools in parallel or sequence, updates the stateful `ContextManager`, and routes inputs to the synthesis agent.
- Guarantees deterministic safety overrides before final response delivery.

### B. Context & Reference Resolution Engine (`ai/contextManager.js`)
- Maintains session-scoped state:
  - `selectedPFZ`: Reference target for pronouns ("it", "there", "that zone", "అది", "దాని").
  - `pfzList`: Cached candidate PFZ zones from recent queries.
  - `lastLocation`: Vessel coordinates (default: Visakhapatnam Coast `17.6868°N, 83.2185°E`).
  - `lastRoute`: Precomputed A* navigation corridor and waypoints.
  - `targetDate`: Temporal forecast horizon (e.g. today vs tomorrow).
  - `language`: Preferred language (`en` for English, `te` for Telugu).
- Resolves ordinal ("2nd one", "closest"), pronoun ("How far is it?", "అది ఎంత దూరంలో ఉంది?"), and situational follow-ups across 5+ turns.

### C. Specialized Autonomous Agents
1. **Intent Agent (`ai/agents/intentAgent.js`)**:
   - Classifies query into 8 distinct intents: `PFZ_SEARCH`, `PFZ_DISTANCE`, `PFZ_EXPLANATION`, `MARINE_SAFETY`, `SAFE_ROUTE`, `ROUTE_HAZARDS`, `MARINE_CONDITIONS`, `HAZARD_ALERT`, and `GEOFENCE_CHECK`.
   - Native Telugu script regex parser (`[\u0C00-\u0C7F]`) preserving language preference.
2. **Planner Agent (`ai/agents/plannerAgent.js`)**:
   - Compiles intents into optimized tool invocation plans.
   - Differentiates between current live queries and forecast horizon queries ("tomorrow", "రేపు").
3. **Synthesis Agent (`ai/agents/synthesisAgent.js`)**:
   - Converts tool outputs into human-readable advice in English or Telugu.
   - Embeds verifiable evidence: data sources, confidence metrics, and parameter breakdowns.
   - Enforces strict deterministic safety override preventing AI hallucinations.

### D. Analytical Backend Services (`backend/services/`)
- **`pfzService.js`**: WFS GeoServer consumer for INCOIS PFZ lines and thermal front clustering.
- **`weatherService.js` & `marineDataService.js`**: Real-time atmospheric (wind, gusts, precipitation) and oceanographic (waves, swell, currents, SST) ingestion.
- **`marineWarningService.js`**: Parser for IMD cyclone, squall, gale, and thunderstorm bulletins.
- **`geofenceService.js`**: Point-in-polygon and line-string intersection engine for maritime boundaries (IMBL, wildlife sanctuaries, naval corridors).
- **`routeOptimizer.js`**: A* graph pathfinder with dynamic environmental risk weighting.

---

## 3. Safety-First Override Hierarchy

Marine AI adheres to a non-negotiable safety priority rule:

1. **Tier 1 (Highest Priority: `DO_NOT_SAIL`)**:
   - Official IMD warning level is `HIGH`.
   - Active cyclone warning (`cyclone.active === true`).
   - Risk engine score exceeds 60 (`HIGH` or `EXTREME`).
   - Geofence breach into restricted marine area (`insideRestrictedZone === true` or route breach).
   - Any detected hazard requiring `DO_NOT_SAIL`.
2. **Tier 2 (Second Priority: `PROCEED_WITH_CAUTION`)**:
   - Risk engine score 30–59 (`MODERATE`).
   - Strong winds (30–39 km/h) or wave heights 2.5–3.4 m.
   - Proximity warning near restricted geofence boundary.
3. **Tier 3 (Normal: `INFORMATIONAL` / `SAFE_TO_SAIL`)**:
   - Permitted only when zero hazardous conditions are detected.
