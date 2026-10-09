# Marine AI — Live Demonstration Script (Queries 1–8)

This script provides the exact questions, expected responses, system behaviors, and conversational context retention for the Smart India Hackathon 2026 jury evaluation.

---

## Live Demo Conversation Sequence

### Turn 1: Initial Discovery (English)
- **User**: `Which PFZ should I go to tomorrow?`
- **Intent**: `PFZ_SEARCH` (Target Date: Tomorrow)
- **AI Response**:
  > "The recommended Potential Fishing Zone is **INCOIS PFZ 040** (or Visakhapatnam Deep Sea Eddy). It is located approximately **25.24 km** from your departure location. Sea surface temperature is **29.34°C**, and chlorophyll concentration is indicative of pelagic aggregation. Data source: INCOIS."
- **Context Established**: Target PFZ (`INCOIS PFZ 040`), Coordinates (`17.56°N, 83.42°E`), Distance (`25.24 km`).

---

### Turn 2: Pronoun Resolution ("it")
- **User**: `How far is it?`
- **Intent**: `PFZ_DISTANCE`
- **AI Response**:
  > "Approximately **25 km** (specifically **25.24 km** from your departure point to **INCOIS PFZ 040**)."
- **System Verification**: Successfully resolved the pronoun `"it"` to the previously selected PFZ without requiring re-specification.

---

### Turn 3: Follow-Up Safety Assessment
- **User**: `Is this PFZ safe?`
- **Intent**: `MARINE_SAFETY`
- **AI Response**:
  > "Current PFZ-specific risk for **INCOIS PFZ 040** is evaluated against live conditions. Wind speed is 21.3 km/h, wave height is 1.5 m, with active IMD marine advisories under continuous monitoring."
- **System Verification**: Assesses the ocean coordinates of the selected PFZ rather than vessel homeport, applying the deterministic safety override rule.

---

### Turn 4: Safe Navigation Routing
- **User**: `Give me the safest route.`
- **Intent**: `SAFE_ROUTE`
- **AI Response**:
  > "Safe route information for **INCOIS PFZ 040**: A risk-aware navigation route was calculated using A* optimization while avoiding restricted and high-risk cells. Calculated route distance: **28.4 km**."
- **System Verification**: Automatically assigns vessel origin as start and target PFZ as goal, avoiding protected boundaries.

---

### Turn 5: Route Hazard Inspection
- **User**: `What hazards are along the route?`
- **Intent**: `ROUTE_HAZARDS`
- **AI Response**:
  > "Along the planned route to **INCOIS PFZ 040**, the navigation corridor avoids restricted naval areas and high-wave zones. Active IMD warnings and wave states are continuously monitored."
- **System Verification**: Evaluates intermediate path cells against active alert registries and geofence polygons.

---

### Turn 6: Official Disaster Advisory Check
- **User**: `Is there an IMD warning?`
- **Intent**: `HAZARD_ALERT`
- **AI Response**:
  > "Marine hazard status checked against official India Meteorological Department telemetry. Official warning levels and active advisories are factored into vessel safety recommendations."
- **System Verification**: Inspects IMD squall, gale, cyclone, and thunderstorm alert bulletins.

---

### Turn 7: Multilingual Equivalence (Telugu)
- **User**: `రేపు నేను ఏ PFZ కి వెళ్లాలి?` *(Which PFZ should I go to tomorrow?)*
- **Intent**: `PFZ_SEARCH` | **Language**: `te` (Telugu)
- **AI Response**:
  > "మీ ప్రస్తుత స్థానానికి సిఫార్సు చేయబడిన Potential Fishing Zone **INCOIS PFZ 040**. ఇది సుమారు **25.24 km** దూరంలో ఉంది. సముద్ర ఉపరితల ఉష్ణోగ్రత **29.34°C**. డేటా మూలం: INCOIS."
- **System Verification**: Native Telugu script detection, seamless Telugu natural language response synthesis.

---

### Turn 8: Multilingual Pronoun Resolution (Telugu "అది")
- **User**: `అది ఎంత దూరంలో ఉంది?` *(How far is it?)*
- **Intent**: `PFZ_DISTANCE` | **Language**: `te` (Telugu)
- **AI Response**:
  > "**INCOIS PFZ 040** సుమారు **25 కి.మీ** (25.24 km) దూరంలో ఉంది."
- **System Verification**: Resolves Telugu pronoun `"అది"` directly to the active PFZ entity across turns.
