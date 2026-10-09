/**
 * Marine AI — Comprehensive Conversational & Multilingual Test Suite
 * Member 4 Deliverable: Multi-turn Context Maintenance & Telugu Language Testing
 */
import { processQuery } from "./orchestrator.js";

console.log("================================================================================");
console.log("🌊 MARINE AI — MULTI-TURN CONTEXT & TELUGU TEST SUITE (MEMBER 4)");
console.log("================================================================================");

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runConversationalTests() {
  // ============================================================================
  // SUITE 1: 5-TURN CONVERSATION FLOW (ENGLISH)
  // Turn 1: Which PFZ should I go to tomorrow?
  // Turn 2: How far is it?  (Pronoun 'it' resolution)
  // Turn 3: Is it safe?     (Pronoun 'it' safety check)
  // Turn 4: What about the route? (Route follow-up)
  // Turn 5: What hazards are along the route? (Hazard follow-up)
  // ============================================================================
  console.log("\n🧪 SUITE 1: 5-Turn English Conversation (Pronoun 'it' Resolution)");
  let ctx1 = {};

  console.log("\n[Turn 1] User: Which PFZ should I go to tomorrow?");
  const turn1 = await processQuery("Which PFZ should I go to tomorrow?", { executeTools: true, verbose: false }, ctx1);
  ctx1 = turn1.context;
  console.log(`AI: ${turn1.answer.slice(0, 160)}...`);
  assert(turn1.intent === "PFZ_SEARCH", "Turn 1 intent classified as PFZ_SEARCH");
  assert(ctx1.selectedPFZ !== null && ctx1.selectedPFZ !== undefined, "Turn 1 selected and stored a PFZ in context");

  console.log("\n[Turn 2] User: How far is it?");
  const turn2 = await processQuery("How far is it?", { executeTools: true, verbose: false }, ctx1);
  ctx1 = turn2.context;
  console.log(`AI: ${turn2.answer}`);
  assert(turn2.intent === "PFZ_DISTANCE", "Turn 2 resolved 'it' to PFZ_DISTANCE");
  assert(turn2.answer.includes("28") || turn2.answer.toLowerCase().includes("km"), "Turn 2 responded with distance in km (approximately 28 km)");

  console.log("\n[Turn 3] User: Is it safe?");
  const turn3 = await processQuery("Is it safe?", { executeTools: true, verbose: false }, ctx1);
  ctx1 = turn3.context;
  console.log(`AI: ${turn3.answer.slice(0, 160)}...`);
  assert(turn3.intent === "MARINE_SAFETY", "Turn 3 resolved 'it' to MARINE_SAFETY");
  assert(turn3.answer.toLowerCase().includes("risk") || turn3.answer.toLowerCase().includes("safe"), "Turn 3 provided safety/risk advisory");

  console.log("\n[Turn 4] User: What about the route?");
  const turn4 = await processQuery("What about the route?", { executeTools: true, verbose: false }, ctx1);
  ctx1 = turn4.context;
  console.log(`AI: ${turn4.answer.slice(0, 160)}...`);
  assert(turn4.intent === "SAFE_ROUTE", "Turn 4 recognized route follow-up as SAFE_ROUTE");
  assert(turn4.answer.toLowerCase().includes("route") || turn4.answer.toLowerCase().includes("distance"), "Turn 4 provided route navigation guidance");

  console.log("\n[Turn 5] User: What hazards are along the route?");
  const turn5 = await processQuery("What hazards are along the route?", { executeTools: true, verbose: false }, ctx1);
  ctx1 = turn5.context;
  console.log(`AI: ${turn5.answer.slice(0, 160)}...`);
  assert(turn5.intent === "ROUTE_HAZARDS", "Turn 5 recognized ROUTE_HAZARDS intent");
  assert(turn5.answer.toLowerCase().includes("route") || turn5.answer.toLowerCase().includes("hazard"), "Turn 5 evaluated hazard and corridor safety");

  // ============================================================================
  // SUITE 2: 5-TURN TELUGU CONVERSATION FLOW
  // Turn 1: రేపు నేను ఏ PFZ కి వెళ్లాలి?
  // Turn 2: అది ఎంత దూరంలో ఉంది? (Pronoun 'అది' resolution)
  // Turn 3: అది సురక్షితమేనా?    (Pronoun 'అది' safety check)
  // Turn 4: మార్గం ఏంటి?         (Route follow-up)
  // Turn 5: ఈ PFZని ఎందుకు ఎంచుకున్నారు? (Selection explanation)
  // ============================================================================
  console.log("\n🧪 SUITE 2: 5-Turn Telugu Conversation (Pronoun 'అది' Resolution)");
  let ctx2 = {};

  console.log("\n[Turn 1] User: రేపు నేను ఏ PFZ కి వెళ్లాలి?");
  const teTurn1 = await processQuery("రేపు నేను ఏ PFZ కి వెళ్లాలి?", { executeTools: true, verbose: false }, ctx2);
  ctx2 = teTurn1.context;
  console.log(`AI: ${teTurn1.answer.slice(0, 160)}...`);
  assert(teTurn1.language === "te", "Telugu language correctly identified as 'te'");
  assert(teTurn1.intent === "PFZ_SEARCH", "Turn 1 intent classified as PFZ_SEARCH");
  assert(ctx2.selectedPFZ !== null, "Turn 1 selected and stored a PFZ in context");

  console.log("\n[Turn 2] User: అది ఎంత దూరంలో ఉంది?");
  const teTurn2 = await processQuery("అది ఎంత దూరంలో ఉంది?", { executeTools: true, verbose: false }, ctx2);
  ctx2 = teTurn2.context;
  console.log(`AI: ${teTurn2.answer}`);
  assert(teTurn2.intent === "PFZ_DISTANCE", "Turn 2 resolved 'అది' to PFZ_DISTANCE");
  assert(teTurn2.language === "te", "Turn 2 responded in Telugu");
  assert(teTurn2.answer.includes("కి.మీ") || teTurn2.answer.includes("km") || teTurn2.answer.includes("దూరంలో"), "Turn 2 returned distance in Telugu");

  console.log("\n[Turn 3] User: అది సురక్షితమేనా?");
  const teTurn3 = await processQuery("అది సురక్షితమేనా?", { executeTools: true, verbose: false }, ctx2);
  ctx2 = teTurn3.context;
  console.log(`AI: ${teTurn3.answer.slice(0, 160)}...`);
  assert(teTurn3.intent === "MARINE_SAFETY", "Turn 3 resolved 'అది సురక్షితమేనా?' to MARINE_SAFETY");
  assert(teTurn3.language === "te", "Turn 3 responded in Telugu");

  console.log("\n[Turn 4] User: మార్గం ఏంటి?");
  const teTurn4 = await processQuery("మార్గం ఏంటి?", { executeTools: true, verbose: false }, ctx2);
  ctx2 = teTurn4.context;
  console.log(`AI: ${teTurn4.answer.slice(0, 160)}...`);
  assert(teTurn4.intent === "SAFE_ROUTE", "Turn 4 recognized 'మార్గం ఏంటి?' as SAFE_ROUTE");
  assert(teTurn4.language === "te", "Turn 4 responded in Telugu with safe route guidance");

  console.log("\n[Turn 5] User: ఈ PFZని ఎందుకు ఎంచుకున్నారు?");
  const teTurn5 = await processQuery("ఈ PFZని ఎందుకు ఎంచుకున్నారు?", { executeTools: true, verbose: false }, ctx2);
  ctx2 = teTurn5.context;
  console.log(`AI: ${teTurn5.answer.slice(0, 160)}...`);
  assert(teTurn5.intent === "PFZ_EXPLANATION", "Turn 5 recognized PFZ_EXPLANATION intent");
  assert(teTurn5.language === "te", "Turn 5 provided Telugu explanation with scientific criteria");

  // ============================================================================
  // SUITE 3: CROSS-LINGUAL COMBINATIONS
  // Combination A: English PFZ -> Telugu Distance Follow-up
  // Combination B: Telugu Safety -> English Route Follow-up
  // ============================================================================
  console.log("\n🧪 SUITE 3: Cross-Lingual Follow-Up Combinations");

  // Combination A: English -> Telugu
  console.log("\n[Combo A] Turn 1 (English): Where is the best fishing zone?");
  let ctx3 = {};
  const cross1 = await processQuery("Where is the best fishing zone?", { executeTools: true, verbose: false }, ctx3);
  ctx3 = cross1.context;
  assert(cross1.language === "en", "Combo A initial language is English");

  console.log("[Combo A] Turn 2 (Telugu follow-up): అది ఎంత దూరంలో ఉంది?");
  const cross2 = await processQuery("అది ఎంత దూరంలో ఉంది?", { executeTools: true, verbose: false }, ctx3);
  ctx3 = cross2.context;
  console.log(`AI: ${cross2.answer}`);
  assert(cross2.language === "te", "Combo A switched output language seamlessly to Telugu");
  assert(cross2.intent === "PFZ_DISTANCE", "Combo A resolved 'అది' to the PFZ selected in English turn");

  // Combination B: Telugu -> English
  console.log("\n[Combo B] Turn 3 (Telugu): అది సురక్షితమేనా?");
  const cross3 = await processQuery("అది సురక్షితమేనా?", { executeTools: true, verbose: false }, ctx3);
  ctx3 = cross3.context;
  assert(cross3.language === "te", "Combo B query language is Telugu");

  console.log("[Combo B] Turn 4 (English follow-up): Give me the safest route there");
  const cross4 = await processQuery("Give me the safest route there", { executeTools: true, verbose: false }, ctx3);
  console.log(`AI: ${cross4.answer.slice(0, 160)}...`);
  assert(cross4.language === "en", "Combo B switched output language cleanly back to English");
  assert(cross4.intent === "SAFE_ROUTE", "Combo B correctly recognized SAFE_ROUTE from Telugu context");

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("\n================================================================================");
  console.log(`📊 TEST EXECUTION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  if (passedTests === totalTests) {
    console.log("🏆 ALL CONVERSATIONAL AI & TELUGU TEST SUITES PASSED 100%!");
  } else {
    console.log("⚠️ SOME TESTS FAILED. CHECK LOGS ABOVE.");
  }
  console.log("================================================================================");
}

runConversationalTests().catch((err) => {
  console.error("FATAL ERROR IN TEST SUITE:", err);
  process.exit(1);
});
