import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function resetPassword(email, newPassword) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log('User found:', user.name);
    console.log('Current password hash:', user.password.substring(0, 30) + '...');

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('New password hash:', hashedPassword.substring(0, 30) + '...');

    // Update directly bypassing middleware
    await User.findByIdAndUpdate(
      user._id,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    console.log('Password reset successful!');
    console.log('You can now login with:');
    console.log('Email:', email);
    console.log('Password:', newPassword);

    // Verify the password works
    const updatedUser = await User.findOne({ email }).select('+password');
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('Password verification:', isMatch ? 'SUCCESS' : 'FAILED');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email and password from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node resetPassword.js <email> <password>');
  console.log('Example: node resetPassword.js tanishaali89@gmail.com NewPass123');
  process.exit(1);
}

resetPassword(email, password);