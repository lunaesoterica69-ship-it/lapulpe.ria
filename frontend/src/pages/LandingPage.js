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

// Modal de "Cómo Funciona" - Estilo limpio con toques sutiles
const HowItWorksModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
    <div className="bg-stone-900 rounded-2xl border border-stone-700/50 max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto">
      <div className="px-6 pt-6 pb-4 border-b border-stone-800">
        <h2 className="text-xl font-bold text-white text-center">¿Cómo funciona?</h2>
        <p className="text-stone-500 text-sm text-center mt-1">3 simples pasos</p>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Paso 1 */}
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">1. Explora</h3>
            <p className="text-stone-400 text-sm mt-1">Encuentra pulperías cercanas a tu ubicación en el mapa</p>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">2. Ordena</h3>
            <p className="text-stone-400 text-sm mt-1">Agrega productos al carrito y haz tu pedido</p>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">3. Recibe</h3>
            <p className="text-stone-400 text-sm mt-1">Te notificamos cuando tu orden esté lista para recoger</p>
          </div>
        </div>

        {/* Para dueños */}
        <div className="bg-stone-800/50 rounded-xl p-4 mt-4">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">¿Tienes una pulpería?</h3>
              <p className="text-stone-400 text-xs mt-1">Registra tu negocio gratis y empieza a recibir pedidos</p>
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

// Logo Simple de La Pulpería - Tienda con toldo (diseño original mejorado)
const PulperiaLogo = ({ size = "md" }) => {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-28 h-28"
  };
  
  return (
    <svg viewBox="0 0 100 100" className={sizes[size]} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EF4444"/>
          <stop offset="100%" stopColor="#B91C1C"/>
        </linearGradient>
        <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7"/>
          <stop offset="100%" stopColor="#FDE68A"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D"/>
          <stop offset="50%" stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#D97706"/>
        </linearGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Building */}
      <rect x="20" y="45" width="60" height="45" rx="3" fill="url(#wallGrad)" stroke="#DC2626" strokeWidth="2"/>
      
      {/* Roof - Toldo ondulado */}
      <path d="M15 45 L50 22 L85 45" fill="none" stroke="url(#roofGrad)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M15 45 Q27 38 39 45 Q50 52 61 45 Q73 38 85 45 L85 52 Q73 45 61 52 Q50 59 39 52 Q27 45 15 52 Z" fill="url(#roofGrad)"/>
      
      {/* Window left */}
      <rect x="26" y="52" width="16" height="14" rx="2" fill="#1C1917"/>
      <rect x="28" y="54" width="12" height="10" rx="1" fill="#292524"/>
      {/* Products */}
      <rect x="30" y="57" width="3" height="7" rx="1" fill="#3B82F6"/>
      <rect x="34" y="59" width="3" height="5" rx="1" fill="#10B981"/>
      
      {/* Window right */}
      <rect x="58" y="52" width="16" height="14" rx="2" fill="#1C1917"/>
      <rect x="60" y="54" width="12" height="10" rx="1" fill="#292524"/>
      {/* Hot food */}
      <circle cx="66" cy="60" r="3" fill="#F59E0B"/>
      
      {/* Door */}
      <rect x="42" y="58" width="16" height="32" rx="2" fill="#7F1D1D"/>
      <rect x="44" y="60" width="12" height="28" rx="1" fill="#991B1B"/>
      <circle cx="53" cy="76" r="2" fill="url(#goldGrad)" filter="url(#softGlow)"/>
      
      {/* Star on top */}
      <circle cx="50" cy="18" r="4" fill="url(#goldGrad)" filter="url(#softGlow)"/>
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

      {/* Art Deco Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(30deg, #D4A843 12%, transparent 12.5%, transparent 87%, #D4A843 87.5%, #D4A843),
            linear-gradient(150deg, #D4A843 12%, transparent 12.5%, transparent 87%, #D4A843 87.5%, #D4A843),
            linear-gradient(30deg, #D4A843 12%, transparent 12.5%, transparent 87%, #D4A843 87.5%, #D4A843),
            linear-gradient(150deg, #D4A843 12%, transparent 12.5%, transparent 87%, #D4A843 87.5%, #D4A843)
          `,
          backgroundSize: '80px 140px',
          backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px'
        }} />
      </div>

      {/* Animated Nebula Background - More subtle */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/15 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-900/10 rounded-full blur-[100px] animate-pulse-slow animation-delay-200" />
      </div>

      {/* Art Deco Corner Decorations */}
      <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
          <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="#D4A843"/>
          <path d="M0 0 L50 0 L50 5 L5 5 L5 50 L0 50 Z" fill="#D4A843" opacity="0.5"/>
        </svg>
      </div>
      <div className="fixed top-0 right-0 w-32 h-32 pointer-events-none transform scale-x-[-1]">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
          <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="#D4A843"/>
          <path d="M0 0 L50 0 L50 5 L5 5 L5 50 L0 50 Z" fill="#D4A843" opacity="0.5"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center animate-fade-in-up">
            {/* Logo con glow Art Deco */}
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="animate-bounce-soft">
                <PulperiaLogo size="lg" />
              </div>
              <div className="relative">
                {/* Art Deco Line Decorations */}
                <div className="absolute -left-12 top-1/2 w-8 h-px bg-gradient-to-r from-transparent to-amber-500/50" />
                <div className="absolute -right-12 top-1/2 w-8 h-px bg-gradient-to-l from-transparent to-amber-500/50" />
                <h1 className="text-4xl md:text-5xl font-bold font-serif">
                  <span className="text-amber-100">La </span>
                  <span className="gold-shimmer-text">Pulpería</span>
                </h1>
              </div>
            </div>
            
            <p className="text-amber-500/60 text-base mb-8 animate-fade-in-up animation-delay-100 tracking-widest uppercase text-sm font-serif">¿Qué deseaba?</p>
            
            {/* Botón Art Deco Premium */}
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              data-testid="login-button"
              className="group relative inline-flex items-center gap-3 art-deco-btn-primary py-4 px-10 text-base transition-all duration-300 animate-fade-in-up animation-delay-200"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-amber-100/30 border-t-amber-100 rounded-full animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Comenzar con Google</span>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Section - Art Deco Style */}
        <div className="px-6 pb-8 animate-fade-in-up animation-delay-300">
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/30" />
            <div className="w-2 h-2 rotate-45 bg-amber-500/30" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/30" />
          </div>

          {/* Social Links - Art Deco Style */}
          <div className="flex justify-center gap-3 mb-4">
            <a
              href="https://x.com/LaPul_periaHN"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-stone-900/80 hover:bg-stone-800 text-amber-100 py-2.5 px-4 transition-all duration-300 border border-amber-500/20 hover:border-amber-500/40 hover:scale-105 backdrop-blur-sm art-deco-border"
            >
              <XIcon />
              <span className="text-sm font-medium tracking-wide">X</span>
            </a>
            <a
              href="https://www.instagram.com/lapulperiah?igsh=MXJlemJzaTl4NDIxdQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2.5 px-4 transition-all duration-300 hover:scale-105"
              style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
            >
              <InstagramIcon />
              <span className="text-sm font-medium tracking-wide">Instagram</span>
            </a>
          </div>

          {/* Share Section - Art Deco */}
          <div className="max-w-sm mx-auto">
            <div className="bg-stone-900/50 p-3 border border-amber-500/10 art-deco-card">
              <p className="text-amber-500/50 text-xs text-center mb-2 tracking-widest uppercase">Comparte</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-stone-800 px-3 py-2 text-xs text-amber-100/60 truncate border border-amber-500/10">
                  {window.location.host}
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 transition-all duration-300 ${copied ? 'bg-emerald-600' : 'bg-stone-700 hover:bg-stone-600 border border-amber-500/20'} text-amber-100`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleShare}
                  className="px-3 py-2 art-deco-btn-primary"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Honduras Flag Colors Accent */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <div className="w-8 h-1 bg-sky-500 rounded-full" />
            <div className="w-8 h-1 bg-white rounded-full" />
            <div className="w-8 h-1 bg-sky-500 rounded-full" />
          </div>
          <p className="text-center text-amber-500/40 text-xs mt-2 tracking-widest uppercase font-serif">Conectando comunidades hondureñas</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
