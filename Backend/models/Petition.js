import mongoose from "mongoose";

const PetitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String },
  lat: Number,
  lng: Number,
  signatureGoal: { type: Number, default: 100 },
  status: { type: String, enum: ["active", "under_review", "closed"], default: "active" },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  signatures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Signature" }]
}, { timestamps: true });

export default mongoose.model("Petition", PetitionSchema);
