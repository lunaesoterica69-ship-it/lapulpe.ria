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
    <div className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <button
            key={item.path}
            data-testid={item.testId}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center relative transition-colors ${
              active ? 'text-primary' : 'text-stone-500 hover:text-primary'
            }`}
          >
            <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
            <span className="text-xs mt-1 font-semibold">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute -top-1 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;