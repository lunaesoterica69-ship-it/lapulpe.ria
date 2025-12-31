import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Store } from 'lucide-react';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  // If user data was passed from AuthCallback, use it immediately
  const hasUserFromCallback = useMemo(() => !!location.state?.user, [location.state?.user]);
  
  // Determine authentication status
  const isAuthenticated = hasUserFromCallback || !!user;

  // Show loading state
  if (loading && !hasUserFromCallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30 mx-auto mb-4 animate-pulse">
            <Store className="w-8 h-8 text-white" />
          </div>
          <p className="text-stone-400 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!loading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
