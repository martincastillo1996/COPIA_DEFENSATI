'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ShieldAlert, Sparkles, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

interface Props {
  targetUrl?: string;
}

export default function DefensatiSinglePricingCard({ targetUrl }: Props) {
  const cleanUrl = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';
  const whatsappUrl = DEFENSATI_WHATSAPP_MESSAGES.precioLimpieza(cleanUrl);

  const features = [
    'Diagnóstico previo sin costo: te muestro qué tiene tu web antes de cobrarte un sol',
    'Limpieza profunda: elimino virus, archivos extraños y puertas traseras',
    'Recuperación de tu acceso de administrador si te cambiaron la contraseña',
    'Retiro de la pantalla roja de advertencia en Google para que tus clientes vuelvan',
    'Garantía de 30 días: si tu web se vuelve a infectar por la misma causa, yo te la limpio gratis',
  ];

  return (
    <section id="limpieza" className="w-full max-w-4xl mx-auto space-y-6 scroll-mt-24">
      
      {/* Tarjeta Grande de Limpieza de WordPress */}
      <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-b from-[#221019]/95 via-[#150a12]/95 to-[#0b0509]/98 border-2 border-rose-500/50 hover:border-rose-400 shadow-[0_20px_70px_rgba(244,63,94,0.25)] backdrop-blur-2xl relative overflow-hidden transition-all text-left">
        
        {/* Glow ambiental de rescate */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Badge superior */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full border bg-rose-500/20 border-rose-400/60 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.35)]">
              <Sparkles className="w-4 h-4 text-rose-300" />
              <span>Oferta Principal &bull; Rescate Inmediato</span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-bold bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Garantía de 30 Días por Escrito</span>
            </span>
          </div>

          {/* Título y descripción */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Limpieza y desinfección de WordPress
              </h2>
            </div>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal pt-1">
              Si tu página web ya tiene virus, abre publicidad extraña, redirige a sitios desconocidos o Google la bloqueó con pantalla roja de peligro, yo me encargo de limpiarla completamente y devolvértela 100% operativa.
            </p>
          </div>

          {/* Precio Prominente */}
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-rose-300/80 font-bold block mb-1">Precio del Servicio</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]">
                  Desde S/ 250
                </span>
                <span className="text-xs sm:text-sm text-neutral-400 font-normal">
                  pago único (según complejidad)
                </span>
              </div>
            </div>
            <div className="text-xs text-neutral-300 sm:text-right font-medium">
              <span>Se cotiza previamente tras la revisión inicial gratuita</span>
            </div>
          </div>

          {/* Lista de beneficios en primera persona y sin jerga */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white">Todo lo que hago por tu web:</span>
            <ul className="space-y-3">
              {features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-start gap-3 text-sm sm:text-base text-neutral-200 leading-relaxed">
                  <Check className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Garantía destacada dentro de la tarjeta */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">
              <strong>Mi Garantía Personal de 30 Días:</strong> Si tu sitio web se vuelve a infectar dentro de los 30 días posteriores por la misma causa, yo te la vuelvo a limpiar completamente gratis.
            </span>
          </div>

          {/* Botón Principal de WhatsApp */}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-[0_10px_35px_rgba(244,63,94,0.5)] active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              <MessageCircle className="w-5 h-5 fill-current shrink-0" />
              <span>Escríbeme por WhatsApp para limpiar tu web</span>
            </a>
          </div>

        </div>
      </div>

      {/* Debajo, en texto pequeño (Requerido por instrucción) */}
      <div className="text-center space-y-2 px-4">
        <p className="text-xs sm:text-sm text-neutral-300 font-normal">
          ¿Tu web no está infectada y solo quieres prevenir hackeos futuros? También realizo{' '}
          <Link href="/planes" className="text-sky-400 hover:underline font-bold">
            Blindaje de seguridad por S/ 165
          </Link>{' '}
          y{' '}
          <Link href="/planes" className="text-indigo-400 hover:underline font-bold">
            Protección avanzada con Firewall (WAF) desde S/ 335
          </Link>
          .
        </p>

        <p className="text-[11px] text-neutral-400">
          <Link href="/planes" className="inline-flex items-center gap-1 hover:text-white transition-colors underline">
            <span>Ver el catálogo de todos los planes y monitoreo mensual</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </div>

    </section>
  );
}
