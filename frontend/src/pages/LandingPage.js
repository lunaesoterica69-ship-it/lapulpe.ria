import { useState } from 'react';
import { ArrowRight, Copy, Check, ExternalLink, ShoppingBag, Store, Bell, MapPin, Star } from 'lucide-react';
import DisclaimerModal from '../components/DisclaimerModal';
import { api, BACKEND_URL, isCustomDomain } from '../config/api';

// Iconos de redes sociales
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// Modal de "Cómo Funciona" - Estilo limpio con iconos centrados
const HowItWorksModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
    <div className="bg-stone-900 rounded-2xl border border-stone-700/50 max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto">
      {/* Header centrado */}
      <div className="px-6 pt-6 pb-4 border-b border-stone-800 text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-500/20">
          <Store className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">¿Cómo funciona?</h2>
        <p className="text-stone-500 text-sm mt-1">3 simples pasos</p>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Paso 1 */}
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-sm font-bold">1</span>
              <h3 className="text-white font-bold">Explora</h3>
            </div>
            <p className="text-stone-400 text-sm">Encuentra pulperías cercanas a tu ubicación en el mapa</p>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">2</span>
              <h3 className="text-white font-bold">Ordena</h3>
            </div>
            <p className="text-stone-400 text-sm">Agrega productos al carrito y haz tu pedido</p>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm font-bold">3</span>
              <h3 className="text-white font-bold">Recibe</h3>
            </div>
            <p className="text-stone-400 text-sm">Te notificamos cuando tu orden esté lista para recoger</p>
          </div>
        </div>

        {/* Para dueños */}
        <div className="bg-gradient-to-r from-stone-800/80 to-stone-800/40 rounded-xl p-4 mt-2 border border-stone-700/50">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">¿Tienes una pulpería?</h3>
              <p className="text-stone-400 text-xs mt-0.5">Registra tu negocio gratis y empieza a recibir pedidos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          ¡Empezar!
        </button>
      </div>
    </div>
  </div>
);

// Logo de La Pulpería - Tiendita simple y limpia
const PulperiaLogo = ({ size = "md" }) => {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };
  
  return (
    <svg viewBox="0 0 100 100" className={`${sizes[size]}`} xmlns="http://www.w3.org/2000/svg">
      {/* Edificio - fondo crema */}
      <rect x="15" y="38" width="70" height="54" rx="3" fill="#FEF3C7" stroke="#FFF" strokeWidth="3"/>
      
      {/* Toldo rojo */}
      <path d="M10 38 L50 14 L90 38" fill="none" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 38 Q19 30 30 40 Q41 50 52 40 Q63 30 74 40 Q85 50 92 40 L92 48 Q83 56 72 46 Q61 36 50 46 Q39 56 28 46 Q17 36 8 46 Z" fill="#DC2626" stroke="#FFF" strokeWidth="2"/>
      
      {/* Ventana izquierda */}
      <rect x="22" y="48" width="20" height="18" rx="2" fill="#292524" stroke="#FFF" strokeWidth="2"/>
      <line x1="32" y1="48" x2="32" y2="66" stroke="#FFF" strokeWidth="1.5"/>
      <rect x="25" y="54" width="5" height="8" rx="1" fill="#3B82F6"/>
      <circle cx="38" cy="57" r="3" fill="#F59E0B"/>
      
      {/* Ventana derecha */}
      <rect x="58" y="48" width="20" height="18" rx="2" fill="#292524" stroke="#FFF" strokeWidth="2"/>
      <line x1="68" y1="48" x2="68" y2="66" stroke="#FFF" strokeWidth="1.5"/>
      <circle cx="63" cy="57" r="3" fill="#EF4444"/>
      <rect x="70" y="53" width="5" height="9" rx="1" fill="#22C55E"/>
      
      {/* Puerta */}
      <rect x="42" y="52" width="16" height="40" rx="2" fill="#78350F" stroke="#FFF" strokeWidth="2"/>
      <circle cx="55" cy="74" r="2.5" fill="#FCD34D" stroke="#FFF" strokeWidth="1"/>
      
      {/* Letrero PULPERÍA */}
      <rect x="28" y="40" width="44" height="7" rx="2" fill="#DC2626" stroke="#FFF" strokeWidth="1.5"/>
      <text x="50" y="46" textAnchor="middle" fill="#FFF" fontSize="5" fontWeight="bold" fontFamily="Arial, sans-serif">PULPERÍA</text>
    </svg>
  );
};

const LandingPage = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    
    if (isCustomDomain()) {
      // Usar Google OAuth propio para el dominio personalizado
      try {
        const redirectUri = `${window.location.origin}/auth/callback`;
        console.log('[Login] Custom domain detected');
        console.log('[Login] Backend:', BACKEND_URL);
        
        // Retry logic para manejar errores de red
        let attempts = 0;
        const maxAttempts = 3;
        let lastError = null;
        
        while (attempts < maxAttempts) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(
              `${BACKEND_URL}/api/auth/google/url?redirect_uri=${encodeURIComponent(redirectUri)}`,
              { signal: controller.signal }
            );
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data?.auth_url) {
              console.log('[Login] Redirecting to Google...');
              window.location.href = data.auth_url;
              return;
            }
            break;
          } catch (err) {
            lastError = err;
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise(r => setTimeout(r, 1000)); // Esperar 1s antes de reintentar
            }
          }
        }
        
        console.error('[Login] All attempts failed:', lastError);
        setIsLoggingIn(false);
        // Mostrar mensaje más amigable
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-4 right-4 bg-red-600 text-white px-4 py-3 rounded-xl shadow-2xl z-50 animate-fade-in-up text-center text-sm';
        toast.textContent = 'No se pudo conectar. Verifica tu internet e intenta de nuevo.';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
        
      } catch (error) {
        console.error('[Login] OAuth error:', error);
        setIsLoggingIn(false);
      }
    } else {
      // Usar Emergent Auth para el dominio de preview
      const redirectUrl = window.location.origin + '/dashboard';
      window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    }
  };

  const handleDisclaimerClose = () => {
    setShowDisclaimer(false);
    setShowHowItWorks(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'La Pulpería',
          text: '¡Descubre La Pulpería! Conectando comunidades hondureñas',
          url: window.location.origin
        });
      } catch (e) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 relative overflow-hidden">
      {/* Modals */}
      {showDisclaimer && <DisclaimerModal onClose={handleDisclaimerClose} />}
      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}

      {/* Animated Nebula Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-red-500/15 rounded-full blur-[80px] animate-pulse-slow animation-delay-200" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Animated Stars */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 animate-twinkle" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.55), transparent),
            radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 90% 30%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 15% 70%, rgba(255,255,255,0.45), transparent),
            radial-gradient(1px 1px at 85% 85%, rgba(255,255,255,0.5), transparent)
          `
        }} />
        <div className="absolute inset-0 animate-twinkle-delayed" style={{
          backgroundImage: `
            radial-gradient(2px 2px at 25% 35%, rgba(255,255,255,0.4), transparent),
            radial-gradient(2px 2px at 65% 45%, rgba(255,255,255,0.35), transparent),
            radial-gradient(2px 2px at 45% 75%, rgba(255,255,255,0.3), transparent)
          `
        }} />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-float-1" style={{ left: '15%', top: '25%' }} />
        <div className="absolute w-0.5 h-0.5 bg-red-400/40 rounded-full animate-float-2" style={{ left: '75%', top: '35%' }} />
        <div className="absolute w-1 h-1 bg-white/20 rounded-full animate-float-3" style={{ left: '45%', top: '65%' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center animate-fade-in-up">
            {/* Logo con glow */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="animate-bounce-soft">
                <PulperiaLogo size="lg" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              La <span className="text-red-500">Pulpería</span>
            </h1>
            
            <p className="text-stone-500 text-base mb-8 animate-fade-in-up animation-delay-100">¿Qué deseaba?</p>
            
            {/* Botón principal - simple con glow */}
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              data-testid="login-button"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-red-800 disabled:to-red-900 text-white font-medium py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95 animate-fade-in-up animation-delay-200"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Comenzar con Google</span>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Section - Simple */}
        <div className="px-6 pb-8 animate-fade-in-up animation-delay-300">
          {/* Social Links */}
          <div className="flex justify-center gap-3 mb-4">
            <a
              href="https://x.com/LaPul_periaHN"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-stone-900/80 hover:bg-stone-800 text-white py-2.5 px-4 rounded-xl transition-all duration-300 border border-stone-800 hover:border-stone-600 hover:scale-105 backdrop-blur-sm"
            >
              <XIcon />
              <span className="text-sm font-medium">X</span>
            </a>
            <a
              href="https://www.instagram.com/lapulperiah?igsh=MXJlemJzaTl4NDIxdQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2.5 px-4 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <InstagramIcon />
              <span className="text-sm font-medium">Instagram</span>
            </a>
          </div>

          {/* Share Section */}
          <div className="max-w-sm mx-auto">
            <div className="bg-stone-900/50 rounded-xl p-3 border border-stone-800/50 backdrop-blur-sm">
              <p className="text-stone-500 text-xs text-center mb-2">Comparte La Pulpería</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-stone-800/50 rounded-lg px-3 py-2 text-xs text-stone-400 truncate">
                  {window.location.host}
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${copied ? 'bg-green-600' : 'bg-stone-700 hover:bg-stone-600'} text-white`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleShare}
                  className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-stone-600 text-xs mt-4">🇭🇳 Conectando comunidades hondureñas</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
