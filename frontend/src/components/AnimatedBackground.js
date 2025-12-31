import { useEffect, useRef } from 'react';

// Animated starfield background component - Grok style
// Creates floating particles like stars in the night sky
const AnimatedBackground = ({ variant = "default", color = "red" }) => {
  const canvasRef = useRef(null);

  // Color configurations
  const colorConfig = {
    red: { r: 239, g: 68, b: 68 },    // red-500
    blue: { r: 59, g: 130, b: 246 }   // blue-500
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle class
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Twinkle effect
        this.opacity += this.twinkleSpeed * this.twinkleDirection;
        if (this.opacity >= 0.7 || this.opacity <= 0.1) {
          this.twinkleDirection *= -1;
        }

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        const baseColor = colorConfig[color] || colorConfig.red;
        
        // Create gradient for glow effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core bright point
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`;
        ctx.fill();
      }
    }

    // Create particles based on variant
    const particleCount = variant === 'minimal' ? 40 : 80;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, variant]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Canvas for star particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0"
        style={{ opacity: 0.8 }}
      />
      
      {/* Large glowing orbs for atmosphere */}
      {variant !== 'minimal' && (
        <>
          <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] ${color === 'blue' ? 'bg-blue-600' : 'bg-red-600'}/10 rounded-full blur-[120px] animate-pulse`}></div>
          <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] ${color === 'blue' ? 'bg-blue-500' : 'bg-red-500'}/10 rounded-full blur-[100px] animate-pulse`} style={{animationDelay: '1s'}}></div>
          <div className={`absolute top-1/2 left-0 w-[400px] h-[400px] ${color === 'blue' ? 'bg-cyan-500' : 'bg-amber-500'}/5 rounded-full blur-[80px]`}></div>
        </>
      )}
      
      {variant === 'minimal' && (
        <>
          <div className={`absolute top-0 left-1/4 w-[400px] h-[400px] ${color === 'blue' ? 'bg-blue-600' : 'bg-red-600'}/5 rounded-full blur-[100px]`}></div>
          <div className={`absolute bottom-0 right-1/4 w-[300px] h-[300px] ${color === 'blue' ? 'bg-blue-500' : 'bg-red-500'}/5 rounded-full blur-[80px]`}></div>
        </>
      )}
    </div>
  );
};

export default AnimatedBackground;
