import express from "express";
import {
  createReview,
  getServiceReviews,
  getMyReviews,
  getProviderReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import protect from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const router = express.Router();

// ── Public Routes ──
router.get("/service/:serviceId", getServiceReviews);

// ── Customer Routes ──
router.post("/", protect, authorize("customer"), createReview);
router.get("/my", protect, authorize("customer"), getMyReviews);

// ── Provider Routes ──
router.get("/provider", protect, authorize("provider"), getProviderReviews);

// ── Admin Routes ──
router.delete("/:id", protect, authorize("admin"), deleteReview);

export default router;
