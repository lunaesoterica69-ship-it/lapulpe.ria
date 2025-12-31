// Animated red background component - reusable across pages
const AnimatedBackground = ({ variant = "default" }) => {
  if (variant === "minimal") {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[80px]"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large glowing orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px]"></div>
      
      {/* Floating particles */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-red-400/40 rounded-full animate-bounce delay-100"></div>
      <div className="absolute top-40 right-32 w-3 h-3 bg-red-300/30 rounded-full animate-bounce delay-300"></div>
      <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-amber-400/40 rounded-full animate-bounce delay-500"></div>
      <div className="absolute top-1/3 right-20 w-2 h-2 bg-red-400/30 rounded-full animate-bounce delay-700"></div>
      <div className="absolute top-1/4 left-1/2 w-1.5 h-1.5 bg-red-300/30 rounded-full animate-bounce delay-200"></div>
      <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-red-500/20 rounded-full animate-bounce delay-400"></div>
    </div>
  );
};

export default AnimatedBackground;
