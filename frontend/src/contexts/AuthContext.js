import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext(null);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  const checkAuth = useCallback(async (showError = false) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      });
      
      setUser(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      // Only clear auth if it's a real auth error (401, 403)
      if (error.response && [401, 403].includes(error.response.status)) {
        setUser(null);
        setIsAuthenticated(false);
        if (showError) {
          toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
      }
      // For network errors, don't clear auth immediately
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with session ID
  const login = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/session`,
        { session_id: sessionId },
        { 
          withCredentials: true,
          timeout: 10000
        }
      );

      const userData = response.data;
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesión. Por favor intenta nuevamente.');
      throw error;
    } finally {
      setLoading(false);
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
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Sesión cerrada correctamente');
    }
  }, []);

  // Update user data
  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Initial auth check - only once on mount
  useEffect(() => {
    checkAuth(false);
  }, [checkAuth]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
