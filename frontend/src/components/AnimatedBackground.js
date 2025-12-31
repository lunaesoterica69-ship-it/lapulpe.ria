// AnimatedBackground - CSS puro, ultra ligero
// Sin canvas, sin JavaScript pesado, solo CSS

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Nebula effect - pure CSS gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(185, 28, 28, 0.15) 0%, rgba(12, 10, 9, 0) 70%)'
        }}
      />
      
      {/* Simple CSS stars - no JavaScript */}
      <div className="stars-layer" />
      
      <style>{`
        .stars-layer {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(2px 2px at 40% 70%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 20%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(2px 2px at 60% 50%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(2px 2px at 10% 60%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 90%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(2px 2px at 15% 15%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 85%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 45%, rgba(255,255,255,0.3) 0%, transparent 100%);
          animation: twinkle 4s ease-in-out infinite alternate;
        }
        
        @keyframes twinkle {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
