import { useEffect, useRef } from 'react';

interface AmbientBackdropProps {
  particlesEnabled: boolean;
  glowEnabled: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: 'sky' | 'indigo' | 'white';
}

export function AmbientBackdrop({
  particlesEnabled,
  glowEnabled,
}: AmbientBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!particlesEnabled) return;
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(48, Math.max(24, Math.floor((width * height) / 36000)));
    const hues: Array<Particle['hue']> = ['sky', 'indigo', 'white'];
    const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16 - 0.04,
      radius: 0.75 + Math.random() * 1.25,
      alpha: 0.12 + Math.random() * 0.28,
      hue: hues[i % hues.length],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if (p.hue === 'sky') {
          ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        } else if (p.hue === 'indigo') {
          ctx.fillStyle = `rgba(129, 140, 248, ${p.alpha * 0.9})`;
        } else {
          ctx.fillStyle = `rgba(226, 232, 240, ${p.alpha * 0.65})`;
        }
        ctx.fill();
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [particlesEnabled]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 bg-[#06070b]"
    >
      {/* Subtle architectural perspective grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 20%, black 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 20%, black 30%, transparent 100%)',
        }}
      />

      {/* Ambient electric blue and indigo radial lights */}
      {glowEnabled && (
        <>
          <div className="animate-aurora absolute -top-48 left-[12%] h-[540px] w-[540px] rounded-full bg-sky-500/[0.08] blur-[130px]" />
          <div className="animate-aurora-reverse absolute top-[28%] -right-32 h-[480px] w-[480px] rounded-full bg-indigo-500/[0.07] blur-[140px]" />
          <div className="animate-aurora absolute -bottom-44 left-[36%] h-[420px] w-[520px] rounded-full bg-cyan-500/[0.05] blur-[140px]" />
        </>
      )}

      {/* Subtle 60fps ambient particle field */}
      {particlesEnabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full opacity-75"
        />
      )}
    </div>
  );
}
