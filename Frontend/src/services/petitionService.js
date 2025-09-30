import api from "./api";

// Get petitions with optional filters
export const getPetitions = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const res = await api.get(`/petitions?${params.toString()}`);
    return res.data.petitions || []; // expect backend to return { petitions: [...] }
  } catch (err) {
    console.error("Error fetching petitions:", err);
    return [];
  }
};

// Get petition by id
export const getPetitionById = async (petitionId) => {
  try {
    const res = await api.get(`/petitions/${petitionId}`);
    return res.data.petition || res.data;
  } catch (err) {
    console.error("Error fetching petition by id:", err);
    throw err;
  }
};

// Create a new petition
export const createPetition = async (petitionData) => {
  try {
    const res = await api.post(`/petitions`, petitionData);
    return res.data;
  } catch (err) {
    console.error("Error creating petition:", err);
    throw err;
  }
};

// Sign a petition
export const signPetition = async (petitionId) => {
  try {
    const res = await api.post(`/petitions/${petitionId}/sign`, {});
    return res.data;
  } catch (err) {
    console.error("Error signing petition:", err);
    throw err;
  }
};

// Delete a petition (only creator can delete)
export const deletePetition = async (petitionId) => {
  const res = await api.delete(`/petitions/${petitionId}`);
  return res.data;
};

// Edit a petition (only creator can edit)
export const editPetition = async (petitionId, updatedData) => {
  const res = await api.put(`/petitions/${petitionId}`, updatedData);
  return res.data;
};
