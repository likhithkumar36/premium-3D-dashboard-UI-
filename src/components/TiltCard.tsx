import { useRef, useState, type ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltEnabled?: boolean;
  glowAccent?: 'sky' | 'indigo' | 'none';
  onClick?: () => void;
  maxTilt?: number;
}

export function TiltCard({
  children,
  className = '',
  tiltEnabled = true,
  glowAccent = 'sky',
  onClick,
  maxTilt = 4,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState(
    'perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)'
  );
  const [glarePos, setGlarePos] = useState({ x: 50, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled) return;
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * (maxTilt * 2);
    const rotateX = (0.5 - py) * (maxTilt * 2);

    setTransform(
      `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(0, -3px, 10px)`
    );
    setGlarePos({
      x: Math.round(px * 100),
      y: Math.round(py * 100),
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setTransform(
      'perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)'
    );
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const glareColor =
    glowAccent === 'indigo'
      ? 'rgba(129, 140, 248, 0.11)'
      : glowAccent === 'sky'
        ? 'rgba(56, 189, 248, 0.11)'
        : 'rgba(255, 255, 255, 0.07)';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: tiltEnabled ? transform : undefined,
        transformStyle: 'preserve-3d',
      }}
      className={`group relative rounded-2xl border border-white/[0.08] glass-surface transition-[transform,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/[0.16] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Dynamic cursor-tracking glass reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-200"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(420px circle at ${glarePos.x}% ${glarePos.y}%, ${glareColor}, transparent 65%)`,
        }}
      />
      {/* Top edge specular highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60 transition-opacity duration-200 group-hover:opacity-100"
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
