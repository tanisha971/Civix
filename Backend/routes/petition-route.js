import express from "express";
import Petition from "../models/Petition.js";
import Signature from "../models/Signature.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ✅ Create Petition
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, category, location, signatureGoal, lat, lng } = req.body;

    const petition = new Petition({
      creator: req.user.id,
      title,
      description,
      category,
      location,
      signatureGoal,
      geo: lat && lng ? { type: "Point", coordinates: [lng, lat] } : undefined
    });

    await petition.save();
    res.status(201).json(petition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Edit Petition (only by creator)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ error: "Petition not found" });
    if (petition.creator.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized" });

    const { title, description, category, location, status, signatureGoal, lat, lng } = req.body;
    if (title) petition.title = title;
    if (description) petition.description = description;
    if (category) petition.category = category;
    if (location) petition.location = location;
    if (status) petition.status = status;
    if (signatureGoal) petition.signatureGoal = signatureGoal;
    if (lat && lng) petition.geo = { type: "Point", coordinates: [lng, lat] };

    await petition.save();
    res.json(petition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Sign Petition (one per user)
router.post("/:id/sign", authMiddleware, async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ error: "Petition not found" });

    // Check if user already signed
    const existing = await Signature.findOne({ petition: petition._id, user: req.user.id });
    if (existing) return res.status(400).json({ error: "You have already signed this petition" });

    // Add signature
    const signature = new Signature({ petition: petition._id, user: req.user.id });
    await signature.save();

    petition.signaturesCount += 1;
    await petition.save();

    res.json({ message: "Signed successfully", petition });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Petitions with filters & optional geo-radius
router.get("/", async (req, res) => {
  try {
    const { category, location, status, lat, lng, radius = 10 } = req.query;

    let filters = {};
    if (category && category !== "All Categories") filters.category = category;
    if (location && location !== "All Locations") filters.location = location;
    if (status && status !== "All Status") {
      filters.status = status.toLowerCase() === "successful" ? "closed" : status.toLowerCase();
    }

    if (lat && lng) {
      filters.geo = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius / 6378.1] // radius in km
        }
      };
    }

    const petitions = await Petition.find(filters)
      .populate("creator", "name email")
      .sort({ createdAt: -1 });

    res.json(petitions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
