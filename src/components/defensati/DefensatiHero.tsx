'use client';

import React from 'react';
import { ShieldCheck, MessageCircle } from 'lucide-react';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

export default function DefensatiHero() {
  const whatsappUrl = DEFENSATI_WHATSAPP_MESSAGES.hero();

  return (
    <section className="relative w-full pt-8 pb-12 sm:pt-14 sm:pb-16 text-center">
      {/* Sutil halo de lectura que aísla el texto suavemente de la red 3D */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] max-w-[95vw] h-[380px] bg-radial from-[#060814]/80 via-[#060814]/40 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Badge superior */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-[#38bdf8] text-xs sm:text-[13px] font-semibold mb-6 backdrop-blur-2xl shadow-[0_0_15px_rgba(56,189,248,0.2)]">
        <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
        <span>DEFENSA TI</span>
      </div>

      {/* Título Principal */}
      <div className="max-w-4xl mx-auto space-y-4 px-4 relative z-10">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] text-[#f5f5f7] leading-[1.1] whitespace-normal drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
          ¿Tu web fue hackeada?
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2997ff] via-[#70baff] to-[#c084fc] mt-2 font-semibold tracking-[-0.035em]">
            La limpio y la dejo blindada.
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="text-lg sm:text-2xl text-[#d1d5db] font-normal leading-relaxed max-w-2xl mx-auto pt-2 tracking-[-0.01em] whitespace-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          Te muestro lo que encontré antes de que pagues.
        </p>
      </div>

      {/* Botón: Escríbeme por WhatsApp */}
      <div className="mt-8 sm:mt-10 flex items-center justify-center max-w-md mx-auto px-4 relative z-10">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-[#30d158] hover:bg-[#28cd41] active:scale-[0.98] text-[#000000] font-bold text-base sm:text-lg shadow-[0_10px_35px_rgba(48,209,88,0.45),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all cursor-pointer group"
        >
          <MessageCircle className="w-5 h-5 fill-current shrink-0" />
          <span className="leading-snug">Escríbeme por WhatsApp</span>
        </a>
      </div>
    </section>
  );
}
