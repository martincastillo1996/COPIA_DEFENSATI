'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart3,
  Scale
} from 'lucide-react';

export default function PreviewCases() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'ecommerce' | 'corporate'>('ecommerce');

  return (
    <section id="ejemplos" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-6 scroll-mt-24">
      
      {/* 1. La Oportunidad Comercial en Perú (Datos Oficiales del Estado Peruano) */}
      <div className="rounded-[32px] bg-[#121214]/80 border border-white/10 p-6 sm:p-9 backdrop-blur-2xl shadow-xl space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-[#ff453a] text-xs sm:text-[13px] font-medium tracking-tight">
            <span className="w-2 h-2 rounded-full bg-[#ff453a] animate-ping" />
            <span>Oportunidad respaldada por datos oficiales</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold text-[#f5f5f7] tracking-[-0.035em]">
            1. La oportunidad comercial en Perú
          </h2>
          <p className="text-sm sm:text-base text-[#a1a1a6] font-normal leading-relaxed max-w-2xl">
            Hay cifras oficiales que puedes utilizar para justificar la necesidad urgente de blindar tus servicios y tu plataforma web:
          </p>
        </div>

        {/* 3 Tarjetas de Métricas Oficiales Apple Pro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Métrica 1 */}
          <div className="rounded-[24px] bg-white/[0.04] border border-white/10 p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#86868b]">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Crecimiento de denuncias
                </span>
                <TrendingUp className="w-4 h-4 text-[#ff453a]" />
              </div>
              <div className="text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-[#ff453a] via-[#ff6961] to-[#ff9f0a]">
                +134%
              </div>
              <p className="text-xs sm:text-sm text-[#f5f5f7] leading-relaxed font-normal">
                Entre 2021 y 2025, las denuncias pasaron de aproximadamente 19 mil a <strong>44,703</strong>, según el Ministerio Público.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-[#86868b]">
              <span>🏛️ Plataforma del Estado Peruano</span>
            </div>
          </div>

          {/* Métrica 2 */}
          <div className="rounded-[24px] bg-white/[0.04] border border-white/10 p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#86868b]">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Primer cuatrimestre de 2026
                </span>
                <Scale className="w-4 h-4 text-[#ff9f0a]" />
              </div>
              <div className="text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-[#ff9f0a] via-[#ffd60a] to-[#30d158]">
                +26.04%
              </div>
              <p className="text-xs sm:text-sm text-[#f5f5f7] leading-relaxed font-normal">
                Se registraron <strong>16,144</strong> delitos informáticos denunciados frente a 12,809 en el mismo periodo de 2025.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-[#86868b]">
              <span>⚖️ Ministerio Público del Perú</span>
            </div>
          </div>

          {/* Métrica 3 */}
          <div className="rounded-[24px] bg-white/[0.04] border border-white/10 p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#86868b]">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Victimización urbana
                </span>
                <BarChart3 className="w-4 h-4 text-[#2997ff]" />
              </div>
              <div className="text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-[#2997ff] via-[#70baff] to-[#c084fc]">
                2.4%
              </div>
              <p className="text-xs sm:text-sm text-[#f5f5f7] leading-relaxed font-normal">
                Tasa de víctimas de delitos informáticos por cada 100 habitantes urbanos de 15 años o más durante 2025.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-[#86868b]">
              <span>📊 INEI (Instituto Nacional de Estadística)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cabecera de Sección con Botón Colapsable */}
      <div className="text-center space-y-4 max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#141416]/90 border border-white/10 backdrop-blur-2xl shadow-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-sky-400 text-xs sm:text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Ejemplos ilustrativos &bull; Simulación didáctica</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          Ejemplos ilustrativos: Antes y Después del Blindaje
        </h2>
        <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl mx-auto font-normal">
          Escenarios modelo representativos basados en configuraciones habituales de páginas web en Perú. Muestran cómo un sitio con fallas perimetrales se transforma tras aplicar buenas prácticas y blindaje.
        </p>

        {/* Botón para Mostrar / Ocultar Detalle (Oculto por defecto) */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#0071e3]/20 hover:bg-[#0071e3]/30 border border-[#0071e3]/50 text-[#38bdf8] font-bold text-sm sm:text-base transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>Ocultar detalle de ejemplos</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Ver detalle de casos de ejemplo (Antes vs Después)</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Contenido Detallado: Solo visible si el usuario hace clic para ver más */}
      {isExpanded && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Selector de Pestañas (Mobile first: centrado y fácil de presionar) */}
          <div className="flex justify-center">
            <div className="inline-flex flex-col sm:flex-row p-1.5 rounded-2xl bg-white/5 border border-white/10 gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('ecommerce')}
                className={`px-5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'ecommerce'
                    ? 'bg-[#0071e3] text-white shadow-md'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                🛒 Ejemplo 1 (Simulación): E-commerce & Tienda de Calzado
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('corporate')}
                className={`px-5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'corporate'
                    ? 'bg-[#0071e3] text-white shadow-md'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                🏢 Ejemplo 2 (Simulación): Portal Corporativo B2B
              </button>
            </div>
          </div>

          {/* Contenido del Caso Activo */}
          <div className="rounded-3xl bg-[#0e1118]/90 border border-white/10 p-6 sm:p-9 backdrop-blur-2xl shadow-2xl space-y-8">
            
            {activeTab === 'ecommerce' ? (
              <div className="space-y-6">
                {/* Título del Caso */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs sm:text-sm font-mono text-sky-400 uppercase font-bold tracking-wider">
                      Sector Retail &bull; Simulación de Muestra
                    </span>
                    <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1">
                      Tienda Online de Calzado & Moda (Simulación WooCommerce)
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold shrink-0 self-start sm:self-center">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Ejemplo ilustrativo</span>
                  </div>
                </div>

                {/* Comparativo Antes vs Después */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Tarjeta ANTES */}
                  <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs sm:text-sm font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Situación Inicial (Ejemplo)</span>
                      </div>
                      <span className="text-3xl font-black text-rose-400 font-mono">24/100 (Grado F)</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <h4 className="text-base sm:text-lg font-black text-white">Vulnerabilidades de muestra:</h4>
                      <ul className="space-y-2.5 text-sm sm:text-base text-neutral-100 leading-relaxed font-normal">
                        <li className="flex items-start gap-2.5">
                          <span className="text-rose-400 font-bold text-base">&times;</span>
                          <span>Sin cabeceras HSTS: conexión vulnerable a intercepciones.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="text-rose-400 font-bold text-base">&times;</span>
                          <span>Sin directiva CSP ni X-Frame-Options: riesgo de clonación de formularios.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="text-rose-400 font-bold text-base">&times;</span>
                          <span>Versión de WordPress y plugins visibles en el código fuente.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Tarjeta DESPUÉS */}
                  <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Tras Blindaje (Ejemplo)</span>
                      </div>
                      <span className="text-3xl font-black text-emerald-400 font-mono">95/100 (Grado A)</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <h4 className="text-base sm:text-lg font-black text-white">Mejoras implementadas:</h4>
                      <ul className="space-y-2.5 text-sm sm:text-base text-neutral-100 leading-relaxed font-normal">
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                          <span>Cabeceras estrictas HSTS activas con precarga.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                          <span>Protección contra clickjacking y formularios seguros.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                          <span>Ocultamiento de versiones y plugins actualizados.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Título del Caso */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs sm:text-sm font-mono text-sky-400 uppercase font-bold tracking-wider">
                      Sector Servicios &bull; Simulación de Muestra
                    </span>
                    <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1">
                      Portal Corporativo B2B (Simulación Servicios & Logística)
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold shrink-0 self-start sm:self-center">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Ejemplo ilustrativo</span>
                  </div>
                </div>

                {/* Comparativo Antes vs Después */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Tarjeta ANTES */}
                  <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs sm:text-sm font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Situación Inicial (Ejemplo)</span>
                      </div>
                      <span className="text-3xl font-black text-rose-400 font-mono">38/100 (Grado F)</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <h4 className="text-base sm:text-lg font-black text-white">Vulnerabilidades de muestra:</h4>
                      <ul className="space-y-2.5 text-sm sm:text-base text-neutral-100 leading-relaxed font-normal">
                        <li className="flex items-start gap-2.5">
                          <span className="text-rose-400 font-bold text-base">&times;</span>
                          <span>Contenido mixto (HTTP/HTTPS) en hojas de estilo y scripts.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="text-rose-400 font-bold text-base">&times;</span>
                          <span>Ausencia de cabeceras de aislamiento y políticas de cookies débiles.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="text-rose-400 font-bold text-base">&times;</span>
                          <span>Exposición de cabeceras de servidor que revelan arquitectura interna.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Tarjeta DESPUÉS */}
                  <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Tras Blindaje (Ejemplo)</span>
                      </div>
                      <span className="text-3xl font-black text-emerald-400 font-mono">98/100 (Grado A)</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <h4 className="text-base sm:text-lg font-black text-white">Mejoras implementadas:</h4>
                      <ul className="space-y-2.5 text-sm sm:text-base text-neutral-100 leading-relaxed font-normal">
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                          <span>Forzado total de HTTPS con redirección 301 limpia.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                          <span>Directivas perimetrales completas (HSTS, CSP, Permissions-Policy).</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                          <span>Cabeceras del servidor saneadas y cookies seguras con atributo SameSite.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Enlace al informe de ejemplo */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-neutral-300 text-center sm:text-left font-normal">
                Puedes explorar un informe técnico de muestra completo y descargable en PDF.
              </span>
              <Link
                href="/defensati/informe-ejemplo"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sky-400 font-bold text-sm transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Ver Informe Modelo (Ejemplo)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      )}

    </section>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  );
}
