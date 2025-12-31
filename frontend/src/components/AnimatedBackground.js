// AnimatedBackground - Ultra ligero, CSS puro
// Estrellas estáticas con CSS, sin JavaScript ni animaciones pesadas

const AnimatedBackground = () => (
  <div 
    className="fixed inset-0 pointer-events-none z-0"
    style={{
      backgroundImage: `
        radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4), transparent),
        radial-gradient(1px 1px at 20% 50%, rgba(255,255,255,0.3), transparent),
        radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.35), transparent),
        radial-gradient(2px 2px at 40% 30%, rgba(255,255,255,0.25), transparent),
        radial-gradient(1px 1px at 50% 70%, rgba(255,255,255,0.3), transparent),
        radial-gradient(1px 1px at 60% 10%, rgba(255,255,255,0.4), transparent),
        radial-gradient(2px 2px at 70% 60%, rgba(255,255,255,0.2), transparent),
        radial-gradient(1px 1px at 80% 40%, rgba(255,255,255,0.35), transparent),
        radial-gradient(1px 1px at 90% 90%, rgba(255,255,255,0.3), transparent),
        radial-gradient(1px 1px at 5% 95%, rgba(255,255,255,0.25), transparent),
        radial-gradient(1px 1px at 95% 5%, rgba(255,255,255,0.3), transparent),
        radial-gradient(1px 1px at 15% 45%, rgba(255,255,255,0.2), transparent),
        radial-gradient(1px 1px at 85% 55%, rgba(255,255,255,0.25), transparent),
        radial-gradient(1px 1px at 25% 15%, rgba(255,255,255,0.3), transparent),
        radial-gradient(1px 1px at 75% 85%, rgba(255,255,255,0.2), transparent)
      `
    }}
  />
);

export default AnimatedBackground;
