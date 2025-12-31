import { ArrowRight } from 'lucide-react';
import DisclaimerModal, { useDisclaimer } from '../components/DisclaimerModal';

// Logo minimalista inline
const PulperiaLogo = () => (
  <svg viewBox="0 0 50 50" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="22" width="34" height="24" rx="2" fill="#FEE2E2" opacity="0.9"/>
    <path d="M5 24 Q12 18 18 24 Q24 30 30 24 Q36 18 42 24 L45 24 L45 20 L25 8 L5 20 Z" fill="#EF4444"/>
    <rect x="19" y="30" width="12" height="16" rx="1" fill="#B91C1C"/>
    <circle cx="28" cy="38" r="1.2" fill="#FCD34D"/>
    <g transform="translate(6, 28)">
      <rect x="0" y="4" width="10" height="12" rx="1" fill="#DC2626"/>
      <path d="M2 4 L2 2 Q2 0 5 0 Q8 0 8 2 L8 4" fill="none" stroke="#DC2626" strokeWidth="1.5"/>
    </g>
  </svg>
);

const LandingPage = () => {
  const { showDisclaimer, closeDisclaimer } = useDisclaimer();

  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-stone-950 relative overflow-hidden">
      {/* Disclaimer Modal */}
      {showDisclaimer && <DisclaimerModal onClose={closeDisclaimer} />}

      {/* Nebula - CSS puro */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-red-500/15 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-600/10 rounded-full blur-[60px]" />
      </div>

      {/* Stars - CSS puro */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, white, transparent),
            radial-gradient(1px 1px at 30% 80%, white, transparent),
            radial-gradient(1px 1px at 50% 10%, white, transparent),
            radial-gradient(1px 1px at 70% 60%, white, transparent),
            radial-gradient(1px 1px at 90% 30%, white, transparent),
            radial-gradient(1px 1px at 20% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 90%, white, transparent),
            radial-gradient(1px 1px at 40% 40%, white, transparent),
            radial-gradient(1px 1px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 15% 85%, white, transparent)
          `
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PulperiaLogo />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              La <span className="text-red-500">Pulpería</span>
            </h1>
          </div>
          
          <p className="text-stone-500 text-base mb-8">¿Qué deseaba?</p>
          
          <button
            data-testid="login-button"
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
            <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <p className="mt-6 text-stone-600 text-sm">🇭🇳 Conectando comunidades hondureñas</p>
        </div>
      </div>

      <footer className="absolute bottom-0 inset-x-0 z-10 py-4 text-center">
        <span className="text-stone-600 text-xs">© 2024 La Pulpería</span>
      </footer>
    </div>
  );
};

export default LandingPage;
