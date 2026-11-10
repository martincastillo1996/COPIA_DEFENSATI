'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  ShieldAlert,
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Clock, 
  FileText 
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
    <section className="relative w-full pt-8 pb-12 sm:pt-16 sm:pb-20 text-center">
      {/* Badge Superior Empresarial */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/12 text-[#2997ff] text-xs sm:text-[13px] font-semibold mb-6 backdrop-blur-2xl shadow-[0_0_20px_rgba(0,113,227,0.2)]">
        <ShieldCheck className="w-4 h-4 text-[#2997ff]" />
        <span>DEFENSA TI &bull; Ciberseguridad Web &amp; Blindaje Perimetral</span>
      </div>

      {/* Titular Principal Estilo Apple Pro */}
      <div className="max-w-4xl mx-auto space-y-4 px-4">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.035em] text-[#f5f5f7] leading-[1.08]">
          Protegemos tu página web para reducir riesgos, prevenir ataques y mantener tu negocio operativo.
        </h1>

        {/* Subtítulo Comercial Estilo Apple */}
        <p className="text-base sm:text-xl text-[#86868b] font-normal leading-relaxed max-w-2xl mx-auto pt-3">
          Atención técnica directa para WordPress, WooCommerce y sitios de negocio. Diagnóstico previo sin costo, desinfección profunda con garantía de 30 días por escrito y comprobante formal con RUC.
        </p>
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

      {/* Enlace sutil directo de WhatsApp con número oficial peruano */}
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

      {/* Micro-garantías Visuales de Confianza */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-[13px] text-neutral-400 px-4 font-normal">
        <span className="inline-flex items-center gap-1.5 text-neutral-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Diagnóstico preliminar en &lt; 2h
        </span>
        <span className="hidden sm:inline text-neutral-600">&bull;</span>
        <span className="inline-flex items-center gap-1.5 text-neutral-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Garantía de 30 días por escrito
        </span>
        <span className="hidden sm:inline text-neutral-600">&bull;</span>
        <span className="inline-flex items-center gap-1.5 text-neutral-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Factura / Boleta RUC {siteConfig.business.ruc}
        </span>
      </div>

      {/* Compatibilidad Técnica de Confianza Estilo Apple */}
      <div className="mt-8 pt-6 border-t border-white/10 max-w-3xl mx-auto px-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-neutral-400">
        <span className="text-[#86868b] text-[12px] font-medium mr-1">Plataformas:</span>
        <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[#f5f5f7]">WordPress</span>
        <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[#f5f5f7]">WooCommerce</span>
        <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[#f5f5f7]">cPanel / Plesk</span>
        <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[#f5f5f7]">Cloudflare</span>
        <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[#f5f5f7]">Nginx / Apache</span>
      </div>
    </section>
  );
}
