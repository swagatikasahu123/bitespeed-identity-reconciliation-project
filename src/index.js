const express = require("express");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const identifyRouter = require("./routes/identify");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware - Parse incoming JSON requests
app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({
    message: "✅ Bitespeed Identity Reconciliation API is running!",
    endpoint: "POST /identify",
  });
});

// ✅ Main route
app.use("/identify", identifyRouter);

// ✅ Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 Endpoint: POST http://localhost:${PORT}/identify`);
});

module.exports = app;
