// authService.js
import api from "./api";

// Login function
export const login = async (email, password) => {
  try {
    console.log("Logging in:", email);
    const response = await api.post("/auth/login", { email, password });
    
    if (response.data.success && response.data.user) {
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      console.log("Storing user data:", response.data.user);
      return { success: true, user: response.data.user };
    }
    
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error("Login error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Login failed" 
    };
  }
};

// Register function
export const register = async (name, email, password) => {
  try {
    console.log("Registering:", email);
    const response = await api.post("/auth/register", { name, email, password });
    
    if (response.data.success) {
      return { success: true, message: response.data.message };
    }
    
    return { success: false, message: response.data.message };
  } catch (error) {
    console.error("Registration error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Registration failed" 
    };
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    console.log("Fetching user profile...");
    const response = await api.get("/auth/profile");
    console.log("Profile data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem("user");
  window.location.href = "/login";
};

// Create a default export object with all functions
const authService = {
  login,
  register,
  getUserProfile,
  logout
};

export default authService;
