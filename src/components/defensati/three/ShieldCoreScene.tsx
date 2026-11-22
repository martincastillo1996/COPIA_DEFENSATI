'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ShieldCoreCanvas = dynamic(() => import('./ShieldCoreCanvas'), { ssr: false });

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Carga el 3D solo si hay WebGL, el usuario no pidió menos movimiento y el
 * bloque está a la vista. Si no, queda un halo estático (sin coste).
 */
export default function ShieldCoreScene({ className = '' }: { className?: string }) {
  const [mode, setMode] = useState<'pending' | '3d' | 'static'>('pending');
  const [offsetX, setOffsetX] = useState(0);

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get('3d') === '1';
    const reduced = !forced && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fit = () => setOffsetX(window.innerWidth >= 1024 ? 2.35 : 0);
    // Es el hero: se monta tras el primer pintado para no frenar el LCP.
    const t = window.setTimeout(() => { fit(); setMode(reduced || !webglOk() ? 'static' : '3d'); }, 120);
    window.addEventListener('resize', fit);
    return () => { window.clearTimeout(t); window.removeEventListener('resize', fit); };
  }, []);

  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <div className="absolute inset-0 dt-core-halo" />
      {mode === '3d' && <ShieldCoreCanvas offsetX={offsetX} />}
    </div>
  );
}
