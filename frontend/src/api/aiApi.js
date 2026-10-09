import { withFallback } from './client';
import * as endpoints from './endpoints';
import { adaptAiResponse } from './adapters';

/**
 * Generate intelligent, query-aware real-time marine fallback response
 * when live backend is temporarily unreachable or experiencing latency.
 * @param {Object} queryInput - { query, userLocation, language }
 */
export function generateDynamicMarineFallback(queryInput = {}) {
  const query = (queryInput.query || '').trim().toLowerCase();
  const lang = (queryInput.language || 'en').toLowerCase();
  const lat = Number(queryInput.userLocation?.latitude ?? 16.98).toFixed(4);
  const lon = Number(queryInput.userLocation?.longitude ?? 82.24).toFixed(4);
  const now = new Date();
  const todayStr = now.toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Detect query intent
  const isSafetyQuery = [
    'can i go', 'can we go', 'is it safe', 'safe to go', 'safe to fish',
    'allowed to go', 'should i go', 'fishing today', 'sail today', 'safety',
    'వెళ్లవచ్చా', 'సురక్షితమేనా', 'వేటకు పోవచ్చా', 'సేఫ్ ఆ'
  ].some(k => query.includes(k));

  const isGreeting = [
    'hello', 'hi', 'hey', 'hii', 'good morning', 'good evening',
    'నమస్కారం', 'నమస్తే', 'హలో'
  ].some(k => query === k || query.startsWith(k + ' '));

  const isWeather = [
    'weather', 'wind', 'rain', 'wave', 'swell', 'forecast',
    'వాతావరణం', 'గాలి', 'వర్షం', 'అలలు'
  ].some(k => query.includes(k));

  const isSst = [
    'sst', 'temperature', 'water temp', 'sea surface', 'ఉష్ణోగ్రత'
  ].some(k => query.includes(k));

  const isPfz = [
    'pfz', 'fish zone', 'where to fish', 'fish aggregation', 'catch',
    'చేపలు ఎక్కడ', 'చేపల జోన్'
  ].some(k => query.includes(k));

  const isGeofence = [
    'geofence', 'boundary', 'restricted', 'sanctuary', 'coringa',
    'సరిహద్దు', 'నిషేధిత'
  ].some(k => query.includes(k));

  if (lang === 'te') {
    if (isGreeting) {
      return {
        intent: 'GREETING',
        answer: `నమస్కారం! 🙏 Marine AI కి స్వాగతం.\nప్రస్తుత స్థానం: ${lat}° N, ${lon}° E.\nమీరు వాతావరణం, సముద్ర భద్రత, లేదా చేపల జోన్ల గురించి అడగవచ్చు. (గమనిక: ప్రస్తుత లైవ్ డేటా అందుబాటులో లేదు).`,
        isSafetyQuery: false,
        confidence: 0.95
      };
    }

    return {
      intent: 'UNAVAILABLE',
      decisionStatus: 'UNKNOWN',
      isSafetyQuery: true,
      answer: `క్షమించండి, ప్రస్తుత లైవ్ డేటా మరియు AI సేవలు అందుబాటులో లేవు. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.`,
      recommendation: 'సమాచారం అందుబాటులో లేదు.',
      evidence: {},
      confidence: 0.0
    };
  }

  // English Responses
  if (isGreeting) {
    return {
      intent: 'GREETING',
      answer: `Hello! 👋 Welcome to Marine AI.\nVessel location: ${lat}° N, ${lon}° E.\nYou can ask about ocean weather, fishing safety, nearest PFZ. (Note: Live data is currently unavailable).`,
      isSafetyQuery: false,
      confidence: 0.95
    };
  }

  return {
    intent: 'UNAVAILABLE',
    decisionStatus: 'UNKNOWN',
    isSafetyQuery: true,
    answer: `I apologize, but live data and AI services are currently unavailable. Please try again later.`,
    recommendation: 'Data unavailable.',
    evidence: {},
    confidence: 0.0
  };
}

/**
 * Execute Agentic AI Query Analysis
 * @param {Object} queryInput - { query, userLocation, language }
 */
export async function analyzeMarineQuery(queryInput = {}) {
  const dynamicFallback = generateDynamicMarineFallback(queryInput);
  return withFallback(
    async () => {
      const res = await endpoints.marineAnalyze(queryInput);
      const adapted = adaptAiResponse(res);
      return adapted;
    },
    dynamicFallback,
    'AgenticAI'
  );
}
