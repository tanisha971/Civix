import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const feedbackService = {
  // Submit feedback
  submitFeedback: async (feedbackData) => {
    try {
      const response = await axios.post(`${API_URL}/feedback`, feedbackData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Submit feedback error:', error);
      throw error;
    }
  },

  // Get user's feedback history
  getUserFeedback: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/feedback/my-feedback`, {
        params,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Get user feedback error:', error);
      throw error;
    }
  },

  // Delete feedback
  deleteFeedback: async (feedbackId) => {
    try {
      const response = await axios.delete(`${API_URL}/feedback/${feedbackId}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Delete feedback error:', error);
      throw error;
    }
  }
};

export default feedbackService;