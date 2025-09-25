import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; // e.g., http://localhost:5000/api

// Get petitions with optional filters
export const getPetitions = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const res = await axios.get(`${API_URL}/petitions?${params.toString()}`);
    return res.data.petitions || []; // expect backend to return { petitions: [...] }
  } catch (err) {
    console.error("Error fetching petitions:", err);
    return [];
  }
};

// Create a new petition
export const createPetition = async (petitionData) => {
  try {
    const res = await axios.post(`${API_URL}/petitions`, petitionData, {
      withCredentials: true
    });
    return res.data;
  } catch (err) {
    console.error("Error creating petition:", err);
    throw err;
  }
};

// Sign a petition
export const signPetition = async (petitionId) => {
  try {
    const res = await axios.post(`${API_URL}/petitions/${petitionId}/sign`, {}, {
      withCredentials: true
    });
    return res.data;
  } catch (err) {
    console.error("Error signing petition:", err);
    throw err;
  }
};

// 0Delete a petition (only creator can delete)
export const deletePetition = async (petitionId) => {
  const res = await axios.delete(`${API_URL}/${petitionId}`, { withCredentials: true });
  return res.data;
};

// Edit a petition (only creator can edit)
export const editPetition = async (petitionId, updatedData) => {
  const res = await axios.put(`${API_URL}/${petitionId}`, updatedData, { withCredentials: true });
  return res.data;
};
