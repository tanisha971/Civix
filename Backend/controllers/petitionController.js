import Petition from "../models/Petition.js";
import Signature from "../models/Signature.js";

// Get all petitions
export const getPetitions = async (req, res) => {
  try {
    const petitions = await Petition.find().populate("creator", "_id name").populate("signatures");
    const formatted = petitions.map(p => ({
      _id: p._id,
      title: p.title,
      category: p.category,
      description: p.description,
      location: p.location,
      lat: p.lat,
      lng: p.lng,
      signatureGoal: p.signatureGoal,
      status: p.status,
      creator: p.creator,
      createdAt: p.createdAt,
      signaturesCount: p.signatures.length
    }));
    res.json({ petitions: formatted });
  } catch (err) {
    res.status(500).json({ message: "Error fetching petitions" });
  }
};

// Create petition
export const createPetition = async (req, res) => {
  try {
    const newPetition = new Petition({
      ...req.body,
      creator: req.body.creatorId || null
    });
    const saved = await newPetition.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error creating petition" });
  }
};
