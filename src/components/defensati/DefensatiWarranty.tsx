'use client';

import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  FileText, 
  AlertCircle
} from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function DefensatiWarranty() {
  return (
    <section id="garantia" className="w-full max-w-6xl xl:max-w-7xl mx-auto scroll-mt-24 space-y-6">
      
      {/* Tarjeta Principal de Garantía Estilo Apple Pro */}
      <div className="p-7 sm:p-12 rounded-[32px] sm:rounded-[36px] bg-[#161618]/75 border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-3xl relative overflow-hidden">
        
        {/* Glow de seguridad verde esmeralda */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
          
          {/* Icono de Escudo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#30d158] shrink-0 shadow-inner">
            <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          {/* Textos de Garantía */}
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[#2997ff] text-xs font-medium tracking-tight">
              <Sparkles className="w-3.5 h-3.5 text-[#30d158]" />
              <span>Garantía de Satisfacción Técnica DEFENSA TI</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold text-[#f5f5f7] tracking-tight leading-snug">
              Garantía por Escrito de 30 Días
            </h3>

            <p className="text-lg sm:text-xl font-medium text-[#30d158] leading-snug">
              “Si tu web se vuelve a infectar dentro de los 30 días por la misma causa, la limpio y la desinfecto gratis.”
            </p>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-3xl font-normal">
              Trabajamos con total transparencia técnica. Nos aseguramos de erradicar la causa raíz del malware y sellar las puertas traseras para que tu negocio opere con total continuidad y tranquilidad.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs sm:text-[13px] text-neutral-400">
              <span className="inline-flex items-center gap-1.5 text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
                RUC {siteConfig.business.ruc} a nombre de {siteConfig.business.owner}
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="inline-flex items-center gap-1.5 text-neutral-200 font-medium">
                <RotateCcw className="w-4 h-4 text-[#30d158]" />
                Yo mismo reviso tu web (sin intermediarios)
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="inline-flex items-center gap-1.5 text-neutral-200">
                <FileText className="w-4 h-4 text-[#38bdf8]" />
                Emisión de Factura o Boleta Electrónica
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Tarjeta de Límites y Condiciones Transparentes (Confianza Comercial) */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-white/[0.02] border border-white/10 backdrop-blur-xl text-left grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
        
        {/* Qué cubre */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#30d158] font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Alcance de la Garantía y Servicios</span>
          </div>
          <ul className="space-y-2 text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-[#30d158]">&bull;</span>
              <span>Desinfección integral de archivos core de WordPress y base de datos SQL.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#30d158]">&bull;</span>
              <span>Eliminación comprobable de virus, redirecciones a sitios spam y puertas traseras.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#30d158]">&bull;</span>
              <span>Fortalecimiento perimetral de cabeceras de transporte (HSTS, CSP, X-Frame) y SSL.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#30d158]">&bull;</span>
              <span>Asistencia técnica para la reactivación ante tu proveedor de hosting y Google Search Console.</span>
            </li>
          </ul>
        </div>

        {/* Qué no cubre (Límites saludables) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>Condiciones y Exclusiones Técnicas</span>
          </div>
          <ul className="space-y-2 text-neutral-400">
            <li className="flex items-start gap-2">
              <span className="text-amber-400">&bull;</span>
              <span>No cubre instalación posterior de plugins piratas (&ldquo;nulled&rdquo;) o temas sin licencia oficial.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">&bull;</span>
              <span>No cubre filtraciones derivadas de contraseñas débiles o compartidas con terceros tras la entrega.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">&bull;</span>
              <span>No cubre caídas generales del datacenter o fallas físicas ajenas a nivel de infraestructura del hosting.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">&bull;</span>
              <span>Medios de pago en Soles: Yape, Plin o Transferencia bancaria (BCP, BBVA, Interbank).</span>
            </li>
          </ul>
        </div>

      </div>

    </section>
  );
}
