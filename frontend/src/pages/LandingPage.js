import { MapPin, Store, ShoppingBag, Zap, Search, ArrowRight, Users, Briefcase, Star, ShoppingCart } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_ecde96f6-7675-4ac5-b409-37ffab40ae06/artifacts/erx8klhi_task_01kdpqhwsmffxsgnf3qpxjd2p1_1767068237_img_1%20%281%29.webp';
const BG_IMAGE = 'https://customer-assets.emergentagent.com/job_ecde96f6-7675-4ac5-b409-37ffab40ae06/artifacts/puislxng_task_01kdpthgcfevxsh9hz1k6vqg5r_1767071380_img_1.webp';

const LandingPage = () => {
  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
      {/* Dark overlay for better text visibility */}
      <div className="fixed inset-0 bg-black/30" />

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo - blends with background */}
          <div className="mb-10">
            <img 
              src={LOGO_URL} 
              alt="La Pulpería" 
              className="w-56 md:w-72 h-auto mx-auto transform hover:scale-105 transition-transform duration-500"
              style={{ 
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))'
              }}
            />
          </div>
          
          {/* CTA Button */}
          <button
            data-testid="login-button"
            onClick={handleLogin}
            className="group relative inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm text-red-700 font-black py-4 px-10 rounded-2xl text-lg shadow-2xl shadow-black/40 hover:bg-white hover:scale-105 transition-all duration-300"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Comenzar con Google
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-8 text-white/80 text-base md:text-lg max-w-md mx-auto drop-shadow-lg">
            Conectando comunidades hondureñas con sus pulperías favoritas
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-20 bg-black/40 backdrop-blur-md">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3 drop-shadow-lg">
              ¿Cómo funciona?
            </h2>
            <p className="text-white/70 text-base max-w-md mx-auto">
              Simple, rápido y diseñado para Honduras
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: MapPin, title: 'Encuentra', desc: 'Pulperías cercanas' },
              { icon: Search, title: 'Busca', desc: 'Productos en tu zona' },
              { icon: ShoppingCart, title: 'Ordena', desc: 'Desde tu celular' },
              { icon: Zap, title: 'Recoge', desc: 'Cuando esté listo' }
            ].map((item, i) => (
              <div key={i} className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-red-400/50 hover:bg-white/20 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-4 gap-4">
            {[
              { num: '100+', label: 'Pulperías' },
              { num: '5K+', label: 'Usuarios' },
              { num: '10K+', label: 'Órdenes' },
              { num: '4.9', label: 'Rating', icon: Star }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-4xl font-black text-white mb-1 drop-shadow-lg">{stat.num}</div>
                <div className="text-white/60 text-xs md:text-sm flex items-center justify-center gap-1">
                  {stat.icon && <stat.icon className="w-3 h-3 fill-current text-amber-400" />}
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Cards */}
      <div className="relative z-10 px-6 py-16 bg-black/40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Para Clientes</h3>
              <p className="text-white/70 text-sm mb-5">
                Encuentra productos, compara precios y ordena fácil.
              </p>
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 bg-white text-red-700 font-bold py-2.5 px-5 rounded-xl text-sm hover:bg-red-50 transition-all shadow-lg"
              >
                Comenzar <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5">
                <Store className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¿Tienes Pulpería?</h3>
              <p className="text-white/70 text-sm mb-5">
                Digitaliza tu negocio y recibe órdenes en tiempo real.
              </p>
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm hover:from-red-400 hover:to-red-500 transition-all shadow-lg"
              >
                <Store className="w-4 h-4" /> Registrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 border-t border-white/10 bg-black/30">
        <p className="text-center text-white/50 text-xs">
          © 2024 La Pulpería — Honduras
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
