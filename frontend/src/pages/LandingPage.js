import { MapPin, Store, ShoppingBag, Zap, Search, ArrowRight, Users, Briefcase, Star, ShoppingCart } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_ecde96f6-7675-4ac5-b409-37ffab40ae06/artifacts/erx8klhi_task_01kdpqhwsmffxsgnf3qpxjd2p1_1767068237_img_1%20%281%29.webp';

const LandingPage = () => {
  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-orange-600 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo Image */}
          <div className="mb-8">
            <img 
              src={LOGO_URL} 
              alt="La Pulpería" 
              className="w-72 h-auto mx-auto rounded-3xl shadow-2xl shadow-black/30 transform hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          {/* CTA Button */}
          <button
            data-testid="login-button"
            onClick={handleLogin}
            className="group relative inline-flex items-center gap-3 bg-white text-red-700 font-black py-5 px-12 rounded-2xl text-xl shadow-xl shadow-black/20 hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Comenzar con Google
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-6 text-white/80 text-lg">
            Conectando comunidades hondureñas con sus pulperías favoritas
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-24 bg-white/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Simple, rápido y diseñado para Honduras
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-orange-400/50 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Encuentra</h3>
              <p className="text-white/70">Pulperías cercanas en un mapa interactivo</p>
            </div>

            <div className="group bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-orange-400/50 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Busca</h3>
              <p className="text-white/70">Productos en todas las tiendas de tu zona</p>
            </div>

            <div className="group bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-orange-400/50 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Ordena</h3>
              <p className="text-white/70">Agrega al carrito y realiza tu pedido</p>
            </div>

            <div className="group bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-orange-400/50 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Recoge</h3>
              <p className="text-white/70">Notificación cuando tu orden esté lista</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">100+</div>
              <div className="text-white/70">Pulperías</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">5K+</div>
              <div className="text-white/70">Usuarios</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">10K+</div>
              <div className="text-white/70">Órdenes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">4.9</div>
              <div className="text-white/70 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA for Business */}
      <div className="relative z-10 px-6 py-24 bg-white/10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-red-500/30 to-orange-500/30 backdrop-blur-xl rounded-3xl p-10 border border-white/20">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Para Clientes</h3>
              <p className="text-white/80 mb-6">
                Encuentra productos, compara precios y ordena desde tu celular. ¡Es gratis!
              </p>
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 bg-white text-red-700 font-bold py-3 px-6 rounded-xl hover:bg-red-50 transition-all shadow-lg"
              >
                Comenzar a Comprar
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-orange-500/30 to-red-500/30 backdrop-blur-xl rounded-3xl p-10 border border-white/20">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6">
                <Store className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">¿Tienes una Pulpería?</h3>
              <p className="text-white/80 mb-6">
                Digitaliza tu negocio, recibe órdenes en tiempo real y aumenta tus ventas.
              </p>
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
              >
                <Store className="w-5 h-5" />
                Registrar mi Pulpería
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            💝 Apoya al Creador
          </h3>
          <p className="text-white/70 mb-6">
            Si te gusta La Pulpería, puedes apoyar su desarrollo
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:onol4sco05@gmail.com"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/20 hover:border-white/40 transition-all text-white/90 hover:text-white"
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
          <p className="text-white/50 text-sm">
            © 2024 La Pulpería — Conectando comunidades hondureñas
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
