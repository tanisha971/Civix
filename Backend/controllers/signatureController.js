import Petition from "../models/Petition.js";
import Signature from "../models/Signature.js";

// Sign a petition
export const signPetition = async (req, res) => {
  try {
    const { petitionId } = req.params;
    const userId = req.body.userId || req.query.userId;

    const petition = await Petition.findById(petitionId);
    if (!petition) return res.status(404).json({ message: "Petition not found" });

    const existing = await Signature.findOne({ petition: petitionId, user: userId });
    if (existing) return res.status(400).json({ message: "Already signed" });

    const signature = new Signature({ petition: petitionId, user: userId });
    await signature.save();

    petition.signatures.push(signature._id);
    await petition.save();

    res.json({ message: "Petition signed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error signing petition" });
  }
};

// Get signed petitions by user
export const getSignedPetitionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const signatures = await Signature.find({ user: userId }).populate("petition");
    res.json(signatures.map(s => s.petition));
  } catch (err) {
    res.status(500).json({ message: "Error fetching signed petitions" });
  }
};
