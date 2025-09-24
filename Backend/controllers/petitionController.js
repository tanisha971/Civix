import Petition from "../models/Petition.js";

// ✅ Create Petition
export const createPetition = async (req, res) => {
  try {
    const { title, description, category, location, signatureGoal, geo } = req.body;
    const petition = new Petition({
      creator: req.user._id, // logged in user
      title,
      description,
      category,
      location,
      signatureGoal,
      geo,
    });
    const saved = await petition.save();
    await saved.populate("creator", "name email _id"); // populate for frontend
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error creating petition", error: err.message });
  }
};

// ✅ Get Petitions (with filters)
export const getPetitions = async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const petitions = await Petition.find(query)
      .populate("creator", "name email _id")
      .sort({ createdAt: -1 });

    res.json({ petitions });
  } catch (err) {
    res.status(500).json({ message: "Error fetching petitions", error: err.message });
  }
};
