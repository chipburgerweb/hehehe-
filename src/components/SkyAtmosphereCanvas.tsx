import { useEffect, useRef } from 'react';
import { SkyMood } from '../types/birthday';

export interface PlasmaBurstRequest {
  id: number;
  x?: number; // 0..1 viewport ratio
  y?: number; // 0..1 viewport ratio
  count?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
  twinkle: number;
}

interface CloudPuff {
  x: number;
  y: number;
  rx: number;
  ry: number;
  speed: number;
  opacity: number;
}

interface Props {
  skyMood: SkyMood;
  burstRequest: PlasmaBurstRequest | null;
}

export function SkyAtmosphereCanvas({ skyMood, burstRequest }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const cloudsRef = useRef<CloudPuff[]>([]);

  // Spawn Night Fury plasma starbursts whenever burstRequest updates
  useEffect(() => {
    if (!burstRequest) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const bursts = burstRequest.count ?? 1;

    const palette =
      skyMood === 'aurora'
        ? ['#38BDF8', '#A855F7', '#F472B6', '#E0F2FE', '#BEF264']
        : ['#0284C7', '#38BDF8', '#7DD3FC', '#818CF8', '#FDE047'];

    for (let b = 0; b < bursts; b++) {
      const originX =
        burstRequest.x !== undefined && bursts === 1
          ? burstRequest.x * width
          : width * (0.18 + Math.random() * 0.64);
      const originY =
        burstRequest.y !== undefined && bursts === 1
          ? burstRequest.y * height
          : height * (0.16 + Math.random() * 0.42);

      const particleCount = 46;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.18;
        const speed = 1.6 + Math.random() * 5.2;
        particlesRef.current.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8,
          radius: 1.6 + Math.random() * 3.1,
          alpha: 1,
          decay: 0.011 + Math.random() * 0.011,
          color: palette[Math.floor(Math.random() * palette.length)],
          twinkle: Math.random() * Math.PI * 2,
        });
      }
    }
  }, [burstRequest, skyMood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupSize();
    window.addEventListener('resize', setupSize);

    // Initialize gentle drifting clouds
    cloudsRef.current = Array.from({ length: 7 }, (_, idx) => ({
      x: (idx / 7) * width + Math.random() * 140,
      y: 70 + idx * 85 + Math.random() * 40,
      rx: 130 + Math.random() * 120,
      ry: 34 + Math.random() * 26,
      speed: 0.12 + Math.random() * 0.18,
      opacity: skyMood === 'aurora' ? 0.07 : 0.34,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw soft atmospheric clouds
      for (const cloud of cloudsRef.current) {
        if (!prefersReducedMotion) {
          cloud.x += cloud.speed;
          if (cloud.x - cloud.rx > width + 80) {
            cloud.x = -cloud.rx - 60;
          }
        }
        const grad = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          cloud.ry * 0.2,
          cloud.x,
          cloud.y,
          cloud.rx
        );
        if (skyMood === 'aurora') {
          grad.addColorStop(0, `rgba(56, 189, 248, ${cloud.opacity})`);
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        } else if (skyMood === 'twilight') {
          grad.addColorStop(0, `rgba(254, 243, 199, ${cloud.opacity * 0.7})`);
          grad.addColorStop(1, 'rgba(254, 243, 199, 0)');
        } else {
          grad.addColorStop(0, `rgba(255, 255, 255, ${cloud.opacity})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.rx, cloud.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw active Night Fury plasma firework particles
      const remaining: Particle[] = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.982;
        p.vy = p.vy * 0.982 + 0.045;
        p.alpha -= p.decay;
        p.twinkle += 0.22;

        if (p.alpha > 0.02) {
          const glow = p.alpha * (0.78 + 0.22 * Math.sin(p.twinkle));
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, glow));
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 14;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          remaining.push(p);
        }
      }
      particlesRef.current = remaining;

      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', setupSize);
      window.cancelAnimationFrame(animId);
    };
  }, [skyMood]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
}
