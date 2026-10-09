const crypto = require("crypto");

async function queryAi(req, res) {
  try {
    const query = req.body.query;
    const context = req.body.context || {};
    if (req.body.userLocation) context.userLocation = req.body.userLocation;
    if (req.body.language) context.language = req.body.language;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({ success: false, error: "Non-empty query is required." });
    }

    const requestId = `req-${crypto.randomUUID()}`;

    // Dynamically import the AI orchestrator to bridge CommonJS to ES Module
    let orchestrator;
    try {
      orchestrator = await import("../../../ai/orchestrator.js");
    } catch (e) {
      console.error("Failed to load orchestrator module:", e);
      return res.status(500).json({ success: false, error: "AI subsystem unavailable." });
    }

    // Call orchestrator
    const result = await orchestrator.processQuery(
      query,
      { executeTools: true, verbose: false },
      context
    );

    // Extract Tool Trace properly
    const toolCalls = [];
    let safetyStatus = "UNKNOWN";
    let routeDecision = "BLOCKED";

    if (result.toolResults) {
      for (const [toolName, output] of Object.entries(result.toolResults)) {
        toolCalls.push({
          tool: toolName,
          input: {}, // Input is hard to extract cleanly without altering orchestrator, leaving empty obj or parsing tasks
          output: output
        });

        if (toolName === "findSafeRoute" || toolName === "analyzeMarine") {
           // We extract safetyStatus directly from deterministic tool output
           const actualSafetyStatus = output.data?.safetyStatus || output.safetyStatus;
           if (actualSafetyStatus) safetyStatus = actualSafetyStatus;
           
           if (safetyStatus === "SAFE" || safetyStatus === "CAUTION") {
             routeDecision = output.success ? "ALLOWED" : "BLOCKED";
           } else {
             routeDecision = "BLOCKED";
           }
        }
      }
    }

    // Fallbacks if no route was generated but intent was detected
    if (safetyStatus === "UNKNOWN" && result.intentDetails?.safetyStatus) {
       safetyStatus = result.intentDetails.safetyStatus;
    }

    const responsePayload = {
      requestId,
      intent: result.intentDetails || {},
      plan: result.tasks || [],
      toolCalls,
      deterministicDecision: {
        safetyStatus,
        routeDecision
      },
      synthesis: result.answer || "No response generated."
    };

    return res.json(responsePayload);

  } catch (error) {
    console.error("AI Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process AI query",
      details: error.message
    });
  }
}

module.exports = {
  queryAi
};
