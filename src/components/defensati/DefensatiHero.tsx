'use client';

import React from 'react';
import { 
  ShieldCheck, 
  ArrowDown, 
  MessageCircle, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Clock, 
  FileText 
} from 'lucide-react';
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
    <section className="relative w-full pt-8 pb-12 sm:pt-16 sm:pb-20 text-center">
      {/* Badge Superior Empresarial */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/30 text-[#38bdf8] text-xs sm:text-[13px] font-medium mb-6 backdrop-blur-2xl shadow-[0_0_20px_rgba(0,113,227,0.2)]">
        <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
        <span>DEFENSA TI &bull; Ciberseguridad Web &amp; Blindaje Perimetral</span>
      </div>

      {/* Titular Principal Aprobado */}
      <div className="max-w-4xl mx-auto space-y-4 px-4">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f5f5f7] leading-[1.12] sm:leading-[1.1]">
          Protegemos tu página web de ataques, caídas y virus para que tu negocio nunca deje de vender.
        </h1>

        {/* Subtítulo Comercial Aprobado */}
        <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed max-w-2xl mx-auto pt-2">
          Atención técnica directa para WordPress, WooCommerce y sitios de negocio. Diagnóstico previo sin costo, desinfección profunda con garantía de 30 días por escrito y comprobante formal con RUC.
        </p>
      </div>

      {/* Botones de Acción de Alta Conversión */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto px-4">
        {/* Botón Principal WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-extrabold text-base shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition-all cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-current shrink-0" />
          <span>Escríbeme por WhatsApp y reviso tu web</span>
        </a>

        {/* Botón Secundario Frosted Glass */}
        <a
          href="#escaner-gratis"
          onClick={scrollToScanner}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-white font-semibold text-sm sm:text-base border border-white/15 backdrop-blur-xl transition-all cursor-pointer text-center"
        >
          <span>Probar escáner gratis</span>
          <ArrowDown className="w-4 h-4 text-[#38bdf8] shrink-0" />
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

      {/* Compatibilidad Técnica de Confianza */}
      <div className="mt-8 pt-6 border-t border-white/10 max-w-3xl mx-auto px-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-neutral-400 font-mono">
        <span className="text-neutral-500 uppercase tracking-wider text-[11px]">Plataformas soportadas:</span>
        <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-neutral-300">WordPress</span>
        <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-neutral-300">WooCommerce</span>
        <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-neutral-300">cPanel / Plesk</span>
        <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-neutral-300">Cloudflare</span>
        <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-neutral-300">Nginx / Apache</span>
      </div>
    </section>
  );
}
