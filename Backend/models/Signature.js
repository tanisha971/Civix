import mongoose from "mongoose";

const signatureSchema = new mongoose.Schema(
  {
    petition: { type: mongoose.Schema.Types.ObjectId, ref: "Petition", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, default: Date.now }
  }
);

signatureSchema.index({ petition: 1, user: 1 }, { unique: true }); // enforce 1 signature per user

const Signature = mongoose.model("Signature", signatureSchema);
export default Signature;
