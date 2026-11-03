/**
 * ParticleBurst.tsx
 * Pooled particle system (max 14 alive) for sparkle (Student) and
 * ember (Canteen) effects. Rendered as absolutely-positioned elements
 * clipped inside the button. Pauses when document is hidden.
 */
import React, { useEffect, useRef, useCallback } from 'react';
import type { ParticleKind } from '../motion/rolePersonalities';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;       // 0..1 remaining
  maxLife: number;    // ms
  size: number;
  rotation: number;
  rotationSpeed: number;
}

interface ParticleBurstProps {
  kind: ParticleKind;
  maxAlive: number;
  lifespanMs: number;
  color: string;
  /** Pointer position inside button, normalized 0-1 */
  pointerX: number;
  pointerY: number;
  /** Whether to spawn particles (only when hovered) */
  active: boolean;
  /** Button width / height for coordinate mapping */
  width: number;
  height: number;
}

let particleIdCounter = 0;
const MAX_PARTICLES_GLOBAL = 14;

function createSparkle(x: number, y: number, color: string): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.3 + Math.random() * 0.6;
  return {
    id: particleIdCounter++,
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 0.8, // drift up
    life: 1,
    maxLife: 600 + Math.random() * 200,
    size: 2 + Math.random() * 3,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 3,
  };
}

function createEmber(x: number, y: number, color: string): Particle {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2; // mostly upward
  const speed = 0.4 + Math.random() * 0.8;
  return {
    id: particleIdCounter++,
    x, y,
    vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.3,
    vy: Math.sin(angle) * speed,
    life: 1,
    maxLife: 700 + Math.random() * 300,
    size: 3 + Math.random() * 4,
    rotation: 0,
    rotationSpeed: 0,
  };
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  kind,
  maxAlive,
  lifespanMs: _lifespanMs,
  color,
  pointerX,
  pointerY,
  active,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);
  const rafId = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const activeRef = useRef(active);
  const colorRef = useRef(color);
  const pointerXRef = useRef(pointerX);
  const pointerYRef = useRef(pointerY);

  activeRef.current = active;
  colorRef.current = color;
  pointerXRef.current = pointerX;
  pointerYRef.current = pointerY;

  if (kind === 'none') return null;

  const SPAWN_INTERVAL_MS = kind === 'sparkle' ? 120 : 80;
  const effectiveMax = Math.min(maxAlive, MAX_PARTICLES_GLOBAL);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    const col = colorRef.current;

    for (const p of particles.current) {
      const alpha = p.life * 0.85;
      ctx.save();
      ctx.globalAlpha = alpha;

      if (kind === 'sparkle') {
        // 4-pointed star shape
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        const s = p.size;
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.3, -s * 0.3);
        ctx.lineTo(s, 0);
        ctx.lineTo(s * 0.3, s * 0.3);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.3, s * 0.3);
        ctx.lineTo(-s, 0);
        ctx.lineTo(-s * 0.3, -s * 0.3);
        ctx.closePath();
        ctx.fill();
      } else {
        // Ember: glowing circle
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, col);
        gradient.addColorStop(1, col + '00');
        ctx.fillStyle = gradient;
        ctx.shadowColor = col;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }, [kind]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (now: number) => {
      if (document.hidden) {
        rafId.current = requestAnimationFrame(loop);
        return;
      }

      const dt = Math.min(now - lastTime, 50); // cap dt at 50ms
      lastTime = now;

      // Spawn
      const px = pointerXRef.current * width;
      const py = pointerYRef.current * height;

      if (
        activeRef.current &&
        particles.current.length < effectiveMax &&
        now - lastSpawnRef.current > SPAWN_INTERVAL_MS
      ) {
        lastSpawnRef.current = now;
        const jitter = 12;
        const sx = px + (Math.random() - 0.5) * jitter;
        const sy = py + (Math.random() - 0.5) * jitter;
        const p = kind === 'sparkle'
          ? createSparkle(sx, sy, colorRef.current)
          : createEmber(sx, sy, colorRef.current);
        particles.current.push(p);
      }

      // Update
      const dtFactor = dt / 16.67;
      particles.current = particles.current.filter((p) => {
        p.x += p.vx * dtFactor;
        p.y += p.vy * dtFactor;
        p.vy += kind === 'ember' ? -0.04 * dtFactor : -0.02 * dtFactor; // rise
        p.rotation += p.rotationSpeed * dtFactor;
        const elapsed = (1 - p.life) * p.maxLife + dt;
        p.life = Math.max(0, 1 - elapsed / p.maxLife);
        return p.life > 0;
      });

      const w = canvas.width;
      const h = canvas.height;
      drawParticles(ctx, w, h);
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      particles.current = [];
    };
  }, [kind, effectiveMax, SPAWN_INTERVAL_MS, width, height, drawParticles]);

  // Stop spawning on deactivate but let existing particles die out
  useEffect(() => {
    if (!active) {
      // particles naturally fade
    }
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none rounded-xl"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    />
  );
};
