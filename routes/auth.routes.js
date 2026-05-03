import express from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes — token লাগবে না
router.post("/register", register);
router.post("/login", login);

// Protected route — token লাগবে
router.get("/me", protect, getMe);

export default router;
