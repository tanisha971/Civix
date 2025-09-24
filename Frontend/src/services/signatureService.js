import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch petitions signed by a specific user
export const getSignedPetitions = async (userId) => {
  if (!userId) throw new Error("User ID is required");
  try {
    const res = await axios.get(`${API_URL}/signatures/user/${userId}`);
    return res.data || [];
  } catch (err) {
    console.error("Error fetching signed petitions:", err);
    throw err;
  }
};
