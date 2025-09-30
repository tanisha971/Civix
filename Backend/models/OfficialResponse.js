// Backend: Create OfficialResponse model
import mongoose from 'mongoose';

const officialResponseSchema = new mongoose.Schema({
  petition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Petition',
    required: true
  },
  official: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['update', 'response', 'timeline', 'closure'],
    default: 'response'
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('OfficialResponse', officialResponseSchema);

// Controller for official responses
export const addOfficialResponse = async (req, res) => {
  try {
    const { petitionId } = req.params;
    const { message, type, isPublic } = req.body;
    const officialId = req.user.id;

    if (req.user.role !== 'official') {
      return res.status(403).json({ 
        message: "Only officials can add responses" 
      });
    }

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