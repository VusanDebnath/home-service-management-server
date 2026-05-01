import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// .env load করো
dotenv.config();

// Express app তৈরি
const app = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares ──
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
  }),
);
app.use(express.json());
// express.json() → request body থেকে JSON parse করে

// ── Database Connect ──
connectDB();

// ── Test Route ──
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🏠 Home Service API Running...",
    version: "1.0.0",
  });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Server Start ──
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
