import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  });
};

// Register user
export const register = async (req, res) => {
  try {
    const { name, email, password, location, role, department, position } = req.body;

    if (!name || !email || !password || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const userData = {
      name,
      email,
      password,
      location,
      role: role || 'citizen'
    };

    if (role === 'public-official') {
      userData.department = department;
      userData.position = position;
      userData.verified = true; // AUTO-VERIFY PUBLIC OFFICIALS
    }

    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      department: user.department,
      position: user.position,
      verified: user.verified
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Format user data for frontend
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      address: user.address,
      // Format location properly
      location: user.location ? {
        type: user.location.type,
        coordinates: user.location.coordinates
      } : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if this is an admin login attempt
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    const isAdminEmail = adminEmails.includes(email);

    if (isAdminEmail) {
      // Admin login - verify against env credentials
      const adminPasswords = process.env.ADMIN_PASSWORDS?.split(',').map(p => p.trim()) || [];
      const adminIndex = adminEmails.indexOf(email);
      const adminPassword = adminPasswords[adminIndex];

      // Check if password matches env password OR hashed password
      const isEnvPasswordMatch = password === adminPassword;
      const isHashedPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isEnvPasswordMatch && !isHashedPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      // Ensure user has admin role
      if (user.role !== 'admin') {
        user.role = 'admin';
        user.isVerified = true;
        await user.save();
      }

      console.log('✅ Admin login successful:', email);
    } else {
      // Regular user login
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Prevent non-admins from having admin role
      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: "Unauthorized admin access attempt",
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Format user data for response
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      address: user.address,
      // Don't send location object in login response
    };

    // Return user data
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Export as 'login' for backwards compatibility
export const login = loginUser;

// Logout user
export const logout = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// Create official
export const createOfficial = async (req, res) => {
  try {
    const { name, email, password, location, department, position } = req.body;
    
    const official = new User({
      name,
      email,
      password,
      location,
      role: 'public-official',
      department,
      position,
      verified: true
    });

    await official.save();
    
    res.json({ 
      success: true, 
      message: "Public Official account created successfully"
    });
  } catch (error) {
    console.error('Create official error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error creating official account",
      error: error.message
    });
  }
};
