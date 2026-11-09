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
    <section className="relative w-full pt-6 pb-12 sm:pt-12 sm:pb-16 text-center">
      {/* Badge superior de confianza */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-sky-400 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-xl shadow-inner">
        <ShieldCheck className="w-4 h-4 text-sky-400" />
        <span>DEFENSA TI &bull; Ciberseguridad y Blindaje Web</span>
      </div>

      {/* Título Principal de Alto Impacto */}
      <div className="max-w-3xl mx-auto space-y-4 px-2">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.18] sm:leading-[1.12] whitespace-normal">
          ¿Tu web fue hackeada?{' '}
          <span className="block text-transparent bg-clip-text bg-linear-to-r from-[#38bdf8] via-[#60a5fa] to-[#a78bfa] mt-1 sm:mt-2">
            La limpiamos y la dejamos blindada
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="text-base sm:text-xl text-neutral-300 font-normal leading-relaxed max-w-xl mx-auto pt-2 whitespace-normal">
          Te mostramos lo que encontramos antes de que pagues.
        </p>
      </div>

      {/* Botones de Acción (Mobile First: ordenados verticalmente en pantallas pequeñas y con grandes áreas táctiles) */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto px-4">
        {/* Botón Principal a WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-extrabold text-base sm:text-lg shadow-[0_10px_35px_rgba(37,211,102,0.4)] transition-all cursor-pointer group"
        >
          <MessageCircle className="w-5 h-5 fill-current shrink-0" />
          <span className="leading-snug">Escríbenos por WhatsApp</span>
        </a>

        {/* Botón Secundario hacia el escáner */}
        <a
          href="#escaner-gratis"
          onClick={scrollToScanner}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-medium text-sm border border-white/15 backdrop-blur-xl transition-all cursor-pointer text-center"
        >
          <span>Probar el escáner gratis</span>
          <ArrowDown className="w-4 h-4 text-sky-400 shrink-0" />
        </a>
      </div>

      {/* Micro-garantías visuales bajo los botones */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400 px-4">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Diagnóstico previo sin costo
        </span>
        <span className="hidden sm:inline">&bull;</span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          WhatsApp: {siteConfig.contact.whatsappFormatted}
        </span>
        <span className="hidden sm:inline">&bull;</span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          RUC {siteConfig.business.ruc}
        </span>
      </div>
    </section>
  );
}
