import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext(null);

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

console.log('[AuthContext] Backend URL:', BACKEND_URL);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  const checkAuth = useCallback(async () => {
    try {
      console.log('[AuthContext] Checking existing session...');
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true,
        timeout: 15000
      });
      
      console.log('[AuthContext] Session found:', response.data.email);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.log('[AuthContext] No active session');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with session_id from Google OAuth
  const login = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      console.log('[AuthContext] Processing login...');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/session`,
        { session_id: sessionId },
        { 
          withCredentials: true,
          timeout: 20000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[AuthContext] Login successful:', response.data.email);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('[AuthContext] Login error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      console.log('[AuthContext] Logging out...');
      await axios.post(
        `${BACKEND_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    } finally {
      setUser(null);
      toast.success('Sesión cerrada');
    }
  }, []);

  // Update user type
  const setUserType = useCallback(async (userType) => {
    try {
      console.log('[AuthContext] Setting user type:', userType);
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/set-user-type?user_type=${userType}`,
        {},
        { withCredentials: true }
      );
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('[AuthContext] Set user type error:', error);
      throw error;
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    console.log('[AuthContext] Initializing...');
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
    setUser,
    setUserType
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
