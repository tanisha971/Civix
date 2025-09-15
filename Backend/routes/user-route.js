import express from "express";
import { createUser, verifyUser } from "../controllers/user.js";

const router = express.Router();

router.post("/signup", createUser);
router.post("/signin", verifyUser);

export default router;
