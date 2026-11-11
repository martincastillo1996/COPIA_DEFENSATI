'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  FileText, 
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function DefensatiWarranty() {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <section id="garantia" className="w-full max-w-6xl xl:max-w-7xl mx-auto scroll-mt-24 space-y-4">
      
      {/* Tarjeta Principal de Garantía Estilo Apple Pro */}
      <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[36px] bg-[#161618]/75 border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-3xl relative overflow-hidden">
        
        {/* Glow de seguridad verde esmeralda */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 sm:gap-8 text-center md:text-left">
          
          {/* Icono de Escudo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#30d158] shrink-0 shadow-inner">
            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          {/* Textos de Garantía */}
          <div className="space-y-2.5 flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[#2997ff] text-xs font-medium tracking-tight">
              <Sparkles className="w-3.5 h-3.5 text-[#30d158]" />
              <span>Garantía de Satisfacción Técnica DEFENSA TI</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#f5f5f7] tracking-tight leading-snug">
              Garantía por Escrito de 30 Días
            </h3>

            <p className="text-base sm:text-lg font-medium text-[#30d158] leading-snug">
              “Si tu web se vuelve a infectar dentro de los 30 días por la misma causa, la limpio y la desinfecto gratis.”
            </p>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl font-normal">
              Trabajamos con total transparencia técnica. Erradicamos la causa raíz del malware y sellamos puertas traseras para que tu negocio opere con tranquilidad.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs text-neutral-400">
              <span className="inline-flex items-center gap-1 text-neutral-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
                RUC {siteConfig.business.ruc}
              </span>
              <span>&bull;</span>
              <span className="inline-flex items-center gap-1 text-neutral-200 font-medium">
                <RotateCcw className="w-3.5 h-3.5 text-[#30d158]" />
                Yo mismo reviso tu web
              </span>
              <span>&bull;</span>
              <span className="inline-flex items-center gap-1 text-neutral-200">
                <FileText className="w-3.5 h-3.5 text-[#38bdf8]" />
                Factura o Boleta Electrónica
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Desplegable de Términos y Condiciones */}
      <div className="rounded-[24px] bg-white/[0.02] border border-white/10 backdrop-blur-xl overflow-hidden transition-all text-left">
        <button
          type="button"
          onClick={() => setShowTerms(prev => !prev)}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-neutral-200">
              {showTerms ? 'Ocultar términos y exclusiones' : '¿Qué cubre y qué no cubre la garantía? (Ver condiciones)'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${showTerms ? 'rotate-180 text-emerald-400' : ''}`} />
        </button>

        {showTerms && (
          <div className="p-5 sm:p-7 pt-0 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm animate-in fade-in-50 duration-200">
            {/* Qué cubre */}
            <div className="space-y-2.5 pt-4">
              <div className="flex items-center gap-2 text-[#30d158] font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Alcance de la Garantía</span>
              </div>
              <ul className="space-y-1.5 text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#30d158]">&bull;</span>
                  <span>Desinfección integral de archivos core de WordPress y base de datos SQL.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#30d158]">&bull;</span>
                  <span>Eliminación comprobable de virus, redirecciones a sitios spam y webshells.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#30d158]">&bull;</span>
                  <span>Fortalecimiento perimetral de cabeceras de transporte (HSTS, CSP, X-Frame) y SSL.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#30d158]">&bull;</span>
                  <span>Gestión técnica para retiro de advertencias en Google Search Console y desbloqueo con el hosting.</span>
                </li>
              </ul>
            </div>

            {/* Qué no cubre */}
            <div className="space-y-2.5 pt-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Exclusiones Técnicas</span>
              </div>
              <ul className="space-y-1.5 text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">&bull;</span>
                  <span>No cubre instalación posterior de plugins piratas (&ldquo;nulled&rdquo;) o temas sin licencia.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">&bull;</span>
                  <span>No cubre filtraciones por contraseñas débiles compartidas tras la entrega.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">&bull;</span>
                  <span>No cubre caídas generales del datacenter o fallas físicas ajenas del hosting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">&bull;</span>
                  <span>Medios de pago en Soles: Yape, Plin o Transferencia bancaria (BCP, BBVA, Interbank).</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

    </section>
  );
}
