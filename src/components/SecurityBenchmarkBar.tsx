'use client';

import React from 'react';
import { BarChart3, TrendingUp, Building2 } from 'lucide-react';
import { isHyperscalePlatform } from '@/lib/hyperscalers';
import { P } from '@/config/catalog';

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
  const isHyperscale = isHyperscalePlatform(cleanDomain);
  const peruvianAverage = 42;
  const defensatiTarget = 98;

  const displayScore = isHyperscale ? 98 : score;
  const displayGrade = isHyperscale ? 'A+' : grade;

  // Determinar texto explicativo según posición
  const isAverageToGood = displayScore > peruvianAverage && displayScore < 85;
  const isElite = displayScore >= 85;

  return (
    <div className="p-6 sm:p-7 bg-[#12141c] border border-white/10 space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/[0.06] border border-white/20 text-[#bdbdbd] flex items-center justify-center">
            {isHyperscale ? <Building2 className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#EDEDED] tracking-tight">
              {isHyperscale
                ? 'Benchmark de Arquitectura: Infraestructura de Hiperescala Global'
                : 'Termómetro de Ciberseguridad: Tu Web vs. Mercado Peruano'}
            </h3>
            <p className="text-xs text-neutral-400">
              {isHyperscale
                ? 'Evaluación de postura perimetral bajo arquitectura Anycast Multi-Cloud propietaria.'
                : 'Comparativa de postura perimetral frente al promedio de páginas web corporativas y tiendas online en Perú.'}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-neutral-300 text-[10px] font-mono font-bold w-fit">
          {isHyperscale ? 'Arquitectura Global' : 'Benchmark OWASP 2026'}
        </span>
      </div>

      {/* Barra Visual de Medición (0 a 100) */}
      <div className="space-y-3 pt-2">
        <div className="relative h-4 bg-[#080808] border border-white/10 p-0.5 overflow-hidden">
          {/* Zona Roja: 0 - 50 */}
          <div className="absolute inset-y-0 left-0 w-1/2" />
          {/* Zona Verde: 50 - 100 */}
          <div className="absolute inset-y-0 left-1/2 right-0" />
          
          {/* Barra de progreso de TU SITIO */}
          <div 
            className={`h-full transition-all duration-1000 ${
              isHyperscale
                ? ' '
                : displayScore >= 85 
                ? ' ' 
                : displayScore >= 60 
                ? ' ' 
                : ' '
            }`}
            style={{ width: `${Math.min(100, Math.max(8, isHyperscale ? 100 : displayScore))}%` }}
          />
        </div>

        {/* 3 Indicadores Comparativos Clave */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Promedio Perú */}
          <div className="p-3.5 bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-mono text-neutral-400 block">Promedio Perú (Pymes)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-neutral-300 font-mono">42 pts</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-white/[0.03] text-[#ff4d4d] border border-white/10">
                Grado F
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Sin cabeceras defensivas ni túneles HSTS forzados.
            </p>
          </div>

          {/* Tu Sitio */}
          <div className={`p-3.5 border space-y-1 ${
            isHyperscale || displayScore >= 85 
              ? 'bg-white/[0.03] border-white/10' 
              : displayScore >= 60 
              ? 'bg-white/[0.03] border-white/20' 
              : 'bg-white/[0.03] border-white/10'
          }`}>
            <span className="text-[10px] uppercase font-mono text-neutral-400 block">
              {isHyperscale ? `Caso de Estudio (${cleanDomain})` : `Tu Sitio (${cleanDomain})`}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-xl font-black font-mono ${
                isHyperscale || displayScore >= 85 ? 'text-emerald-300' : displayScore >= 60 ? 'text-[#38bdf8]' : 'text-rose-400'
              }`}>
                {displayScore} pts
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 ${
                isHyperscale || displayScore >= 85 
                  ? 'bg-white/[0.03] text-[#EDEDED] border border-white/10' 
                  : displayScore >= 60 
                  ? 'bg-white/[0.03] text-[#EDEDED] border border-white/10' 
                  : 'bg-white/[0.03] text-[#ff4d4d] border border-white/10'
              }`}>
                Grado {displayGrade}
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-tight">
              {isHyperscale
                ? 'Infraestructura de hiperescala nativa en navegadores (Chromium Preload).'
                : isElite
                ? 'Nivel de élite, por encima del 95% del mercado.'
                : isAverageToGood
                ? 'Superas el promedio, pero aún tienes brechas perimetrales.'
                : 'En zona de riesgo, por debajo del estándar seguro.'}
            </p>
          </div>

          {/* Meta DEFENSA TI */}
          <div className="p-3.5 bg-white/[0.03] border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#EDEDED] block">Meta con Blindaje DEFENSA TI</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-[#EDEDED] font-mono">98-100 pts</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-white/[0.03] text-[#EDEDED] border border-white/10">
                Grado A+
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-tight">
              {isHyperscale
                ? 'Replicamos esta misma seguridad para pymes mediante WAF Cloudflare.'
                : 'Cabeceras canónicas + Cloudflare WAF anti-ataques activo.'}
            </p>
          </div>
        </div>
      </div>

      {/* Insight Conclusivo */}
      <div className="p-3.5 bg-white/[0.03] border border-white/5 flex items-center gap-3 text-xs text-neutral-300">
        <TrendingUp className="w-4 h-4 text-[#bdbdbd] shrink-0" />
        <span>
          {isHyperscale
            ? 'Las plataformas de hiperescala (Google, GitHub, Microsoft, Apple) operan con redes Anycast globales y listas nativas de navegador. En DEFENSA TI adaptamos esa misma arquitectura de blindaje perimetral para pymes y empresas en el Perú.'
            : isElite
            ? 'Tu sitio web ya cuenta con una barrera perimetral ejemplar. Mantener este estándar genera máxima confianza en compradores.'
            : isAverageToGood
            ? `Cerrar la brecha de ${defensatiTarget - score} puntos hacia Grado A+ toma solo 24 horas con el paquete unificado de Blindaje + WAF Cloudflare (${P.blindajeWaf}).`
            : 'El 82% de las infecciones en webs peruanas ocurren en sitios con menos de 50 puntos debido a la ausencia de cabeceras defensivas básicas.'}
        </span>
      </div>
    </div>
  );
}
