import express from "express";
import {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  cancelBooking,
  confirmBooking,
  completeBooking,
  getAllBookings,
} from "../controllers/booking.controller.js";
import protect from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const router = express.Router();

// ── Customer Routes ──
router.post("/", protect, authorize("customer"), createBooking);
router.get("/my", protect, authorize("customer"), getMyBookings);
router.patch("/:id/cancel", protect, authorize("customer"), cancelBooking);

// ── Provider Routes ──
router.get("/provider", protect, authorize("provider"), getProviderBookings);
router.patch("/:id/confirm", protect, authorize("provider"), confirmBooking);
router.patch("/:id/complete", protect, authorize("provider"), completeBooking);

// ── Admin Routes ──
router.get("/", protect, authorize("admin"), getAllBookings);

// ── Shared (Customer + Provider + Admin) ──
router.get("/:id", protect, getBookingById);

export default router;
