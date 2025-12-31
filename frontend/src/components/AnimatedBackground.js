// Animated background component - reusable across pages
// Supports red (default), blue (jobs), and minimal variants
const AnimatedBackground = ({ variant = "default", color = "red" }) => {
  // Color configurations
  const colors = {
    red: {
      primary: 'bg-red-600',
      secondary: 'bg-red-500',
      accent: 'bg-amber-500',
      particle: 'bg-red-400'
    },
    blue: {
      primary: 'bg-blue-600',
      secondary: 'bg-blue-500',
      accent: 'bg-cyan-500',
      particle: 'bg-blue-400'
    }
  };

  const c = colors[color] || colors.red;

  if (variant === "minimal") {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-0 left-1/4 w-[400px] h-[400px] ${c.primary}/5 rounded-full blur-[100px]`}></div>
        <div className={`absolute bottom-0 right-1/4 w-[300px] h-[300px] ${c.secondary}/5 rounded-full blur-[80px]`}></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large glowing orbs */}
      <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] ${c.primary}/10 rounded-full blur-[120px] animate-pulse`}></div>
      <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] ${c.secondary}/10 rounded-full blur-[100px] animate-pulse`} style={{animationDelay: '1s'}}></div>
      <div className={`absolute top-1/2 left-0 w-[400px] h-[400px] ${c.accent}/5 rounded-full blur-[80px]`}></div>
      
      {/* Floating particles */}
      <div className={`absolute top-20 left-20 w-2 h-2 ${c.particle}/40 rounded-full animate-bounce`} style={{animationDelay: '0.1s'}}></div>
      <div className={`absolute top-40 right-32 w-3 h-3 ${c.particle}/30 rounded-full animate-bounce`} style={{animationDelay: '0.3s'}}></div>
      <div className={`absolute bottom-40 left-1/3 w-2 h-2 ${c.accent}/40 rounded-full animate-bounce`} style={{animationDelay: '0.5s'}}></div>
      <div className={`absolute top-1/3 right-20 w-2 h-2 ${c.particle}/30 rounded-full animate-bounce`} style={{animationDelay: '0.7s'}}></div>
      <div className={`absolute top-1/4 left-1/2 w-1.5 h-1.5 ${c.particle}/30 rounded-full animate-bounce`} style={{animationDelay: '0.2s'}}></div>
      <div className={`absolute bottom-1/4 right-1/3 w-2 h-2 ${c.secondary}/20 rounded-full animate-bounce`} style={{animationDelay: '0.4s'}}></div>
    </div>
  );
};

export default AnimatedBackground;
