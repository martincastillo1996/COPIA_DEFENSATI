'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';

/** Fases 00–05 de la cadena de ataque. Cada capítulo empuja el mundo 3D (CyberWorld). */
const CHAPTERS = [
  {
    id: 'objetivo',
    kicker: 'Defensa TI · Fase 00',
    title: 'Así te ven ellos.',
    body: 'Así ocurre un ataque real contra una web en el Perú, de principio a fin. Desliza.',
  },
  {
    id: 'reconocimiento',
    kicker: 'Fase 01 · Reconocimiento',
    title: 'Primero, te encuentran.',
    body: 'Desde servidores alquilados en cualquier parte del mundo, bots rastrean internet entero buscando WordPress desactualizados, paneles expuestos y puertos abiertos. No te eligen: prueban a todos.',
  },
  {
    id: 'intrusion',
    kicker: 'Fase 02 · Intrusión',
    title: 'Luego, tocan la puerta.',
    body: 'Fuerza bruta contra el login, formularios sin protección y peticiones maliciosas. Sin WAF ni cabeceras estrictas, nada las filtra antes de llegar a tu servidor.',
  },
  {
    id: 'explotacion',
    kicker: 'Fase 03 · Explotación',
    title: 'Entran por lo olvidado.',
    body: 'Un plugin sin actualizar o una versión vieja del CMS basta para ejecutar código dentro de tu servidor.',
  },
  {
    id: 'persistencia',
    kicker: 'Fase 04 · Persistencia',
    title: 'Y se quedan a vivir.',
    body: 'Dejan puertas traseras escondidas en archivos y en la base de datos. Por eso una limpieza a medias no sirve: vuelven.',
  },
  {
    id: 'respuesta',
    kicker: 'Fase 05 · Respuesta',
    title: 'Aquí entramos nosotros.',
    body: 'Desinfección forense archivo por archivo, cierre de cada puerta trasera y blindaje del perímetro. Con garantía escrita de 30 días.',
    cta: true,
  },
] as const;

export default function DefensatiOdyssey() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-chapter]').forEach((el) => {
        const lines = el.querySelectorAll('[data-reveal]');
        // Una sola línea de tiempo por capítulo: entra, se sostiene y sale
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 20%', scrub: true } })
          .fromTo(lines, { opacity: 0, y: reduced ? 0 : 40 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.3, ease: 'none' })
          .to(lines, { opacity: 1, duration: 0.4 })
          .to(lines, { opacity: 0, y: reduced ? 0 : -30, stagger: 0.03, duration: 0.3, ease: 'none' });
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} aria-label="Anatomía de un ciberataque" className="relative">
      {CHAPTERS.map((c, i) => (
        <div
          key={c.id}
          id={`capitulo-${c.id}`}
          data-chapter
          data-phase={i}
          style={{ height: '100vh', paddingBottom: i === 0 ? '9rem' : undefined }}
          className={`flex px-4 sm:px-[8.333%] ${i === 0 ? 'items-end' : 'items-center'} ${
            i % 2 ? 'justify-end' : 'justify-start'
          }`}
        >
          <div className="w-full" style={{ maxWidth: i === 0 ? 'min(60rem, 100%)' : 'min(36rem, 100%)' }}>
            <p data-reveal className="hud-label !tracking-[0.2em] mb-5">
              {c.kicker}
            </p>
            <h2
              data-reveal
              className="hud-display !font-normal !leading-[0.92] !tracking-[-0.045em] [text-wrap:balance] [text-shadow:0_0_30px_#0a0c0f]"
              style={{ fontSize: i === 0 ? 'clamp(3rem, 7.5vw, 7.5rem)' : 'clamp(2.25rem, 4.6vw, 4.5rem)' }}
            >
              {c.title}
            </h2>
            <p
              data-reveal
              className="mt-6 text-base sm:text-lg text-[#b4bec6] leading-relaxed [text-shadow:0_0_18px_#0a0c0f,0_0_4px_#0a0c0f]"
              style={{ maxWidth: '32rem' }}
            >
              {c.body}
            </p>
            {'cta' in c && c.cta && (
              <div data-reveal className="mt-8 flex flex-wrap gap-3">
                <a href="#escaner-perimetral" className="hud-btn hud-btn-solid">
                  Escanear mi sitio
                </a>
                <a
                  href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick({ service: 'general', placement: 'odyssey_cta' })}
                  className="hud-btn"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current" /> Hablar con un especialista
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
