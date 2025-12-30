import { MapPin, Store, ShoppingBag, Zap, Search, ArrowRight, Users, Star, ShoppingCart, Package, Sparkles } from 'lucide-react';

// Custom SVG Logo Component - La Pulpería (Minimalist)
const PulperiaLogo = ({ className = "" }) => (
  <svg viewBox="0 0 60 60" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
    </defs>
    {/* Store body */}
    <rect x="10" y="28" width="40" height="28" rx="3" fill="#FEE2E2"/>
    {/* Roof */}
    <path d="M6 30 L30 12 L54 30 Z" fill="url(#roofGrad)"/>
    {/* Awning stripes */}
    <rect x="10" y="28" width="8" height="8" fill="#DC2626"/>
    <rect x="18" y="28" width="8" height="8" fill="#FECACA"/>
    <rect x="26" y="28" width="8" height="8" fill="#DC2626"/>
    <rect x="34" y="28" width="8" height="8" fill="#FECACA"/>
    <rect x="42" y="28" width="8" height="8" fill="#DC2626"/>
    {/* Door */}
    <rect x="23" y="42" width="14" height="14" rx="2" fill="#991B1B"/>
    <circle cx="34" cy="50" r="1.5" fill="#FCD34D"/>
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
          {/* Logo + Title */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <PulperiaLogo className="w-14 md:w-16 h-auto" />
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
              La <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-500">Pulpería</span>
            </h1>
          </div>
          
          <p className="text-white/50 text-lg md:text-xl mb-10 max-w-lg mx-auto">
            Tu tienda de barrio, ahora en tu bolsillo
          </p>
          
          {/* CTA Button */}
          <button
            data-testid="login-button"
            onClick={handleLogin}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-2xl shadow-red-900/50 hover:shadow-red-500/40 hover:scale-105 transition-all duration-300 border border-red-400/30"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Comenzar con Google
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-8 text-white/40 text-sm">
            🇭🇳 Conectando comunidades hondureñas
          </p>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/40 rounded-full"></div>
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
