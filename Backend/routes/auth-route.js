import express from "express";
import { register, login, getProfile, logout, createOfficial } from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.post("/logout", logout);
router.post("/create-official", createOfficial); // Admin route

export default router;
