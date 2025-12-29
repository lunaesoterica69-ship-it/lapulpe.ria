import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User as UserIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        setUser(response.data);
        
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Error al cargar perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('cart');
      toast.success('Sesión cerrada');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-stone-600 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero text-white px-6 py-8 text-center">
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserIcon className="w-12 h-12" />
          </div>
        )}
        <h1 className="text-3xl font-black mb-2">{user?.name}</h1>
        <p className="text-white/90">{user?.email}</p>
      </div>

      {/* Profile Info */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-2xl shadow-md border-b-4 border-primary p-6 space-y-4">
          <div>
            <p className="text-sm text-stone-500 mb-1">Tipo de Usuario</p>
            <p className="text-lg font-bold text-stone-800 capitalize">
              {user?.user_type === 'cliente' ? 'Cliente' : 'Dueño de Pulpería'}
            </p>
          </div>

          <div className="border-t border-stone-200 pt-4">
            <button
              data-testid="logout-button"
              onClick={handleLogout}
              className="w-full bg-red-500 text-white hover:bg-red-600 font-bold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
          <h3 className="text-lg font-black text-stone-800 mb-4 text-center">💝 Apoya al Creador</h3>
          
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-semibold text-stone-600 mb-1">📧 Contacto</p>
              <a 
                href="mailto:onol4sco05@gmail.com"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm break-all"
              >
                onol4sco05@gmail.com
              </a>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="text-sm font-semibold text-stone-600 mb-1">💳 PayPal</p>
              <a 
                href="https://paypal.me/alejandronolasco979?locale.x=es_XC&country.x=HN"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm break-all"
              >
                paypal.me/alejandronolasco979
              </a>
            </div>
          </div>

          <p className="text-center text-xs text-stone-500 mt-4">
            Tu apoyo ayuda a mantener la plataforma 🙏
          </p>
        </div>

        <div className="mt-6 text-center text-sm text-stone-500">
          <p>La Pulpería v1.0</p>
          <p className="mt-1">© 2024 - Conectando comunidades hondureñas</p>
        </div>
      </div>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default UserProfile;