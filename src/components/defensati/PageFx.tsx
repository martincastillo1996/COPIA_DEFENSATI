'use client';

import { useEffect } from 'react';
import NeuralGravityField from './NeuralGravityField';

/**
 * Interactividad global de /defensati: orbe fijo que sigue cursor y scroll,
 * secciones que aparecen al entrar en pantalla y foco de luz que sigue al mouse.
 */
export default function PageFx() {
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('ng-in'); io.unobserve(e.target); } }),
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    );
    const scan = () => Array.from(main.children).forEach((el) => {
      if (el.classList.contains('ng-reveal')) return;
      el.classList.add('ng-reveal');
      if (el.getBoundingClientRect().top < window.innerHeight) {
        requestAnimationFrame(() => el.classList.add('ng-in'));
      } else {
        io.observe(el);
      }
    });
    scan();
    // Respaldo: si el observer no dispara, nunca dejar contenido oculto
    const fallback = setTimeout(() => main.querySelectorAll('.ng-reveal').forEach((e) => e.classList.add('ng-in')), 3000);
    const mo = new MutationObserver(scan);
    mo.observe(main, { childList: true });
    return () => { clearTimeout(fallback); io.disconnect(); mo.disconnect(); };
  }, []);

  return (
    <>
      <NeuralGravityField global className="z-0" />
    </>
  );
}
