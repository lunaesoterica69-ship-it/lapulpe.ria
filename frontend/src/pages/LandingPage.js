import { useState } from 'react';
import { ArrowRight, Copy, Check, ExternalLink, ShoppingBag, Store, Bell, MapPin, Star } from 'lucide-react';
import axios from 'axios';
import DisclaimerModal from '../components/DisclaimerModal';

const CUSTOM_DOMAIN = 'lapulperiastore.net';
// Always use Emergent backend for API calls
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://lapulperia.preview.emergentagent.com';

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

// Modal de "Cómo Funciona" - Defined outside component to prevent re-creation
const HowItWorksModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
    <div className="bg-stone-900 rounded-3xl border border-stone-700 max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto">
      <div className="px-6 pt-6 pb-4 border-b border-stone-800">
        <h2 className="text-xl font-bold text-white text-center">¿Cómo funciona?</h2>
        <p className="text-stone-500 text-sm text-center mt-1">3 simples pasos</p>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Paso 1 */}
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">1. Explora</h3>
            <p className="text-stone-400 text-sm mt-1">Encuentra pulperías cercanas a tu ubicación en el mapa</p>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">2. Ordena</h3>
            <p className="text-stone-400 text-sm mt-1">Agrega productos al carrito y haz tu pedido</p>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">3. Recibe</h3>
            <p className="text-stone-400 text-sm mt-1">Te notificamos cuando tu orden esté lista para recoger</p>
          </div>
        </div>

        {/* Para dueños */}
        <div className="bg-stone-800 rounded-2xl p-4 mt-4">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
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
          className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold transition-colors"
        >
          ¡Empezar!
        </button>
      </div>
    </div>
  </div>
);

const PulperiaLogo = () => (
  <svg viewBox="0 0 50 50" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="22" width="34" height="24" rx="2" fill="#FEE2E2" opacity="0.9"/>
    <path d="M5 24 Q12 18 18 24 Q24 30 30 24 Q36 18 42 24 L45 24 L45 20 L25 8 L5 20 Z" fill="#EF4444"/>
    <rect x="19" y="30" width="12" height="16" rx="1" fill="#B91C1C"/>
    <circle cx="28" cy="38" r="1.2" fill="#FCD34D"/>
  </svg>
);

const LandingPage = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogin = async () => {
    const currentHost = window.location.hostname;
    const isCustomDomain = currentHost === CUSTOM_DOMAIN || currentHost === `www.${CUSTOM_DOMAIN}`;
    
    if (isCustomDomain) {
      // Use custom Google OAuth for custom domain
      try {
        const redirectUri = `${window.location.origin}/auth/callback`;
        const response = await axios.get(`${BACKEND_URL}/api/auth/google/url`, {
          params: { redirect_uri: redirectUri }
        });
        
        if (response.data?.auth_url) {
          window.location.href = response.data.auth_url;
        } else {
          console.error('No auth URL received');
          alert('Error al iniciar sesión. Por favor intenta de nuevo.');
        }
      } catch (error) {
        console.error('OAuth error:', error);
        alert('Error al conectar con Google. Por favor intenta de nuevo.');
      }
    } else {
      // Use Emergent Auth for preview domain
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

      {/* Nebula */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-red-500/15 rounded-full blur-[80px]" />
      </div>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none opacity-50" style={{
        backgroundImage: `radial-gradient(1px 1px at 10% 20%, white, transparent),
          radial-gradient(1px 1px at 30% 80%, white, transparent),
          radial-gradient(1px 1px at 50% 10%, white, transparent),
          radial-gradient(1px 1px at 70% 60%, white, transparent),
          radial-gradient(1px 1px at 90% 30%, white, transparent)`
      }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <PulperiaLogo />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                La <span className="text-red-500">Pulpería</span>
              </h1>
            </div>
            
            <p className="text-stone-500 text-base mb-6">¿Qué deseaba?</p>
            
            <button
              onClick={handleLogin}
              className="group inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-medium py-3.5 px-8 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Comenzar con Google
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
            </button>
          </div>
        </div>

        {/* Bottom Section - Redes y Compartir */}
        <div className="px-6 pb-8">
          {/* Social Links */}
          <div className="flex justify-center gap-3 mb-4">
            <a
              href="https://x.com/LaPul_periaHN"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white py-2.5 px-4 rounded-xl transition-colors border border-stone-800"
            >
              <XIcon />
              <span className="text-sm font-medium">X</span>
            </a>
            <a
              href="https://www.instagram.com/lapulperiah?igsh=MXJlemJzaTl4NDIxdQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2.5 px-4 rounded-xl transition-colors"
            >
              <InstagramIcon />
              <span className="text-sm font-medium">Instagram</span>
            </a>
          </div>

          {/* Share Section */}
          <div className="max-w-sm mx-auto">
            <div className="bg-stone-900/50 rounded-2xl p-3 border border-stone-800">
              <p className="text-stone-500 text-xs text-center mb-2">Comparte La Pulpería</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-stone-800 rounded-lg px-3 py-2 text-xs text-stone-500 truncate">
                  {window.location.host}
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-lg transition-colors ${copied ? 'bg-green-600' : 'bg-stone-700 hover:bg-stone-600'} text-white`}
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
