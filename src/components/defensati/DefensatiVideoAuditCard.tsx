'use client';

import React from 'react';
import { Video, Play, Sparkles, Check, Clock, UserCheck } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';

interface Props {
  domain: string;
  score?: number;
  grade?: string;
}

export default function DefensatiVideoAuditCard({ domain, score, grade }: Props) {
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  const whatsappUrl = DEFENSATI_WHATSAPP_MESSAGES.videoDiagnostico(cleanDomain, score, grade);

  return (
    <div className="relative overflow-hidden border border-white/10 hover:border-white/10 p-6 sm:p-8 space-y-6 transition-all text-left">
      {/* Resplandor ambiental violeta / azul */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.03] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.03] blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Columna Izquierda: Mensaje y Valor */}
        <div className="space-y-3.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10 text-[#EDEDED] text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full bg-white/[0.03] opacity-75" />
              <span className="relative inline-flex h-2 w-2 bg-white/[0.03]" />
            </span>
            <span className="font-mono uppercase tracking-wider text-[11px]">100% GRATIS &bull; SIN TECNICISMOS</span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#EDEDED] tracking-tight leading-tight flex items-center gap-2.5">
              <span className="w-9 h-9 bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#EDEDED] shrink-0">
                <Video className="w-5 h-5" />
              </span>
              <span>¿Muchos términos técnicos? Pide tu Video-Diagnóstico de 2 min</span>
            </h4>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              Si cabeceras como HSTS, CSP o registros DMARC te suenan a otro idioma, <strong className="text-white">Martín Castillo</strong> grabará la pantalla de tu web (<span className="text-sky-300 font-mono">{cleanDomain || 'tu-sitio.pe'}</span>), te señalará en 120 segundos qué vulnerabilidades tienes y qué hacer para no perder clientes ni ventas.
            </p>
          </div>

          {/* 3 Checks de Confianza */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-neutral-200">
            <div className="flex items-center gap-2 p-2 bg-white/[0.03] border border-white/5">
              <Check className="w-4 h-4 text-[#EDEDED] shrink-0" />
              <span className="text-[11px] leading-tight">Ves tu propia web en video</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/[0.03] border border-white/5">
              <Check className="w-4 h-4 text-[#EDEDED] shrink-0" />
              <span className="text-[11px] leading-tight">Directo al grano, sin rodeos</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/[0.03] border border-white/5">
              <Check className="w-4 h-4 text-[#EDEDED] shrink-0" />
              <span className="text-[11px] leading-tight">100% libre de compromiso</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Llamado a la Acción */}
        <div className="lg:w-80 shrink-0 flex flex-col justify-center space-y-3 p-4 sm:p-5 bg-[#080808] border border-white/10 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[#EDEDED] text-xs font-mono font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Entrega en &lt; 2 horas hábiles</span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackWhatsAppClick({
                service: 'video_diagnostico',
                placement: 'video_audit_card',
                domain: cleanDomain,
              });
            }}
            className="w-full py-3.5 px-5 bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
            <span>Pedir Video por WhatsApp</span>
          </a>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
            <UserCheck className="w-3.5 h-3.5 text-[#EDEDED]" />
            <span>Atención personal de Martín Castillo</span>
          </div>
        </div>

      </div>
    </div>
  );
}
