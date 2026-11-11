'use client';

import React, { useState } from 'react';
import { Download, X, MessageSquare, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface PdfLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phone?: string) => void;
  domain: string;
  pdfViewMode: 'both' | 'management' | 'dev';
}

export default function PdfLeadModal({
  isOpen,
  onClose,
  onConfirm,
  domain,
  pdfViewMode,
}: PdfLeadModalProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
  const viewLabel =
    pdfViewMode === 'management'
      ? 'Dictamen Ejecutivo (Gerencia)'
      : pdfViewMode === 'dev'
      ? 'Ficha Técnica (Dev / Sysadmin)'
      : 'Dictamen Oficial Completo (2 Págs)';

  const handleSendAndDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      onConfirm();
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Responsable de ${cleanDomain}`,
          company: cleanDomain,
          email: `descarga-pdf@${cleanDomain.replace(/[^a-z0-9.-]/g, '')}`,
          phone: phone.trim(),
          service: `Descarga de Dictamen PDF (${viewLabel})`,
          budget: 'Interesado en Blindaje / Rescate',
          details: `Solicitó copia del dictamen oficial para ${cleanDomain} vía WhatsApp. Modo de PDF: ${viewLabel}.`,
        }),
      });
    } catch {
      // Ignorar fallo de red para no bloquear la descarga del PDF
    } finally {
      setLoading(false);
      onConfirm(phone.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#141416] border border-white/15 shadow-2xl space-y-5 text-left text-white">
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado del Modal */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-sky-400 text-[10px] font-mono font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{viewLabel}</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Descargar Dictamen con Membrete Oficial
          </h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            ¿A qué número de WhatsApp te enviamos una copia de respaldo para que la compartas fácilmente con tu equipo?
          </p>
        </div>

        {/* Formulario de WhatsApp */}
        <form onSubmit={handleSendAndDownload} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold text-neutral-300 block">
              Número de WhatsApp (Opcional):
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-mono text-neutral-400">
                +51
              </span>
              <input
                type="tel"
                placeholder="992 520 336"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#0071e3] transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0071e3] to-[#2997ff] hover:from-[#0077ed] hover:to-[#38bdf8] text-white text-xs font-bold transition-all shadow-lg shadow-[#0071e3]/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando dictamen...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{phone.trim() ? 'Guardar y Descargar PDF' : 'Descargar Dictamen PDF'}</span>
              </>
            )}
          </button>
        </form>

        {/* Enlace de Descarga Directa sin Registro */}
        <div className="text-center pt-1 border-t border-white/5">
          <button
            type="button"
            onClick={() => onConfirm()}
            className="text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 font-medium"
          >
            <span>O descargar directo sin ingresar número</span>
            <ArrowRight className="w-3 h-3 text-neutral-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
