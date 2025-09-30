import Petition from "../models/Petition.js";
import Signature from "../models/Signature.js";
import OfficialResponse from "../models/OfficialResponse.js";

// Get all petitions
export const getPetitions = async (req, res) => {
  try {
    const { creator, category, search, status } = req.query;
    
    const filter = {};
    
    if (creator) filter.creator = creator;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const petitions = await Petition.find(filter)
      .populate("creator", "_id name")
      .populate("signatures")
      .sort({ createdAt: -1 }); // newest first
    const currentUserId = req.user ? req.user.id : null;

    // Format petitions to include signatures count and whether current user has signed
    const formatted = petitions.map(p => ({
      _id: p._id,
      title: p.title,
      category: p.category,
      description: p.description,
      location: p.location,
      signatureGoal: p.signatureGoal,
      status: p.status,
      creator: p.creator,
      createdAt: p.createdAt,
      signaturesCount: p.signatures.length,
      signedByCurrentUser: currentUserId ? p.signatures.map(sig => sig.toString()).includes(currentUserId) : false,
      verified: p.verified,
      officialResponse: p.officialResponse,
      userHasSigned: req.user ? p.signatures.includes(req.user.id) : false
    }));

    res.json({ 
      success: true,
      petitions: formatted,
      count: formatted.length
    });
  } catch (err) {
    console.error("Error fetching petitions:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching petitions", 
      error: err.message 
    });
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
    res.status(201).json({
      success: true,
      message: "Petition created successfully",
      petition: saved
    });
  } catch (err) {
    console.error("Error creating petition:", err);
    res.status(500).json({ 
      success: false,
      message: "Error creating petition", 
      error: err.message 
    });
  }
};

// Sign a petition
export const signPetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ 
        success: false,
        message: "Petition not found" 
      });
    }
    // Prevent duplicate signatures
    if (petition.signatures.map(sig => sig.toString()).includes(req.user.id)) {
      return res.status(400).json({ 
        success: false,
        message: "You have already signed this petition",
      });
    }

    petition.signatures.push(req.user.id);
    await petition.save();

    await Signature.create({ 
      user: req.user.id, 
      petition: petition._id 
    });

    res.status(201).json({ 
      success: true,
      message: "Petition signed successfully", 
      petition: {
        _id: petition._id,
        signaturesCount: petition.signatures.length
      }
    });
  } catch (err) {
    console.error("Error signing petition:", err);
    res.status(500).json({ 
      success: false,
      message: "Error signing petition", 
      error: err.message 
    });
  }
};

export const getPetitionById = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ 
        success: false,
        message: "Petition not found" 
      });
    }

    res.json({
      success: true,
      petition
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching petition" });
  }
};

// Edit petition (only creator)
export const editPetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ 
        success: false,
        message: "Petition not found" 
      });
    }

    if (petition.creator.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "You can only edit your own petition" 
      });
    }

    Object.assign(petition, req.body);
    await petition.save();

    res.json({ 
      success: true,
      message: "Petition updated successfully", 
      petition 
    });
  } catch (err) {
    console.error("Error editing petition:", err);
    res.status(500).json({ 
      success: false,
      message: "Error editing petition", 
      error: err.message 
    });
  }
};

// Delete petition (only creator)
export const deletePetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ 
        success: false,
        message: "Petition not found" 
      });
    }

    if (petition.creator.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "You can only delete your own petition" 
      });
    }

    await petition.deleteOne();
    await Signature.deleteMany({ petition: req.params.id });

    res.json({ 
      success: true,
      message: "Petition deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting petition:", err);
    res.status(500).json({ 
      success: false,
      message: "Error deleting petition", 
      error: err.message 
    });
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