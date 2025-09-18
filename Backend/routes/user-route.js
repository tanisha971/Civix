import express from "express";
import User from "../models/user.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Protected route to fetch user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile fetched", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
