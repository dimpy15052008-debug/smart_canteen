import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '../../types';
import { ROLE_THEMES } from '../motion/tokens';
import { usePageVisibility, usePrefersReducedMotion } from '../motion/hooks';

interface AuthBackgroundProps {
  role: UserRole;
  className?: string;
  rippleTrigger?: number; // increments on role switch
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
}

interface Pulse {
  sourceIdx: number;
  targetIdx: number;
  progress: number;
  speed: number;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({
  role,
  className = '',
  rippleTrigger = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isVisible = usePageVisibility();
  const prefersReduced = usePrefersReducedMotion();
  const currentRoleRef = useRef<UserRole>(role);
  currentRoleRef.current = role;

  // Track ripples emanating on role switch
  const ripplesRef = useRef<{ x: number; y: number; r: number; maxR: number; alpha: number }[]>([]);

  useEffect(() => {
    if (rippleTrigger > 0 && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      ripplesRef.current.push({
        x: rect.width / 2,
        y: rect.height * 0.4,
        r: 10,
        maxR: Math.max(rect.width, rect.height) * 0.8,
        alpha: 0.6,
      });
    }
  }, [rippleTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = 0;
    let height = 0;

    const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    const nodeCount = isTouch ? 40 : 75;
    const maxDist = isTouch ? 95 : 130;

    const nodes: Node[] = [];
    const pulses: Pulse[] = [];

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Re-populate nodes if empty
      if (nodes.length === 0 && width > 0 && height > 0) {
        for (let i = 0; i < nodeCount; i++) {
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 1.8 + 1.2,
            baseAlpha: Math.random() * 0.4 + 0.3,
          });
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial pulse spawner
    const maybeSpawnPulse = (pairs: [number, number][]) => {
      if (pulses.length < 5 && pairs.length > 0 && Math.random() < 0.04) {
        const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
        pulses.push({
          sourceIdx: randomPair[0],
          targetIdx: randomPair[1],
          progress: 0,
          speed: 0.015 + Math.random() * 0.015,
        });
      }
    };

    // Render loop
    const render = () => {
      if (!isVisible && !prefersReduced) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const theme = ROLE_THEMES[currentRoleRef.current] || ROLE_THEMES.student;
      const accent = theme.accent;

      // Update & draw ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i];
        rip.r += 6;
        rip.alpha *= 0.96;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.globalAlpha = rip.alpha;
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (rip.r >= rip.maxR || rip.alpha < 0.02) {
          ripplesRef.current.splice(i, 1);
        }
      }

      // Update nodes
      if (!prefersReduced) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0) n.x = width;
          else if (n.x > width) n.x = 0;
          if (n.y < 0) n.y = height;
          else if (n.y > height) n.y = 0;
        }
      }

      // Draw connections
      const connectedPairs: [number, number][] = [];
      ctx.lineWidth = 0.8;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = accent;
            ctx.globalAlpha = alpha;
            ctx.stroke();
            connectedPairs.push([i, j]);
          }
        }
      }

      // Handle pulses
      if (!prefersReduced) {
        maybeSpawnPulse(connectedPairs);

        for (let p = pulses.length - 1; p >= 0; p--) {
          const pulse = pulses[p];
          pulse.progress += pulse.speed;

          const sNode = nodes[pulse.sourceIdx];
          const tNode = nodes[pulse.targetIdx];

          if (sNode && tNode) {
            const px = sNode.x + (tNode.x - sNode.x) * pulse.progress;
            const py = sNode.y + (tNode.y - sNode.y) * pulse.progress;

            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = Math.sin(pulse.progress * Math.PI) * 0.9;
            ctx.shadowColor = accent;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          if (pulse.progress >= 1) {
            pulses.splice(p, 1);
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = n.baseAlpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (!prefersReduced) {
        animFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, prefersReduced]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* 1. Aurora Gradient Mesh (re-tints smoothly with --role-accent) */}
      <motion.div
        className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full blur-[110px] opacity-25"
        style={{
          background: 'radial-gradient(circle, var(--role-accent, #6366f1) 0%, transparent 70%)',
          transition: 'background 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        animate={
          prefersReduced
            ? undefined
            : {
                x: [0, 45, -25, 0],
                y: [0, -35, 25, 0],
                scale: [1, 1.15, 0.92, 1],
              }
        }
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-36 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--role-accent2, #8b5cf6) 0%, transparent 70%)',
          transition: 'background 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        animate={
          prefersReduced
            ? undefined
            : {
                x: [0, -35, 20, 0],
                y: [0, 35, -20, 0],
                scale: [1, 0.9, 1.12, 1],
              }
        }
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-36 left-1/4 w-[520px] h-[520px] rounded-full blur-[120px] opacity-15"
        style={{
          background: 'radial-gradient(circle, var(--role-accent, #6366f1) 0%, transparent 70%)',
          transition: 'background 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        animate={
          prefersReduced
            ? undefined
            : {
                x: [0, 30, -30, 0],
                y: [0, -25, 30, 0],
                scale: [1, 1.08, 0.94, 1],
              }
        }
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 2. Campus Network Constellation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 3. Grid Overlay with moving radial mask */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at 40% 45%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(circle at 40% 45%, black 20%, transparent 85%)',
        }}
      />

      {/* 4. Film Grain Noise Texture (3% opacity) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
