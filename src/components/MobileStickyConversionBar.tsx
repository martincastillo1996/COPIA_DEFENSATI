'use client';

import React, { useState, useEffect } from 'react';
import { Download, ShieldCheck, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';
import { isHyperscalePlatform } from '@/lib/hyperscalers';

interface MobileStickyConversionBarProps {
  score: number;
  grade: string;
  domain: string;
  auditId?: string;
  onDownloadPdf: () => void;
}

export default function MobileStickyConversionBar({
  score,
  grade,
  domain,
  auditId,
  onDownloadPdf,
}: MobileStickyConversionBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar solo cuando el usuario haya scrolleado más de 380px hacia los resultados
      if (window.scrollY > 380) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
  const isHyperscale = isHyperscalePlatform(cleanDomain);
  const isOptimal = (grade === 'A+' || grade === 'A') && score >= 90;

  const reportUrl = auditId
    ? typeof window !== 'undefined'
      ? `${window.location.origin}/report/${auditId}`
      : `https://neuronalgravity.com/report/${auditId}`
    : undefined;

  const whatsappUrl = isHyperscale
    ? `https://wa.me/17856433991?text=${encodeURIComponent(
        `Hola Martín, estuve revisando el análisis de referencia de ${cleanDomain} en DEFENSA TI${reportUrl ? ` (${reportUrl})` : ''} y deseo cotizar una arquitectura de blindaje perimetral.`
      )}`
    : DEFENSATI_WHATSAPP_MESSAGES.escanerContextual({
        domain: cleanDomain,
        score,
        grade,
        primaryIssue: isOptimal ? 'Sitio óptimo verificado' : `Calificación ${score}/100`,
        recommendation: isOptimal ? 'optimo' : score < 60 ? 'limpieza' : 'blindaje',
        reportUrl,
      });

  const gradeColor =
    grade.startsWith('A')
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : grade.startsWith('B')
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
      : grade.startsWith('C')
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

  const dotColor =
    grade.startsWith('A')
      ? 'bg-emerald-400'
      : grade.startsWith('B')
      ? 'bg-blue-400'
      : grade.startsWith('C')
      ? 'bg-amber-400'
      : 'bg-rose-400';

  return (
    <aside 
      aria-label="Acciones rápidas de auditoría"
      className="fixed bottom-0 inset-x-0 z-40 print:hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 pointer-events-auto"
    >
      <div className="bg-[#0c0f17]/90 backdrop-blur-2xl border-t border-white/12 shadow-[0_-12px_45px_rgba(0,0,0,0.85)] px-4 py-2.5 sm:py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Lado izquierdo: Badge de Score + Dominio */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`px-2.5 py-1 rounded-full border text-xs font-mono font-black flex items-center gap-1.5 shrink-0 ${gradeColor}`}>
              <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
              <span>{score}/100</span>
              <span className="text-[10px] opacity-80">({grade})</span>
            </div>
            
            <div className="min-w-0 hidden xs:block">
              <span className="text-xs font-bold text-white truncate block max-w-[140px] sm:max-w-[220px]">
                {cleanDomain}
              </span>
              <span className="text-[10px] text-neutral-400 hidden sm:block">
                {isHyperscale
                  ? 'Infraestructura Global'
                  : isOptimal
                  ? 'Blindaje Óptimo Verificado'
                  : 'Fallas detectadas • Requiere blindaje'}
              </span>
            </div>
          </div>

          {/* Lado derecho: Acciones de Conversión */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Botón Descargar PDF */}
            <button
              type="button"
              onClick={onDownloadPdf}
              className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Descargar dictamen forense en PDF"
            >
              <Download className="w-3.5 h-3.5 text-neutral-300" />
              <span className="hidden sm:inline">Descargar PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            {/* Botón WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackWhatsAppClick({
                  service: isHyperscale ? 'general' : isOptimal ? 'general' : 'blindaje',
                  placement: 'mobile_sticky_bar',
                  domain: cleanDomain,
                })
              }
              className="px-4 sm:px-5 py-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#25D366]/25 transition-all cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span className="hidden sm:inline">
                {isHyperscale ? 'Cotizar Arquitectura' : isOptimal ? 'Hablar con Martín' : 'Cotizar Blindaje (S/ 450)'}
              </span>
              <span className="sm:hidden">
                {isHyperscale ? 'Cotizar' : isOptimal ? 'WhatsApp' : 'Blindar S/ 450'}
              </span>
            </a>
          </div>

        </div>
      </div>
    </aside>
  );
}
