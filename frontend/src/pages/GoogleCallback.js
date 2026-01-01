import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

// Dynamically determine backend URL based on current domain
const getBackendUrl = () => {
  const currentHost = window.location.hostname;
  const customDomains = ['lapulperiastore.net', 'www.lapulperiastore.net'];
  
  // If on custom domain, use same origin (the deployed app)
  if (customDomains.includes(currentHost)) {
    return window.location.origin;
  }
  
  // Otherwise use environment variable (for preview/development)
  return process.env.REACT_APP_BACKEND_URL;
};

const BACKEND_URL = getBackendUrl();

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Autenticación cancelada');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!code) {
        setError('Código de autorización no encontrado');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        // Get the redirect URI (must match what was sent to Google)
        const redirectUri = `${window.location.origin}/auth/callback`;
        
        // Exchange code for session
        const response = await axios.post(
          `${BACKEND_URL}/api/auth/google/callback`,
          null,
          {
            params: { code, redirect_uri: redirectUri },
            withCredentials: true
          }
        );

        if (response.data) {
          // Store session token if returned
          if (response.data.session_token) {
            localStorage.setItem('session_token', response.data.session_token);
          }
          
          // Redirect to dashboard
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.response?.data?.detail || 'Error al iniciar sesión');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400 font-medium">{error}</p>
            <p className="text-stone-500 text-sm mt-2">Redirigiendo...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-4 border-red-400/30 rounded-full animate-spin border-t-red-500 mx-auto mb-4"></div>
            <p className="text-white font-medium">Iniciando sesión...</p>
            <p className="text-stone-500 text-sm mt-1">Por favor espera</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
