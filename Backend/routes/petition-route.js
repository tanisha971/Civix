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
  getOfficialAnalytics,
  getPetitionById
} from "../controllers/petitionController.js";
import { getPetitionById } from "../controllers/petitionController.js";
const router = express.Router();

// Get all petitions
router.get("/", getPetitions);
router.get("/:id", getPetitionById);

// Create a new petition
router.post("/", authMiddleware, createPetition);

// Sign a petition
router.post("/:id/sign", authMiddleware, signPetition);

// Edit a petition
router.put("/:id", authMiddleware, editPetition);

// Delete a petition
router.delete("/:id", authMiddleware, deletePetition);

// Public Official only routes
router.put("/:id/status", authMiddleware, publicOfficialMiddleware, updatePetitionStatus);
router.put("/:id/verify", authMiddleware, publicOfficialMiddleware, verifyPetition);
router.post("/:petitionId/response", authMiddleware, publicOfficialMiddleware, addOfficialResponse);
router.get("/analytics", authMiddleware, publicOfficialMiddleware, getOfficialAnalytics);

export default router;
