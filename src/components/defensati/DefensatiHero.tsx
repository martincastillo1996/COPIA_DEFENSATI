'use client';

import React from 'react';
import { ShieldCheck, ArrowDown, MessageCircle, CheckCircle2 } from 'lucide-react';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';

export default function DefensatiHero() {
  const whatsappUrl = DEFENSATI_WHATSAPP_MESSAGES.hero();

  const scrollToScanner = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById('escaner-gratis');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative w-full pt-8 pb-14 sm:pt-16 sm:pb-20 text-center">
      {/* Badge superior Apple Glass */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-[#2997ff] text-xs sm:text-[13px] font-medium mb-6 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <ShieldCheck className="w-4 h-4 text-[#2997ff]" />
        <span>DEFENSA TI &bull; Blindaje y Ciberseguridad Web</span>
      </div>

      {/* Título Principal Apple Pro Display (Tipografía SF Pro equilibrada, sin grosor excesivo) */}
      <div className="max-w-4xl mx-auto space-y-3 px-4">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] text-[#f5f5f7] leading-[1.08] sm:leading-[1.05] whitespace-normal drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
          ¿Tu web fue hackeada?
          <span className="block text-transparent bg-clip-text bg-linear-to-r from-[#2997ff] via-[#70baff] to-[#c084fc] mt-2 sm:mt-3 font-semibold tracking-[-0.035em]">
            La limpiamos y la dejamos blindada
          </span>
        </h1>

        {/* Subtítulo Estilo Apple */}
        <p className="text-base sm:text-xl text-[#a1a1a6] font-normal leading-relaxed max-w-xl mx-auto pt-3 tracking-[-0.01em] whitespace-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
          Te mostramos lo que encontramos antes de que pagues.
        </p>
      </div>

      {/* Botones de Acción Estilo Apple Pro (Pill redondeado con iluminación de cristal) */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto px-4">
        {/* Botón Principal WhatsApp Estilo Apple Pill */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#30d158] hover:bg-[#28cd41] active:scale-[0.98] text-[#000000] font-semibold text-base sm:text-lg shadow-[0_10px_30px_rgba(48,209,88,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all cursor-pointer group"
        >
          <MessageCircle className="w-5 h-5 fill-current shrink-0" />
          <span className="leading-snug">Escríbenos por WhatsApp</span>
        </a>

        {/* Botón Secundario Frosted Glass */}
        <a
          href="#escaner-gratis"
          onClick={scrollToScanner}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white/[0.08] hover:bg-white/[0.12] active:scale-[0.98] text-[#f5f5f7] font-medium text-sm sm:text-base border border-white/[0.14] backdrop-blur-2xl transition-all cursor-pointer text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
        >
          <span>Probar el escáner gratis</span>
          <ArrowDown className="w-4 h-4 text-[#2997ff] shrink-0" />
        </a>
      </div>

      {/* Micro-garantías visuales Apple */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-[13px] text-[#86868b] px-4 font-normal tracking-[-0.01em]">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
          Diagnóstico previo sin costo
        </span>
        <span className="hidden sm:inline text-neutral-600">&bull;</span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
          WhatsApp: {siteConfig.contact.whatsappFormatted}
        </span>
        <span className="hidden sm:inline text-neutral-600">&bull;</span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
          RUC {siteConfig.business.ruc}
        </span>
      </div>

      {/* Indicador interactivo de la red neuronal 3D */}
      <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/25 text-[#7dd3fc] text-xs font-mono backdrop-blur-xl shadow-[0_0_15px_rgba(56,189,248,0.15)]">
        <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
        <span>Red neuronal 3D en tiempo real &bull; Clic en cualquier dominio para autocompletar</span>
      </div>
    </section>
  );
}
