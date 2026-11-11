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
    <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-[#181226]/90 via-[#10121a]/95 to-[#0b0d14]/98 border border-purple-500/30 hover:border-purple-500/50 shadow-[0_20px_50px_rgba(168,85,247,0.18)] backdrop-blur-2xl p-6 sm:p-8 space-y-6 transition-all text-left">
      {/* Resplandor ambiental violeta / azul */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Columna Izquierda: Mensaje y Valor */}
        <div className="space-y-3.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            <span className="font-mono uppercase tracking-wider text-[11px]">100% GRATIS &bull; SIN TECNICISMOS</span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
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
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] leading-tight">Ves tu propia web en video</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] leading-tight">Directo al grano, sin rodeos</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] leading-tight">100% libre de compromiso</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Llamado a la Acción */}
        <div className="lg:w-80 shrink-0 flex flex-col justify-center space-y-3 p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 text-center">
          <div className="flex items-center justify-center gap-1.5 text-purple-300 text-xs font-mono font-semibold">
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
            className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(37,211,102,0.35)] transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
            <span>Pedir Video por WhatsApp</span>
          </a>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Atención personal de Martín Castillo</span>
          </div>
        </div>

      </div>
    </div>
  );
}
