# Marine AI — Algorithmic Models & Specifications

This document describes the mathematical formulations, heuristic models, and algorithmic pipelines implemented in the Marine AI platform.

---

## 1. Potential Fishing Zone (PFZ) Suitability Scoring

The AI suitability score $S_{PFZ} \in [0, 100]$ ranks candidate ocean zones based on 4 weighted oceanographic factors:

$$S_{PFZ} = \frac{\sum_{i} W_i \cdot P_i}{\sum_{i} W_i} \times 100$$

Where $W_i$ represents the weight of each available factor, and $P_i$ is the normalized performance score. Missing factors are dynamically excluded and the remaining factor weights normalized to 100.

### Factor 1: Biological Productivity (Chlorophyll-a) — Max 45 Points
Phytoplankton concentration directly indicates primary marine productivity and pelagic fish congregation.
- $\text{Chl} \ge 3.0\text{ mg/m}^3 \implies 45\text{ pts}$
- $2.0 \le \text{Chl} < 3.0\text{ mg/m}^3 \implies 38\text{ pts}$
- $1.0 \le \text{Chl} < 2.0\text{ mg/m}^3 \implies 28\text{ pts}$
- $0.5 \le \text{Chl} < 1.0\text{ mg/m}^3 \implies 18\text{ pts}$
- $\text{Chl} < 0.5\text{ mg/m}^3 \implies 5\text{ pts}$

### Factor 2: Accessibility & Fuel Economics (Distance) — Max 25 Points
Computed using the great-circle Haversine formula from vessel departure coordinates $(lat_1, lon_1)$ to target zone $(lat_2, lon_2)$:

$$d = 2R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos \phi_1 \cos \phi_2 \sin^2\left(\frac{\Delta \lambda}{2}\right)} \right)$$

- $d \le 15\text{ km} \implies 25\text{ pts}$
- $15 < d \le 30\text{ km} \implies 20\text{ pts}$
- $30 < d \le 50\text{ km} \implies 14\text{ pts}$
- $50 < d \le 80\text{ km} \implies 8\text{ pts}$
- $d > 80\text{ km} \implies 2\text{ pts}$

### Factor 3: Thermal Front Suitability (SST) — Max 20 Points
Pelagic species in the Bay of Bengal aggregate along ocean thermal fronts where upwelling brings nutrients.
- $26.0^\circ\text{C} \le \text{SST} \le 30.0^\circ\text{C} \implies 20\text{ pts}$ (Prime thermal zone)
- $24.0^\circ\text{C} \le \text{SST} < 26.0^\circ\text{C}$ or $30.0^\circ\text{C} < \text{SST} \le 32.0^\circ\text{C} \implies 12\text{ pts}$
- $\text{SST} < 24.0^\circ\text{C}$ or $\text{SST} > 32.0^\circ\text{C} \implies 5\text{ pts}$

### Factor 4: Official INCOIS Baseline Score — Max 10 Points
Direct incorporation of INCOIS PFZ line advisories:
$$P_{INCOIS} = \frac{\min(100, \max(0, \text{score}_{INCOIS}))}{100} \times 10\text{ pts}$$

---

## 2. Data Confidence Scoring

To prevent misleading recommendations during sensor outages or cloud obscuration, the data confidence metric $C_{data} \in [0, 100]$ evaluates data availability and telemetry freshness:

$$C_{data} = \text{round}\left( \frac{W_{avail}}{100} \times 75 + (\text{isLive} ? 25 : 15) \right)$$

- Evaluates sensor availability: Wind, Wave Height, Rain, Lightning, IMD warnings, SST, Chlorophyll.
- Displays transparent disclosures when parameters are estimated or missing.

---

## 3. Marine Risk Engine & Geographic Grid

### Risk Score Formulation
The composite risk score $R \in [0, 100+]$ aggregates atmospheric and oceanographic hazards:

$$R = R_{IMD} + R_{Wind} + R_{Gust} + R_{Wave} + R_{Rain} + R_{Lightning} + R_{Cyclone}$$

| Hazard Component | Metric Threshold | Points |
| :--- | :--- | :--- |
| **Official IMD Warning** | HIGH / MODERATE | +60 / +30 |
| **Sustained Wind Speed** | $> 40 / > 30 / > 20\text{ km/h}$ | +40 / +25 / +10 |
| **Dangerous Wind Gust** | $> 50 / > 40 / > 30\text{ km/h}$ | +40 / +25 / +10 |
| **Wave Significant Height** | $> 3.5 / > 2.5 / > 1.8\text{ m}$ | +40 / +25 / +10 |
| **Heavy Rain Probability** | $> 80\% / > 60\%$ | +15 / +10 |
| **Lightning Frequency** | $\ge 3\text{ strikes} / \ge 1\text{ strike}$ | +20 / +10 |
| **Active Cyclone** | Cyclone detected in basin | +100 |

### Categorical Risk Levels
- **EXTREME**: $R \ge 100$ $\implies$ Critical Hazard (`DO_NOT_SAIL`)
- **HIGH**: $60 \le R < 100$ $\implies$ Dangerous Sea (`DO_NOT_SAIL`)
- **MODERATE**: $30 \le R < 60$ $\implies$ Cautionary Conditions (`PROCEED_WITH_CAUTION`)
- **LOW**: $R < 30$ $\implies$ Favorable Conditions (`SAFE_TO_SAIL`)

### Geographic Risk Grid
- Covers maritime operational zones segmented into $0.25^\circ \times 0.25^\circ$ spatial grid cells.
- Each cell evaluates local wave height, wind speed, and restricted geofences.

---

## 4. Safe Route Selection (A* Graph Pathfinder)

Route optimization computes the minimum-cost maritime path $P^*$ from vessel start $S$ to goal PFZ $G$:

$$f(n) = g(n) + h(n) + C_{hazard}(n)$$

Where:
- $g(n)$: Cumulative geodesic nautical distance from start to node $n$.
- $h(n)$: Euclidean/Haversine heuristic estimate to goal $G$.
- $C_{hazard}(n)$: Risk penalty assigned to node $n$:
  - $n \in \text{Restricted Zone} \implies C_{hazard}(n) = \infty$ (Pruned / Invariant bypass)
  - $n \in \text{High Risk Wave/Wind Cell} \implies C_{hazard}(n) = +100 \times \text{penalty}$
  - $n \in \text{Moderate Risk Cell} \implies C_{hazard}(n) = +25 \times \text{penalty}$

The path guarantees evasion of restricted zones (Coringa Mangroves, Visakhapatnam Naval Protected Corridors, IMBL) while optimizing vessel fuel burn and transit time.

---

## 5. Deterministic Safety Override Logic

Safety rules are enforced deterministically in code after AI synthesis to prevent LLM hallucinations from compromising vessel safety:

```javascript
if (
  warning.level === "HIGH" ||
  cyclone.active === true ||
  safety.riskLevel === "EXTREME" ||
  safety.riskLevel === "HIGH" ||
  geofence.insideRestrictedZone === true ||
  geofence.crossesRestricted === true ||
  hazards.some(h => h.recommendation === "DO_NOT_SAIL")
) {
  recommendation = "DO_NOT_SAIL";
  enforceSafetyAnswer(answer, "DO_NOT_SAIL");
}
```
