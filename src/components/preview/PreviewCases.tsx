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
  ChevronUp
} from 'lucide-react';

export default function PreviewCases() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'ecommerce' | 'corporate'>('ecommerce');

  return (
    <section id="ejemplos" className="w-full max-w-5xl mx-auto space-y-6 scroll-mt-24 px-4 sm:px-6">
      
      {/* Cabecera de Sección con Botón Colapsable */}
      <div className="text-center space-y-4 max-w-3xl mx-auto p-6 sm:p-7 rounded-3xl bg-[#141416]/90 border border-white/10 backdrop-blur-2xl shadow-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-sky-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ejemplos ilustrativos &bull; Simulación didáctica</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
          Ejemplos ilustrativos: Antes y Después del Blindaje
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl mx-auto">
          Escenarios modelo representativos basados en configuraciones habituales de páginas web en Perú. Muestran cómo un sitio con fallas perimetrales se transforma tras aplicar buenas prácticas y blindaje.
        </p>

        {/* Botón para Mostrar / Ocultar Detalle (Oculto por defecto) */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0071e3]/15 hover:bg-[#0071e3]/25 border border-[#0071e3]/40 text-[#38bdf8] font-bold text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer"
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
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'ecommerce'
                    ? 'bg-[#0071e3] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🛒 Ejemplo 1 (Simulación): E-commerce & Tienda de Calzado
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('corporate')}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'corporate'
                    ? 'bg-[#0071e3] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
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
                    <span className="text-[11px] font-mono text-sky-400 uppercase font-bold tracking-wider">
                      Sector Retail &bull; Simulación de Muestra
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                      Tienda Online de Calzado & Moda (Simulación WooCommerce)
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0 self-start sm:self-center">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Ejemplo ilustrativo</span>
                  </div>
                </div>

                {/* Comparativo Antes vs Después */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Tarjeta ANTES */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Situación Inicial (Ejemplo)</span>
                      </div>
                      <span className="text-2xl font-black text-rose-400 font-mono">24/100 (Grado F)</span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <h4 className="text-sm font-bold text-white">Vulnerabilidades de muestra:</h4>
                      <ul className="space-y-2 text-xs text-neutral-300">
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">&times;</span>
                          <span>Sin cabeceras HSTS: conexión vulnerable a intercepciones.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">&times;</span>
                          <span>Sin directiva CSP ni X-Frame-Options: riesgo de clonación de formularios.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">&times;</span>
                          <span>Versión de WordPress y plugins visibles en el código fuente.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Tarjeta DESPUÉS */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Tras Blindaje (Ejemplo)</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-400 font-mono">95/100 (Grado A)</span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <h4 className="text-sm font-bold text-white">Mejoras implementadas:</h4>
                      <ul className="space-y-2 text-xs text-neutral-300">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Cabeceras estrictas HSTS activas con precarga.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Protección contra clickjacking y formularios seguros.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
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
                    <span className="text-[11px] font-mono text-sky-400 uppercase font-bold tracking-wider">
                      Sector Servicios &bull; Simulación de Muestra
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                      Portal Corporativo B2B (Simulación Servicios & Logística)
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0 self-start sm:self-center">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Ejemplo ilustrativo</span>
                  </div>
                </div>

                {/* Comparativo Antes vs Después */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Tarjeta ANTES */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Situación Inicial (Ejemplo)</span>
                      </div>
                      <span className="text-2xl font-black text-rose-400 font-mono">38/100 (Grado F)</span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <h4 className="text-sm font-bold text-white">Vulnerabilidades de muestra:</h4>
                      <ul className="space-y-2 text-xs text-neutral-300">
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">&times;</span>
                          <span>Contenido mixto (HTTP/HTTPS) en hojas de estilo y scripts.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">&times;</span>
                          <span>Ausencia de cabeceras de aislamiento y políticas de cookies débiles.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">&times;</span>
                          <span>Exposición de cabeceras de servidor que revelan arquitectura interna.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Tarjeta DESPUÉS */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Tras Blindaje (Ejemplo)</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-400 font-mono">98/100 (Grado A)</span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <h4 className="text-sm font-bold text-white">Mejoras implementadas:</h4>
                      <ul className="space-y-2 text-xs text-neutral-300">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Forzado total de HTTPS con redirección 301 limpia.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Directivas perimetrales completas (HSTS, CSP, Permissions-Policy).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
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
              <span className="text-xs text-neutral-400 text-center sm:text-left">
                Puedes explorar un informe técnico de muestra completo y descargable en PDF.
              </span>
              <Link
                href="/defensati/informe-ejemplo"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sky-400 font-semibold text-xs transition-all"
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
