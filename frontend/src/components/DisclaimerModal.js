import { X, AlertTriangle } from 'lucide-react';

// Disclaimer Art Deco Style - se muestra CADA VEZ que se entra
const DisclaimerModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-stone-900 to-stone-950 max-w-md w-full shadow-2xl art-deco-border">
        {/* Art Deco Header */}
        <div className="px-6 pt-6 pb-4 border-b-2 border-amber-500/30 flex items-center justify-between relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rotate-45 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-stone-900 -rotate-45" />
            </div>
            <h2 className="text-xl font-bold text-amber-100 font-serif tracking-wide">Aviso Importante</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-800 transition-colors border border-amber-500/20">
            <X className="w-5 h-5 text-amber-400/70" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4">
            <p className="text-amber-100 text-sm leading-relaxed font-serif">
              Esta app es para el <span className="font-bold text-amber-400">comercio libre</span> entre individuos y empresas, con el objetivo de fomentar la compra y venta de bienes.
            </p>
            <p className="text-amber-200/70 text-sm mt-3 leading-relaxed">
              Todo lo que hagas en esta página es <span className="font-bold text-amber-300">responsabilidad tuya</span>. Verifica todas las informaciones antes de comprar.
            </p>
          </div>

          <div className="bg-sky-500/10 border-l-4 border-sky-500 p-4">
            <p className="text-sky-100 text-sm leading-relaxed">
              <span className="font-bold text-sky-300">Dale tiempo</span> si a veces está lenta. Comprueba tu conexión o sigue esperando.
            </p>
          </div>

          <div className="bg-stone-800/50 border-l-4 border-stone-500 p-4">
            <p className="text-stone-200 text-sm leading-relaxed">
              Si no ves tiendas cerca tuyo, es porque <span className="font-bold text-amber-300">no hay registradas</span> en tu zona.
            </p>
            <p className="text-stone-400 text-sm mt-2 leading-relaxed">
              Acércate a tu pulpería o negocio de confianza y diles que se unan.
            </p>
          </div>
        </div>

        {/* Footer with Art Deco Button */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full art-deco-btn-primary py-4 text-lg transition-all duration-300"
          >
            Entendido, continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
