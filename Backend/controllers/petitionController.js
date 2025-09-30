import Petition from "../models/Petition.js";
import Signature from "../models/Signature.js";
import OfficialResponse from "../models/OfficialResponse.js";
import mongoose from "mongoose";

// Get all petitions
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
      signaturesCount: Array.isArray(p.signatures) ? p.signatures.length : 0,
      signedByCurrentUser: currentUserId
        ? (Array.isArray(p.signatures) && p.signatures
            .map(sig => (sig && sig._id ? sig._id.toString() : sig?.toString?.()))
            .includes(currentUserId))
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

// Sign a petition
export const signPetition = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Petition not found" });
    }
    const petition = await Petition.findById(id);
    if (!petition) return res.status(404).json({ message: "Petition not found" });

    // Prevent duplicate signatures
    if (petition.signatures.map(sig => sig.toString()).includes(req.user.id)) {
      return res.status(400).json({ message: "You have already signed this petition" });
    }

    petition.signatures.push(req.user.id);
    await petition.save();

    res.json({ message: "Signed petition successfully", petition });
  } catch (err) {
    if (err?.name === "CastError") {
      return res.status(404).json({ message: "Petition not found" });
    }
    console.error("Error signing petition:", err);
    res.status(500).json({ message: "Error signing petition", error: err.message });
  }
};


export const getPetitionById = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ message: "Petition not found" });
    res.json({ petition });
  } catch (error) {
    res.status(500).json({ message: "Error fetching petition", error: error.message });
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

    Object.assign(petition, req.body);
    await petition.save();

    res.json({ message: "Petition updated successfully", petition });
  } catch (err) {
    res.status(500).json({ message: "Error editing petition", error: err.message });
  }
};

// Delete petition (only creator)
export const deletePetition = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Petition not found" });
    }

    const petition = await Petition.findById(id);
    if (!petition) return res.status(404).json({ message: "Petition not found" });

    if (petition.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own petition" });
    }

    await petition.deleteOne();
    await Signature.deleteMany({ petition: id });

    res.json({ message: "Petition deleted successfully" });
  } catch (err) {
    if (err?.name === "CastError") {
      return res.status(404).json({ message: "Petition not found" });
    }
    console.error("Error deleting petition:", err);
    res.status(500).json({ message: "Error deleting petition", error: err.message });
  }
};

// Update petition status (Public Officials only)
export const updatePetitionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, officialResponse, timeline } = req.body;
    const officialId = req.user.id;

    const petition = await Petition.findById(id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    petition.status = status;
    petition.officialResponse = officialResponse;
    petition.reviewedBy = officialId;
    petition.reviewedAt = new Date();
    
    if (timeline) {
      petition.timeline = timeline;
    }

    await petition.save();

    res.json({
      success: true,
      message: "Petition status updated successfully",
      petition
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating petition status" });
  }
};

// Verify petition (Public Officials only)
export const verifyPetition = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, verificationNote } = req.body;
    const officialId = req.user.id;

    const petition = await Petition.findById(id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    petition.verified = verified;
    petition.verificationNote = verificationNote;
    petition.verifiedBy = officialId;
    petition.verifiedAt = new Date();

    await petition.save();

    res.json({
      success: true,
      message: `Petition ${verified ? 'verified' : 'marked as unverified'}`,
      petition
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying petition" });
  }
};

// Add official response
export const addOfficialResponse = async (req, res) => {
  try {
    const { petitionId } = req.params;
    const { message, type, isPublic } = req.body;
    const officialId = req.user.id;

    const response = new OfficialResponse({
      petition: petitionId,
      official: officialId,
      message,
      type,
      isPublic
    });

    await response.save();
    await response.populate('official', 'name department');

    res.json({
      success: true,
      message: "Official response added successfully",
      response
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding official response" });
  }
};

// Get analytics for public officials
export const getOfficialAnalytics = async (req, res) => {
  try {
    const totalPetitions = await Petition.countDocuments();
    const activePetitions = await Petition.countDocuments({ status: 'active' });
    const reviewedPetitions = await Petition.countDocuments({ status: 'under_review' });
    const closedPetitions = await Petition.countDocuments({ status: 'closed' });

    const petitionsByCategory = await Petition.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const petitionsByLocation = await Petition.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingPetitions = await Petition.find({
      createdAt: { $gte: thirtyDaysAgo }
    })
    .populate('creator', 'name')
    .sort({ 'signatures.length': -1 })
    .limit(10);

    const signatureTrends = await Signature.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalPetitions,
          activePetitions,
          reviewedPetitions,
          closedPetitions
        },
        petitionsByCategory,
        petitionsByLocation,
        trendingPetitions,
        signatureTrends
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics" });
  }
};