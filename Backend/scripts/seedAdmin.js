import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmails = process.env.ADMIN_EMAILS.split(',').map(e => e.trim());
    const adminPasswords = process.env.ADMIN_PASSWORDS.split(',').map(p => p.trim());
    const adminNames = process.env.ADMIN_NAMES.split(',').map(n => n.trim());

    for (let i = 0; i < adminEmails.length; i++) {
      const email = adminEmails[i];
      const password = adminPasswords[i];
      const name = adminNames[i];

      // Check if admin already exists
      const existingAdmin = await User.findOne({ email });

      if (existingAdmin) {
        console.log(`Admin already exists: ${email}`);
        
        // Update password if changed
        const hashedPassword = await bcrypt.hash(password, 10);
        existingAdmin.password = hashedPassword;
        existingAdmin.role = 'admin';
        existingAdmin.isVerified = true;
        await existingAdmin.save();
        console.log(`✅ Updated admin: ${email}`);
      } else {
        // Create new admin
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const admin = await User.create({
          name,
          email,
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
          location: {
            type: 'Point',
            coordinates: [0, 0]
          },
          address: {
            street: 'Admin',
            city: 'System',
            state: 'Admin',
            zipCode: '00000',
            country: 'System'
          }
        });

        console.log(`✅ Created admin: ${email}`);
      }
    }

    console.log('✅ Admin seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin seeding error:', error);
    process.exit(1);
  }
};

seedAdmins();