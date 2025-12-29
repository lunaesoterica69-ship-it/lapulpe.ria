import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error('Error: No se recibió el ID de sesión');
          navigate('/', { replace: true });
          return;
        }

        // Login using the AuthContext
        const user = await login(sessionId);

        if (!user) {
          toast.error('Error al procesar la autenticación');
          navigate('/', { replace: true });
          return;
        }

        // Check if user needs to select their type
        if (!user.user_type) {
          navigate('/select-type', { replace: true });
        } else if (user.user_type === 'pulperia') {
          toast.success(`¡Bienvenido de vuelta, ${user.name}!`);
          navigate('/dashboard', { replace: true });
        } else {
          toast.success(`¡Bienvenido de vuelta, ${user.name}!`);
          navigate('/map', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Error al iniciar sesión. Por favor intenta nuevamente.');
        navigate('/', { replace: true });
      }
    };

    processAuth();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-800">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-20 h-20 border-4 border-red-300/30 rounded-full animate-spin border-t-red-100"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-pulse border-t-orange-300"></div>
        </div>
        <p className="mt-6 text-xl text-white font-semibold">Iniciando sesión...</p>
        <p className="mt-2 text-red-100/70">Por favor espera un momento</p>
      </div>
    </div>
  );
};

export default AuthCallback;
