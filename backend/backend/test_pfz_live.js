const { getBestFishingZones } = require("./services/pfzRecommendationService");
const { rankPFZs } = require("./services/pfzService");

async function runLivePFZTest() {
    console.log("--- E2E LIVE PFZ TEST ---");
    const latitude = 17.68;
    const longitude = 83.21;
    
    console.log(`Getting best fishing zones for: ${latitude}, ${longitude}`);
    
    try {
        const result = await getBestFishingZones({ latitude, longitude });
        
        console.log("PFZ Best Selection Success:", result.success);
        
        if (result.success) {
            console.log("\nRECOMMENDED PFZ:");
            console.log("ID:", result.recommendedZone.id);
            console.log("Name:", result.recommendedZone.name);
            console.log("Distance:", result.recommendedZone.distanceKm, "km");
            console.log("SST:", result.recommendedZone.sst, `(Status: ${result.recommendedZone.sstStatus})`);
            console.log("Chlorophyll:", result.recommendedZone.chlorophyll, `(Status: ${result.recommendedZone.chlorophyllStatus})`);
            console.log("Score:", result.recommendedZone.aiSuitabilityScore);
            console.log("Missing Data Disclosure:", result.recommendedZone.missingDataDisclosure);
            console.log("Selection Explanation:\n", result.recommendedZone.selectionExplanation.join("\n "));
            console.log("Rejection reason:", result.recommendedZone.rejectionReason);

            if (result.alternatives && result.alternatives.length > 0) {
                console.log("\nTOP ALTERNATIVE PFZ:");
                console.log("ID:", result.alternatives[0].id);
                console.log("Distance:", result.alternatives[0].distanceKm, "km");
                console.log("SST:", result.alternatives[0].sst, `(Status: ${result.alternatives[0].sstStatus})`);
                console.log("Chlorophyll:", result.alternatives[0].chlorophyll, `(Status: ${result.alternatives[0].chlorophyllStatus})`);
                console.log("Score:", result.alternatives[0].aiSuitabilityScore);
                console.log("Rejection reason:", result.alternatives[0].rejectionReason);
            }
        } else {
            console.log("Message:", result.message);
        }
    } catch (e) {
        console.error("Test Error:", e);
    }
}

runLivePFZTest().catch(console.error);
