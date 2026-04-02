import { useEffect, useRef } from 'react';

export default function StarfieldCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Generate ~180 stars
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 0.4 + Math.random() * 1.2,
      baseAlpha: 0.2 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.009,
    }));

    let animationId;
    let startTime = Date.now();

    const animate = () => {
      const time = (Date.now() - startTime) / 1000;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        const alpha = star.baseAlpha + 0.35 * Math.sin(star.phase + time * star.speed);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Regenerate star positions
      stars.forEach(star => {
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
