import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getAllUsers,
  getUserById,
  toggleBlockUser,
  makeAdmin,
  deleteUser,
} from "../controllers/user.controller.js";
import protect from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const router = express.Router();

// ── Protected Routes (সবাই — login করলেই হবে) ──
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);
router.patch("/change-password", protect, changePassword);

// ── Admin Only Routes ──
router.get("/", protect, authorize("admin"), getAllUsers);
router.get("/:id", protect, authorize("admin"), getUserById);
router.patch("/:id/toggle-block", protect, authorize("admin"), toggleBlockUser);
router.patch("/:id/make-admin", protect, authorize("admin"), makeAdmin);
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;
