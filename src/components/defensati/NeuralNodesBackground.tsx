'use client';

import { useEffect, useRef } from 'react';

/**
 * Fondo de red neuronal interactivo:
 * - El cursor es una neurona más: se conecta a los nodos cercanos y los atrae suavemente.
 * - Clic / toque: onda expansiva que empuja los nodos y dispara pulsos en cascada.
 * - Los nodos "excitados" se encienden y propagan su señal a sus vecinos.
 * - Scroll: paralaje leve de la red.
 * Decorativo (aria-hidden), se pausa con la pestaña oculta y respeta reduced-motion.
 */
type Node = { x: number; y: number; vx: number; vy: number; r: number; e: number };
type Pulse = { a: number; b: number; t: number; s: number };
type Wave = { x: number; y: number; r: number };

export default function NeuralNodesBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0, nodes: Node[] = [], raf = 0, scrollY = window.scrollY, offset = 0;
    const pulses: Pulse[] = [];
    const waves: Wave[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    const LINK = 150, MOUSE_R = 200;

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(120, (w * h) / 13000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 1.6, e: 0,
      }));
    };

    const fire = (i: number, strength = 1) => {
      nodes[i].e = Math.min(1, nodes[i].e + strength);
      let sent = 0;
      for (let j = 0; j < nodes.length && sent < 3 && pulses.length < 60; j++) {
        if (j === i) continue;
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < LINK) {
          pulses.push({ a: i, b: j, t: 0, s: strength * 0.8 });
          sent++;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // Paralaje de scroll
      const target = (window.scrollY - scrollY) * 0.15;
      offset += (target - offset) * 0.08;
      scrollY += (window.scrollY - scrollY) * 0.08;

      for (const n of nodes) {
        if (!reduced) {
          // Atracción suave hacia el cursor
          if (mouse.active) {
            const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
            if (d < MOUSE_R && d > 30) { n.vx += (dx / d) * 0.012; n.vy += (dy / d) * 0.012; }
            if (d <= 30) { n.vx -= (dx / (d || 1)) * 0.05; n.vy -= (dy / (d || 1)) * 0.05; }
          }
          // Onda expansiva
          for (const wv of waves) {
            const dx = n.x - wv.x, dy = n.y - wv.y, d = Math.hypot(dx, dy);
            if (Math.abs(d - wv.r) < 18) { n.vx += (dx / (d || 1)) * 0.6; n.vy += (dy / (d || 1)) * 0.6; n.e = 1; }
          }
          n.vx *= 0.985; n.vy *= 0.985;
          const sp = Math.hypot(n.vx, n.vy);
          if (sp < 0.12) { n.vx += (Math.random() - 0.5) * 0.04; n.vy += (Math.random() - 0.5) * 0.04; }
          n.x += n.vx; n.y += n.vy - offset * 0.02;
          if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
        }
        n.e *= 0.96;
      }

      // Conexiones entre nodos
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            const ex = Math.max(a.e, b.e);
            const alpha = (1 - d / LINK) * (0.14 + ex * 0.5);
            ctx.strokeStyle = ex > 0.2 ? `rgba(56,189,248,${alpha})` : `rgba(160,190,220,${alpha})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            if (!reduced && pulses.length < 20 && Math.random() < 0.0003) pulses.push({ a: i, b: j, t: 0, s: 0.4 });
          }
        }
      }

      // El cursor como neurona: se conecta y excita a los cercanos
      if (mouse.active) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (d < MOUSE_R) {
            ctx.strokeStyle = `rgba(237,237,237,${(1 - d / MOUSE_R) * 0.5})`;
            ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(n.x, n.y); ctx.stroke();
            n.e = Math.max(n.e, (1 - d / MOUSE_R) * 0.6);
            if (!reduced && Math.random() < 0.004) fire(i, 0.6);
          }
        }
        ctx.fillStyle = 'rgba(237,237,237,0.9)';
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 2.2, 0, Math.PI * 2); ctx.fill();
      }

      // Nodos
      for (const n of nodes) {
        if (n.e > 0.15) {
          ctx.fillStyle = `rgba(56,189,248,${n.e * 0.25})`;
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 5 * n.e, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = n.e > 0.15 ? `rgba(237,247,255,${0.5 + n.e * 0.5})` : 'rgba(200,210,225,0.45)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + n.e, 0, Math.PI * 2); ctx.fill();
      }

      // Pulsos (sinapsis) que propagan en cascada
      for (let k = pulses.length - 1; k >= 0; k--) {
        const p = pulses[k];
        const a = nodes[p.a], b = nodes[p.b];
        p.t += 0.025;
        if (!a || !b) { pulses.splice(k, 1); continue; }
        if (p.t >= 1) {
          pulses.splice(k, 1);
          if (p.s > 0.25) fire(p.b, p.s);
          else b.e = Math.max(b.e, p.s);
          continue;
        }
        ctx.fillStyle = `rgba(56,189,248,${0.5 + p.s * 0.5})`;
        ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * p.t, a.y + (b.y - a.y) * p.t, 1.4 + p.s, 0, Math.PI * 2); ctx.fill();
      }

      // Ondas de clic
      for (let k = waves.length - 1; k >= 0; k--) {
        const wv = waves[k];
        wv.r += 7;
        const life = 1 - wv.r / 420;
        if (life <= 0) { waves.splice(k, 1); continue; }
        ctx.strokeStyle = `rgba(56,189,248,${life * 0.35})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(wv.x, wv.y, wv.r, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 0.6;
      }

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; };
    const onLeave = () => { mouse.active = false; };
    const onDown = (e: PointerEvent) => {
      // No interferir con botones, enlaces ni formularios
      if ((e.target as HTMLElement).closest('a,button,input,label,textarea,select,iframe')) return;
      waves.push({ x: e.clientX, y: e.clientY, r: 0 });
      nodes
        .map((n, i) => ({ i, d: Math.hypot(n.x - e.clientX, n.y - e.clientY) }))
        .sort((p, q) => p.d - q.d)
        .slice(0, 4)
        .forEach(({ i }) => fire(i, 1));
    };
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(draw); };

    resize(); raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 print:hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#121722_0%,#0b0d12_45%,#080808_100%)]" />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
