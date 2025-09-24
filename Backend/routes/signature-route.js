import express from "express";
import Signature from "../models/Signature.js";
import Petition from "../models/Petition.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Sign a petition
router.post("/:petitionId", authMiddleware, async (req, res) => {
  try {
    const { petitionId } = req.params;
    const userId = req.user.id;

    // Prevent duplicate signing
    const alreadySigned = await Signature.findOne({ petition: petitionId, user: userId });
    if (alreadySigned) {
      return res.status(400).json({ message: "You already signed this petition" });
    }

    // Save signature
    const signature = new Signature({ petition: petitionId, user: userId });
    await signature.save();

    // Update petition count
    await Petition.findByIdAndUpdate(petitionId, { $inc: { signaturesCount: 1 } });

    res.status(201).json(signature);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get petitions signed by a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const signed = await Signature.find({ user: userId }).populate("petition");

    if (!signed || signed.length === 0) return res.status(200).json([]);

    const petitions = signed.map(s => s.petition);
    res.json(petitions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching signed petitions" });
  }
});

export default router;
