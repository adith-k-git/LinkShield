
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { analyzeUrl } = require("./services/urlAnalyzer");
const { checkSafeBrowsing } = require("./services/safeBrowsing");
const connectDB = require("./config/db");
const Scan = require("./models/Scan");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "10kb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "LinkShield API is running",
  });
});

// Scan URL and save complete results to MongoDB
app.post("/api/scan", async (req, res) => {
  try {
    // Step 1: Basic URL analysis
    const result = analyzeUrl(req.body?.url);

    // Step 2: Google Safe Browsing check
    const threatCheck = await checkSafeBrowsing(result.url);

    // Step 3: Update risk assessment if a known threat is detected
    if (threatCheck.status === "unsafe") {
      result.score = 100;
      result.assessment = "Known threat detected";

      result.warnings.push({
        code: "GOOGLE_SAFE_BROWSING",
        message: threatCheck.message,
      });
    }

    // Step 4: Save complete scan to MongoDB
    const savedScan = await Scan.create({
      url: result.url,
      hostname: result.hostname,
      score: result.score,
      assessment: result.assessment,
      warnings: result.warnings,

      threatStatus: threatCheck.status,
      threatTypes: threatCheck.threatTypes,
      threatCheckedAt: new Date(),
    });

    // Step 5: Return results to frontend
    res.json({
      ...result,
      id: savedScan._id,
      threatCheck,
    });
  } catch (error) {
    console.error("Scan failed:", error.message);

    res.status(400).json({
      error: error.message,
    });
  }
});

// Get recent scan history
app.get("/api/scans", async (req, res) => {
  try {
    const scans = await Scan.find()
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(scans);
  } catch (error) {
    console.error("Failed to fetch scans:", error.message);

    res.status(500).json({
      error: "Unable to retrieve scan history",
    });
  }
});

// Start server after database connection
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `LinkShield API running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start LinkShield:", error.message);
    process.exit(1);
  }
};

startServer();
