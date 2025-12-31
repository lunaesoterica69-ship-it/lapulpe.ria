import { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';

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

const DisclaimerModal = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-stone-900 rounded-3xl border border-stone-700 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-stone-900 px-6 pt-6 pb-4 border-b border-stone-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Bienvenido a La Pulpería</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Disclaimer principal */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
            <p className="text-amber-200 text-sm leading-relaxed">
              Esta app es para el <span className="font-semibold">comercio libre</span> entre individuos y empresas, con el objetivo de fomentar la compra y venta de bienes.
            </p>
            <p className="text-amber-200/80 text-sm mt-3 leading-relaxed">
              Todo lo que hagas en esta página es <span className="font-semibold">responsabilidad tuya</span>. Verifica todas las informaciones antes de comprar.
            </p>
          </div>

          {/* Sobre la carga */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
            <p className="text-blue-200 text-sm leading-relaxed">
              <span className="font-semibold">Dale tiempo</span> si a veces está lenta. Comprueba tu conexión o sigue esperando.
            </p>
          </div>

          {/* Sobre tiendas cercanas */}
          <div className="bg-stone-800 rounded-2xl p-4">
            <p className="text-stone-300 text-sm leading-relaxed">
              Si no ves tiendas cerca tuyo, es porque <span className="font-semibold">no hay registradas</span> en tu zona.
            </p>
            <p className="text-stone-400 text-sm mt-2 leading-relaxed">
              Acércate a tu pulpería o negocio de confianza y diles que se unan usando el link en nuestras páginas oficiales.
            </p>
          </div>

          {/* Redes Sociales */}
          <div>
            <p className="text-stone-500 text-xs uppercase tracking-wider mb-3 font-medium">Síguenos</p>
            <div className="flex gap-3">
              <a
                href="https://x.com/LaPul_periaHN"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-stone-800 text-white py-3 px-4 rounded-xl transition-colors border border-stone-700"
              >
                <XIcon />
                <span className="font-medium">X</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
              <a
                href="https://www.instagram.com/lapulperiah?igsh=MXJlemJzaTl4NDIxdQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-4 rounded-xl transition-colors"
              >
                <InstagramIcon />
                <span className="font-medium">Instagram</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            </div>
          </div>

          {/* Compartir */}
          <div>
            <p className="text-stone-500 text-xs uppercase tracking-wider mb-3 font-medium">Comparte La Pulpería</p>
            <div className="bg-stone-800 rounded-xl p-3 border border-stone-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-stone-900 rounded-lg px-3 py-2 text-sm text-stone-400 truncate border border-stone-600">
                  {window.location.origin}
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`p-2.5 rounded-lg transition-colors ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-stone-700 hover:bg-stone-600 text-white'
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={handleShare}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Compartir con amigos
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-white hover:bg-stone-100 text-stone-900 py-4 rounded-xl font-bold transition-colors text-lg"
          >
            Entendido, continuar
          </button>
          <p className="text-center text-stone-600 text-xs mt-3">
            🇭🇳 Conectando comunidades hondureñas
          </p>
        </div>
      </div>
    </div>
  );
};

// Hook para manejar el disclaimer
export const useDisclaimer = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    // Verificar si ya vio el disclaimer
    const hasSeenDisclaimer = localStorage.getItem('lapulperia_disclaimer_seen');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
  }, []);

  const closeDisclaimer = () => {
    localStorage.setItem('lapulperia_disclaimer_seen', 'true');
    setShowDisclaimer(false);
  };

  return { showDisclaimer, closeDisclaimer };
};

export default DisclaimerModal;
