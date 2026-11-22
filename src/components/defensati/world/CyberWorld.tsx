'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { MAX_PHASE, PHASES, type WorldState } from './phases';

const CyberWorldScene = dynamic(() => import('./CyberWorldScene'), { ssr: false });

/**
 * Un solo mundo para toda la página: canvas 3D fijo detrás del contenido.
 * Cada bloque con `data-phase="N"` empuja la escena a la fase N del ataque
 * mientras cruza el centro de la pantalla.
 */
export default function CyberWorld() {
  const world = useRef<WorldState>({
    phase: 0,
    eased: 0,
    time: 0,
    dt: 0,
    speed: 1,
    scan: 'idle',
    score: null,
  });
  const fade = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [lite, setLite] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Con movimiento reducido la escena sigue viva, pero más lenta y sin scroll suavizado
    world.current.speed = reduced ? 0.35 : 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depende de window, solo en cliente
    setLite(window.innerWidth < 768 || reduced);

    let lenis: Lenis | null = null;
    const tick = (t: number) => lenis?.raf(t * 1000);
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.1, anchors: { offset: -64 } });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    // Fase según la posición real de cada bloque respecto al centro de la pantalla.
    // Se mide en vivo (sin posiciones cacheadas), así nunca queda desfasada.
    const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-phase]')).map((el) => ({
      el,
      k: Number(el.dataset.phase),
    }));
    let queued = false;
    const recompute = () => {
      queued = false;
      const mid = window.innerHeight / 2;
      let ph = 0;
      for (const { el, k } of blocks) {
        const r = el.getBoundingClientRect();
        if (r.top > mid) break;
        ph = k + Math.min(1, (mid - r.top) / Math.max(1, r.height));
      }
      world.current.phase = Math.min(MAX_PHASE, ph);
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(recompute);
    };
    recompute();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Las animaciones de texto (ScrollTrigger) sí cachean posiciones: refrescarlas si cambia la altura
    let lastH = document.documentElement.scrollHeight;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) < 4) return;
      lastH = h;
      clearTimeout(timer);
      timer = setTimeout(() => {
        ScrollTrigger.refresh();
        recompute();
      }, 200);
    });
    ro.observe(document.body);
    const settle = setTimeout(() => ScrollTrigger.refresh(), 600);

    // El escáner real de la página alimenta la escena
    const onScan = (e: Event) => {
      const d = (e as CustomEvent<{ state: WorldState['scan']; score?: number }>).detail;
      world.current.scan = d.state;
      world.current.score = d.score ?? null;
    };
    window.addEventListener('defensati:scan', onScan);

    return () => {
      window.removeEventListener('defensati:scan', onScan);
      clearTimeout(timer);
      clearTimeout(settle);
      ro.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 z-0 print:hidden pointer-events-none">
      <CyberWorldScene world={world} overlays={{ fade, dim, label, bar }} lite={lite} />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#0a0c0f_100%)]" />
      {/* Atenuación para leer el contenido en las fases de la página */}
      <div ref={dim} className="absolute inset-0 bg-[#0a0c0f] opacity-0" />
      {/* Fundido negro en los saltos Tierra ↔ servidor */}
      <div ref={fade} className="absolute inset-0 bg-[#0a0c0f] opacity-0" />

      {/* Retícula suiza de 1px */}
      <div className="absolute left-0 right-0 top-[7.5rem] lg:top-24 h-px bg-white/[0.07]" />
      <div className="absolute left-0 right-0 bottom-14 h-px bg-white/[0.07]" />
      <div className="absolute inset-y-0 left-[8.333%] w-px bg-white/[0.04]" />
      <div className="absolute inset-y-0 right-[8.333%] w-px bg-white/[0.04]" />

      {/* Coordenadas ancladas a las esquinas */}
      <p className="hud-label !tracking-[0.2em] absolute top-[8rem] lg:top-[6.5rem] left-4 sm:left-8">12°02′S · 77°01′W · Lima</p>
      <p className="hud-label !tracking-[0.2em] absolute top-[8rem] lg:top-[6.5rem] right-4 sm:right-8 hidden sm:block">
        Cadena de ataque
      </p>
      <p className="hud-label !tracking-[0.2em] !text-[#e8edf1] absolute bottom-5 left-4 sm:left-8">
        <span ref={label}>Fase 00 · {PHASES[0]}</span>
      </p>
      <p className="hud-label !tracking-[0.2em] absolute bottom-5 right-4 sm:right-8">Desliza ↓</p>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1a2026]">
        <div ref={bar} className="h-full bg-[#cfe3ee] origin-left" style={{ transform: 'scaleX(0)' }} />
      </div>
    </div>
  );
}
