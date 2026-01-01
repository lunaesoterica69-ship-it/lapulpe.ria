import { X, AlertTriangle } from 'lucide-react';

// Disclaimer simple y limpio
const DisclaimerModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-stone-900 rounded-2xl border border-stone-700/50 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Aviso Importante</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-amber-200 text-sm leading-relaxed">
              Esta app es para el <span className="font-bold">comercio libre</span> entre individuos y empresas, con el objetivo de fomentar la compra y venta de bienes.
            </p>
            <p className="text-amber-200/80 text-sm mt-3 leading-relaxed">
              Todo lo que hagas en esta página es <span className="font-bold">responsabilidad tuya</span>. Verifica todas las informaciones antes de comprar.
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-200 text-sm leading-relaxed">
              <span className="font-bold">Dale tiempo</span> si a veces está lenta. Comprueba tu conexión o sigue esperando.
            </p>
          </div>

          <div className="bg-stone-800/50 rounded-xl p-4">
            <p className="text-stone-300 text-sm leading-relaxed">
              Si no ves tiendas cerca tuyo, es porque <span className="font-bold">no hay registradas</span> en tu zona.
            </p>
            <p className="text-stone-400 text-sm mt-2 leading-relaxed">
              Acércate a tu pulpería o negocio de confianza y diles que se unan.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 text-lg"
          >
            Entendido, continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
