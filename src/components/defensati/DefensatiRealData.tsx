'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, FileText, Search } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';

/**
 * Datos públicos y verificables (cada tarjeta enlaza a su fuente original).
 * - Patchstack, "State of WordPress Security in 2026" (datos de 2025).
 * - Sucuri, "2023 Hacked Website & Malware Threat Report" (39,594 sitios limpiados).
 * - Ministerio Público del Perú, vía Diario Oficial El Peruano (02/09/2026).
 */
const SOURCES = {
  patchstack: {
    label: 'Patchstack · State of WordPress Security in 2026',
    href: 'https://patchstack.com/whitepaper/state-of-wordpress-security-in-2026/',
  },
  sucuri: {
    label: 'Sucuri · Hacked Website & Malware Threat Report 2023',
    href: 'https://sucuri.net/reports/2023-hacked-website-report/',
  },
  mp: {
    label: 'Ministerio Público del Perú · El Peruano, 02/09/2026',
    href: 'https://elperuano.pe/noticia/303867-ciberdelitos-mas-denunciados-en-el-peru',
  },
} as const;

const YEARLY_VULNS = [
  { year: '2023', value: 5948 },
  { year: '2024', value: 7966 },
  { year: '2025', value: 11334 },
];

const PERU_TOTAL = 29118;
const PERU_BREAKDOWN = [
  { label: 'Fraude informático', value: 19602, color: '#38bdf8' },
  { label: 'Suplantación de identidad', value: 7431, color: '#7928ca' },
  { label: 'Otros delitos de la Ley N° 30096', value: PERU_TOTAL - 19602 - 7431, color: '#48484a' },
];

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

function CountUp({ to, active, decimals = 0 }: { to: number; active: boolean; decimals?: number }) {
  // Parte del valor final: si la animación no llega a ejecutarse, la cifra correcta ya está en pantalla.
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(to * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      setValue(to);
    };
  }, [active, to]);

  return (
    <span className="tabular-nums">
      {value.toLocaleString('es-PE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}

function SourceLink({ source }: { source: { label: string; href: string } }) {
  return (
    <a
      href={source.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-start gap-1 text-[11px] text-[#86868b] hover:text-[#38bdf8] transition-colors leading-snug whitespace-normal"
    >
      <span>Fuente: {source.label}</span>
      <ArrowUpRight className="w-3 h-3 shrink-0 mt-0.5" />
    </a>
  );
}

const CARD =
  'relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-[#141416] border border-white/10 p-6 sm:p-8 flex flex-col justify-between gap-6 transition-colors duration-300 hover:border-white/20 snap-center shrink-0 w-[86%] md:w-auto';
const EYEBROW = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#86868b]';
const BIG = 'font-semibold tracking-[-0.045em] leading-none bg-clip-text text-transparent';

export default function DefensatiRealData() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const maxVulns = Math.max(...YEARLY_VULNS.map((y) => y.value));

  // Anillo del 91 %
  const ringRadius = 52;
  const ringLength = 2 * Math.PI * ringRadius;

  return (
    <section id="datos-reales" className="w-full max-w-6xl xl:max-w-7xl mx-auto scroll-mt-24 text-left space-y-8 sm:space-y-12">
      {/* Cabecera */}
      <div className="max-w-3xl space-y-4">
        <p className="text-sm font-semibold text-[#38bdf8]">Datos reales, con su fuente</p>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#f5f5f7] tracking-[-0.04em] leading-[1.06]">
          No te hackean por ser grande.
          <span className="block text-[#86868b]">Te hackean por estar desactualizado.</span>
        </h2>
        <p className="text-base sm:text-lg text-[#a1a1a6] leading-relaxed">
          Estas cifras no son nuestras. Vienen de los informes públicos que usa la industria y del Ministerio Público del Perú. Cada tarjeta enlaza a su fuente para que la revises tú mismo.
        </p>
      </div>

      <p className="md:hidden text-xs text-[#86868b] -mb-4">Desliza para ver los 6 datos &rarr;</p>

      {/* Bento de datos (carrusel en móvil) */}
      <div ref={ref} className="flex md:grid md:grid-cols-6 gap-4 sm:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0">
        {/* 1. Vulnerabilidades por año */}
        <article className={`${CARD} md:col-span-4`}>
          <div className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full bg-[#0071e3]/20 blur-[90px]" />
          <div className="relative space-y-3">
            <p className={EYEBROW}>Fallas nuevas en WordPress, 2025</p>
            <p className={`${BIG} text-6xl sm:text-8xl bg-gradient-to-b from-white to-[#8fd3ff]`}>
              <CountUp to={11334} active={inView} />
            </p>
            <p className="text-base sm:text-lg text-[#d1d1d6] leading-snug max-w-md">
              vulnerabilidades nuevas en un solo año. Son <strong className="text-white font-semibold">42 % más</strong> que en 2024.
            </p>
          </div>

          <div className="relative">
            <div className="flex items-end gap-3 sm:gap-5 h-36 sm:h-44" role="img" aria-label="Vulnerabilidades nuevas por año: 5,948 en 2023, 7,966 en 2024 y 11,334 en 2025">
              {YEARLY_VULNS.map((item, index) => {
                const isLast = index === YEARLY_VULNS.length - 1;
                return (
                  <div key={item.year} className="flex-1 h-full flex flex-col justify-end gap-2">
                    <span className={`text-xs sm:text-sm font-semibold tabular-nums ${isLast ? 'text-white' : 'text-[#86868b]'}`}>
                      {item.value.toLocaleString('es-PE')}
                    </span>
                    <div
                      className={`w-full rounded-t-2xl rounded-b-md transition-[height] duration-[1200ms] ease-out motion-reduce:transition-none ${
                        isLast ? 'bg-gradient-to-t from-[#0071e3] to-[#38bdf8] shadow-[0_0_40px_rgba(56,189,248,0.35)]' : 'bg-white/[0.12]'
                      }`}
                      style={{
                        height: inView ? `${(item.value / maxVulns) * 78}%` : '0%',
                        transitionDelay: `${index * 140}ms`,
                      }}
                    />
                    <span className="text-xs text-[#86868b] font-medium">{item.year}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5">
              <SourceLink source={SOURCES.patchstack} />
            </div>
          </div>
        </article>

        {/* 2. 91 % en plugins */}
        <article className={`${CARD} md:col-span-2`}>
          <p className={EYEBROW}>Dónde está el problema</p>
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-40 h-40 sm:w-44 sm:h-44">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" role="img" aria-label="91 % de las vulnerabilidades están en plugins">
                <defs>
                  <linearGradient id="ring-plugins" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0071e3" />
                    <stop offset="55%" stopColor="#7928ca" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                <circle
                  cx="60"
                  cy="60"
                  r={ringRadius}
                  fill="none"
                  stroke="url(#ring-plugins)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={ringLength}
                  strokeDashoffset={inView ? ringLength * (1 - 0.91) : ringLength}
                  className="transition-[stroke-dashoffset] duration-[1500ms] ease-out motion-reduce:transition-none"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-white">
                  <CountUp to={91} active={inView} />%
                </span>
                <span className="text-xs text-[#86868b] font-medium mt-1">en plugins</span>
              </div>
            </div>
            <p className="text-sm text-[#d1d1d6] leading-snug text-center">
              El 9 % restante está en temas. En el núcleo de WordPress solo se reportaron <strong className="text-white font-semibold">6</strong>.
            </p>
          </div>
          <SourceLink source={SOURCES.patchstack} />
        </article>

        {/* 3. 5 horas */}
        <article className={`${CARD} md:col-span-3`}>
          <div className="pointer-events-none absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-[#ff453a]/15 blur-[90px]" />
          <div className="relative space-y-3">
            <p className={EYEBROW}>Cuánto tardan en atacar</p>
            <p className={`${BIG} text-6xl sm:text-8xl bg-gradient-to-b from-white to-[#ffb4ae]`}>
              <CountUp to={5} active={inView} /> <span className="text-4xl sm:text-5xl">horas</span>
            </p>
            <p className="text-base text-[#d1d1d6] leading-snug max-w-sm">
              Es la mediana entre que se publica una falla muy atacada y el primer intento de explotarla.
            </p>
          </div>
          <div className="relative space-y-3">
            <div className="relative h-3 rounded-full bg-white/[0.08] overflow-hidden" role="img" aria-label="5 de 24 horas">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#ff453a] to-[#ff9f0a] transition-[width] duration-[1400ms] ease-out motion-reduce:transition-none"
                style={{ width: inView ? `${(5 / 24) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#86868b] font-medium">
              <span>Se publica la falla</span>
              <span>24 h</span>
            </div>
            <SourceLink source={SOURCES.patchstack} />
          </div>
        </article>

        {/* 4. El hosting bloquea 26 % */}
        <article className={`${CARD} md:col-span-3`}>
          <div className="space-y-3">
            <p className={EYEBROW}>¿Y mi hosting no me protege?</p>
            <p className={`${BIG} text-6xl sm:text-8xl bg-gradient-to-b from-white to-[#9be7b4]`}>
              <CountUp to={26} active={inView} />%
            </p>
            <p className="text-base text-[#d1d1d6] leading-snug max-w-sm">
              Solo eso bloquearon las defensas de hostings populares en una prueba a gran escala. El resto de ataques pasó.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 sm:gap-1.5" role="img" aria-label="De cada 100 ataques, 26 fueron bloqueados y 74 pasaron">
              {Array.from({ length: 100 }).map((_, i) => (
                <span
                  key={i}
                  className={`aspect-square rounded-full transition-opacity duration-700 motion-reduce:transition-none ${
                    i < 26 ? 'bg-[#30d158]' : 'bg-[#ff453a]/70'
                  }`}
                  style={{ opacity: inView ? 1 : 0, transitionDelay: `${i * 8}ms` }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#d1d1d6]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#30d158]" />
                26 bloqueados
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff453a]/70" />
                74 pasaron
              </span>
            </div>
            <SourceLink source={SOURCES.patchstack} />
          </div>
        </article>

        {/* 5. Sucuri: backdoors y software desactualizado */}
        <article className={`${CARD} md:col-span-2`}>
          <div className="space-y-2">
            <p className={EYEBROW}>Dentro de una web infectada</p>
            <p className="text-sm text-[#a1a1a6] leading-snug">Sobre 39,594 sitios limpiados en un año.</p>
          </div>
          <div className="space-y-6">
            {[
              { value: 49.21, label: 'tenía al menos una puerta trasera oculta para volver a entrar', color: 'from-[#7928ca] to-[#38bdf8]' },
              { value: 39.1, label: 'usaba un gestor de contenidos desactualizado al infectarse', color: 'from-[#0071e3] to-[#38bdf8]' },
            ].map((row, index) => (
              <div key={row.label} className="space-y-2">
                <p className="text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-white">
                  <CountUp to={row.value} active={inView} decimals={1} />%
                </p>
                <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${row.color} transition-[width] duration-[1300ms] ease-out motion-reduce:transition-none`}
                    style={{ width: inView ? `${row.value}%` : '0%', transitionDelay: `${index * 160}ms` }}
                  />
                </div>
                <p className="text-sm text-[#d1d1d6] leading-snug">{row.label}</p>
              </div>
            ))}
          </div>
          <SourceLink source={SOURCES.sucuri} />
        </article>

        {/* 6. Perú */}
        <article className={`${CARD} md:col-span-4`}>
          <div className="pointer-events-none absolute -top-24 -left-16 w-80 h-80 rounded-full bg-[#7928ca]/20 blur-[90px]" />
          <div className="relative space-y-3">
            <p className={EYEBROW}>Perú, enero a julio de 2026</p>
            <p className={`${BIG} text-6xl sm:text-8xl bg-gradient-to-b from-white to-[#c9a8ff]`}>
              <CountUp to={PERU_TOTAL} active={inView} />
            </p>
            <p className="text-base sm:text-lg text-[#d1d1d6] leading-snug max-w-lg">
              denuncias por delitos informáticos registró el Ministerio Público en solo siete meses. Más del <strong className="text-white font-semibold">92 %</strong> fue fraude o suplantación de identidad.
            </p>
          </div>

          <div className="relative space-y-4">
            <div className="flex h-4 rounded-full overflow-hidden bg-white/[0.06] gap-0.5" role="img" aria-label="Fraude informático 19,602; suplantación de identidad 7,431; otros 2,085">
              {PERU_BREAKDOWN.map((part, index) => (
                <div
                  key={part.label}
                  className="h-full transition-[width] duration-[1300ms] ease-out motion-reduce:transition-none"
                  style={{
                    width: inView ? `${(part.value / PERU_TOTAL) * 100}%` : '0%',
                    backgroundColor: part.color,
                    transitionDelay: `${index * 160}ms`,
                  }}
                />
              ))}
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PERU_BREAKDOWN.map((part) => (
                <li key={part.label} className="space-y-0.5">
                  <span className="flex items-center gap-2 text-lg font-semibold text-white tabular-nums">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: part.color }} />
                    {part.value.toLocaleString('es-PE')}
                  </span>
                  <span className="block text-xs text-[#a1a1a6] leading-snug">{part.label}</span>
                </li>
              ))}
            </ul>
            <SourceLink source={SOURCES.mp} />
          </div>
        </article>
      </div>

      {/* Cierre: qué significa y qué hacer */}
      <div className="rounded-[28px] sm:rounded-[32px] bg-[#0e1118] border border-white/10 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-2xl sm:text-3xl font-semibold text-[#f5f5f7] tracking-[-0.03em] leading-tight">
            ¿Tu web está en ese grupo?
          </h3>
          <p className="text-sm sm:text-base text-[#a1a1a6] leading-relaxed">
            Lo sabes en un minuto con el escáner gratuito. Y si prefieres, yo mismo la reviso y te explico qué encontré antes de que pagues nada.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <a
            href="#escaner-gratis"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white font-semibold text-sm sm:text-base transition-all"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Escanear mi web gratis</span>
          </a>
          <a
            href={DEFENSATI_WHATSAPP_MESSAGES.diagnosticoGratis()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick({ service: 'diagnostico_gratis', placement: 'real_data_section' })}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/12 active:scale-[0.98] text-[#f5f5f7] font-semibold text-sm sm:text-base transition-all"
          >
            <WhatsAppIcon className="w-4 h-4 fill-[#25D366] shrink-0" />
            <span>Que Martín la revise</span>
          </a>
        </div>
      </div>

      {/* Informe de muestra */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <p className="text-sm text-[#a1a1a6] leading-snug">
          ¿Quieres ver qué entregamos antes de contratar? Revisa un informe de muestra (caso ficticio, claramente marcado).
        </p>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/defensati/informe-ejemplo"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-[#f5f5f7] font-semibold text-xs transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Ver informe online</span>
          </Link>
          <a
            href="/informe-ejemplo-defensati.pdf"
            target="_blank"
            download="informe-ejemplo-defensati.pdf"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-[#f5f5f7] font-semibold text-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Descargar PDF</span>
          </a>
        </div>
      </div>
    </section>
  );
}
