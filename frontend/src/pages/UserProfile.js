import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { User as UserIcon, LogOut, Mail, CreditCard, Heart, Shield, Store, ShoppingBag, ArrowRightLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, loading, logout, setUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [changingType, setChangingType] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('cart');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const handleChangeUserType = async () => {
    if (changingType) return;
    
    const newType = user.user_type === 'cliente' ? 'pulperia' : 'cliente';
    const confirmMsg = newType === 'cliente' 
      ? '¿Quieres cambiar a cuenta de Cliente?' 
      : '¿Quieres cambiar a cuenta de Pulpería?';
    
    if (!window.confirm(confirmMsg)) return;
    
    setChangingType(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/change-user-type`,
        { new_type: newType },
        { withCredentials: true }
      );
      
      setUser(response.data);
      toast.success(`¡Cambiado a ${newType === 'cliente' ? 'Cliente' : 'Pulpería'}!`);
      
      // Redirect to appropriate page
      if (newType === 'cliente') {
        navigate('/map');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error changing user type:', error);
      toast.error('Error al cambiar tipo de cuenta');
    } finally {
      setChangingType(false);
    }
  };

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 rounded-full animate-spin border-t-red-600 mx-auto"></div>
          <p className="mt-4 text-red-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-orange-500 text-white px-6 py-10 text-center">
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-xl"
          />
        ) : (
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserIcon className="w-12 h-12" />
          </div>
        )}
        <h1 className="text-2xl font-black mb-1">{user?.name}</h1>
        <p className="text-white/80 text-sm">{user?.email}</p>
        <div className="inline-flex items-center gap-2 mt-3 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium">
          {user?.user_type === 'cliente' ? (
            <><ShoppingBag className="w-4 h-4" /> Cliente</>
          ) : (
            <><Store className="w-4 h-4" /> Dueño de Pulpería</>
          )}
        </div>
        
        {/* Admin Badge */}
        {user?.is_admin && (
          <div className="inline-flex items-center gap-2 mt-2 ml-2 bg-yellow-500 px-3 py-1 rounded-full text-sm font-bold text-yellow-900">
            <Shield className="w-4 h-4" /> Admin
          </div>
        )}
      </div>

      {/* Profile Actions */}
      <div className="px-4 py-6 space-y-4">
        {/* Admin Panel Access */}
        {user?.is_admin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg p-4 flex items-center gap-4 hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-white">Panel de Administrador</p>
              <p className="text-sm text-white/80">Gestionar anuncios y pulperías</p>
            </div>
          </button>
        )}

        {/* View Ad Assignment Log */}
        <button
          onClick={() => navigate('/ad-log')}
          className="w-full bg-white rounded-2xl shadow-sm border border-red-100 p-4 flex items-center gap-4 hover:bg-red-50 transition-all active:scale-[0.99]"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-stone-800">Registro de Anuncios</p>
            <p className="text-sm text-stone-500">Ve cómo se asignan los perks</p>
          </div>
        </button>

        {/* Change Account Type */}
        <button
          onClick={handleChangeUserType}
          disabled={changingType}
          className="w-full bg-white rounded-2xl shadow-sm border border-red-100 p-4 flex items-center gap-4 hover:bg-red-50 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <ArrowRightLeft className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-stone-800">
              {changingType ? 'Cambiando...' : 'Cambiar Tipo de Cuenta'}
            </p>
            <p className="text-sm text-stone-500">
              Actualmente: {user?.user_type === 'cliente' ? 'Cliente' : 'Pulpería'} → {user?.user_type === 'cliente' ? 'Pulpería' : 'Cliente'}
            </p>
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl shadow-sm border border-red-100 p-4 flex items-center gap-4 hover:bg-red-50 transition-all active:scale-[0.99]"
        >
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <LogOut className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-stone-800">Cerrar Sesión</p>
            <p className="text-sm text-stone-500">Salir de tu cuenta</p>
          </div>
        </button>

        {/* Support Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-stone-800">Apoya al Creador</h3>
          </div>
          
          <div className="space-y-3">
            <a 
              href="mailto:onol4sco05@gmail.com"
              className="flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
            >
              <Mail className="w-5 h-5 text-red-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-600">Contacto</p>
                <p className="text-xs text-red-600 truncate">onol4sco05@gmail.com</p>
              </div>
            </a>

            <a 
              href="https://paypal.me/alejandronolasco979?locale.x=es_XC&country.x=HN"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all"
            >
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-600">PayPal</p>
                <p className="text-xs text-blue-600 truncate">paypal.me/alejandronolasco979</p>
              </div>
            </a>
          </div>

          <p className="text-center text-xs text-stone-400 mt-4">
            Tu apoyo ayuda a mantener la plataforma 🙏
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-sm text-stone-500 font-medium">La Pulpería v2.0</p>
          <p className="text-xs text-stone-400 mt-1">© 2024 - Conectando comunidades hondureñas</p>
        </div>
      </div>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default UserProfile;
