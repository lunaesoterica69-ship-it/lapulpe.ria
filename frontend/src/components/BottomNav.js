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
    { icon: Briefcase, label: 'Chamba', path: '/jobs-services', testId: 'nav-jobs' },
    { icon: User, label: 'Perfil', path: '/profile', testId: 'nav-profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Art Deco Top Border */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      
      <div className="bg-stone-950/95 backdrop-blur-md border-t border-amber-500/10">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                data-testid={item.testId}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center relative py-2 px-4 transition-all duration-300 ${
                  active 
                    ? 'text-amber-400' 
                    : 'text-stone-500 hover:text-amber-200'
                }`}
              >
                {/* Active Indicator - Art Deco Diamond */}
                {active && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rotate-45" />
                )}
                
                <div className={`relative ${active ? 'transform scale-110' : ''} transition-transform`}>
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] mt-1 tracking-wide ${active ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
                
                {/* Cart Badge */}
                {item.badge > 0 && (
                  <span 
                    className="absolute top-1 right-2 text-stone-900 text-[9px] font-bold w-4 h-4 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #F7E7A0, #D4A843)',
                      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Art Deco Bottom Accent */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      </div>
    </div>
  );
};

export default BottomNav;
