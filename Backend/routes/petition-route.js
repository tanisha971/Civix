import express from "express";
import { 
  getPetitions, 
  createPetition, 
  signPetition, 
  editPetition, 
  deletePetition 
} from "../controllers/petitionController.js";
import { authMiddleware } from "../middleware/auth.js"; // make sure you have this
import { getPetitionById } from "../controllers/petitionController.js";
const router = express.Router();

// Get all petitions
router.get("/", getPetitions);
router.get("/:id", getPetitionById);

// Create a new petition (only logged-in users)
router.post("/", authMiddleware, createPetition);

// Sign a petition (only once per user)
router.post("/:id/sign", authMiddleware, signPetition);

// Edit petition (only creator)
router.put("/:id", authMiddleware, editPetition);

// Delete petition (only creator)
router.delete("/:id", authMiddleware, deletePetition);

export default router;
