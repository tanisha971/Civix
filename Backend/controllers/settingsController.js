import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Get user settings
export const getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      location: user.locationString || "",
      avatar: user.profilePicture || null,
      role: user.role,
      department: user.department,
      position: user.position,
      verified: user.verified || user.isVerified,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, location } = req.body;

    console.log('Profile update request:', { name, email, location });

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields
    user.name = name;
    user.email = email;
    if (location !== undefined) {
      user.locationString = location;
    }

    await user.save();

    console.log('Profile updated successfully for user:', user._id);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      locationString: user.locationString,
      location: user.locationString,
      avatar: user.profilePicture,
      role: user.role,
      department: user.department,
      position: user.position,
      verified: user.verified || user.isVerified,
    };

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Change password - FIXED: Manual hashing to prevent double-hashing
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    console.log("Password change request for user:", req.user.id);

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    // Validate new password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Verifying current password for user:", req.user.id);

    // Verify current password
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordMatch) {
      console.log("Current password incorrect for user:", req.user.id);
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    console.log("Current password verified, hashing new password");

    // FIXED: Hash password manually and update using findByIdAndUpdate to bypass pre-save hook
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(
      req.user.id,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    console.log("Password changed successfully for user:", req.user.id);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
      error: error.message,
    });
  }
};

// Upload avatar (base64)
export const uploadAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    console.log("Avatar upload request for user:", req.user.id);

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "No avatar data provided",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.profilePicture = avatar;
    await user.save();

    console.log("Avatar uploaded successfully for user:", user._id);

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: user.profilePicture,
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete avatar
export const deleteAvatar = async (req, res) => {
  try {
    console.log("Avatar delete request for user:", req.user.id);

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.profilePicture = "";
    await user.save();

    console.log("Avatar deleted successfully for user:", user._id);

    res.json({
      success: true,
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};