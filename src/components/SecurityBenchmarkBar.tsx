'use client';

import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface SecurityBenchmarkBarProps {
  score: number;
  grade: string;
  domain: string;
}

export default function SecurityBenchmarkBar({
  score,
  grade,
  domain,
}: SecurityBenchmarkBarProps) {
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
  const peruvianAverage = 42;
  const defensatiTarget = 98;

  // Determinar texto explicativo según posición
  const isAverageToGood = score > peruvianAverage && score < 85;
  const isElite = score >= 85;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#12141c] border border-white/10 shadow-2xl space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0071e3]/15 border border-[#0071e3]/30 text-[#38bdf8] flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Termómetro de Ciberseguridad: Tu Web vs. Mercado Peruano
            </h3>
            <p className="text-xs text-neutral-400">
              Comparativa de postura perimetral frente al promedio de páginas web corporativas y tiendas online en Perú.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-[10px] font-mono font-bold w-fit">
          Benchmark OWASP 2026
        </span>
      </div>

      {/* Barra Visual de Medición (0 a 100) */}
      <div className="space-y-3 pt-2">
        <div className="relative h-4 rounded-full bg-black/60 border border-white/10 p-0.5 overflow-hidden">
          {/* Zona Roja: 0 - 50 */}
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-rose-500/25 to-amber-500/25" />
          {/* Zona Verde: 50 - 100 */}
          <div className="absolute inset-y-0 left-1/2 right-0 bg-gradient-to-r from-amber-500/25 via-[#0071e3]/30 to-emerald-500/35" />
          
          {/* Barra de progreso de TU SITIO */}
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              score >= 85 
                ? 'bg-gradient-to-r from-[#0071e3] to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' 
                : score >= 60 
                ? 'bg-gradient-to-r from-amber-500 to-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                : 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
            }`}
            style={{ width: `${Math.min(100, Math.max(8, score))}%` }}
          />
        </div>

        {/* 3 Indicadores Comparativos Clave */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Promedio Perú */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-mono text-neutral-400 block">Promedio Perú (Pymes)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-neutral-300 font-mono">42 pts</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 border border-rose-500/20">
                Grado F
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Sin cabeceras defensivas ni túneles HSTS forzados.
            </p>
          </div>

          {/* Tu Sitio */}
          <div className={`p-3.5 rounded-2xl border space-y-1 ${
            score >= 85 
              ? 'bg-emerald-950/20 border-emerald-500/30' 
              : score >= 60 
              ? 'bg-sky-950/20 border-[#0071e3]/30' 
              : 'bg-rose-950/20 border-rose-500/30'
          }`}>
            <span className="text-[10px] uppercase font-mono text-neutral-400 block">Tu Sitio ({cleanDomain})</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-xl font-black font-mono ${
                score >= 85 ? 'text-emerald-300' : score >= 60 ? 'text-[#38bdf8]' : 'text-rose-400'
              }`}>
                {score} pts
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                score >= 85 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : score >= 60 
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                Grado {grade}
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-tight">
              {isElite
                ? 'Nivel de élite, por encima del 95% del mercado.'
                : isAverageToGood
                ? 'Superas el promedio, pero aún tienes brechas perimetrales.'
                : 'En zona de riesgo, por debajo del estándar seguro.'}
            </p>
          </div>

          {/* Meta DEFENSA TI */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/15 border border-emerald-500/25 space-y-1">
            <span className="text-[10px] uppercase font-mono text-emerald-400 block">Meta con Blindaje DEFENSA TI</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-emerald-300 font-mono">98-100 pts</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Grado A+
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-tight">
              Cabeceras canónicas + Cloudflare WAF anti-ataques activo.
            </p>
          </div>
        </div>
      </div>

      {/* Insight Conclusivo */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3 text-xs text-neutral-300">
        <TrendingUp className="w-4 h-4 text-[#38bdf8] shrink-0" />
        <span>
          {isElite
            ? 'Tu sitio web ya cuenta con una barrera perimetral ejemplar. Mantener este estándar genera máxima confianza en compradores.'
            : isAverageToGood
            ? `Cerrar la brecha de ${defensatiTarget - score} puntos hacia Grado A+ toma solo 24 horas con el paquete unificado de Blindaje + WAF Cloudflare (S/ 450).`
            : 'El 82% de las infecciones en webs peruanas ocurren en sitios con menos de 50 puntos debido a la ausencia de cabeceras defensivas básicas.'}
        </span>
      </div>
    </div>
  );
}
