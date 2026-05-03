import express from "express";
import {
  getAllServices,
  getServiceById,
  createService,
  getMyServices,
  updateService,
  toggleAvailability,
  deleteService,
  getAllServicesAdmin,
  approveService,
} from "../controllers/service.controller.js";
import protect from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const router = express.Router();

// ── Public Routes ──
router.get("/", getAllServices);
router.get("/:id", getServiceById);

// ── Provider Routes ──
router.post("/", protect, authorize("provider"), createService);
router.get("/my/services", protect, authorize("provider"), getMyServices);
router.patch("/:id", protect, authorize("provider"), updateService);
router.patch("/:id/toggle", protect, authorize("provider"), toggleAvailability);
router.delete("/:id", protect, authorize("provider", "admin"), deleteService);

// ── Admin Routes ──
router.get("/admin/all", protect, authorize("admin"), getAllServicesAdmin);
router.patch("/:id/approve", protect, authorize("admin"), approveService);

export default router;
