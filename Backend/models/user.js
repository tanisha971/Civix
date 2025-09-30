import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, required: true },
  role: { type: String, enum: ["citizen", "public-official"], required: true },
  // Public Official specific fields
  department: {
    type: String,
    required: function() { return this.role === 'public-official'; }
  },
  position: {
    type: String,
    required: function() { return this.role === 'public-official'; }
  },
  verified: {
    type: Boolean,
    default: function() { return this.role === 'citizen'; }
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);