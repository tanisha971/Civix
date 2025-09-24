import express from "express";
import { getPetitions, createPetition } from "../controllers/petitionController.js";

const router = express.Router();

router.get("/", getPetitions);
router.post("/", createPetition);

export default router;
