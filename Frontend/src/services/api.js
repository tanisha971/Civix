// src/services/api.js
import axios from "axios";

export const getProfile = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/users/profile", {
      withCredentials: true, // important to send JWT cookie
    });
    return res.data; // expects { user: {...} }
  } catch (err) {
    console.error("Error fetching profile:", err.response?.data?.message);
    throw err;
  }
};
