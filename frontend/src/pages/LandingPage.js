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

// Logo de La Pulpería - Elegante y profesional
const PulperiaLogo = ({ size = "md" }) => {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };
  
  return (
    <svg viewBox="0 0 100 100" className={`${sizes[size]}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Gradientes elegantes */}
        <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DC2626"/>
          <stop offset="100%" stopColor="#991B1B"/>
        </linearGradient>
        <linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB"/>
          <stop offset="100%" stopColor="#FEF3C7"/>
        </linearGradient>
        <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78350F"/>
          <stop offset="100%" stopColor="#451A03"/>
        </linearGradient>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D"/>
          <stop offset="50%" stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#D97706"/>
        </linearGradient>
        {/* Sombra suave */}
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.15"/>
        </filter>
        <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
          <feOffset in="blur" dx="0" dy="1" result="offsetBlur"/>
          <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
        </filter>
      </defs>
      
      {/* Fondo circular sutil */}
      <circle cx="50" cy="52" r="46" fill="none" stroke="rgba(220,38,38,0.1)" strokeWidth="1"/>
      
      {/* Edificio principal con sombra */}
      <g filter="url(#softShadow)">
        {/* Pared */}
        <rect x="18" y="40" width="64" height="48" rx="4" fill="url(#wallGradient)"/>
        
        {/* Toldo elegante */}
        <path d="M14 40 L50 18 L86 40" fill="none" stroke="url(#roofGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        
        {/* Ondas del toldo - más suaves */}
        <path d="M12 40 Q22 33 32 41 Q42 49 50 41 Q58 33 68 41 Q78 49 88 41" 
              fill="none" stroke="url(#roofGradient)" strokeWidth="10" strokeLinecap="round"/>
        <path d="M12 40 Q22 33 32 41 Q42 49 50 41 Q58 33 68 41 Q78 49 88 41" 
              fill="none" stroke="#FECACA" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      </g>
      
      {/* Ventanas elegantes con marco */}
      <g>
        {/* Ventana izquierda */}
        <rect x="24" y="50" width="18" height="16" rx="2" fill="#1F2937" stroke="#D4AF37" strokeWidth="1.5"/>
        <rect x="25.5" y="51.5" width="7" height="13" rx="1" fill="#111827"/>
        <rect x="34" y="51.5" width="7" height="13" rx="1" fill="#111827"/>
        {/* Reflejo */}
        <rect x="26" y="52" width="3" height="6" rx="0.5" fill="rgba(255,255,255,0.1)"/>
        {/* Productos */}
        <circle cx="29" cy="60" r="2.5" fill="#F59E0B"/>
        <rect x="35" y="57" width="4" height="6" rx="1" fill="#3B82F6"/>
        
        {/* Ventana derecha */}
        <rect x="58" y="50" width="18" height="16" rx="2" fill="#1F2937" stroke="#D4AF37" strokeWidth="1.5"/>
        <rect x="59.5" y="51.5" width="7" height="13" rx="1" fill="#111827"/>
        <rect x="68" y="51.5" width="7" height="13" rx="1" fill="#111827"/>
        {/* Reflejo */}
        <rect x="60" y="52" width="3" height="6" rx="0.5" fill="rgba(255,255,255,0.1)"/>
        {/* Productos */}
        <circle cx="63" cy="60" r="2.5" fill="#EF4444"/>
        <rect x="69" y="56" width="4" height="7" rx="1" fill="#22C55E"/>
      </g>
      
      {/* Puerta elegante */}
      <rect x="42" y="52" width="16" height="36" rx="2" fill="url(#doorGradient)" stroke="#92400E" strokeWidth="1"/>
      {/* Paneles de puerta */}
      <rect x="44" y="55" width="12" height="10" rx="1.5" fill="#5C2D0E" opacity="0.5"/>
      <rect x="44" y="68" width="12" height="10" rx="1.5" fill="#5C2D0E" opacity="0.5"/>
      {/* Perilla dorada */}
      <circle cx="54" cy="72" r="2.5" fill="url(#goldGradient)"/>
      <circle cx="53.5" cy="71.5" r="0.8" fill="#FEF3C7" opacity="0.8"/>
      
      {/* Letrero premium */}
      <rect x="26" y="41" width="48" height="8" rx="2" fill="url(#roofGradient)" stroke="#FCD34D" strokeWidth="0.8"/>
      <text x="50" y="47" textAnchor="middle" fill="#FEF3C7" fontSize="5.5" fontWeight="bold" fontFamily="Georgia, serif" letterSpacing="1">PULPERÍA</text>
      
      {/* Detalles dorados decorativos */}
      <circle cx="50" cy="16" r="3" fill="url(#goldGradient)"/>
      <circle cx="49" cy="15" r="1" fill="#FEF3C7" opacity="0.6"/>
      
      {/* Línea base elegante */}
      <line x1="15" y1="88" x2="85" y2="88" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
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
