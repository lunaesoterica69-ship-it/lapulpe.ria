import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext(null);

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLoggingIn = useRef(false);

  // Check existing session on mount
  const checkAuth = useCallback(async () => {
    // Don't check auth if we're in the middle of logging in
    if (isLoggingIn.current) {
      return null;
    }
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true,
        timeout: 10000
      });
      
      setUser(response.data);
      return response.data;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with session_id from Google OAuth
  const login = useCallback(async (sessionId) => {
    isLoggingIn.current = true;
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/session`,
        { session_id: sessionId },
        { 
          withCredentials: true,
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Login error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      isLoggingIn.current = false;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      setUser(null);
      toast.success('Sesión cerrada');
    }
  }, []);

  // Update user type
  const setUserType = useCallback(async (userType) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/set-user-type?user_type=${userType}`,
        {},
        { withCredentials: true }
      );
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Set user type error:', error);
      throw error;
    }
  }, []);

  // Check auth on mount - but skip if there's a session_id in the URL
  useEffect(() => {
    // Skip initial auth check if we're handling OAuth callback
    const hasSessionInUrl = window.location.hash.includes('session_id=');
    if (!hasSessionInUrl) {
      checkAuth();
    } else {
      // Just set loading to false, let AuthCallback handle the login
      setLoading(false);
    }
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
