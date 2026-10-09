import { processQuery } from "./orchestrator.js";
import { detectIntent } from "./agents/intentAgent.js";
import { createPlan } from "./agents/plannerAgent.js";

async function run() {
    const query = "Can I go fishing tomorrow morning, find the nearest suitable PFZ, and give me the safest route?";
    console.log("1. INTENT AGENT");
    const intentResult = await detectIntent(query);
    console.log("Intent Result:", intentResult);

    console.log("\n2. PLANNER AGENT");
    const plan = await createPlan(intentResult, query);
    console.log("Plan Result:", plan);
    
    // We can also run the full E2E through orchestrator
    console.log("\n3. ORCHESTRATOR EXECUTION");
    const result = await processQuery(query, { executeTools: true, verbose: true }, { lastLocation: { lat: 17.68, lon: 83.21 } });
    console.log("\nORCHESTRATOR RESULT:");
    console.log(JSON.stringify(result, null, 2));
}

run().catch(console.error);
