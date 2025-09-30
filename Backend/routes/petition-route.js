import express from "express";
import authMiddleware, { publicOfficialMiddleware } from "../middleware/auth.js";
import { 
  getPetitions, 
  createPetition,
  signPetition,
  editPetition,
  deletePetition,
  updatePetitionStatus,
  verifyPetition,
  addOfficialResponse,
  getOfficialAnalytics
} from "../controllers/petitionController.js";
import { getPetitionById } from "../controllers/petitionController.js";
const router = express.Router();

// Public routes
router.get("/", getPetitions);
router.get("/:id", getPetitionById);

// Authenticated user routes
router.post("/", authMiddleware, createPetition);
router.post("/:id/sign", authMiddleware, signPetition);
router.put("/:id", authMiddleware, editPetition);
router.delete("/:id", authMiddleware, deletePetition);

// Public Official only routes
router.put("/:id/status", authMiddleware, publicOfficialMiddleware, updatePetitionStatus);
router.put("/:id/verify", authMiddleware, publicOfficialMiddleware, verifyPetition);
router.post("/:petitionId/response", authMiddleware, publicOfficialMiddleware, addOfficialResponse);
router.get("/analytics", authMiddleware, publicOfficialMiddleware, getOfficialAnalytics);

export default router;
