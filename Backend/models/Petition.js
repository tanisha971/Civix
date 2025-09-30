import mongoose from "mongoose";

const PetitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String },
  lat: Number,
  lng: Number,
  signatureGoal: { type: Number, default: 100 },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["active", "under_review", "closed"], default: "active" },
  signatures: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
// Official review fields
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
  officialResponse: { type: String },
  timeline: { type: String },
  verified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verifiedAt: { type: Date },
  verificationNote: { type: String }
}, { timestamps: true });

export default mongoose.model("Petition", PetitionSchema);
