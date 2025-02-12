const express = require("express");
const router = express.Router();
const scanService = require("../services/scanService");
const { errorLogger } = require("../logger");

router.post("/run-compliance", async (_, res) => {
  try {
    const results = await scanService.runFullScan();
    res.json({ success: true, ...results });
  } catch (error) {
    errorLogger("Scan controller error:", error);
    res.status(500).json({ error: "Failed to run security scan" });
  }
});

module.exports = router;
