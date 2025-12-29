import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Store } from 'lucide-react';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing (StrictMode)
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleAuth = async () => {
      try {
        console.log('[AuthCallback] Processing authentication...');
        console.log('[AuthCallback] Current URL:', window.location.href);
        
        // Extract session_id from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          console.error('[AuthCallback] No session_id found in URL');
          toast.error('Error de autenticación: No se recibió información de sesión');
          setTimeout(() => navigate('/', { replace: true }), 2000);
          return;
        }

        console.log('[AuthCallback] Session ID found, calling login...');
        const user = await login(sessionId);

        if (!user) {
          console.error('[AuthCallback] Login failed - no user returned');
          toast.error('Error al procesar la autenticación');
          setTimeout(() => navigate('/', { replace: true }), 2000);
          return;
        }

        console.log('[AuthCallback] Login successful:', user.email);
        
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);

        // Redirect based on user type
        if (!user.user_type) {
          console.log('[AuthCallback] New user - redirecting to type selector');
          navigate('/select-type', { replace: true, state: { user } });
        } else if (user.user_type === 'pulperia') {
          console.log('[AuthCallback] Pulperia user - redirecting to dashboard');
          toast.success(`¡Bienvenido de vuelta, ${user.name}!`);
          navigate('/dashboard', { replace: true, state: { user } });
        } else {
          console.log('[AuthCallback] Cliente user - redirecting to map');
          toast.success(`¡Bienvenido de vuelta, ${user.name}!`);
          navigate('/map', { replace: true, state: { user } });
        }
      } catch (error) {
        console.error('[AuthCallback] Error:', error);
        toast.error('Error al iniciar sesión. Por favor intenta nuevamente.');
        setTimeout(() => navigate('/', { replace: true }), 2000);
      }
    };

    handleAuth();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pulpo-900 via-pulpo-800 to-pulpo-950">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-pulpo-500 to-pulpo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-pulpo-500/40 animate-pulse">
            <Store className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
          {/* Spinning ring */}
          <div className="absolute -inset-2">
            <div className="w-full h-full border-4 border-pulpo-300/20 rounded-full animate-spin border-t-pulpo-300"></div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">Iniciando sesión...</h2>
        <p className="text-pulpo-100/70">Conectando con Google</p>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-pulpo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-pulpo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-pulpo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
