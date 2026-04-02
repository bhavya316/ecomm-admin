import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ADMIN_API_URL } from '../utils/api';

export const AuthContext = createContext();

const API_URL = ADMIN_API_URL;


export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.headers.common['Accept'] = 'application/json';
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token: newToken, admin: adminData } = response.data;
      localStorage.setItem('adminToken', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setAdmin(adminData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
