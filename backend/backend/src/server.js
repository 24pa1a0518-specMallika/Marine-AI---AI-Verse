const express = require("express");
const cors = require("cors");
require("dotenv").config();

const riskRoutes = require("./routes/riskRoutes");
const geofenceRoutes = require("./routes/geofenceRoutes");
const marineAnalyzeRoutes = require("./routes/marineAnalyzeRoutes");
const alertRoutes = require("./routes/alertRoutes");
const pfzRoutes = require("./routes/pfzRoutes");
const currentsRoutes = require("./routes/currentsRoutes");

let liveDataRoutes, sstRoutes, marineRouteRoutes, fishingRouteRoutes, routeRoutes;

try { liveDataRoutes = require("./routes/liveDataRoutes"); } catch (e) { console.warn("Notice: liveDataRoutes not loaded:", e.message); }
try { sstRoutes = require("./routes/sstRoutes"); } catch (e) { console.warn("Notice: sstRoutes not loaded:", e.message); }
try { marineRouteRoutes = require("./routes/marineRouteRoutes"); } catch (e) { console.warn("Notice: marineRouteRoutes not loaded:", e.message); }
try { fishingRouteRoutes = require("./routes/fishingRouteRoutes"); } catch (e) { console.warn("Notice: fishingRouteRoutes not loaded:", e.message); }
try { routeRoutes = require("./routes/routeRoutes"); } catch (e) { console.warn("Notice: routeRoutes not loaded:", e.message); }
let aiRoutes;
try { aiRoutes = require("./routes/aiRoutes"); } catch (e) { console.warn("Notice: aiRoutes not loaded:", e.message); }

const app = express();

// ========================================
// CORS & MIDDLEWARE
// ========================================
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(",").map(s => s.trim()) 
  : "*";

app.use(cors({
  origin: allowedOrigins === "*" ? "*" : allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

const PORT = process.env.PORT || 5000;

// ========================================
// HEALTH CHECK ENDPOINTS (Member 6 Specification)
// ========================================

// Exact Member 6 specification: GET /health
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Marine AI",
  });
});

// Backward-compatible endpoint: GET /api/health
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Marine AI",
    message: "Marine AI backend is running",
    services: {
      risk: "active",
      geofence: "active",
      pfz: "active",
      alerts: "active",
      routes: "active",
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// MOUNT ROUTES
// ========================================
if (liveDataRoutes) app.use("/api", liveDataRoutes);
app.use("/api/marine", riskRoutes);
app.use("/api/marine/geofence", geofenceRoutes);
app.use("/api/geofence", geofenceRoutes);

if (pfzRoutes) app.use("/api/pfz", pfzRoutes);
if (sstRoutes) app.use("/api/marine/sst", sstRoutes);
if (marineRouteRoutes) app.use("/api/route", marineRouteRoutes);
if (fishingRouteRoutes) app.use("/api/fishing-route", fishingRouteRoutes);
if (routeRoutes) app.use("/api/route", routeRoutes);
if (marineAnalyzeRoutes) app.use("/api/marine/analyze", marineAnalyzeRoutes);
if (alertRoutes) app.use("/api/alerts", alertRoutes);
if (aiRoutes) app.use("/api/ai", aiRoutes);
if (currentsRoutes) app.use("/api/currents", currentsRoutes);

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// ========================================
// START SERVER
// ========================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Marine AI backend running on port ${PORT}`);
    console.log(`Health endpoint: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
