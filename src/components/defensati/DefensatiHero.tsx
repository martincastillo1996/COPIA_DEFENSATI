'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  ShieldAlert,
  Zap,
  UserCheck,
  Receipt
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';
import { trackDiagnosticRequest, trackWhatsAppClick } from '@/lib/analytics';

export default function DefensatiHero() {
  const scrollToScanner = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    trackDiagnosticRequest({ source: 'hero_primary_cta' });
    const target = document.getElementById('escaner-gratis');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const inputEl = document.getElementById('url-scan-input-defensati');
        if (inputEl) inputEl.focus();
      }, 400);
    }
  };

  return (
    <section className="relative w-full pt-8 pb-12 sm:pt-14 sm:pb-18 text-center">
      {/* Badge Superior Apple Style */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/12 text-[#2997ff] text-xs sm:text-[13px] font-semibold mb-6 backdrop-blur-2xl shadow-[0_0_20px_rgba(0,113,227,0.2)]">
        <ShieldCheck className="w-4 h-4 text-[#2997ff]" />
        <span>DEFENSA TI &bull; Ciberseguridad Web &amp; Blindaje Perimetral</span>
      </div>

      {/* Titular Principal Estilo Apple Pro: Tipografía de alto impacto y respiración visual */}
      <div className="max-w-4xl mx-auto space-y-3 px-4">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] text-[#f5f5f7] leading-[1.08]">
          Protegemos tu página web
          <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-[#2997ff] via-[#70b4ff] to-[#d0e4ff] bg-clip-text text-transparent">
            Blindamos tu negocio.
          </span>
        </h1>

        {/* Subtítulo Conciso y Directo */}
        <p className="text-base sm:text-xl text-[#86868b] font-normal leading-relaxed max-w-2xl mx-auto pt-2">
          Atención técnica directa: <strong className="text-neutral-200 font-semibold">yo mismo reviso tu web</strong>. Diagnóstico en &lt; 2h, desinfección forense y blindaje perimetral.
        </p>
      </div>

      {/* Grid Gráfico Estilo Apple (Bento Cards de Confianza) */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto px-4">
        {/* Card 1: Atención Directa */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 backdrop-blur-xl transition-all text-left flex flex-col justify-between group">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[#2997ff] mb-2.5 group-hover:scale-105 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-sm sm:text-base leading-snug">Yo mismo la reviso</div>
            <div className="text-[12px] text-neutral-400 mt-0.5">Sin intermediarios ni bots</div>
          </div>
        </div>

        {/* Card 2: Diagnóstico Rápido */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 backdrop-blur-xl transition-all text-left flex flex-col justify-between group">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-2.5 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-sm sm:text-base leading-snug">Diagnóstico &lt; 2h</div>
            <div className="text-[12px] text-neutral-400 mt-0.5">100% Gratuito y sin riesgo</div>
          </div>
        </div>

        {/* Card 3: Garantía Escrita */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 backdrop-blur-xl transition-all text-left flex flex-col justify-between group">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-sm sm:text-base leading-snug">Garantía 30 días</div>
            <div className="text-[12px] text-neutral-400 mt-0.5">Por escrito ante reinfección</div>
          </div>
        </div>

        {/* Card 4: Factura Formal */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 backdrop-blur-xl transition-all text-left flex flex-col justify-between group">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2.5 group-hover:scale-105 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-sm sm:text-base leading-snug">Factura / Boleta</div>
            <div className="text-[12px] text-neutral-400 mt-0.5">RUC {siteConfig.business.ruc}</div>
          </div>
        </div>
      </div>

      {/* Botones de Acción de Alta Conversión Apple Pills */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto px-4">
        {/* CTA 1 Principal: Diagnóstico Gratuito */}
        <a
          href="#escaner-gratis"
          onClick={scrollToScanner}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white font-semibold text-base shadow-[0_4px_16px_rgba(0,113,227,0.4)] transition-all cursor-pointer"
        >
          <Search className="w-5 h-5 text-sky-200 shrink-0" />
          <span>Diagnóstico gratuito de tu web</span>
        </a>

        {/* CTA 2 Secundario: Recuperación de páginas hackeadas */}
        <a
          href={DEFENSATI_WHATSAPP_MESSAGES.recuperacionHackeo()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackWhatsAppClick({
              service: 'recuperacion_hackeo',
              placement: 'hero_secondary_cta',
            })
          }
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-rose-500/15 hover:bg-rose-500/25 active:scale-[0.98] text-rose-300 hover:text-white font-semibold text-base border border-rose-500/30 backdrop-blur-xl shadow-[0_4px_20px_rgba(244,63,94,0.15)] transition-all cursor-pointer text-center"
        >
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Recuperar página hackeada</span>
        </a>
      </div>

      {/* Enlace directo de WhatsApp oficial */}
      <div className="mt-4 text-xs text-neutral-400">
        <span>¿Urgencia técnica directa? </span>
        <a
          href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackWhatsAppClick({
              service: 'general',
              placement: 'hero_text_link',
            })
          }
          className="text-[#25D366] hover:underline font-bold inline-flex items-center gap-1.5"
        >
          <WhatsAppIcon className="w-3.5 h-3.5 fill-current inline" />
          <span>Escríbenos a WhatsApp (+1 (785) 643-3991)</span>
        </a>
      </div>

      {/* Plataformas Compatibles en Badges Visuales Apple */}
      <div className="mt-8 pt-6 border-t border-white/10 max-w-3xl mx-auto px-4 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs text-neutral-400">
        <span className="text-[#86868b] text-[12px] font-medium mr-1">Especialistas en:</span>
        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 font-semibold">WordPress</span>
        <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 font-semibold">WooCommerce</span>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-semibold">Shopify</span>
        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 font-semibold">Wix</span>
        <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/12 text-neutral-300 font-medium">cPanel / Plesk</span>
        <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-300 font-semibold">Cloudflare WAF</span>
      </div>
    </section>
  );
}
