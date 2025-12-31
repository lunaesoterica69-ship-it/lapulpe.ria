import { useEffect, useRef, useMemo } from 'react';

// Starfield animation - Grok style
// Clean, minimal, elegant floating stars with twinkle effect
const AnimatedBackground = ({ variant = "default", color = "red" }) => {
  const canvasRef = useRef(null);

  const colorConfig = useMemo(() => ({
    red: { r: 239, g: 68, b: 68 },
    blue: { r: 59, g: 130, b: 246 },
    white: { r: 255, g: 255, b: 255 }
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Star particle class
    class Star {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.08;
        this.speedY = (Math.random() - 0.5) * 0.08;
        this.baseOpacity = Math.random() * 0.5 + 0.2;
        this.opacity = this.baseOpacity;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.isStar = Math.random() > 0.7; // 30% are stars with twinkle
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;

        // Twinkle effect for stars
        if (this.isStar) {
          this.twinklePhase += this.twinkleSpeed;
          this.opacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.3;
        }
      }

      draw() {
        const baseColor = colorConfig[color] || colorConfig.white;
        
        if (this.isStar && this.size > 1) {
          // Draw star shape for larger particles
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            ctx.moveTo(0, 0);
            const angle = (i * Math.PI) / 2;
            const len = this.size * 2;
            ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
          }
          ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${this.opacity * 0.5})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.restore();
        }
        
        // Draw dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Create particles - fewer for better performance
    const count = variant === 'minimal' ? 40 : 70;
    for (let i = 0; i < count; i++) {
      particles.push(new Star());
    }

    let lastTime = 0;
    const animate = (timestamp) => {
      // Throttle to ~30fps for better performance
      if (timestamp - lastTime < 33) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      lastTime = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, variant, colorConfig]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ willChange: 'auto' }}
    />
  );
};

export default AnimatedBackground;
