'use client';

import React, { useState } from 'react';
import { MessageCircle, ShieldCheck, CheckCircle2, ArrowRight, Sparkles, Send } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';

interface Props {
  initialUrl?: string;
}

export default function DefensatiQuickContact({ initialUrl = '' }: Props) {
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState(initialUrl);
  const [service, setService] = useState('diagnostico');
  const [note, setNote] = useState('');

  const servicesList = [
    { id: 'diagnostico', label: 'Diagnóstico preliminar gratuito (S/ 0)' },
    { id: 'limpieza', label: 'Recuperar web hackeada / con virus (desde S/ 250)' },
    { id: 'blindaje', label: 'Blindaje perimetral preventivo (S/ 165)' },
    { id: 'waf', label: 'Protección con Firewall WAF Cloudflare (desde S/ 335)' },
    { id: 'monitoreo', label: 'Plan de monitoreo y vigilancia mensual (S/ 49 / S/ 99/mes)' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = targetUrl.trim() || 'mi sitio web';
    const clientName = name.trim() || 'un cliente';
    const selectedServiceLabel = servicesList.find((s) => s.id === service)?.label || 'consultoría técnica';
    
    let message = `Hola Martín, soy ${clientName}. Estoy interesado en: ${selectedServiceLabel} para ${cleanUrl}.`;
    if (note.trim()) {
      message += ` Detalle adicional: ${note.trim()}.`;
    }
    message += ' ¿Podrías darme detalles para comenzar?';

    const url = getWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="contacto-rapido" className="w-full max-w-4xl mx-auto scroll-mt-24 text-left">
      <div className="p-7 sm:p-10 rounded-[32px] bg-[#0c101c]/90 border border-white/12 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-6">
        
        <div className="space-y-2 border-b border-white/10 pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071e3]/15 border border-[#0071e3]/30 text-[#38bdf8] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CONSULTA TÉCNICA SIN COSTO</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
            ¿Prefieres que revisemos tu caso de forma directa?
          </h3>
          <p className="text-sm sm:text-base text-neutral-300 font-normal">
            Completa estos 2 datos básicos y te responderemos por WhatsApp con un diagnóstico preliminar sin compromiso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Campo 1: Nombre */}
            <div className="space-y-1.5">
              <label htmlFor="quick-contact-name" className="text-xs font-medium text-neutral-300">
                Tu nombre o nombre de empresa <span className="text-rose-400">*</span>
              </label>
              <input
                id="quick-contact-name"
                type="text"
                required
                placeholder="Ej. Carlos Mendoza / Distribuidora Lima"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] transition-all text-sm font-normal"
              />
            </div>

            {/* Campo 2: Web */}
            <div className="space-y-1.5">
              <label htmlFor="quick-contact-url" className="text-xs font-medium text-neutral-300">
                Dirección web a revisar <span className="text-rose-400">*</span>
              </label>
              <input
                id="quick-contact-url"
                type="text"
                required
                placeholder="https://tudominio.com"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] transition-all text-sm font-normal"
              />
            </div>

          </div>

          {/* Campo 3: Servicio de Interés */}
          <div className="space-y-1.5">
            <label htmlFor="quick-contact-service" className="text-xs font-medium text-neutral-300">
              ¿Qué servicio o situación deseas consultar?
            </label>
            <select
              id="quick-contact-service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#141416] border border-white/10 text-white focus:outline-none focus:border-[#0071e3] transition-all text-sm cursor-pointer"
            >
              {servicesList.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#141416] text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Campo 4: Detalle breve opcional */}
          <div className="space-y-1.5">
            <label htmlFor="quick-contact-note" className="text-xs font-medium text-neutral-300">
              ¿Algún detalle que debamos saber? (Opcional)
            </label>
            <input
              id="quick-contact-note"
              type="text"
              placeholder="Ej. Google puso pantalla roja, o el hosting me bloqueó hoy"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] transition-all text-sm font-normal"
            />
          </div>

          {/* Botón de Envío Directo a WhatsApp */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-extrabold text-sm sm:text-base shadow-[0_10px_30px_rgba(37,211,102,0.35)] flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current shrink-0" />
              <span>Enviar consulta técnica a WhatsApp (+51 987 010 380)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Diagnóstico preliminar 100% gratuito
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              Sin pedir contraseñas ni accesos confidenciales
            </span>
          </div>

        </form>

      </div>
    </section>
  );
}
