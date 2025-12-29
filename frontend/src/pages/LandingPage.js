import { MapPin, Store, ShoppingBag, Zap, Search, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/select-type';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-950 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-red-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo/Icon */}
          <div className="mb-8 inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30 mx-auto">
              <Store className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            <span className="text-white">La </span>
            <span className="bg-gradient-to-r from-red-300 via-red-200 to-red-300 bg-clip-text text-transparent">
              Pulpería
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-10 text-red-100/80 max-w-2xl mx-auto font-semibold">
            ¿Qué deseaba?
          </p>
          
          {/* CTA Button */}
          <button
            data-testid="login-button"
            onClick={handleLogin}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 
              text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-xl shadow-red-900/50 
              hover:shadow-red-900/70 hover:scale-105 transition-all duration-300 border-2 border-red-400/20"
          >
            <Store className="w-5 h-5" />
            Comenzar con Google
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-red-100/70 text-lg">
              Simple, rápido y diseñado para Honduras
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-red-400/50 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Encuentra</h3>
              <p className="text-red-100/70">Pulperías cercanas en un mapa interactivo</p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-red-400/50 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Busca</h3>
              <p className="text-red-100/70">Productos específicos en todas las tiendas</p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-red-400/50 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Ordena</h3>
              <p className="text-red-100/70">Agrega al carrito y realiza tu pedido</p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-red-400/50 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Recoge</h3>
              <p className="text-red-100/70">Notificación instantánea cuando esté listo</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA for Business */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 backdrop-blur-xl rounded-3xl p-12 border border-red-500/20">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              ¿Tienes una pulpería?
            </h2>
            <p className="text-xl text-red-100/80 mb-8">
              Digitaliza tu negocio y recibe órdenes en tiempo real
            </p>
            <button
              data-testid="owner-cta-button"
              onClick={handleLogin}
              className="inline-flex items-center gap-2 bg-white text-red-900 font-bold py-4 px-8 rounded-2xl text-lg hover:bg-red-50 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <Store className="w-5 h-5" />
              Registrar mi Pulpería
            </button>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="relative z-10 px-6 py-16 bg-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            💝 Apoya al Creador
          </h3>
          <p className="text-red-100/70 mb-6">
            Si te gusta La Pulpería, puedes apoyar su desarrollo
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:onol4sco05@gmail.com"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/10 hover:border-white/30 transition-all text-red-100/90 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              onol4sco05@gmail.com
            </a>
            
            <a 
              href="https://paypal.me/alejandronolasco979?locale.x=es_XC&country.x=HN"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all text-white font-medium shadow-lg"
            >
              PayPal
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-red-100/50 text-sm">
            © 2024 La Pulpería — Conectando comunidades hondureñas
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
