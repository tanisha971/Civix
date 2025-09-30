import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Use bcryptjs since you have it in package.json

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: true,
    select: false // Hide password by default
  },
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export default mongoose.model("User", userSchema);