'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

interface Props {
  targetUrl?: string;
}

export default function DefensatiSinglePricingCard({ targetUrl }: Props) {
  const cleanUrl = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';
  const whatsappUrl = DEFENSATI_WHATSAPP_MESSAGES.precioLimpieza(cleanUrl);

  return (
    <section id="precio" className="w-full max-w-4xl mx-auto space-y-6 scroll-mt-24 text-left">
      
      {/* Tarjeta Grande de Precio */}
      <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-b from-[#221019]/95 via-[#150a12]/95 to-[#0b0509]/98 border-2 border-rose-500/50 hover:border-rose-400 shadow-[0_20px_70px_rgba(244,63,94,0.25)] backdrop-blur-2xl relative overflow-hidden transition-all">
        
        {/* Glow de rescate */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          <div className="border-b border-white/10 pb-3">
            <span className="text-xs uppercase tracking-widest font-mono text-rose-400 font-bold">
              PRECIO
            </span>
          </div>

          {/* Título y Precio */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Limpieza de web infectada:{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-rose-400">
                  desde S/ 250
                </span>
              </h2>
            </div>

            {/* Garantía */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-400/40 text-emerald-200 text-sm sm:text-base flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                Si se vuelve a infectar por la misma causa en 30 días, la limpio gratis.
              </span>
            </div>
          </div>

          {/* Botón: Quiero que revisen mi web */}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-[0_10px_35px_rgba(244,63,94,0.5)] active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              <MessageCircle className="w-5 h-5 fill-current shrink-0" />
              <span>Quiero que revisen mi web</span>
            </a>
          </div>

        </div>
      </div>

      {/* Debajo: ¿Aún no te hackearon? Blindaje preventivo S/ 165 · Con firewall desde S/ 335 */}
      <div className="text-center px-4 pt-1">
        <p className="text-xs sm:text-sm text-neutral-300 font-normal">
          ¿Aún no te hackearon?{' '}
          <Link href="/planes" className="text-sky-400 hover:underline font-bold">
            Blindaje preventivo S/ 165
          </Link>{' '}
          &middot;{' '}
          <Link href="/planes" className="text-indigo-400 hover:underline font-bold">
            Con firewall desde S/ 335
          </Link>
        </p>
      </div>

    </section>
  );
}
