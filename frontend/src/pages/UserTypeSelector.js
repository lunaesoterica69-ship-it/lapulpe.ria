import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShoppingBag, Store, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const UserTypeSelector = () => {
  const navigate = useNavigate();
  const { user, setUser, setUserType, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    // If user already has a type, redirect them
    if (user?.user_type) {
      if (user.user_type === 'cliente') {
        navigate('/map', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-red-950">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-300 border-r-transparent"></div>
          <p className="mt-4 text-white font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleSelectType = async (userType) => {
    setSelectedType(userType);
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/set-user-type?user_type=${userType}`,
        {},
        { withCredentials: true }
      );

      // Update the auth context with the new user data
      updateUser(response.data);
      
      toast.success('¡Cuenta configurada correctamente!');
      
      // Force a re-check of auth to ensure everything is synced
      await checkAuth(false);
      
      if (userType === 'cliente') {
        navigate('/map', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error setting user type:', error);
      toast.error('Error al configurar tu cuenta. Por favor intenta de nuevo.');
      setSelectedType(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-950 flex items-center justify-center px-6 py-12 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-red-300" />
            <span className="text-sm text-red-200 font-medium">Nuevo usuario</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            ¡Hola, {user.name?.split(' ')[0]}!
          </h1>
          <p className="text-xl text-red-100/80">
            ¿Cómo vas a usar La Pulpería?
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Cliente Option */}
          <button
            data-testid="select-cliente-button"
            onClick={() => handleSelectType('cliente')}
            disabled={loading}
            className={`group relative bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 
              hover:border-red-400/50 hover:bg-white/10 transition-all duration-300 text-center 
              disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden
              ${selectedType === 'cliente' ? 'border-red-400 bg-red-500/10' : ''}`}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-600/0 group-hover:from-red-500/10 group-hover:to-red-600/10 transition-all duration-300 rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
              
              <h2 className="text-2xl font-bold mb-3 text-white">Soy Cliente</h2>
              <p className="text-red-100/70">
                Buscar pulperías cercanas, ver productos y hacer pedidos
              </p>
              
              {selectedType === 'cliente' && loading && (
                <div className="mt-4">
                  <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              )}
            </div>
          </button>

          {/* Pulpería Option */}
          <button
            data-testid="select-pulperia-button"
            onClick={() => handleSelectType('pulperia')}
            disabled={loading}
            className={`group relative bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 
              hover:border-red-400/50 hover:bg-white/10 transition-all duration-300 text-center 
              disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden
              ${selectedType === 'pulperia' ? 'border-red-400 bg-red-500/10' : ''}`}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-700/0 group-hover:from-red-500/10 group-hover:to-red-700/10 transition-all duration-300 rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform duration-300">
                <Store className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
              
              <h2 className="text-2xl font-bold mb-3 text-white">Tengo una Pulpería</h2>
              <p className="text-red-100/70">
                Digitalizar mi negocio, gestionar productos y recibir órdenes
              </p>
              
              {selectedType === 'pulperia' && loading && (
                <div className="mt-4">
                  <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-red-100/50 text-sm mt-8">
          Esta selección es permanente para tu cuenta
        </p>
      </div>
    </div>
  );
};

export default UserTypeSelector;
