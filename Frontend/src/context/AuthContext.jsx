import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData.user);
        try { localStorage.setItem('user', JSON.stringify(userData.user)); } catch {}
      } else {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    try { localStorage.setItem('user', JSON.stringify(response.user)); } catch {}
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // NEW: update user globally (used after profile edit)
  const updateUser = (newUser) => {
    setUser(newUser);
    try { localStorage.setItem('user', JSON.stringify(newUser)); } catch {}
    // keep a DOM event fallback for legacy listeners
    try {
      const ev = new CustomEvent('profileUpdated', { detail: newUser });
      window.dispatchEvent(ev);
    } catch {}
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    updateUser, // exported
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;