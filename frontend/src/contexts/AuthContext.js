import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { BACKEND_URL } from '../config/api';

const AuthContext = createContext(null);

// Helper para obtener headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem('session_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLoggingIn = useRef(false);

  // Check existing session on mount
  const checkAuth = useCallback(async () => {
    if (isLoggingIn.current) {
      return null;
    }
    
    const token = localStorage.getItem('session_token');
    
    // Si no hay token, no hay sesión
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true,
        timeout: 10000,
        headers: getAuthHeaders()
      });
      
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.log('[Auth] Session check failed, clearing token');
      localStorage.removeItem('session_token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with session_id from Google OAuth (Emergent Auth)
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

      // Guardar token si viene en la respuesta
      if (response.data.session_token) {
        localStorage.setItem('session_token', response.data.session_token);
      }

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

  // Login directo con datos de usuario (para Google OAuth propio)
  const loginWithUser = useCallback((userData) => {
    if (userData.session_token) {
      localStorage.setItem('session_token', userData.session_token);
    }
    setUser(userData);
    setLoading(false);
  }, []);

  // Logout
  const logout = useCallback(async () => {
    const token = localStorage.getItem('session_token');
    
    try {
      await axios.post(
        `${BACKEND_URL}/api/auth/logout`,
        {},
        { 
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      localStorage.removeItem('session_token');
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
        { 
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Set user type error:', error);
      throw error;
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    const hasSessionInUrl = window.location.hash.includes('session_id=');
    const isCallbackPage = window.location.pathname === '/auth/callback';
    
    if (!hasSessionInUrl && !isCallbackPage) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [checkAuth]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    loginWithUser,
    logout,
    checkAuth,
    setUser,
    setUserType,
    getAuthHeaders
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

// Export helper for use outside React components
export { getAuthHeaders };
