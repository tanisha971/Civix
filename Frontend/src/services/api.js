// src/services/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is essential for cookies to be sent
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
    if (user) {
      const token = JSON.parse(user).token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error.response?.data || error.message);

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log("Unauthorized - user not logged in or token expired");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export const getProfile = async () => {
  try {
    const res = await api.get("/users/profile");
    return res.data; // expects { user: {...} }
  } catch (err) {
    console.error("Error fetching profile:", err.response?.data?.message);
    throw err;
  }
};

export default api;
