// src/services/pollService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const DEFAULT_CONFIG = { withCredentials: true };

// Get polls with optional filters
export async function getPolls(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const res = await axios.get(`${API_URL}/polls?${params.toString()}`);
    return res.data.polls || [];
  } catch (err) {
    console.error("Error fetching polls:", err);
    return [];
  }
}

// Get single poll by id
export async function getPollById(pollId) {
  try {
    const res = await axios.get(`${API_URL}/polls/${pollId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching poll by id:", err);
    throw err;
  }
}

// Create a new poll
export async function createPoll(pollData) {
  try {
    const res = await axios.post(`${API_URL}/polls`, pollData, DEFAULT_CONFIG);
    return res.data;
  } catch (err) {
    console.error("Error creating poll:", err);
    throw err;
  }
}

// Vote on a poll (option is optional — backend may accept it)
export async function votePoll(pollId, option) {
  try {
    const body = option !== undefined ? { option } : {};
    const res = await axios.post(`${API_URL}/polls/${pollId}/vote`, body, DEFAULT_CONFIG);
    return res.data;
  } catch (err) {
    console.error("Error voting on poll:", err);
    throw err;
  }
}

// Delete a poll (only creator)
export async function deletePoll(pollId) {
  try {
    const res = await axios.delete(`${API_URL}/polls/${pollId}`, DEFAULT_CONFIG);
    return res.data;
  } catch (err) {
    console.error("Error deleting poll:", err);
    throw err;
  }
}

// Edit a poll (only creator)
export async function editPoll(pollId, updatedData) {
  try {
    const res = await axios.put(`${API_URL}/polls/${pollId}`, updatedData, DEFAULT_CONFIG);
    return res.data;
  } catch (err) {
    console.error("Error editing poll:", err);
    throw err;
  }
}

// Optional: get polls the user has voted on (backend must implement)
export async function getVotedPolls(userId) {
  try {
    const res = await axios.get(`${API_URL}/polls/voted/${userId}`);
    return res.data.polls || [];
  } catch (err) {
    console.error("Error fetching voted polls:", err);
    throw err;
  }
}

// Backwards-compatible service object
export const pollService = {
  getPolls,
  getPollById,
  createPoll,
  votePoll,
  deletePoll,
  editPoll,
  getVotedPolls,
};
