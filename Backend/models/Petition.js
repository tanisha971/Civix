import mongoose from "mongoose";

const petitionSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true },
    category: { type: String, required: true, maxlength: 100 },
    location: { type: String, required: true },
    geo: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    },
    status: { 
      type: String, 
      enum: ["active", "under_review", "closed"], 
      default: "active" 
    },
    signatureGoal: { type: Number, default: 100 },
    signaturesCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

petitionSchema.index({ geo: "2dsphere" });

const Petition = mongoose.model("Petition", petitionSchema);
export default Petition;
