import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Store, Briefcase, History, Megaphone, Crown, Tv } from 'lucide-react';

const BottomNav = ({ user, cartCount = 0, activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path, tabName) => {
    if (activeTab) return activeTab === tabName;
    return location.pathname === path;
  };

  const navItems = user?.user_type === 'pulperia' ? [
    { icon: Store, label: 'Dashboard', path: '/dashboard', testId: 'nav-dashboard', tab: 'dashboard' },
    { icon: History, label: 'Historial', path: '/order-history', testId: 'nav-history', tab: 'historial' },
    { icon: Tv, label: 'Anuncios', path: '/anuncios', testId: 'nav-anuncios', tab: 'anuncios' },
    { icon: User, label: 'Perfil', path: '/profile', testId: 'nav-profile', tab: 'perfil' },
  ] : [
    { icon: Home, label: 'Mapa', path: '/map', testId: 'nav-map', tab: 'mapa' },
    { icon: Search, label: 'Buscar', path: '/search', testId: 'nav-search', tab: 'buscar' },
    { icon: Tv, label: 'Anuncios', path: '/anuncios', testId: 'nav-anuncios', tab: 'anuncios' },
    { icon: ShoppingCart, label: 'Carrito', path: '/cart', testId: 'nav-cart', tab: 'carrito', badge: cartCount },
    { icon: User, label: 'Perfil', path: '/profile', testId: 'nav-profile', tab: 'perfil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-stone-950/95 backdrop-blur-md border-t border-stone-800 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              data-testid={item.testId}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center relative py-2 px-4 transition-colors ${
                active ? 'text-red-500' : 'text-stone-600 hover:text-stone-400'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute top-1 right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
