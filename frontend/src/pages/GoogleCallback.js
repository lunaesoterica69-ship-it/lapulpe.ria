import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Store } from 'lucide-react';
import { BACKEND_URL } from '../config/api';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Procesando...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      console.log('[GoogleCallback] Starting...');
      console.log('[GoogleCallback] Code:', code ? 'present' : 'missing');
      console.log('[GoogleCallback] Error param:', errorParam);
      console.log('[GoogleCallback] Backend URL:', BACKEND_URL);

      if (errorParam) {
        console.log('[GoogleCallback] Error from Google:', errorParam);
        setError('Autenticación cancelada por el usuario');
        setTimeout(() => navigate('/', { replace: true }), 3000);
        return;
      }

      if (!code) {
        console.log('[GoogleCallback] No code found');
        setError('Código de autorización no encontrado');
        setTimeout(() => navigate('/', { replace: true }), 3000);
        return;
      }

      try {
        setStatus('Verificando con Google...');
        
        // El redirect_uri debe coincidir EXACTAMENTE con lo que se envió a Google
        const redirectUri = `${window.location.origin}/auth/callback`;
        console.log('[GoogleCallback] Redirect URI:', redirectUri);
        
        // Intercambiar código por sesión
        const response = await axios.post(
          `${BACKEND_URL}/api/auth/google/callback`,
          null,
          {
            params: { code, redirect_uri: redirectUri },
            withCredentials: true,
            timeout: 30000
          }
        );

        console.log('[GoogleCallback] Response:', response.data);

        if (response.data) {
          setStatus('¡Bienvenido!');
          
          // Guardar token de sesión
          if (response.data.session_token) {
            localStorage.setItem('session_token', response.data.session_token);
          }
          
          // Determinar a dónde redirigir
          const user = response.data;
          
          setTimeout(() => {
            if (!user.user_type) {
              navigate('/select-type', { replace: true });
            } else if (user.user_type === 'pulperia') {
              navigate('/dashboard', { replace: true });
            } else {
              navigate('/map', { replace: true });
            }
          }, 500);
        }
      } catch (err) {
        console.error('[GoogleCallback] Error:', err);
        console.error('[GoogleCallback] Error response:', err.response?.data);
        
        const errorMsg = err.response?.data?.detail || 'Error al iniciar sesión. Intenta de nuevo.';
        setError(errorMsg);
        setTimeout(() => navigate('/', { replace: true }), 4000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="text-center px-4">
        {error ? (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400 font-medium text-lg">{error}</p>
            <p className="text-stone-500 text-sm mt-2">Redirigiendo a inicio...</p>
          </>
        ) : (
          <>
            {/* Logo animado */}
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30">
                <Store className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-2">
                <div className="w-full h-full border-4 border-red-300/20 rounded-full animate-spin border-t-red-400"></div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">{status}</h2>
            <p className="text-stone-400 text-sm">Conectando con Google</p>
            
            {/* Dots de progreso */}
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
