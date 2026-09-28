import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('smart_farmer_token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('smart_farmer_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const sendOtp = async (phone) => {
    return await api.sendOtp(phone);
  };

  const login = async (phone, password, otp) => {
    const data = await api.login(phone, password, otp);
    localStorage.setItem('smart_farmer_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, phone, password, preferredLanguage, otp) => {
    const data = await api.register(name, phone, password, preferredLanguage, otp);
    localStorage.setItem('smart_farmer_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('smart_farmer_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, sendOtp, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
