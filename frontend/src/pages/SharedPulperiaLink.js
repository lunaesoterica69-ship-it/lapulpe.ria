import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, BACKEND_URL } from '../config/api';
import { Store, ArrowRight } from 'lucide-react';


// Página de link compartido - SIEMPRE pide iniciar sesión
const SharedPulperiaLink = () => {
  const { id } = useParams();
  const [pulperia, setPulperia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Solo buscar info de la pulpería, NO verificar auth
    const fetchPulperia = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/pulperias/${id}`);
        setPulperia(res.data);
      } catch (e) {
        setPulperia(null);
      }
      setLoading(false);
    };
    fetchPulperia();
  }, [id]);

  const handleLogin = () => {
    // Siempre redirige al auth, luego a la pulpería
    const returnUrl = `${window.location.origin}/pulperia/${id}`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(returnUrl)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const bgColor = pulperia?.background_color || '#DC2626';

  return (
    <div className="min-h-screen bg-stone-950 relative overflow-hidden">
      {/* Nebula */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] opacity-25" style={{ backgroundColor: bgColor }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[80px] opacity-20" style={{ backgroundColor: bgColor }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          
          {/* Pulperia Card */}
          {pulperia ? (
            <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden mb-8 shadow-2xl">
              <div 
                className="h-28 relative"
                style={{ 
                  background: pulperia.banner_url 
                    ? `url(${pulperia.banner_url}) center/cover`
                    : `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}88 100%)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />
              </div>
              
              <div className="px-6 pb-6 -mt-10 relative">
                <div className="flex flex-col items-center">
                  {pulperia.logo_url ? (
                    <img src={pulperia.logo_url} alt={pulperia.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-stone-900 shadow-xl" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl border-4 border-stone-900 flex items-center justify-center shadow-xl" style={{ backgroundColor: bgColor }}>
                      <Store className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <h1 className="text-2xl font-bold text-white mt-4">{pulperia.name}</h1>
                  {pulperia.description && <p className="text-stone-400 text-sm mt-2 line-clamp-2">{pulperia.description}</p>}
                  {pulperia.address && <p className="text-stone-500 text-xs mt-2">{pulperia.address}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-stone-900 rounded-3xl border border-stone-800 p-8 mb-8">
              <Store className="w-16 h-16 text-stone-700 mx-auto mb-4" />
              <p className="text-stone-400">Pulpería no encontrada</p>
            </div>
          )}

          {/* Login */}
          <div className="space-y-4">
            <p className="text-stone-400 text-sm">Inicia sesión para ver productos y hacer pedidos</p>
            
            <button onClick={handleLogin} className="w-full group flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-medium py-4 px-6 rounded-xl transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Iniciar Sesión con Google
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
            </button>
            
            <p className="text-stone-600 text-xs">🇭🇳 La Pulpería</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedPulperiaLink;
