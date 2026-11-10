'use client';

import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  MessageCircle, 
  Check, 
  ArrowRight,
  Shield, 
  Lock, 
  Activity 
} from 'lucide-react';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

interface Props {
  targetUrl?: string;
}

export default function DefensatiPricing({ targetUrl }: Props) {
  const cleanUrl = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';

  return (
    <section id="precios" className="w-full max-w-5xl mx-auto space-y-8 scroll-mt-24 text-left">
      
      {/* 1. TARJETA PRINCIPAL: LIMPIEZA DE WEB INFECTADA (Oferta Estrella, Ultra Simple y Fácil de Comprar) */}
      <div className="p-8 sm:p-12 rounded-[32px] bg-gradient-to-b from-[#1b1018]/90 via-[#120a11]/90 to-[#0a060a]/95 border-2 border-rose-500/40 hover:border-rose-500/60 shadow-[0_20px_60px_rgba(244,63,94,0.22)] backdrop-blur-2xl relative overflow-hidden transition-all">
        
        {/* Glow de rescate */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Badge superior */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <span className="text-xs uppercase tracking-widest font-mono text-rose-400 font-bold px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25">
              OFERTA PRINCIPAL &bull; RESCATE WEB
            </span>
            <span className="text-xs text-neutral-400">
              Pago único &bull; Sin cobros sorpresa
            </span>
          </div>

          {/* Título y Precio */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Limpieza de web infectada:{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-rose-300">
                    desde S/ 250
                  </span>
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 mt-1">
                  Para sitios con virus, redirecciones extrañas, spam o advertencias de Google.
                </p>
              </div>
            </div>

            {/* Garantía Destacada */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-sm sm:text-base flex items-center gap-3 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                Si tu web se vuelve a infectar por la misma causa en 30 días, la limpio gratis.
              </span>
            </div>
          </div>

          {/* 3 Puntos Claros (Sin Jerga Técnica) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 text-sm sm:text-base text-neutral-200">
              <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Diagnóstico previo sin costo:</strong> Te muestro exactamente qué encontré antes de que pagues.</span>
            </div>
            <div className="flex items-start gap-3 text-sm sm:text-base text-neutral-200">
              <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Desinfección profunda:</strong> Eliminación de archivos maliciosos y recuperación de tu acceso.</span>
            </div>
            <div className="flex items-start gap-3 text-sm sm:text-base text-neutral-200">
              <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Trato directo y comprobante formal:</strong> Trabajo directo contigo y emito boleta o factura con RUC 10704877850.</span>
            </div>
          </div>

          {/* Botón de Alta Conversión */}
          <div className="pt-2">
            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioLimpieza(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#20ba59] hover:brightness-110 active:scale-[0.98] text-black font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-[0_10px_35px_rgba(37,211,102,0.4)] transition-all cursor-pointer text-center"
            >
              <MessageCircle className="w-5 h-5 fill-current shrink-0" />
              <span>Escríbeme por WhatsApp: Quiero que revisen mi web</span>
            </a>
          </div>

        </div>
      </div>

      {/* 2. OPCIONES COMPLEMENTARIAS (Simples, Claras y Fáciles de Vender) */}
      <div className="space-y-4">
        <div className="px-2">
          <p className="text-xs uppercase tracking-widest font-mono text-sky-400 font-bold">
            ¿AÚN NO TE HACKEARON? OPCIONES DE PREVENCIÓN Y MONITOREO
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Opción 1: Blindaje */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4 backdrop-blur-xl">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sky-400">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                Blindaje preventivo
              </h4>
              <p className="text-2xl font-black text-white font-mono">
                S/ 165 <span className="text-xs text-neutral-400 font-normal">pago único</span>
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Protección para sitios sanos: cierre de accesos vulnerables y actualización segura.
              </p>
            </div>

            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioBlindaje(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold transition-all"
            >
              <span>Pedir Blindaje (S/ 165)</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            </a>
          </div>

          {/* Opción 2: WAF Firewall */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-sky-500/30 transition-all flex flex-col justify-between space-y-4 backdrop-blur-xl">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                Protección con Firewall (WAF)
              </h4>
              <p className="text-2xl font-black text-white font-mono">
                Desde S/ 335 <span className="text-xs text-neutral-400 font-normal">implementación</span>
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Filtro perimetral automático para bloquear bots maliciosos y ataques continuos.
              </p>
            </div>

            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioBlindajeWaf(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-xs sm:text-sm font-semibold transition-all"
            >
              <span>Pedir con Firewall (S/ 335)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Opción 3: Monitoreo Mensual */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4 backdrop-blur-xl">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                Monitoreo mensual
              </h4>
              <p className="text-2xl font-black text-white font-mono">
                S/ 49 <span className="text-xs text-neutral-400 font-normal">/mes &bull; Pro S/ 99</span>
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Vigilancia continua. Te aviso directo a WhatsApp si tu web se cae. Cancela cuando quieras.
              </p>
            </div>

            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioMensual(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold transition-all"
            >
              <span>Activar Monitoreo (S/ 49/m)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>

    </section>
  );
}
