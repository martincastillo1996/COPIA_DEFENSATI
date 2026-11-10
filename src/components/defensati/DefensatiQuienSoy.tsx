'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

export default function DefensatiQuienSoy() {
  const whatsappUrl = DEFENSATI_WHATSAPP_MESSAGES.hero();

  return (
    <section id="quien-soy" className="w-full max-w-4xl mx-auto space-y-6 scroll-mt-24 text-left">
      <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-b from-[#101524]/90 via-[#0a0e19]/90 to-[#060812]/95 border border-sky-500/30 shadow-[0_20px_50px_rgba(0,113,227,0.18)] backdrop-blur-2xl relative overflow-hidden">
        
        {/* Glow cósmico */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="border-b border-white/10 pb-3 mb-6 relative z-10">
          <h2 className="text-xs uppercase tracking-widest font-mono text-[#38bdf8] font-bold">
            QUIÉN SOY
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          
          {/* Foto de Martín Castillo */}
          <div className="relative w-48 sm:w-56 shrink-0 rounded-2xl overflow-hidden border-2 border-sky-500/40 bg-black/60 shadow-[0_0_30px_rgba(56,189,248,0.2)] p-2 space-y-2">
            <div className="relative w-full h-64 rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
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
              <span className="font-bold text-white text-[12px]">Martín Castillo</span>
              <span className="text-[10px] text-sky-400 font-semibold">Lima, Perú</span>
            </div>
          </div>

          {/* Información en primera persona */}
          <div className="space-y-4 flex-1 text-center md:text-left">
            <p className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
              Soy Martín Castillo, de Lima. Trabajo directo contigo por WhatsApp, sin intermediarios. Emito comprobante con RUC ({siteConfig.business.ruc}).
            </p>

            <p className="text-sm text-neutral-300 leading-relaxed font-normal">
              Me encargo personalmente de revisar tu sitio, eliminar el malware y dejarlo blindado para que operes con tranquilidad.
            </p>

            {/* Botón directo de WhatsApp */}
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>Escríbeme por WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
