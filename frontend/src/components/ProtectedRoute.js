import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Store } from 'lucide-react';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user, loading, checkAuth } = useAuth();
  
  // If user data was passed from AuthCallback, use it
  const [isAuthenticated, setIsAuthenticated] = useState(
    location.state?.user ? true : null
  );

  useEffect(() => {
    // Skip auth check if user data was passed from AuthCallback
    if (location.state?.user) {
      setIsAuthenticated(true);
      return;
    }

    // Check authentication status
    const verifyAuth = async () => {
      try {
        const userData = await checkAuth();
        setIsAuthenticated(!!userData);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    if (!loading && isAuthenticated === null) {
      verifyAuth();
    } else if (!loading && user) {
      setIsAuthenticated(true);
    } else if (!loading && !user) {
      setIsAuthenticated(false);
    }
  }, [loading, user, checkAuth, location.state]);

  // Show loading state
  if (loading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pulpo-50 to-pulpo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pulpo-500 to-pulpo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-pulpo-500/30 mx-auto mb-4 animate-pulse">
            <Store className="w-8 h-8 text-white" />
          </div>
          <p className="text-pulpo-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
