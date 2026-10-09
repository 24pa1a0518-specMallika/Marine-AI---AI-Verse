/**
 * Marine AI — Phase 7 Context Manager (Multi-Turn & Reference Resolution)
 * Smart India Hackathon 2026 - Problem Statement ID: 26176
 *
 * Maintains persistent conversation state across turns:
 * - lastLocation: { name, lat, lon }
 * - selectedPFZ: Last discussed/selected PFZ object
 * - pfzList: Array of PFZ zones from previous queries
 * - lastRoute: Last calculated safe navigation route
 * - targetDate: Target forecast date (e.g. YYYY-MM-DD)
 * - conversationHistory: Multi-turn message history array
 * - language: Preferred user language ('en' | 'te' | 'hi')
 */

export class ContextManager {
  constructor(initialState = {}) {
    this.state = {
      session_id: initialState.session_id || `session_${Date.now()}`,
      lastLocation: initialState.lastLocation || {
        name: "Visakhapatnam Coast",
        lat: 17.6868,
        lon: 83.2185,
      },
      destination: initialState.destination || null,
      selectedPFZ: initialState.selectedPFZ || null,
      pfzList: initialState.pfzList || [],
      lastRoute: initialState.lastRoute || null,
      targetDate: initialState.targetDate || this.getTodayDateString(),
      previousRiskResult: initialState.previousRiskResult || null,
      language: initialState.language || "en",
      conversationHistory: initialState.conversationHistory || [],
    };
  }

  getTodayDateString() {
    return new Date().toISOString().split("T")[0];
  }

  getTomorrowDateString() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  /**
   * Resolves multi-turn references such as:
   * - Pronoun "it" / "అది" ("How far is it?", "Is it safe?", "అది ఎంత దూరంలో ఉంది?", "అది సురక్షితమేనా?")
   * - Route follow-ups ("What about the route?", "Safe route", "దోవ ఏంటి?")
   * - Route hazards ("What hazards are along the route?", "మార్గంలో ప్రమాదాలు?")
   * - Selection explanation ("Why did you select this PFZ?", "ఈ PFZని ఎందుకు ఎంచుకున్నారు?")
   * - Ordinal references ("second one", "closest", "2nd zone", "రెండోది")
   * - Date references ("tomorrow", "రేపు")
   */
  resolveReference(userQuery = "") {
    const query = String(userQuery).toLowerCase().trim();

    // 1. Ordinal resolution: "second one", "2nd zone", "2nd", "రెండోది", "రెండవది"
    if (
      query.includes("second") ||
      query.includes("2nd") ||
      query.includes("రెండోది") ||
      query.includes("రెండవది")
    ) {
      if (Array.isArray(this.state.pfzList) && this.state.pfzList.length >= 2) {
        this.state.selectedPFZ = this.state.pfzList[1];
        return { type: "PFZ_ORDINAL", resolvedPFZ: this.state.pfzList[1] };
      }
    }

    // 2. Ordinal resolution: "third one", "3rd zone", "3rd", "మూడోది"
    if (
      query.includes("third") ||
      query.includes("3rd") ||
      query.includes("మూడోది")
    ) {
      if (Array.isArray(this.state.pfzList) && this.state.pfzList.length >= 3) {
        this.state.selectedPFZ = this.state.pfzList[2];
        return { type: "PFZ_ORDINAL", resolvedPFZ: this.state.pfzList[2] };
      }
    }

    // 3. Proximity resolution: "closest", "nearest", "సమీపంలోని", "దగ్గరలోని"
    if (
      query.includes("closest") ||
      query.includes("nearest") ||
      query.includes("సమీప") ||
      query.includes("దగ్గర")
    ) {
      if (Array.isArray(this.state.pfzList) && this.state.pfzList.length > 0) {
        const sorted = [...this.state.pfzList].sort(
          (a, b) =>
            Number(a.distanceKm ?? Infinity) - Number(b.distanceKm ?? Infinity),
        );
        this.state.selectedPFZ = sorted[0];
        return { type: "PFZ_CLOSEST", resolvedPFZ: sorted[0] };
      }
    }

    // 4. Pronoun & Follow-up resolution: "it", "that", "there", "that zone", "అది", "దాని"
    const hasPronoun =
      /\bit\b/i.test(query) ||
      query.includes("that zone") ||
      query.includes("that place") ||
      query.includes("this zone") ||
      query.includes("this pfz") ||
      query.includes("there") ||
      query.includes("అది") ||
      query.includes("దాని") ||
      query.includes("ఆ ప్రాంతం") ||
      query.includes("అక్కడ");

    const activePFZ = this.state.selectedPFZ || (this.state.pfzList && this.state.pfzList[0]);

    if (activePFZ) {
      // Distance follow-up: "how far is it", "how far", "distance", "అది ఎంత దూరంలో ఉంది", "ఎంత దూరం"
      if (
        query.includes("how far") ||
        query.includes("distance") ||
        query.includes("దూరం") ||
        query.includes("ఎంత దూరంలో") ||
        (hasPronoun && (query.includes("far") || query.includes("distance") || query.includes("దూరం")))
      ) {
        return {
          type: "PFZ_DISTANCE",
          resolvedPFZ: activePFZ,
        };
      }

      // Route hazards follow-up: "what hazards are along the route", "hazards along the route"
      if (
        (query.includes("hazard") || query.includes("ప్రమాద")) &&
        (query.includes("route") || query.includes("way") || query.includes("మార్గం") || query.includes("రహదారి") || query.includes("దోవ"))
      ) {
        return {
          type: "ROUTE_HAZARDS",
          resolvedPFZ: activePFZ,
          resolvedRoute: this.state.lastRoute,
        };
      }

      // Safe route follow-up: "what about the route", "give me the safest route", "route", "మార్గం"
      if (
        query.includes("route") ||
        query.includes("safest route") ||
        query.includes("path") ||
        query.includes("way to") ||
        query.includes("navigation") ||
        query.includes("దోవ") ||
        query.includes("రహదారి") ||
        query.includes("మార్గాలు") ||
        query.includes("మార్గం")
      ) {
        return {
          type: "SAFE_ROUTE",
          resolvedPFZ: activePFZ,
        };
      }

      // Explanation follow-up: "why did you select this pfz", "why this one", "why", "ఎందుకు ఎంచుకున్నారు"
      if (
        query.includes("why") ||
        query.includes("reason") ||
        query.includes("explain") ||
        query.includes("ఎందుకు") ||
        query.includes("కారణం")
      ) {
        return {
          type: "PFZ_EXPLANATION",
          resolvedPFZ: activePFZ,
        };
      }

      // Safety follow-up: "is it safe", "is it safe tomorrow", "safe", "సురక్షితమేనా"
      if (
        query.includes("safe") ||
        query.includes("risk") ||
        query.includes("danger") ||
        query.includes("సురక్షితమేనా") ||
        query.includes("ప్రమాదమా") ||
        (hasPronoun && (query.includes("safe") || query.includes("risk") || query.includes("సురక్షితం")))
      ) {
        return {
          type: "MARINE_SAFETY",
          resolvedPFZ: activePFZ,
        };
      }

      // General pronoun reference to active PFZ
      if (hasPronoun) {
        return {
          type: "PFZ_PRONOUN",
          resolvedPFZ: activePFZ,
        };
      }
    }

    // 5. Date resolution: "tomorrow", "రేపు"
    if (
      query.includes("tomorrow") ||
      query.includes("morning") ||
      query.includes("రేపు")
    ) {
      this.state.targetDate = this.getTomorrowDateString();
      return { type: "DATE_SHIFT", targetDate: this.state.targetDate };
    }

    return null;
  }

  /**
   * Updates state from executed tools and intent result
   */
  updateFromQueryAndIntent(intentResult, toolResults = {}) {
    if (intentResult.language) {
      this.state.language = intentResult.language;
    }

    // Capture location if detected
    if (intentResult.detectedLocation) {
      this.state.lastLocation = intentResult.detectedLocation;
    }

    // If intent has an explicitly resolved PFZ, update context
    if (intentResult.resolvedPFZ) {
      this.state.selectedPFZ = intentResult.resolvedPFZ;
      this.state.destination = {
        name: intentResult.resolvedPFZ.name || intentResult.resolvedPFZ.landingCentre || intentResult.resolvedPFZ.id,
        lat: Number(intentResult.resolvedPFZ.latitude || intentResult.resolvedPFZ.lat),
        lon: Number(intentResult.resolvedPFZ.longitude || intentResult.resolvedPFZ.lon),
      };
    }

    // Capture PFZ list from getNearbyPFZ or rankPFZs
    const pfzData =
      toolResults.getNearbyPFZ?.data ||
      toolResults.rankPFZs?.data ||
      toolResults.getNearbyPFZ ||
      toolResults.rankPFZs;

    if (pfzData && Array.isArray(pfzData.pfzs) && pfzData.pfzs.length > 0) {
      this.state.pfzList = pfzData.pfzs;

      // Automatically select top/nearest PFZ if none selected
      if (!this.state.selectedPFZ) {
        const selected = pfzData.pfzs[0];
        this.state.selectedPFZ = selected;
        this.state.destination = {
          name: selected.name || selected.landingCentre || selected.id,
          lat: Number(selected.latitude || selected.lat),
          lon: Number(selected.longitude || selected.lon),
        };
      }
    }

    if (toolResults.calculateRisk?.data) {
      this.state.previousRiskResult = toolResults.calculateRisk.data;
    }

    if (toolResults.findSafeRoute?.data) {
      this.state.lastRoute = toolResults.findSafeRoute.data;
    }

    return this.state;
  }

  /**
   * Appends a turn to conversation history
   */
  recordTurn(userQuery, responseObj) {
    this.state.conversationHistory.push({
      timestamp: new Date().toISOString(),
      userQuery,
      intent: responseObj.intent,
      recommendation: responseObj.recommendation,
      answer: responseObj.answer,
      selectedPFZ: this.state.selectedPFZ ? (this.state.selectedPFZ.id || this.state.selectedPFZ.name) : null,
    });
  }

  getContext() {
    return { ...this.state };
  }
}
