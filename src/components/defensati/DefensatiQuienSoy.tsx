'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

export default function DefensatiQuienSoy() {
  const whatsappUrl = DEFENSATI_WHATSAPP_MESSAGES.hero();

  return (
    <section id="quien-soy" className="w-full max-w-4xl mx-auto space-y-6 scroll-mt-24 text-left">
      <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-b from-[#101524]/90 via-[#0a0e19]/90 to-[#060812]/95 border border-sky-500/30 shadow-[0_20px_50px_rgba(0,113,227,0.18)] backdrop-blur-2xl relative overflow-hidden">
        
        {/* Glow cósmico */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          
          {/* Foto de Martín Castillo */}
          <div className="relative w-56 sm:w-64 shrink-0 rounded-2xl overflow-hidden border-2 border-sky-500/40 bg-black/60 shadow-[0_0_30px_rgba(56,189,248,0.2)] p-2 space-y-2">
            <div className="relative w-full h-72 rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
              <Image
                src="/martin-castillo-preview.jpg"
                alt="Martín Castillo - DEFENSA TI"
                fill
                className="object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="flex items-center justify-between px-2 py-1 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white text-[12px]">Martín Castillo</span>
              </div>
              <span className="text-[10px] text-sky-400 font-semibold">Desarrollador Web</span>
            </div>
          </div>

          {/* Información en primera persona */}
          <div className="space-y-4 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-[#38bdf8] text-xs font-bold shadow-[0_0_12px_rgba(56,189,248,0.25)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quién soy &bull; Trato Directo</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Soy Martín Castillo
            </h2>

            <p className="text-sm sm:text-base font-semibold text-sky-300 leading-snug">
              Desarrollador de software y especialista en seguridad y limpieza web en Perú.
            </p>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              No soy una agencia con intermediarios, secretarias ni chatbots que te dejan esperando días. Cuando me escribes, <strong>yo mismo reviso tu página web</strong>, encuentro los virus, te digo qué pasó y me encargo personalmente de limpiarla y dejarla protegida.
            </p>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              Cuento con respaldo formal y emisión de comprobantes bajo <strong>RUC con Negocio {siteConfig.business.ruc}</strong>. Mi compromiso es que recuperes tu página web rápido y sin dolores de cabeza.
            </p>

            {/* Micro badges de confianza */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Atención 100% personalizada</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-200">
                <span>🇵🇪 Cobertura en todo el Perú</span>
              </span>
            </div>

            {/* Botón directo de WhatsApp */}
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>Conversa conmigo directamente por WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
