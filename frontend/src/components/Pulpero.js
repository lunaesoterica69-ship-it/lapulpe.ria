// Pulpero - Tu amigo pulpero que te acompaña en cada pedido
// Un personaje amigable y cercano que hace la espera más divertida

const Pulpero = ({ status, size = 'md', showMessage = true }) => {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  // Mensajes más humanos y variados para cada estado
  const messages = {
    pending: [
      "Dame un momento, ya te busco todo...",
      "Revisando tu pedido, ¡ya casi!",
      "Un segundito, estoy organizando...",
      "¡Recibido! Déjame prepararlo..."
    ],
    accepted: [
      "¡Manos a la obra! Preparando con cariño...",
      "Todo va bien, ya casi está listo...",
      "Empacando tus cosas con amor...",
      "¡Trabajando en tu pedido!"
    ],
    ready: [
      "¡Listo compa! Ya puedes pasar a buscar",
      "¡Todo preparado! Te espero",
      "¡Ya está! Ven cuando quieras",
      "¡Pedido listo! A tu orden"
    ]
  };

  const getMessage = (status) => {
    const statusMessages = messages[status];
    if (!statusMessages) return '';
    return statusMessages[Math.floor(Math.random() * statusMessages.length)];
  };

  // Pending: Pulpero buscando/organizando
  if (status === 'pending') {
    return (
      <div className={`${sizes[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Body */}
          <ellipse cx="50" cy="45" rx="28" ry="25" fill="#ef4444" className="animate-pulse" />
          
          {/* Face */}
          <ellipse cx="50" cy="42" rx="22" ry="18" fill="#fca5a5" />
          
          {/* Eyes - looking around curiously */}
          <g className="animate-bounce" style={{ animationDuration: '2s' }}>
            <circle cx="40" cy="38" r="6" fill="white" />
            <circle cx="60" cy="38" r="6" fill="white" />
            <circle cx="42" cy="38" r="3" fill="#1c1917" />
            <circle cx="62" cy="38" r="3" fill="#1c1917" />
          </g>
          
          {/* Thinking expression */}
          <path d="M34 32 Q40 28 46 32" stroke="#991b1b" strokeWidth="2" fill="none" />
          
          {/* Concentrated mouth */}
          <ellipse cx="50" cy="50" rx="4" ry="3" fill="#991b1b" />
          
          {/* Tentacles wiggling - busy searching */}
          <g>
            <path d="M25 55 Q20 65 25 75 Q30 85 25 90" stroke="#ef4444" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-wiggle-1" />
            <path d="M35 58 Q28 70 35 80 Q42 90 35 95" stroke="#ef4444" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-wiggle-2" />
            <path d="M50 60 Q50 72 50 82 Q50 92 50 98" stroke="#ef4444" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-wiggle-3" />
            <path d="M65 58 Q72 70 65 80 Q58 90 65 95" stroke="#ef4444" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-wiggle-2" />
            <path d="M75 55 Q80 65 75 75 Q70 85 75 90" stroke="#ef4444" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-wiggle-1" />
          </g>
          
          {/* Search indicators */}
          <text x="78" y="25" className="animate-float-up text-lg" fill="#fbbf24" fontWeight="bold">🔍</text>
        </svg>
        <style>{`
          @keyframes wiggle-1 { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
          @keyframes wiggle-2 { 0%, 100% { transform: rotate(5deg); } 50% { transform: rotate(-5deg); } }
          @keyframes wiggle-3 { 0%, 100% { transform: translateX(-2px); } 50% { transform: translateX(2px); } }
          @keyframes float-up { 0%, 100% { opacity: 0.5; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-8px); } }
          .animate-wiggle-1 { animation: wiggle-1 1s ease-in-out infinite; transform-origin: top center; }
          .animate-wiggle-2 { animation: wiggle-2 1.2s ease-in-out infinite; transform-origin: top center; }
          .animate-wiggle-3 { animation: wiggle-3 0.8s ease-in-out infinite; }
          .animate-float-up { animation: float-up 2s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  // Accepted: Pulpero preparando con gorro de chef
  if (status === 'accepted') {
    return (
      <div className={`${sizes[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Chef hat */}
          <ellipse cx="50" cy="18" rx="18" ry="10" fill="white" />
          <rect x="35" y="15" width="30" height="12" fill="white" />
          <rect x="38" y="25" width="24" height="4" fill="#e5e5e5" />
          
          {/* Body */}
          <ellipse cx="50" cy="50" rx="28" ry="25" fill="#3b82f6" />
          
          {/* Face */}
          <ellipse cx="50" cy="47" rx="22" ry="18" fill="#93c5fd" />
          
          {/* Happy closed eyes */}
          <path d="M36 42 Q40 38 44 42" stroke="#1e3a8a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M56 42 Q60 38 64 42" stroke="#1e3a8a" strokeWidth="3" fill="none" strokeLinecap="round" />
          
          {/* Cheerful smile */}
          <path d="M42 52 Q50 60 58 52" stroke="#1e3a8a" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* Blush */}
          <ellipse cx="35" cy="48" rx="4" ry="2" fill="#f472b6" opacity="0.5" />
          <ellipse cx="65" cy="48" rx="4" ry="2" fill="#f472b6" opacity="0.5" />
          
          {/* Tentacles busy working */}
          <g>
            <path d="M22 60 Q15 72 22 82" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-work-1" />
            <path d="M32 65 Q25 78 32 88" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-work-2" />
            <path d="M50 68 Q50 80 50 90" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M68 65 Q75 78 68 88" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-work-2" />
            <path d="M78 60 Q85 72 78 82" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-work-1" />
          </g>
          
          {/* Work sparkles */}
          <text x="80" y="35" className="animate-sparkle text-sm" fill="#fbbf24">✨</text>
          <text x="12" y="40" className="animate-sparkle-delayed text-xs" fill="#fbbf24">📦</text>
        </svg>
        <style>{`
          @keyframes work-1 { 0%, 100% { transform: rotate(-10deg) translateY(0); } 50% { transform: rotate(10deg) translateY(-5px); } }
          @keyframes work-2 { 0%, 100% { transform: rotate(10deg) translateY(0); } 50% { transform: rotate(-10deg) translateY(-5px); } }
          @keyframes sparkle { 0%, 100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1.2); } }
          .animate-work-1 { animation: work-1 0.6s ease-in-out infinite; transform-origin: top center; }
          .animate-work-2 { animation: work-2 0.6s ease-in-out infinite; transform-origin: top center; }
          .animate-sparkle { animation: sparkle 1s ease-in-out infinite; }
          .animate-sparkle-delayed { animation: sparkle 1s ease-in-out infinite 0.3s; }
        `}</style>
      </div>
    );
  }

  // Ready: Pulpero celebrando
  if (status === 'ready') {
    return (
      <div className={`${sizes[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Confetti */}
          <circle cx="15" cy="20" r="3" fill="#fbbf24" className="animate-confetti-1" />
          <circle cx="85" cy="25" r="2" fill="#f472b6" className="animate-confetti-2" />
          <circle cx="20" cy="80" r="2" fill="#34d399" className="animate-confetti-3" />
          <circle cx="80" cy="75" r="3" fill="#60a5fa" className="animate-confetti-1" />
          
          {/* Body bouncing with excitement */}
          <g className="animate-celebrate">
            <ellipse cx="50" cy="45" rx="28" ry="25" fill="#22c55e" />
            
            {/* Face */}
            <ellipse cx="50" cy="42" rx="22" ry="18" fill="#86efac" />
            
            {/* Excited star eyes */}
            <text x="33" y="44" fill="#15803d" fontSize="14">★</text>
            <text x="57" y="44" fill="#15803d" fontSize="14">★</text>
            
            {/* Big happy smile */}
            <path d="M38 48 Q50 62 62 48" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
            
            {/* Excited blush */}
            <ellipse cx="32" cy="46" rx="5" ry="3" fill="#fda4af" opacity="0.6" />
            <ellipse cx="68" cy="46" rx="5" ry="3" fill="#fda4af" opacity="0.6" />
          </g>
          
          {/* Waving tentacles */}
          <g>
            <path d="M22 55 Q10 65 20 80 Q25 90 15 95" stroke="#22c55e" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-wave-1" />
            <path d="M32 58 Q22 72 30 85" stroke="#22c55e" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-wave-2" />
            <path d="M50 60 Q50 75 50 90" stroke="#22c55e" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-wave-3" />
            <path d="M68 58 Q78 72 70 85" stroke="#22c55e" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-wave-2" />
            <path d="M78 55 Q90 65 80 80 Q75 90 85 95" stroke="#22c55e" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-wave-1" />
          </g>
          
          {/* Ready badge */}
          <circle cx="50" cy="8" r="8" fill="#fbbf24" className="animate-pulse" />
          <text x="46" y="12" fill="white" fontSize="10" fontWeight="bold">✓</text>
        </svg>
        <style>{`
          @keyframes celebrate { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
          @keyframes wave-1 { 0%, 100% { transform: rotate(-20deg); } 50% { transform: rotate(20deg); } }
          @keyframes wave-2 { 0%, 100% { transform: rotate(15deg); } 50% { transform: rotate(-15deg); } }
          @keyframes wave-3 { 0%, 100% { transform: scaleX(0.9); } 50% { transform: scaleX(1.1); } }
          @keyframes confetti-1 { 0%, 100% { transform: translateY(0) rotate(0); opacity: 1; } 50% { transform: translateY(-15px) rotate(180deg); opacity: 0.5; } }
          @keyframes confetti-2 { 0%, 100% { transform: translateY(0) rotate(0); opacity: 0.5; } 50% { transform: translateY(-20px) rotate(-180deg); opacity: 1; } }
          @keyframes confetti-3 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-10px) scale(1.3); } }
          .animate-celebrate { animation: celebrate 0.5s ease-in-out infinite; transform-origin: center; }
          .animate-wave-1 { animation: wave-1 0.4s ease-in-out infinite; transform-origin: top center; }
          .animate-wave-2 { animation: wave-2 0.5s ease-in-out infinite; transform-origin: top center; }
          .animate-wave-3 { animation: wave-3 0.3s ease-in-out infinite; transform-origin: top center; }
          .animate-confetti-1 { animation: confetti-1 1s ease-in-out infinite; }
          .animate-confetti-2 { animation: confetti-2 1.2s ease-in-out infinite; }
          .animate-confetti-3 { animation: confetti-3 0.8s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  // Completed: Pulpero satisfecho y descansando
  return (
    <div className={`${sizes[size]} relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full opacity-50">
        <ellipse cx="50" cy="45" rx="28" ry="25" fill="#78716c" />
        <ellipse cx="50" cy="42" rx="22" ry="18" fill="#a8a29e" />
        <path d="M36 40 Q40 36 44 40" stroke="#57534e" strokeWidth="2" fill="none" />
        <path d="M56 40 Q60 36 64 40" stroke="#57534e" strokeWidth="2" fill="none" />
        <path d="M42 50 Q50 56 58 50" stroke="#57534e" strokeWidth="2" fill="none" />
        <path d="M25 55 Q20 70 30 85" stroke="#78716c" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M40 60 Q35 75 45 90" stroke="#78716c" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M60 60 Q65 75 55 90" stroke="#78716c" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M75 55 Q80 70 70 85" stroke="#78716c" strokeWidth="5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// Función helper para obtener mensajes del Pulpero
export const getPulperoMessage = (status) => {
  const messages = {
    pending: [
      "Dame un momento, ya te busco todo...",
      "Revisando tu pedido, ¡ya casi!",
      "Un segundito, estoy organizando...",
      "¡Recibido! Déjame prepararlo..."
    ],
    accepted: [
      "¡Manos a la obra! Preparando con cariño...",
      "Todo va bien, ya casi está listo...",
      "Empacando tus cosas con amor...",
      "¡Trabajando en tu pedido!"
    ],
    ready: [
      "¡Listo compa! Ya puedes pasar a buscar",
      "¡Todo preparado! Te espero",
      "¡Ya está! Ven cuando quieras",
      "¡Pedido listo! A tu orden"
    ]
  };
  
  const statusMessages = messages[status];
  if (!statusMessages) return '';
  // Use a seed based on current minute to keep message consistent for a while
  const seed = Math.floor(Date.now() / 60000) % statusMessages.length;
  return statusMessages[seed];
};

export default Pulpero;
