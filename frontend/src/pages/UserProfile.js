import { useState, useEffect, useMemo } from 'react';
import { api, BACKEND_URL } from '../config/api';
import { toast } from 'sonner';
import { User as UserIcon, LogOut, Mail, CreditCard, Heart, Shield, Store, ShoppingBag, ArrowRightLeft, Eye, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import AnimatedBackground from '../components/AnimatedBackground';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';


const UserProfile = () => {
  const navigate = useNavigate();
  const { user, loading, logout, setUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [changingType, setChangingType] = useState(false);
  const [myPulperias, setMyPulperias] = useState([]);
  const [showCloseStoreDialog, setShowCloseStoreDialog] = useState(false);
  const [selectedPulperiaToClose, setSelectedPulperiaToClose] = useState(null);
  const [closeConfirmation, setCloseConfirmation] = useState('');
  const [isClosingStore, setIsClosingStore] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
    
    // Fetch user's pulperias if they are a pulperia owner
    const fetchMyPulperias = async () => {
      if (user?.user_type === 'pulperia') {
        try {
          const res = await api.get('/api/pulperias');
          const mine = res.data.filter(p => p.owner_user_id === user.user_id);
          setMyPulperias(mine);
        } catch (e) {
          console.error('Error fetching pulperias:', e);
        }
      }
    };
    
    if (user) {
      fetchMyPulperias();
    }
  }, [user]);

  const handleCloseStore = async () => {
    if (!selectedPulperiaToClose) return;
    
    if (closeConfirmation.trim().toLowerCase() !== selectedPulperiaToClose.name.trim().toLowerCase()) {
      toast.error(`Debes escribir exactamente "${selectedPulperiaToClose.name}" para confirmar`);
      return;
    }
    
    setIsClosingStore(true);
    try {
      const response = await api.delete(`/api/pulperias/${selectedPulperiaToClose.pulperia_id}/close`, {
        data: { confirmation_phrase: closeConfirmation }
      });
      
      toast.success(response.data.message || '¡Tu tienda ha sido cerrada!');
      setShowCloseStoreDialog(false);
      setCloseConfirmation('');
      setSelectedPulperiaToClose(null);
      
      // Refresh pulperias list
      const res = await api.get('/api/pulperias');
      const mine = res.data.filter(p => p.owner_user_id === user.user_id);
      setMyPulperias(mine);
      
      // If no more pulperias, they can create a new one
      if (mine.length === 0) {
        toast.info('Puedes crear una nueva pulpería desde el Dashboard');
      }
      
    } catch (error) {
      console.error('Error closing store:', error);
      const errorMsg = error.response?.data?.detail || 'Error al cerrar la tienda';
      toast.error(errorMsg);
    } finally {
      setIsClosingStore(false);
    }
  };

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
      const response = await api.post(`/api/auth/change-user-type`,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-400/30 rounded-full animate-spin border-t-white mx-auto"></div>
          <p className="mt-4 text-white/80 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 pb-24">
      <AnimatedBackground variant="minimal" />
      {/* Header */}
      <div className="bg-gradient-to-br from-red-800 to-red-900 text-white px-6 py-10 text-center">
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/30 shadow-xl"
          />
        ) : (
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserIcon className="w-12 h-12" />
          </div>
        )}
        <h1 className="text-2xl font-black mb-1">{user?.name}</h1>
        <p className="text-white/70 text-sm">{user?.email}</p>
        <div className="inline-flex items-center gap-2 mt-3 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium">
          {user?.user_type === 'cliente' ? (
            <><ShoppingBag className="w-4 h-4" /> Cliente</>
          ) : (
            <><Store className="w-4 h-4" /> Dueño de Pulpería</>
          )}
        </div>
        
        {/* Admin Badge */}
        {user?.is_admin && (
          <div className="inline-flex items-center gap-2 mt-2 ml-2 bg-amber-500 px-3 py-1 rounded-full text-sm font-bold text-amber-900">
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
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-2xl shadow-lg p-4 flex items-center gap-4 hover:from-amber-500 hover:to-amber-400 transition-all"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-600" />
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
          className="w-full bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 p-4 flex items-center gap-4 hover:border-blue-500/50 transition-all active:scale-[0.99]"
        >
          <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center border border-blue-700">
            <Eye className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-white">Registro de Anuncios</p>
            <p className="text-sm text-stone-400">Ve cómo se asignan los perks</p>
          </div>
        </button>

        {/* Change Account Type */}
        <button
          onClick={handleChangeUserType}
          disabled={changingType}
          className="w-full bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 p-4 flex items-center gap-4 hover:border-orange-500/50 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          <div className="w-12 h-12 bg-orange-900/50 rounded-xl flex items-center justify-center border border-orange-700">
            <ArrowRightLeft className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-white">
              {changingType ? 'Cambiando...' : 'Cambiar Tipo de Cuenta'}
            </p>
            <p className="text-sm text-stone-400">
              Actualmente: {user?.user_type === 'cliente' ? 'Cliente' : 'Pulpería'} → {user?.user_type === 'cliente' ? 'Pulpería' : 'Cliente'}
            </p>
          </div>
        </button>

        {/* Close Store - Only for pulperia owners with pulperias */}
        {user?.user_type === 'pulperia' && myPulperias.length > 0 && (
          <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-red-900/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-red-400">Cerrar Tienda</h3>
            </div>
            <p className="text-sm text-stone-400 mb-3">
              Cierra tu pulpería permanentemente. Podrás crear una nueva después.
            </p>
            {myPulperias.map(pulperia => (
              <button
                key={pulperia.pulperia_id}
                onClick={() => {
                  setSelectedPulperiaToClose(pulperia);
                  setShowCloseStoreDialog(true);
                }}
                className="w-full p-3 bg-red-900/20 border border-red-800/50 rounded-xl flex items-center gap-3 hover:bg-red-900/30 transition-all mb-2 last:mb-0"
              >
                <Store className="w-5 h-5 text-red-400" />
                <span className="text-white flex-1 text-left">{pulperia.name}</span>
                <span className="text-red-400 text-sm">Cerrar</span>
              </button>
            ))}
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 p-4 flex items-center gap-4 hover:border-red-500/50 transition-all active:scale-[0.99]"
        >
          <div className="w-12 h-12 bg-red-900/50 rounded-xl flex items-center justify-center border border-red-700">
            <LogOut className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-white">Cerrar Sesión</p>
            <p className="text-sm text-stone-400">Salir de tu cuenta</p>
          </div>
        </button>

        {/* Support Section */}
        <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-white">Apoya al Creador</h3>
          </div>
          
          <div className="space-y-3">
            <a 
              href="mailto:onol4sco05@gmail.com"
              className="flex items-center gap-3 p-3 bg-stone-700/30 rounded-xl hover:bg-stone-700/50 transition-all border border-stone-600"
            >
              <Mail className="w-5 h-5 text-red-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-300">Contacto</p>
                <p className="text-xs text-red-400 truncate">onol4sco05@gmail.com</p>
              </div>
            </a>

            <a 
              href="https://paypal.me/alejandronolasco979?locale.x=es_XC&country.x=HN"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-blue-900/30 rounded-xl hover:bg-blue-900/50 transition-all border border-blue-700"
            >
              <CreditCard className="w-5 h-5 text-blue-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-300">PayPal</p>
                <p className="text-xs text-blue-400 truncate">paypal.me/alejandronolasco979</p>
              </div>
            </a>
          </div>

          <p className="text-center text-xs text-stone-500 mt-4">
            Tu apoyo ayuda a mantener la plataforma 🙏
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-sm text-stone-400 font-medium">La Pulpería v2.0</p>
          <p className="text-xs text-stone-500 mt-1">© 2024 - Conectando comunidades hondureñas</p>
        </div>
      </div>

      <BottomNav user={user} cartCount={cartCount} />
      
      {/* Dialog para cerrar tienda */}
      <Dialog open={showCloseStoreDialog} onOpenChange={setShowCloseStoreDialog}>
        <DialogContent className="bg-stone-950 border-red-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              ¿Cerrar Tu Tienda?
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
              <p className="text-red-300 font-medium mb-2">⚠️ Esta acción eliminará los datos de esta tienda</p>
              <ul className="text-sm text-red-200/70 space-y-1 list-disc pl-4">
                <li>Se eliminarán todos tus productos</li>
                <li>Se eliminarán todas las órdenes</li>
                <li>Se eliminarán todas las reseñas</li>
                <li>Se eliminarán todos tus logros</li>
              </ul>
              <p className="text-green-400 text-sm mt-3">✓ Podrás crear una nueva pulpería después</p>
            </div>
            
            <div>
              <Label className="text-stone-400 text-sm">
                Para confirmar, escribe el nombre de tu pulpería:
              </Label>
              <p className="text-amber-400 font-bold mb-2 text-lg">&quot;{selectedPulperiaToClose?.name}&quot;</p>
              <Input
                value={closeConfirmation}
                onChange={(e) => setCloseConfirmation(e.target.value)}
                placeholder="Escribe el nombre exacto..."
                className="bg-stone-900 border-stone-700 text-white"
                data-testid="close-store-confirmation-input"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCloseStoreDialog(false);
                  setCloseConfirmation('');
                  setSelectedPulperiaToClose(null);
                }}
                className="flex-1 border-stone-700 text-stone-400 hover:bg-stone-800"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleCloseStore}
                disabled={isClosingStore || closeConfirmation.trim().toLowerCase() !== selectedPulperiaToClose?.name?.trim().toLowerCase()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                data-testid="confirm-close-store-button"
              >
                {isClosingStore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Cerrando...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cerrar Tienda
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
