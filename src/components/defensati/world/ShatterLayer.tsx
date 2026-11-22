'use client';

import { useEffect, useRef } from 'react';

/**
 * Capa global de "desintegración": un canvas fijo encima del contenido que cubre
 * cada bloque marcado con `data-shatter` con fragmentos cuadrados.
 *  - Al entrar por abajo, los fragmentos se dispersan y el bloque se ensambla.
 *  - Al salir por arriba, los fragmentos vuelven y el bloque se desintegra.
 *  - Cuando un bloque aparece de golpe (p. ej. el informe), se ensambla en ~1 s.
 * No toca el DOM de las secciones: solo dibuja encima (pointer-events: none).
 */
const TILE = 26;
const BG = '#0a0c0f';

// Ruido determinista por celda (mismo patrón en cada frame)
const noise = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

interface Props {
  /** Bloques a fragmentar */
  selector?: string;
  /** Solo ensamblaje al aparecer (sin depender del scroll), p. ej. en una pantalla fija */
  introOnly?: boolean;
  className?: string;
}

export default function ShatterLayer({
  selector = '[data-shatter]',
  introOnly = false,
  className = 'fixed inset-0 z-40',
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Con movimiento reducido el efecto se mantiene pero más corto
    const slow = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.5 : 1;
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const firstSeen = new WeakMap<Element, number>();
    let raf = 0;

    const frame = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const enterTop = h * 0.92; // empieza a ensamblarse
      const enterBand = h * 0.38;
      const exitBand = h * 0.22;

      document.querySelectorAll<HTMLElement>(selector).forEach((el, idx) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > h || r.width === 0) return;
        if (!firstSeen.has(el)) firstSeen.set(el, now);
        const age = (now - (firstSeen.get(el) || now)) / 1000;

        // Solo dibujar la parte visible del bloque, alineada a la cuadrícula del bloque
        const x0 = Math.max(r.left, 0);
        const x1 = Math.min(r.right, w);
        const y0 = Math.max(r.top, 0);
        const y1 = Math.min(r.bottom, h);
        const cStart = Math.floor((x0 - r.left) / TILE);
        const cEnd = Math.ceil((x1 - r.left) / TILE);
        const rStart = Math.floor((y0 - r.top) / TILE);
        const rEnd = Math.ceil((y1 - r.top) / TILE);

        for (let row = rStart; row < rEnd; row++) {
          const ty = r.top + row * TILE;
          const cy = ty + TILE / 2;
          // Frente de ensamblaje (entrada) y de desintegración (salida) según la altura en pantalla
          const enter = clamp01((enterTop - cy) / enterBand);
          const exit = clamp01((cy + TILE) / exitBand);
          for (let col = cStart; col < cEnd; col++) {
            const n = noise(col + idx * 31, row);
            const scroll = introOnly ? 1 : Math.min(enter, exit);
            const intro = clamp01((age / slow - n * 0.6) / 0.45); // ensamblaje al aparecer
            const local = clamp01(Math.min(scroll * 1.35 - n * 0.35, intro));
            if (local >= 1) continue; // fragmento ya disuelto: contenido visible

            const tx = r.left + col * TILE;
            if (local <= 0) {
              ctx.fillStyle = BG;
              ctx.fillRect(tx, ty, TILE + 0.5, TILE + 0.5);
              continue;
            }
            // Fragmento en vuelo: se desplaza, gira y se encoge mientras se disuelve
            const a = n * Math.PI * 2;
            const dist = local * (30 + n * 70);
            const dx = Math.cos(a) * dist;
            const dy = Math.sin(a) * dist - local * 20;
            const s = TILE * (1 - local * 0.85);
            ctx.save();
            ctx.globalAlpha = 1 - local;
            ctx.translate(tx + TILE / 2 + dx, ty + TILE / 2 + dy);
            ctx.rotate((n - 0.5) * local * 2.4);
            ctx.fillStyle = BG;
            ctx.fillRect(-s / 2, -s / 2, s, s);
            ctx.strokeStyle = n > 0.82 ? 'rgba(255,77,61,0.7)' : 'rgba(207,227,238,0.45)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-s / 2 + 0.5, -s / 2 + 0.5, s - 1, s - 1);
            ctx.restore();
          }
        }
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [selector, introOnly]);

  return <canvas ref={canvas} aria-hidden className={`${className} pointer-events-none print:hidden w-full h-full`} />;
}
