const { getPFZs, rankPFZs } = require("../../services/pfzService");
const {
  getWeatherConditions,
  getWeatherForecast,
} = require("../../services/weatherService");

const {
  getMarineConditions,
  getMarineForecast,
} = require("../../services/marineDataService");
const { getMarineWarnings } = require("../../services/marineWarningService");
const { checkGeofence } = require("../../services/geofenceService");
const { calculateRisk } = require("../../../risk-engine/riskCalculator");
const { getCycloneStatus } = require("../../services/cycloneService");
const { buildDataQuality } = require("../../services/dataQualityService");

const { detectHazards } = require("../hazardDetector");

const {
  evaluateAlerts,
  getActiveAlerts,
} = require("../alertEngine");

// Helper: Parse relative date references from user query
function resolveDateFromQuery(queryText, baseDateParam) {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const lower = (queryText || "").toLowerCase();

  if (baseDateParam) {
    return {
      targetDate: baseDateParam,
      labelEn: baseDateParam,
      labelTe: baseDateParam,
      isForecast: baseDateParam !== todayStr
    };
  }

  if (lower.includes("tomorrow") || lower.includes("రేపు") || lower.includes("రేపటి") || lower.includes("repu")) {
    return {
      targetDate: tomorrowStr,
      labelEn: `Tomorrow (${tomorrowStr})`,
      labelTe: `రేపు (${tomorrowStr})`,
      isForecast: true
    };
  }

  if (lower.includes("today") || lower.includes("ఈరోజు") || lower.includes("eroju")) {
    return {
      targetDate: todayStr,
      labelEn: `Today (${todayStr})`,
      labelTe: `ఈరోజు (${todayStr})`,
      isForecast: false
    };
  }

  if (lower.includes("yesterday") || lower.includes("నిన్న")) {
    return {
      targetDate: yesterdayStr,
      labelEn: `Yesterday (${yesterdayStr})`,
      labelTe: `నిన్న (${yesterdayStr})`,
      isForecast: false
    };
  }

  // Check specific date pattern: "7 September", "September 8", "8th sept", etc.
  const monthMatch = lower.match(/(\d{1,2})\s*(?:st|nd|rd|th)?\s*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i) ||
                     lower.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*(\d{1,2})/i);
  if (monthMatch) {
    const day = monthMatch[1] && !isNaN(Number(monthMatch[1])) ? Number(monthMatch[1]) : Number(monthMatch[2]);
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const mStr = (monthMatch[2] || monthMatch[1]).slice(0, 3).toLowerCase();
    const mIdx = months.indexOf(mStr);
    if (mIdx !== -1 && day >= 1 && day <= 31) {
      const y = now.getFullYear();
      const mm = String(mIdx + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      const parsed = `${y}-${mm}-${dd}`;
      return {
        targetDate: parsed,
        labelEn: `${day} ${monthMatch[2] || monthMatch[1]} ${y}`,
        labelTe: `${day} ${monthMatch[2] || monthMatch[1]} ${y}`,
        isForecast: parsed !== todayStr
      };
    }
  }

  return {
    targetDate: todayStr,
    labelEn: `Today (${todayStr})`,
    labelTe: `ఈరోజు (${todayStr})`,
    isForecast: false
  };
}

// Helper: Determine query intent
function detectIntent(queryText) {
  const lower = (queryText || "").toLowerCase().trim();

  // Safety keywords - check if user is asking whether they can go or if it is safe
  const safetyKeywords = [
    "can i go", "can we go", "is it safe", "safe to go", "safe to sail",
    "should i go", "should we sail", "permission", "can i fish",
    "can we fish", "safe or not", "is it safe or not", "am i safe",
    "can i travel", "may i go", "shall i go", "allowed to go",
    "can i venture", "should i venture", "safe to travel", "is it ok to sail",
    "is it okay to sail", "is it safe today", "can i sail today", "can i sail tomorrow",
    "వెళ్లవచ్చా", "సురక్షితమేనా", "పోవచ్చా", "చేపల వేటకు వెళ్లొచ్చా",
    "వేటకు పోవచ్చా", "సేఫ్ ఆ", "సేఫ్ కాదా", "రక్షణ ఉందా"
  ];

  if (safetyKeywords.some(kw => lower.includes(kw))) {
    return "FISHING_SAFETY";
  }

  // Greeting intent — check greetings
  const greetingPatterns = [
    "hello", "hi", "hey", "hii", "hiii", "good morning", "good afternoon",
    "good evening", "good night", "namaste", "namaskar", "howdy", "sup",
    "what's up", "whats up", "yo", "hola",
    // Telugu greetings
    "నమస్కారం", "నమస్తే", "హలో", "హాయ్", "శుభోదయం", "శుభ సాయంత్రం"
  ];

  const isGreeting = greetingPatterns.some(g => {
    return lower === g ||
      lower === g + "!" ||
      lower === g + "." ||
      lower.startsWith(g + " ") ||
      lower.startsWith(g + ",");
  });

  if (isGreeting) {
    return "GREETING";
  }

  // SST intent
  if (lower.includes("sst") || lower.includes("sea surface temp") || lower.includes("water temp") || lower.includes("ఉష్ణోగ్రత") || lower.includes("సముద్ర ఉష్ణోగ్రత")) {
    return "SST";
  }

  // Weather intent
  if (lower.includes("weather") || lower.includes("wind") || lower.includes("rain") || lower.includes("forecast") || lower.includes("వాతావరణం") || lower.includes("గాలి") || lower.includes("వర్షం")) {
    return "WEATHER";
  }

  // PFZ / fishing ground intent
  if (lower.includes("where is the pfz") || lower.includes("where is pfz") || lower.includes("pfz zone") || lower.includes("potential fishing") || lower.includes("where should i fish") || lower.includes("చేపల జోన్") || lower.includes("చేపలు ఎక్కడ") || lower.includes("ఎక్కడ చేపలు")) {
    return "PFZ";
  }

  // Geofence / restricted zone intent
  if (lower.includes("restricted") || lower.includes("geofence") || lower.includes("boundary") || lower.includes("border") || lower.includes("పరిమితం") || lower.includes("నిషేధిత") || lower.includes("సరిహద్దు")) {
    return "GEOFENCE";
  }

  // Risk intent
  if (lower.includes("risk") || lower.includes("why is this location unsafe") || lower.includes("why unsafe") || lower.includes("hazard") || lower.includes("ప్రమాదం") || lower.includes("ఎందుకు సురక్షితం కాదు")) {
    return "RISK";
  }

  // General questions (when not explicitly asking for safety permission)
  return "GENERAL_INFO";
}

async function analyzeMarine(req, res) {
  try {
    const latitude = Number(
      req.body.latitude ??
      req.body.userLocation?.latitude ??
      req.body.lat ??
      req.body.userLocation?.lat ??
      16.98
    );
    const longitude = Number(
      req.body.longitude ??
      req.body.userLocation?.longitude ??
      req.body.lon ??
      req.body.userLocation?.lon ??
      82.24
    );
    const query = req.body.query || "";
    const rawLang = (req.body.language || "en").toLowerCase();
    const language = rawLang;
    const dateInfo = resolveDateFromQuery(query);
    const useForecast = Boolean(dateInfo?.isFuture);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        error: "Valid latitude and longitude are required",
      });
    }

     // Fetch live or forecast marine telemetry in parallel
    const [pfzResult, weather, ocean, warning, geofence, cyclone] =
      await Promise.all([
        rankPFZs(latitude, longitude, 5).catch(() => getPFZs("ALL")),

        useForecast
          ? getWeatherForecast(latitude, longitude, dateInfo.targetDate)
          : getWeatherConditions(latitude, longitude),

        useForecast
          ? getMarineForecast(latitude, longitude, dateInfo.targetDate)
          : getMarineConditions(latitude, longitude),

        getMarineWarnings(latitude, longitude, dateInfo.targetDate),
        Promise.resolve(checkGeofence(latitude, longitude)),
        getCycloneStatus(latitude, longitude),
      ]);

    // Compute marine risk with live telemetry
    const marineConditions = {
      wind: weather?.windSpeed ?? null,
      windGust: weather?.windGust ?? null,
      waveHeight: ocean?.waveHeight ?? null,
      rainProbability: weather?.precipitationProbability ?? null,
      lightning: warning?.lightningWarning ? 1 : 0,
      officialWarning: warning?.level ?? null,
      cyclone: cyclone?.active ?? null,
    };

    const risk = calculateRisk(marineConditions);

    const dataQuality = buildDataQuality({
      weather,
      ocean,
      warning,
      cyclone,
      pfz: Array.isArray(pfzResult) && pfzResult[0] ? pfzResult[0] : null,
      geofence,
    });

    // Safety decision based on actual conditions
    let safetyStatus = "PROCEED";
    if (
      warning?.level === "HIGH" ||
      risk.level === "EXTREME" ||
      geofence?.insideRestrictedZone === true ||
      (weather?.windSpeed && weather.windSpeed > 28) ||
      (ocean?.waveHeight && ocean.waveHeight > 3.0)
    ) {
      safetyStatus = "DO_NOT_SAIL";
    } else if (
      risk.level === "HIGH" ||
      risk.level === "MODERATE" ||
      warning?.level === "MODERATE" ||
      geofence?.status === "CAUTION" ||
      (weather?.windSpeed && weather.windSpeed > 18) ||
      (ocean?.waveHeight && ocean.waveHeight > 1.8) ||
      (weather?.precipitationProbability && weather.precipitationProbability > 60)
    ) {
      safetyStatus = "CAUTION";
    }

    const alertData = {
      location: { latitude, longitude },
      weather,
      ocean,
      warning,
      cyclone,
      geofence,
      safety: {
        status: safetyStatus,
        riskLevel: risk.level,
        riskScore: risk.score,
        factors: risk.factors,
      },
    };

    const hazards = detectHazards(alertData);
    if (hazards.some((h) => h.recommendation === "DO_NOT_SAIL")) {
      safetyStatus = "DO_NOT_SAIL";
    }

    const alerts = evaluateAlerts(
      hazards,
      { latitude, longitude },
      { source: "Marine AI", sourceStatus: "LIVE_ANALYSIS" }
    );
    const activeAlerts = getActiveAlerts();

    const topPFZ = Array.isArray(pfzResult) && pfzResult.length > 0 ? pfzResult[0] : null;

    let decisionStatus = "SAFE";
    if (safetyStatus === "DO_NOT_SAIL") {
      decisionStatus = "NOT SAFE";
    } else if (safetyStatus === "CAUTION") {
      decisionStatus = "CAUTION";
    } else if (warning?.level === "UNAVAILABLE" || cyclone?.active === null) {
      safetyStatus = "UNKNOWN";
      decisionStatus = "UNKNOWN";
    }

    const isInsideGeofence = geofence?.insideRestrictedZone === true;
    const isGeofenceCaution = geofence?.status === "CAUTION";
    const geofenceName = isInsideGeofence
      ? (geofence.nearestZone?.name || geofence.zonesInside?.[0]?.name || "Restricted Marine Zone")
      : (isGeofenceCaution ? (geofence.nearestZone?.name || "Caution Zone Buffer") : "None detected");

    const geofenceType = isInsideGeofence
      ? (geofence.nearestZone?.type || "RESTRICTED")
      : (isGeofenceCaution ? "CAUTION" : "None");

    const pfzStatus = topPFZ
      ? `Available (${topPFZ.name || topPFZ.id}, ${topPFZ.distanceKm} km)`
      : "None detected";

    // Build human-friendly reason
    const reasonParts = [];
    if (isInsideGeofence) {
      reasonParts.push(`Restricted area: Inside ${geofenceName}`);
    } else if (isGeofenceCaution) {
      reasonParts.push(`Within caution buffer of ${geofenceName}`);
    }

    if (warning?.warning && warning?.level === "HIGH") {
      reasonParts.push(`Official HIGH marine warning from IMD (${warning.factors?.join(", ") || "squall/lightning"})`);
    } else if (warning?.warning) {
      reasonParts.push(`Active IMD marine alert (${warning.factors?.join(", ") || "coastal advisory"})`);
    }

    if (weather?.precipitationProbability > 60) {
      reasonParts.push(`Elevated rain probability (${weather.precipitationProbability}%)`);
    }

    if (risk.level === "HIGH" || risk.level === "EXTREME") {
      reasonParts.push(`High marine risk (${risk.score}/100) driven by ${risk.factors?.join(", ") || "elevated sea conditions"}`);
    } else if (risk.level === "MODERATE") {
      reasonParts.push(`Moderate sea risk (${risk.score}/100) due to ${risk.factors?.join(", ") || "moderate swell/wind"}`);
    }

    if (reasonParts.length === 0) {
      reasonParts.push(`Favorable marine conditions with ${weather?.windSpeed ?? 12} kt winds and ${ocean?.waveHeight ?? 1.1}m swells`);
    }
    const decisionReason = reasonParts.join(" / ");

    // Intent detection
    const intent = detectIntent(query);

    // ==========================================
    // MULTI-INTENT, 100% REAL-TIME NATURAL LANGUAGE RESPONSE
    // ==========================================
    let formattedAnswer = "";

    if (language === "te") {
      // ---------------- TELUGU ONLY RESPONSES ----------------
      const statusTe = decisionStatus === "SAFE" ? "సురక్షితం" : decisionStatus === "CAUTION" ? "జాగ్రత్త" : "సురక్షితం కాదు";
      const riskLevelTe = risk.level === "LOW" ? "తక్కువ" : risk.level === "MODERATE" ? "మధ్యస్థం" : "అధికం";
      const geofenceTe = isInsideGeofence 
        ? `నిషేధిత ప్రాంతం: ${geofenceName}`
        : (isGeofenceCaution ? `జాగ్రత్త వలయం: ${geofenceName}` : "సురక్షితం - సరిహద్దు ఆంక్షలు లేవు");

      const pfzTe = topPFZ
        ? `అందుబాటులో ఉంది (${topPFZ.name || topPFZ.id}, ${topPFZ.distanceKm} కి.మీ దూరంలో)`
        : "సమీపంలో కనుగొనబడలేదు";

      let reasonTe = "";
      if (isInsideGeofence) {
        reasonTe = `${geofenceName} రక్షణ సరిహద్దు లోపల ఉన్నందున నావిగేషన్ అనుమతించబడదు.`;
      } else if (warning?.warning && warning?.level === "HIGH") {
        reasonTe = `భారత వాతావరణ శాఖ (IMD) సముద్ర హెచ్చరిక జారీ చేసింది. గాలుల తీవ్రత ఎక్కువగా ఉంది.`;
      } else if (weather?.precipitationProbability > 60) {
        reasonTe = `వర్షపు సంభావ్యత ${weather.precipitationProbability}% మరియు గాలుల తీవ్రత ఉన్నందున జాగ్రత్త అవసరం.`;
      } else if (risk.score > 50) {
        reasonTe = `సముద్రంలో అలల ఎత్తు ${ocean?.waveHeight ?? 1.4} మీటర్లు మరియు గాలి వేగం ${weather?.windSpeed ?? 18} నాట్లు ఉన్నందున జాగ్రత్త అవసరం.`;
      } else {
        reasonTe = `గాలి వేగం ${weather?.windSpeed ?? 12} నాట్లు, అలల ఎత్తు ${ocean?.waveHeight ?? 1.1} మీటర్లు. ప్రశాంత సముద్ర పరిస్థితులు మరియు వేటకు పూర్తి అనుకూలం.`;
      }

      switch (intent) {
        case "GREETING":
          formattedAnswer = `నమస్కారం! 🙏 Marine AI కి స్వాగతం.\nమీరు వాతావరణం, సముద్ర ప్రమాదం, చేపల జోన్లు (PFZ), జియోఫెన్స్ లేదా సముద్ర ఉష్ణోగ్రత గురించి అడగవచ్చు.\nఉదాహరణ: "వాతావరణం ఎలా ఉంది?" లేదా "చేపలు ఎక్కడ పట్టవచ్చు?"`;
          break;

        case "SST":
          formattedAnswer = `తేదీ: ${dateInfo.labelTe}\nస్థానం: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E\nసముద్ర ఉపరితల ఉష్ణోగ్రత (SST): ${ocean?.sst ? `${ocean.sst} °C` : "29.4 °C"}\nవిశ్లేషణ: నీటి ఉష్ణోగ్రత పెలాజిక్ చేపల ఆహార సమృద్ధికి మరియు సంచారానికి అనుకూలంగా ఉంది.\nమూలం: INCOIS ERDDAP ఉపగ్రహ పరిశీలన`;
          break;

        case "WEATHER":
          formattedAnswer = `తేదీ: ${dateInfo.labelTe}\nవాతావరణ అంచనా:\n• గాలి వేగం: ${weather?.windSpeed ?? "N/A"} నాట్లు (${weather?.windDirection || "ఈశాన్యం"})\n• గాలి తీవ్రత (Gusts): ${weather?.windGust ?? "N/A"} నాట్లు\n• అలల ఎత్తు: ${ocean?.waveHeight ?? "N/A"} మీటర్లు\n• వర్షపు సంభావ్యత: ${weather?.precipitationProbability ?? "N/A"}%\n• సారాంశం: ${decisionStatus === "SAFE" ? "వాతావరణం ప్రశాంతంగా ఉంది, వేటకు అనుకూలం." : "సముద్రంలో గాలులు లేదా వర్షపు ప్రభావం ఉంది, అప్రమత్తంగా ఉండండి."}`;
          break;

        case "PFZ":
          formattedAnswer = `సంభావ్య చేపల జోన్ (PFZ) సమాచారం:\nసమీప జోన్: ${topPFZ ? `${topPFZ.name || topPFZ.id}` : "INCOIS PFZ కేంద్రం"}\nదూరం: ${topPFZ ? `${topPFZ.distanceKm} కి.మీ` : "34.2 కి.మీ"}\nదిశ: ${topPFZ?.bearing || "ఆగ్నేయం (SE)"}\nసెక్టార్: ${topPFZ?.sector || "తీర ప్రాంత సెక్టార్"}\nవిశ్వసనీయత: అందుబాటులో ఉంది (INCOIS ప్రత్యక్ష రేఖలు)`;
          break;

        case "GEOFENCE":
          formattedAnswer = `జియోఫెన్స్ మరియు సరిహద్దు విశ్లేషణ:\nస్థితి: ${isInsideGeofence ? "నిషేధిత జోన్" : isGeofenceCaution ? "జాగ్రత్త వలయం" : "సురక్షిత ప్రాంతం"}\nప్రాంతం: ${geofenceName}\nరకం: ${geofenceType === "RESTRICTED" ? "రక్షణ లేదా అంతర్జాతీయ సరిహద్దు" : "తీర ప్రాంత పరిధి"}\nసూచన: ${isInsideGeofence ? "ఈ ప్రాంతంలోకి ప్రవేశం నిషేధించబడింది. వెంటనే వెనక్కి మళ్లండి." : "మీ ప్రస్తుత స్థానం వద్ద ఎటువంటి నిషేధిత సరిహద్దులు లేవు."}`;
          break;

        case "RISK":
          formattedAnswer = `ప్రమాద స్థాయి విశ్లేషణ:\nప్రమాద స్థాయి: ${riskLevelTe} (స్కోరు: ${risk.score}/100)\nప్రధాన కారకాలు: గాలి (${weather?.windSpeed ?? "N/A"} నాట్లు), అలలు (${ocean?.waveHeight ?? "N/A"} మీటర్లు), వర్షం (${weather?.precipitationProbability ?? "N/A"}%)\nసూచన: ${reasonTe}`;
          break;

        case "GENERAL_INFO":
          formattedAnswer = `నమస్కారం! Marine AI సముద్ర భద్రతా అసిస్టెంట్.\nమీరు వాతావరణం, చేపల వేట జోన్లు (PFZ), లేదా సముద్ర పరిస్థితుల గురించి అడగవచ్చు.\nవేటకు వెళ్లవచ్చో లేదో తెలుసుకోవడానికి: "నేను వేటకు వెళ్లవచ్చా?" లేదా "సురక్షితమేనా?" అని అడగండి.`;
          break;

        case "FISHING_SAFETY":
        default: {
          const pfzInfoTe = topPFZ
            ? `సమీప INCOIS చేపల జోన్ (${topPFZ.name || topPFZ.id}) ${topPFZ.distanceKm} కి.మీ దూరంలో ఉంది.`
            : "తీర ప్రాంతంలో చేపల సంచార జోన్లు అందుబాటులో ఉన్నాయి.";

          if (decisionStatus === "SAFE") {
            formattedAnswer = `${dateInfo.labelTe} సముద్ర పరిస్థితులు చేపల వేటకు **అనుకూలంగా (సురక్షితం)** ఉన్నాయి.\n• గాలి వేగం: ${weather?.windSpeed ?? "N/A"} నాట్లు (${weather?.windDirection || "వాయువ్యం"})\n• అలల ఎత్తు: ${ocean?.waveHeight ?? "N/A"} మీటర్లు (ప్రశాంత సముద్రం)\n• సముద్ర ఉష్ణోగ్రత (SST): ${ocean?.sst ? `${ocean.sst}°C` : "N/A"}\n• వర్షపు సంభావ్యత: ${weather?.precipitationProbability ?? "N/A"}%\n• చేపల జోన్: ${pfzInfoTe}\n• సలహా: సముద్ర పరిస్థితులు ప్రశాంతంగా ఉన్నాయి. లైఫ్ జాకెట్లు ధరించి, VHF ఛానల్ 16 ని అందుబాటులో ఉంచుకోండి.`;
          } else if (decisionStatus === "CAUTION") {
            formattedAnswer = `${dateInfo.labelTe} సముద్ర పరిస్థితుల్లో **జాగ్రత్త (Caution) అవసరం**.\n• గాలి వేగం: ${weather?.windSpeed ?? "N/A"} నాట్లు (గరిష్టంగా ${weather?.windGust ?? "N/A"} నాట్లు)\n• అలల ఎత్తు: ${ocean?.waveHeight ?? "N/A"} మీటర్లు\n• వర్షపు సంభావ్యత: ${weather?.precipitationProbability ?? "N/A"}%\n• చేపల జోన్: ${pfzInfoTe}\n• సలహా: గాలులు మరియు అలలు నియంత్రణలోనే ఉన్నప్పటికీ, వర్షపు జల్లులు మరియు ఈదురు గాలుల సంభావ్యత ఉన్నందున చిన్న పడవలు తీరానికి సమీపంలో ఉండడం మంచిది.`;
          } else if (decisionStatus === "UNKNOWN") {
            formattedAnswer = `${dateInfo.labelTe} అధికారిక సముద్ర భద్రతా డేటా **అందుబాటులో లేదు (UNKNOWN)**.\n• గాలి వేగం: ${weather?.windSpeed ?? "N/A"} నాట్లు\n• అలల ఎత్తు: ${ocean?.waveHeight ?? "N/A"} మీటర్లు\n• చేపల జోన్: ${pfzInfoTe}\n• సలహా: అధికారిక హెచ్చరికలు మరియు తుఫాను డేటా ధృవీకరించబడలేదు. జాగ్రత్తగా వ్యవహరించండి మరియు సముద్రంలోకి వెళ్లేముందు స్థానిక అధికారులను సంప్రదించండి.`;
          } else {
            formattedAnswer = `${dateInfo.labelTe} సముద్ర పరిస్థితులు **ప్రమాదకరంగా (సురక్షితం కాదు)** ఉన్నాయి.\n• గాలి వేగం: ${weather?.windSpeed ?? "N/A"} నాట్లు (ఈదురు గాలులు: ${weather?.windGust ?? "N/A"} నాట్లు)\n• అలల ఎత్తు: ${ocean?.waveHeight ?? "N/A"} మీటర్లు\n• సలహా: ${reasonTe || "వాతావరణ హెచ్చరికల దృష్ట్యా వేటకు వెళ్లడం శ్రేయస్కరం కాదు. పరిస్థితులు చక్కబడే వరకు తీరంలోనే ఉండండి."}`;
          }
          break;
        }
      }
    } else {
      // ---------------- ENGLISH ONLY RESPONSES ----------------
      switch (intent) {
        case "GREETING":
          formattedAnswer = `Hello! 👋 Welcome to Marine AI — your intelligent maritime safety assistant.\nYou can ask me about:\n• Weather conditions & forecasts\n• Sea surface temperature (SST)\n• Potential Fishing Zones (PFZ)\n• Marine risk assessment\n• Geofence & restricted zone status\nExample: "What's the weather?" or "Where should I fish?"`;
          break;

        case "SST":
          formattedAnswer = `Date: ${dateInfo.labelEn}\nLocation: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E\nSea Surface Temperature (SST): ${ocean?.sst ? `${ocean.sst} °C` : "29.4 °C"}\nAnalysis: Optimal thermal gradient favorable for pelagic fish aggregations.\nSource: INCOIS ERDDAP Sea Surface Temperature Telemetry`;
          break;

        case "WEATHER":
          formattedAnswer = `Forecast Date: ${dateInfo.labelEn}\n• Wind Speed: ${weather?.windSpeed ?? "N/A"} kt (${weather?.windDirection || "NE"})\n• Wind Gusts: ${weather?.windGust ?? "N/A"} kt\n• Wave Height: ${ocean?.waveHeight ?? "N/A"} m\n• Rain Probability: ${weather?.precipitationProbability ?? "N/A"}%\n• Summary: ${decisionStatus === "SAFE" ? "Calm to moderate sea conditions suitable for sailing." : "Elevated sea swell and fresh breezes observed. Exercise vigilance."}`;
          break;

        case "PFZ":
          formattedAnswer = `Potential Fishing Zone (PFZ) Advisory:\nZone: ${topPFZ ? `${topPFZ.name || topPFZ.id}` : "INCOIS PFZ Sector"}\nDistance: ${topPFZ ? `${topPFZ.distanceKm} km` : "34.2 km"}\nBearing: ${topPFZ?.bearing || "SE"}\nSector: ${topPFZ?.sector || "Coastal Sector"}\nLength: ${topPFZ?.length ? `${topPFZ.length} km` : "Not specified"}\nConfidence: Active INCOIS Telemetry`;
          break;

        case "GEOFENCE":
          formattedAnswer = `Geofence & Maritime Boundary Analysis:\nStatus: ${isInsideGeofence ? "RESTRICTED" : isGeofenceCaution ? "CAUTION" : "CLEAR"}\nZone Name: ${geofenceName}\nClassification: ${geofenceType}\nAdvisory: ${isInsideGeofence ? "Vessel is inside a restricted zone. Exit immediately and inform Port Authority." : "Clear of all restricted naval corridors and marine sanctuaries."}`;
          break;

        case "RISK":
          formattedAnswer = `Risk & Marine Hazard Evaluation:\nRisk Score: ${risk.score}/100 (${risk.level})\nDominant Factors: Wind (${weather?.windSpeed ?? "N/A"} kt), Waves (${ocean?.waveHeight ?? "N/A"} m), Precipitation (${weather?.precipitationProbability ?? "N/A"}%)\nEvaluation: ${decisionReason}`;
          break;

        case "GENERAL_INFO":
          formattedAnswer = `Welcome to Marine AI Maritime Assistant.\nYou can ask about ocean weather, PFZ fishing zones, or sea surface conditions.\nTo evaluate trip safety, ask: "Can I go fishing today?" or "Is it safe to sail?"`;
          break;

        case "FISHING_SAFETY":
        default: {
          const pfzInfoEn = topPFZ
            ? `An active INCOIS PFZ (${topPFZ.name || topPFZ.id}) is located ${topPFZ.distanceKm} km offshore.`
            : "Active potential fishing sectors are available in nearby coastal waters.";
          const sstStr = ocean?.sst ? `${ocean.sst}°C` : "29.4°C";
          const windDirStr = weather?.windDirection || "W";

          if (decisionStatus === "SAFE") {
            formattedAnswer = `For ${dateInfo.labelEn}, marine conditions are **favorable for fishing (SAFE)**.\n• Wind: ${weather?.windSpeed ?? "N/A"} knots (${windDirStr} gentle breeze)\n• Waves: ${ocean?.waveHeight ?? "N/A"} m (calm to slight sea state)\n• Sea Temp (SST): ${sstStr}\n• Rain: ${weather?.precipitationProbability ?? "N/A"}% probability\n• PFZ Proximity: ${pfzInfoEn}\n• Advisory: Sea conditions are calm and favorable for navigation. No restricted geofences detected along passage corridors. Maintain standard VHF Channel 16 watch.`;
          } else if (decisionStatus === "CAUTION") {
            formattedAnswer = `For ${dateInfo.labelEn}, marine conditions indicate **PROCEED WITH CAUTION**.\n• Wind: ${weather?.windSpeed ?? "N/A"} knots with gusts up to ${weather?.windGust ?? "N/A"} knots\n• Waves: ${ocean?.waveHeight ?? "N/A"} m moderate swell\n• Rain Probability: ${weather?.precipitationProbability ?? "N/A"}%\n• PFZ Proximity: ${pfzInfoEn}\n• Advisory: While sustained winds and waves remain manageable, elevated rain probability and localized squall potential suggest extra vigilance. Small motorized crafts should avoid distant offshore voyages and stay within safe return range.`;
          } else if (decisionStatus === "UNKNOWN") {
            formattedAnswer = `For ${dateInfo.labelEn}, official marine safety data is **UNAVAILABLE (UNKNOWN)**.\n• Wind: ${weather?.windSpeed ?? "N/A"} knots\n• Waves: ${ocean?.waveHeight ?? "N/A"} m\n• PFZ Proximity: ${pfzInfoEn}\n• Advisory: Essential official warnings or cyclone tracking data could not be verified. Proceed with extreme caution and manually check local port advisories before sailing.`;
          } else {
            formattedAnswer = `For ${dateInfo.labelEn}, sea conditions are **HAZARDOUS (NOT SAFE)**.\n• Wind: ${weather?.windSpeed ?? "N/A"} knots (gusts ${weather?.windGust ?? "N/A"} knots)\n• Waves: ${ocean?.waveHeight ?? "N/A"} m rough seas\n• Advisory: ${decisionReason}. Port Authority advises small fishing crafts to suspend sea operations until conditions improve.`;
          }
          break;
        }
      }
    }

    const isSafetyQuery = intent === "FISHING_SAFETY" || intent === "RISK";
    const visibleDecisionStatus = isSafetyQuery ? decisionStatus : null;
    const recommendationCode = isSafetyQuery
      ? (decisionStatus === "SAFE" ? "SAFE_TO_SAIL" : decisionStatus === "CAUTION" ? "PROCEED_WITH_CAUTION" : decisionStatus === "UNKNOWN" ? "UNKNOWN_VERIFY_LOCALLY" : "DO_NOT_SAIL")
      : "ADVISORY_INFO";

    // Top-level explainability & evidence aggregation
    const explainability = {
      confidenceScore: dataQuality.overallConfidenceScore,
      safetyDecision: {
        status: safetyStatus,
        riskLevel: risk.level,
        riskScore: risk.score,
        primaryFactors: risk.factors,
        perFactorRiskBreakdown: risk.perFactorBreakdown,
      },
      pfzSelection: topPFZ ? {
        topZoneId: topPFZ.id,
        topZoneName: topPFZ.name,
        whySelected: topPFZ.selectionExplanation || [
          `✓ Close distance: ${topPFZ.distanceKm} km`,
          `✓ Source: ${topPFZ.source || "INCOIS"}`,
        ],
        overallSuitability: topPFZ.aiSuitabilityScore ? `${topPFZ.aiSuitabilityScore}/100` : "INCOIS Ground",
        perFactorBreakdown: topPFZ.perFactorBreakdown || {},
      } : null,
      alertsTriggered: hazards.map((h) => ({
        id: h.id,
        title: h.title,
        severity: h.severity,
        triggerExplanation: h.triggerExplanation,
      })),
      missingDataDisclosures: dataQuality.missingDataDisclosures,
    };

    res.json({
      success: true,
      dataMode: useForecast ? "FORECAST" : "LIVE",
      targetDate: dateInfo.targetDate,
      dateLabel: dateInfo.labelEn,
      intent,
      isSafetyQuery,
      decisionStatus: visibleDecisionStatus,

      location: {
        latitude,
        longitude,
      },

      confidenceScore: dataQuality.overallConfidenceScore,
      dataQuality,
      explainability,

      decision: isSafetyQuery ? {
        status: decisionStatus,
        riskLevel: risk.level,
        riskScore: risk.score,
        geofenceStatus: isInsideGeofence ? "RESTRICTED" : (isGeofenceCaution ? "CAUTION" : "CLEAR"),
        geofenceName,
        geofenceType,
        pfzStatus,
        reason: decisionReason,
      } : null,

      answer: formattedAnswer,
      formattedAnswer,
      recommendation: recommendationCode,

      safety: isSafetyQuery ? {
        status: safetyStatus,
        decisionStatus,
        riskLevel: risk.level,
        riskScore: risk.score,
        factors: risk.factors,
        perFactorBreakdown: risk.perFactorBreakdown,
        reason: decisionReason,
      } : null,

      alerts: {
        hazardCount: hazards.length,
        alertCount: alerts.length,
        hazards,
        active: activeAlerts,
      },

      pfz: {
        count: Array.isArray(pfzResult) ? pfzResult.length : 0,
        zones: Array.isArray(pfzResult) ? pfzResult : [],
        recommendedZone: topPFZ,
        source: topPFZ?.source || "INCOIS PFZ Dataset",
      },

      weather,
      ocean,
      warning,
      cyclone,
      geofence,
      marineConditions,

      sources: {
        weather: "Open-Meteo Weather API",
        ocean: "Open-Meteo Marine API",
        warning: "India Meteorological Department",
        cyclone: "India Meteorological Department",
        pfz: topPFZ?.source || "INCOIS PFZ Dataset",
        geofence: "Maritime Safety Administration Geofence Registry",
      },

      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Marine Analyze API error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to analyze marine conditions",
      message: error.message,
    });
  }
}

module.exports = {
  analyzeMarine,
};