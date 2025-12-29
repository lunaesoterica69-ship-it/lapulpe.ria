import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    // Only redirect if we're done loading and not authenticated
    if (!loading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-4 text-stone-700 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading, don't render (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Pass user data through location state if needed
  return children;
};

export default ProtectedRoute;
