import { X, AlertTriangle, Shield, Clock, MapPin } from 'lucide-react';

// Disclaimer simple y limpio con iconos mejorados
const DisclaimerModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-stone-900 rounded-2xl border border-stone-700/50 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-800 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Aviso Importante</h2>
          <p className="text-stone-500 text-sm mt-1">Antes de continuar</p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex gap-4 items-start bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-200 text-sm leading-relaxed">
                Esta app es para el <span className="font-bold">comercio libre</span> entre individuos y empresas.
              </p>
              <p className="text-amber-200/70 text-sm mt-2 leading-relaxed">
                Todo lo que hagas es <span className="font-bold">tu responsabilidad</span>. Verifica antes de comprar.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-blue-200 text-sm leading-relaxed">
                <span className="font-bold">Dale tiempo</span> si está lenta. Comprueba tu conexión o sigue esperando.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start bg-stone-800/50 border border-stone-700/50 rounded-xl p-4">
            <div className="w-10 h-10 bg-stone-700/50 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-stone-400" />
            </div>
            <div>
              <p className="text-stone-300 text-sm leading-relaxed">
                Si no ves tiendas cerca, es porque <span className="font-bold">no hay registradas</span> en tu zona.
              </p>
              <p className="text-stone-500 text-sm mt-1">
                Invita a tu pulpería favorita a unirse.
              </p>
            </div>
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
