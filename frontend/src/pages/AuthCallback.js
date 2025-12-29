import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error('Error en autenticación');
          navigate('/', { replace: true });
          return;
        }

        const response = await axios.post(
          `${BACKEND_URL}/api/auth/session`,
          { session_id: sessionId },
          { withCredentials: true }
        );

        const user = response.data;
        
        // Check if user needs to select their type (new user or null type)
        if (!user.user_type) {
          // New user - must select type
          navigate('/select-type', { replace: true, state: { user } });
        } else if (user.user_type === 'pulperia') {
          // Pulperia owner - go to dashboard
          toast.success(`¡Bienvenido, ${user.name}!`);
          navigate('/dashboard', { replace: true });
        } else {
          // Client - go to map
          toast.success(`¡Bienvenido, ${user.name}!`);
          navigate('/map', { replace: true });
        }
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Error al iniciar sesión');
        navigate('/', { replace: true });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin border-t-purple-500"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-pulse border-t-cyan-400"></div>
        </div>
        <p className="mt-6 text-xl text-white font-medium">Iniciando sesión...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
