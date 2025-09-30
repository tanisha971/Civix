import Petition from "../models/Petition.js";
import Signature from "../models/Signature.js";

// Get all petitions, newest first
export const getPetitions = async (req, res) => {
  try {
    const petitions = await Petition.find()
      .populate("creator", "_id name")
      .populate("signatures")
      .sort({ createdAt: -1 }); // newest first
    const currentUserId = req.user?.id;
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
      signaturesCount: p.signatures.length,
      signedByCurrentUser: currentUserId
        ? p.signatures.map(sig => sig.toString()).includes(currentUserId)
        : false
    }));

    res.json({ petitions: formatted });
  } catch (err) {
    res.status(500).json({ message: "Error fetching petitions", error: err.message });
  }
};

// Create a petition
export const createPetition = async (req, res) => {
  try {
    const newPetition = new Petition({
      ...req.body,
      creator: req.user?.id || req.body.creatorId || null
    });

    const saved = await newPetition.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error creating petition", error: err.message });
  }
};

// Sign a petition (one time per user)
export const signPetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ message: "Petition not found" });

    // Prevent duplicate signatures
    if (petition.signatures.map(sig => sig.toString()).includes(req.user.id)) {
      return res.status(400).json({ message: "You have already signed this petition" });
    }

    petition.signatures.push(req.user.id);
    await petition.save();

    res.json({ message: "Signed petition successfully", petition });
  } catch (err) {
    res.status(500).json({ message: "Error signing petition", error: err.message });
  }
};

export const getPetitionById = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ message: "Petition not found" });
    res.json({ petition });
  } catch (err) {
    res.status(500).json({ message: "Error fetching petition", error: err.message });
  }
};
// Edit petition (only creator)
export const editPetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ message: "Petition not found" });

    if (petition.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own petition" });
    }

    Object.assign(petition, req.body); // update allowed fields
    await petition.save();

    res.json({ message: "Petition updated successfully", petition });
  } catch (err) {
    res.status(500).json({ message: "Error editing petition", error: err.message });
  }
};

// Delete petition (only creator)
export const deletePetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ message: "Petition not found" });

    if (petition.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own petition" });
    }

    await petition.deleteOne();
    res.json({ message: "Petition deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting petition", error: err.message });
  }
};
