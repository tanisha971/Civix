import mongoose from "mongoose";

const SignatureSchema = new mongoose.Schema({
  petition: { type: mongoose.Schema.Types.ObjectId, ref: "Petition", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Signature", SignatureSchema);
