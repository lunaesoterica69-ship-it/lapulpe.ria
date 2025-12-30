import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Store, Briefcase, History, Megaphone } from 'lucide-react';

const BottomNav = ({ user, cartCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = user?.user_type === 'pulperia' ? [
    { icon: Store, label: 'Dashboard', path: '/dashboard', testId: 'nav-dashboard' },
    { icon: History, label: 'Historial', path: '/order-history', testId: 'nav-history' },
    { icon: Megaphone, label: 'Publicidad', path: '/advertising', testId: 'nav-advertising' },
    { icon: User, label: 'Perfil', path: '/profile', testId: 'nav-profile' },
  ] : [
    { icon: Home, label: 'Mapa', path: '/map', testId: 'nav-map' },
    { icon: Search, label: 'Buscar', path: '/search', testId: 'nav-search' },
    { icon: ShoppingCart, label: 'Carrito', path: '/cart', testId: 'nav-cart', badge: cartCount },
    { icon: Briefcase, label: 'Empleos', path: '/jobs-services', testId: 'nav-jobs' },
    { icon: User, label: 'Perfil', path: '/profile', testId: 'nav-profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-stone-900/95 backdrop-blur-xl border-t border-stone-800 shadow-2xl safe-bottom z-50">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              data-testid={item.testId}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center relative transition-all py-1 px-3 rounded-xl ${
                active 
                  ? 'text-red-400 bg-red-500/10' 
                  : 'text-stone-500 hover:text-red-400 hover:bg-stone-800'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
              <span className="text-xs mt-1 font-semibold">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute -top-1 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
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