import { MapPin, Store, ShoppingBag, Zap, Search, ArrowRight, Users, Star, ShoppingCart, Package, Sparkles } from 'lucide-react';

// Custom SVG Logo Component - La Pulpería
const PulperiaLogo = ({ className = "" }) => (
  <svg viewBox="0 0 200 220" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Store roof/awning */}
    <defs>
      <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
      <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FECACA" />
        <stop offset="100%" stopColor="#FCA5A5" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.3"/>
      </filter>
    </defs>
    
    {/* Main building */}
    <rect x="30" y="70" width="140" height="120" rx="8" fill="url(#buildingGradient)" filter="url(#shadow)"/>
    
    {/* Roof/Awning */}
    <path d="M20 75 L100 25 L180 75 Z" fill="url(#roofGradient)" filter="url(#shadow)"/>
    
    {/* Awning stripes */}
    <g>
      <rect x="30" y="70" width="20" height="25" fill="#DC2626"/>
      <rect x="50" y="70" width="20" height="25" fill="white"/>
      <rect x="70" y="70" width="20" height="25" fill="#DC2626"/>
      <rect x="90" y="70" width="20" height="25" fill="white"/>
      <rect x="110" y="70" width="20" height="25" fill="#DC2626"/>
      <rect x="130" y="70" width="20" height="25" fill="white"/>
      <rect x="150" y="70" width="20" height="25" fill="#DC2626"/>
    </g>
    
    {/* Awning wave bottom */}
    <path d="M30 95 Q40 105 50 95 Q60 85 70 95 Q80 105 90 95 Q100 85 110 95 Q120 105 130 95 Q140 85 150 95 Q160 105 170 95" 
          fill="none" stroke="#991B1B" strokeWidth="3"/>
    
    {/* Door */}
    <rect x="75" y="130" width="50" height="60" rx="4" fill="#7F1D1D"/>
    <circle cx="115" cy="160" r="4" fill="#FCD34D"/>
    
    {/* Windows */}
    <rect x="40" y="110" width="25" height="30" rx="3" fill="#0EA5E9"/>
    <rect x="135" y="110" width="25" height="30" rx="3" fill="#0EA5E9"/>
    
    {/* Window frames */}
    <line x1="52.5" y1="110" x2="52.5" y2="140" stroke="white" strokeWidth="2"/>
    <line x1="40" y1="125" x2="65" y2="125" stroke="white" strokeWidth="2"/>
    <line x1="147.5" y1="110" x2="147.5" y2="140" stroke="white" strokeWidth="2"/>
    <line x1="135" y1="125" x2="160" y2="125" stroke="white" strokeWidth="2"/>
    
    {/* Chimney */}
    <rect x="140" y="30" width="20" height="35" fill="#991B1B"/>
    
    {/* Stars/sparkles */}
    <circle cx="25" cy="50" r="3" fill="#FCD34D"/>
    <circle cx="175" cy="45" r="2" fill="#FCD34D"/>
    <circle cx="185" cy="60" r="2.5" fill="#FCD34D"/>
  </svg>
);

const LandingPage = () => {
  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-red-950 to-stone-950 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px]"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-red-400/40 rounded-full animate-bounce delay-100"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-red-300/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-amber-400/40 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-1/3 right-20 w-2 h-2 bg-red-400/30 rounded-full animate-bounce delay-700"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-6 animate-fade-in">
            <PulperiaLogo className="w-40 md:w-52 h-auto mx-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-500" />
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-3 tracking-tight">
            La <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Pulpería</span>
          </h1>
          
          <p className="text-white/60 text-lg md:text-xl mb-10 max-w-lg mx-auto">
            Tu tienda de barrio, ahora en tu bolsillo
          </p>
          
          {/* CTA Button */}
          <button
            data-testid="login-button"
            onClick={handleLogin}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-black py-4 px-10 rounded-2xl text-lg shadow-2xl shadow-red-900/50 hover:shadow-red-500/40 hover:scale-105 transition-all duration-300 border border-red-400/30"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Comenzar con Google
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-8 text-white/50 text-sm">
            🇭🇳 Conectando comunidades hondureñas
          </p>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 bg-white/50 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">Simple y Rápido</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Encuentra, ordena y recoge. Así de fácil.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, title: 'Encuentra', desc: 'Pulperías cercanas a ti', step: '01' },
              { icon: Search, title: 'Busca', desc: 'Productos disponibles', step: '02' },
              { icon: ShoppingCart, title: 'Ordena', desc: 'Desde tu celular', step: '03' },
              { icon: Zap, title: 'Recoge', desc: 'Cuando esté listo', step: '04' }
            ].map((item, i) => (
              <div key={i} className="group relative">
                <div className="absolute -top-3 -left-3 text-6xl font-black text-red-500/10 group-hover:text-red-500/20 transition-colors">
                  {item.step}
                </div>
                <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-red-500/30 hover:bg-white/10 transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-900/30 group-hover:scale-110 group-hover:rotate-3 transition-all">
                    <item.icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/50">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 backdrop-blur-xl rounded-3xl p-10 border border-red-500/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { num: '100+', label: 'Pulperías', icon: Store },
                { num: '5,000+', label: 'Usuarios', icon: Users },
                { num: '10K+', label: 'Órdenes', icon: Package },
                { num: '4.9', label: 'Rating', icon: Star }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-red-400" />
                  <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.num}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Cards */}
      <div className="relative z-10 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* For Customers */}
            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-all">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Soy Cliente</h3>
              <p className="text-white/60 mb-6">
                Encuentra productos cerca de ti, compara precios y ordena con un solo click.
              </p>
              <ul className="space-y-2 mb-8">
                {['Busca en todas las pulperías', 'Compara precios fácil', 'Recibe notificaciones'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 bg-white text-red-700 font-bold py-3 px-6 rounded-xl hover:bg-red-50 transition-all shadow-lg"
              >
                Empezar a Comprar <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* For Store Owners */}
            <div className="group bg-gradient-to-br from-red-600/20 to-red-700/20 backdrop-blur-xl rounded-3xl p-10 border border-red-500/20 hover:border-red-500/40 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Tengo una Pulpería</h3>
              <p className="text-white/60 mb-6">
                Digitaliza tu negocio, recibe pedidos y aumenta tus ventas.
              </p>
              <ul className="space-y-2 mb-8">
                {['Panel de control completo', 'Notificaciones en tiempo real', 'Gestiona tu inventario'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-6 rounded-xl hover:from-red-400 hover:to-red-500 transition-all shadow-lg"
              >
                <Store className="w-4 h-4" /> Registrar mi Pulpería
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-10 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <PulperiaLogo className="w-10 h-10" />
              <span className="text-white font-bold">La Pulpería</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a 
                href="mailto:onol4sco05@gmail.com"
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                onol4sco05@gmail.com
              </a>
              <a 
                href="https://paypal.me/alejandronolasco979"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full text-sm hover:bg-blue-600/30 transition-all"
              >
                💝 Apoyar
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-white/30 text-sm">
              © 2024 La Pulpería — Hecho con ❤️ en Honduras
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
