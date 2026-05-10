import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Routes import
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import reviewRoutes from "./routes/review.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173",
      "https://home-service-management-client-site.vercel.app/"
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Database
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🏠 Home Service API Running...",
    version: "1.0.0",
  });
});

// ── API Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);// User related routes (profile, admin user management)
app.use("/api/services", serviceRoutes);// Service related routes (CRUD, approval, etc.)
app.use("/api/bookings", bookingRoutes);// Booking related routes (CRUD, status updates, etc.)
app.use("/api/reviews", reviewRoutes);// Review related routes (CRUD, etc.)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
