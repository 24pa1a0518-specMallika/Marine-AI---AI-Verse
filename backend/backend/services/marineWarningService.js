const https = require("https");

const IMD_WARNING_URL =
  "https://mausam.imd.gov.in/imd_latest/contents/subdivisionwise-warning_mc.php?id=2";

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https
      .get(
        url,
        { rejectUnauthorized: false, timeout: 5000 },
        (response) => {
          let data = "";

          response.on("data", (chunk) => {
            data += chunk;
          });

          response.on("end", () => {
            if (response.statusCode !== 200) {
              return reject(
                new Error(
                  `IMD warning service returned status ${response.statusCode}`
                )
              );
            }

            resolve(data);
          });
        }
      )
      .on("timeout", () => req.destroy(new Error("IMD warning request timed out")))
      .on("error", reject);
  });
}

function cleanHTML(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseImdRows(html) {
  const rowRegex = /<tr\s+style=["'][^"']*background-color:\s*([^"';]+)[^"']*["'][^>]*>([\s\S]*?)<\/tr>/gi;
  let match;
  const rows = [];
  let inCoastalAP = false;

  while ((match = rowRegex.exec(html)) !== null) {
    const color = match[1].trim().toUpperCase();
    const text = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    if (text.includes("Warnings for Coastal Andhra Pradesh")) {
      inCoastalAP = true;
      continue;
    } else if (text.includes("Warnings for")) {
      inCoastalAP = false;
    }

    if (inCoastalAP && (text.includes("Day") || text.includes("September") || text.includes("Date"))) {
      rows.push({ color, text });
    }
  }

  return rows;
}

function classifyImdColor(colorHex) {
  const c = (colorHex || "").toUpperCase();
  if (c.includes("FF0000") || c.includes("FF3333") || c.includes("RED")) {
    return "HIGH"; // Warning (Take Action / Do Not Sail)
  }
  if (c.includes("FFA500") || c.includes("FF9900") || c.includes("ORANGE")) {
    return "MODERATE"; // Alert (Be Prepared / Caution)
  }
  if (c.includes("FFFF00") || c.includes("YELLOW")) {
    return "ADVISORY"; // Watch (Be Updated / Normal Operations with Awareness)
  }
  return "NORMAL"; // Green / No Warning
}

async function getMarineWarnings(latitude, longitude, targetDateStr = null) {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("Invalid latitude or longitude");
  }

  let html = "";
  try {
    html = await fetchText(IMD_WARNING_URL);
  } catch (e) {
    console.warn("[IMD Warning Service] Warning fetch failed:", e.message);
    return {
      source: "India Meteorological Department",
      sourceUrl: IMD_WARNING_URL,
      region: "Coastal Andhra Pradesh",
      latitude: lat,
      longitude: lon,
      level: "UNAVAILABLE",
      warning: null,
      isWatch: null,
      advisoryText: "IMD Marine Warning service is temporarily unavailable.",
      factors: [],
      lightningWarning: null,
      strongWindWarning: null,
      squallWarning: null,
      checkedAt: new Date().toISOString()
    };
  }

  const rows = parseImdRows(html);

  // Match target day or default to Day 1
  let selectedRow = null;
  if (targetDateStr) {
    // format e.g. "2026-09-08" -> "September 8"
    const dateObj = new Date(targetDateStr);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[dateObj.getMonth()];
    const dayNum = dateObj.getDate();
    const targetSubstr = `${monthName} ${dayNum}`;

    selectedRow = rows.find(r => r.text.includes(targetSubstr));
  }

  if (!selectedRow && rows.length > 0) {
    selectedRow = rows.find(r => r.text.startsWith("Day 1")) || rows[0];
  }

  if (!selectedRow) {
    return {
      source: "India Meteorological Department",
      sourceUrl: IMD_WARNING_URL,
      region: "Coastal Andhra Pradesh",
      latitude: lat,
      longitude: lon,
      level: "UNAVAILABLE",
      warning: null,
      isWatch: null,
      advisoryText: "Could not parse IMD Marine Warning data.",
      factors: [],
      lightningWarning: null,
      strongWindWarning: null,
      squallWarning: null,
      checkedAt: new Date().toISOString()
    };
  }

  const color = selectedRow.color;
  const rowText = selectedRow.text;
  const level = classifyImdColor(color);

  const lowerText = rowText.toLowerCase();
  const factors = [];
  if (lowerText.includes("squall")) factors.push("Squall Watch");
  if (lowerText.includes("thunderstorm") || lowerText.includes("lightning")) factors.push("Thunderstorm/Lightning Watch");
  if (lowerText.includes("strong surface winds")) factors.push("Fresh Breeze Winds");
  if (lowerText.includes("heavy rain")) factors.push("Heavy Rain Warning");

  return {
    source: "India Meteorological Department",
    sourceUrl: IMD_WARNING_URL,
    region: "Coastal Andhra Pradesh",
    latitude: lat,
    longitude: lon,
    level, // "NORMAL" | "ADVISORY" | "MODERATE" | "HIGH"
    warning: level === "HIGH" || level === "MODERATE",
    isWatch: level === "ADVISORY",
    advisoryText: rowText,
    factors: factors.length > 0 ? factors : ["Routine Coastal Weather Watch"],
    lightningWarning: level === "HIGH" && lowerText.includes("lightning"),
    strongWindWarning: (level === "HIGH" || level === "MODERATE") && lowerText.includes("wind"),
    squallWarning: level === "HIGH" && lowerText.includes("squall"),
    checkedAt: new Date().toISOString()
  };
}

module.exports = {
  getMarineWarnings
};