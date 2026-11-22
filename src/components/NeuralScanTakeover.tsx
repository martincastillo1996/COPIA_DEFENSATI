'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ShatterLayer from '@/components/defensati/world/ShatterLayer';

interface NeuralScanTakeoverProps {
  targetUrl: string;
}

/** Pasos del escaneo público (el mismo orden que sigue /api/scan). */
const SCAN_STEPS = [
  { name: 'DNS y red', detail: 'Resolución del dominio y disponibilidad del servidor', progress: 25 },
  { name: 'Cifrado SSL', detail: 'Certificado, vigencia y configuración HTTPS', progress: 55 },
  { name: 'Cabeceras y puertos', detail: 'Protecciones HTTP y servicios expuestos', progress: 82 },
  { name: 'Dictamen', detail: 'Calificación y recomendaciones para tu negocio', progress: 98 },
];

const LOGS = [
  'dns · resolviendo dominio',
  'red · comprobando respuesta del servidor (443)',
  'tls · leyendo certificado y cadena',
  'tls · verificando vigencia',
  'http · inspeccionando cabeceras de seguridad',
  'http · evaluando protección contra clonación',
  'puertos · buscando servicios expuestos',
  'informe · calculando calificación',
];

export default function NeuralScanTakeover({ targetUrl }: NeuralScanTakeoverProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(8);
  const [logs, setLogs] = useState<string[]>([]);

  const cleanDomain =
    targetUrl
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .toLowerCase() || 'tuweb.com';

  useEffect(() => {
    const h = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(h);
  }, []);

  // Bloquear el scroll de la página mientras dura el escaneo
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const s = setInterval(() => {
      setStep((prev) => {
        const next = Math.min(prev + 1, SCAN_STEPS.length - 1);
        setProgress(SCAN_STEPS[next].progress);
        return next;
      });
    }, 850);
    let i = 0;
    const l = setInterval(() => {
      if (i < LOGS.length) {
        const line = LOGS[i++];
        setLogs((prev) => [...prev.slice(-4), line]);
      }
    }, 420);
    const first = setTimeout(() => setProgress(SCAN_STEPS[0].progress), 60);
    return () => {
      clearInterval(s);
      clearInterval(l);
      clearTimeout(first);
    };
  }, []);

  if (!mounted) return null;

  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Escaneando ${cleanDomain}`}
      data-shatter-scan
      style={{ background: 'rgba(10, 12, 15, 0.94)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}
      className="ice fixed inset-0 z-[999999] text-[#e8edf1] select-none animate-in fade-in duration-300 overflow-hidden"
    >
      {/* Retícula suiza de 1px, igual que el resto de la página */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 right-0 top-16 h-px bg-white/[0.08]" />
        <div className="absolute left-0 right-0 bottom-20 h-px bg-white/[0.08]" />
        <div className="absolute inset-y-0 w-px bg-white/[0.05]" style={{ left: '8.333%' }} />
        <div className="absolute inset-y-0 w-px bg-white/[0.05]" style={{ right: '8.333%' }} />
        {/* Barrido de escaneo vertical */}
        <style>{`@keyframes dtScanline{0%{top:0%;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:100%;opacity:0}}
          @media (prefers-reduced-motion: reduce){.dt-scanline{animation:none!important;opacity:0}}`}</style>
        <div
          className="dt-scanline absolute left-0 right-0 h-px bg-[#cfe3ee]/40 shadow-[0_0_24px_4px_rgba(207,227,238,0.25)]"
          style={{ animation: 'dtScanline 2.4s linear infinite' }}
        />
      </div>

      {/* Esquinas */}
      <p className="hud-label !tracking-[0.2em] !text-[#e8edf1] absolute top-6 left-4 sm:left-8">Fase 06 · Detección</p>
      <p className="hud-label !tracking-[0.2em] absolute top-6 right-4 sm:right-8 hidden sm:block">Escaneo no intrusivo · sin tocar tu base de datos</p>

      <div className="relative h-full grid grid-cols-12 gap-x-6 px-4 sm:px-8 pt-24 pb-28 content-center">
        {/* Título + dominio */}
        <div className="col-span-12 lg:col-span-7 self-center" style={{ paddingLeft: 'max(0px, calc(8.333% - 2rem))' }}>
          <p className="hud-label !tracking-[0.2em] mb-5">Escaneando el perímetro de</p>
          <h2
            className="hud-display !font-normal !leading-[0.95] !tracking-[-0.04em] break-all"
            style={{ fontSize: 'clamp(2.25rem, 5.5vw, 5.5rem)' }}
          >
            {cleanDomain}
          </h2>
          {/* Telemetría */}
          <ol className="mt-10 space-y-1.5 font-mono text-xs sm:text-[13px]">
            {logs.map((line, idx) => (
              <li
                key={`${line}-${idx}`}
                className={`truncate transition-opacity duration-300 ${idx === logs.length - 1 ? 'text-[#cfe3ee]' : 'text-[#7d8891]'}`}
              >
                <span className="text-[#4a535b] mr-2">›</span>
                {line}
                {idx === logs.length - 1 && <span className="inline-block w-2 h-3.5 ml-1 align-middle bg-[#cfe3ee] animate-pulse" />}
              </li>
            ))}
          </ol>
        </div>

        {/* Pasos */}
        <ol className="col-span-12 lg:col-span-4 lg:col-start-9 self-center mt-10 lg:mt-0 border-t border-white/[0.08]">
          {SCAN_STEPS.map((s, i) => {
            const done = step > i;
            const current = step === i;
            return (
              <li
                key={s.name}
                className={`grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 px-3 py-4 border-b border-white/[0.08] transition-colors duration-150 ${
                  current ? 'bg-[#e8edf1] text-[#0a0c0f]' : done ? 'text-[#e8edf1]' : 'text-[#4a535b]'
                }`}
              >
                <span className="font-mono text-[11px] tracking-[0.2em]">0{i + 1}</span>
                <span>
                  <span className="block text-lg font-light tracking-tight">{s.name}</span>
                  {current && <span className="block text-xs mt-0.5 opacity-70">{s.detail}</span>}
                </span>
                <span className="font-mono text-[11px] tracking-[0.2em] uppercase">
                  {done ? 'OK' : current ? '···' : ''}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Progreso: línea de 1px de borde a borde y porcentaje grande */}
      <div className="absolute left-0 right-0 bottom-20 h-px">
        <div className="h-full bg-[#cfe3ee] transition-[width] duration-700 ease-out shadow-[0_0_12px_rgba(207,227,238,0.6)]" style={{ width: `${progress}%` }} />
      </div>
      <div className="absolute bottom-5 left-4 sm:left-8 right-4 sm:right-8 flex items-end justify-between gap-4">
        <p className="hud-label !tracking-[0.2em]">
          Paso {step + 1} / {SCAN_STEPS.length} · {SCAN_STEPS[step].name}
        </p>
        <p className="font-light tracking-[-0.04em] tabular-nums leading-none" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
          {progress}
          <span className="text-[#7d8891] text-[0.5em] align-top ml-1">%</span>
        </p>
      </div>

      {/* Se arma a partir de fragmentos al abrirse */}
      <ShatterLayer selector="[data-shatter-scan]" introOnly className="absolute inset-0 z-10" />
    </div>
  );

  return createPortal(content, document.body);
}
