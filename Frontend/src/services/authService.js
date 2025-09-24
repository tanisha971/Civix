// authService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });

  if (res.data?.user?._id) {
    // Save user in localStorage
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }

  return res.data;
};
