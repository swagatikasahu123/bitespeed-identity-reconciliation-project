const express = require("express");
const router = express.Router();
const { handleIdentify } = require("../controllers/identifyController");

// POST /identify
router.post("/", handleIdentify);

module.exports = router;
