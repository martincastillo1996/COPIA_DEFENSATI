'use client';

import React from 'react';
import { 
  AlertOctagon, 
  TrendingDown, 
  Ban, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';

export default function DefensatiProblems() {
  const problems = [
    {
      title: 'Pantalla roja de advertencia en Google',
      desc: 'Google cataloga tu web como "sitio engañoso o con software malicioso". Los navegadores bloquean el ingreso y tus clientes huyen espantados.',
      solution: 'Desinfectamos los archivos afectados y gestionamos la solicitud de reconsideración para retirar la advertencia en tiempo récord.',
      icon: Ban,
      color: 'text-rose-400',
      badge: 'Pérdida de Confianza',
      buttonText: 'Quitar pantalla roja por WhatsApp',
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.problemaGoogleRed(),
      btnClass: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30',
    },
    {
      title: 'Redirecciones a páginas dudosas o spam',
      desc: 'Cuando un usuario hace clic en tu web o en tus productos, es enviado a páginas de apuestas, farmacias piratas o sitios fraudulentos.',
      solution: 'Rastreamos la inyección en bases de datos y archivos PHP de WordPress, así como scripts maliciosos insertados en temas de Shopify y Wix para erradicar las redirecciones forzadas de raíz.',
      icon: TrendingDown,
      color: 'text-amber-400',
      badge: 'Fuga de Ventas',
      buttonText: 'Eliminar redirecciones por WhatsApp',
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.problemaRedirecciones(),
      btnClass: 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30',
    },
    {
      title: 'Cuenta suspendida por tu proveedor de hosting',
      desc: 'Tu proveedor detectó consumo excesivo de CPU o malware saliente y dio de baja tu cuenta sin ayudarte a desinfectar el código.',
      solution: 'Realizamos una limpieza forense integral para que tu hosting reactive tu servicio sin exigirte costosos pagos adicionales en dólares.',
      icon: AlertOctagon,
      color: 'text-sky-400',
      badge: 'Sitio Inaccesible',
      buttonText: 'Reactivar mi hosting por WhatsApp',
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.problemaHosting(),
      btnClass: 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/30',
    },
  ];

  return (
    <section id="problemas" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-8 scroll-mt-24 text-left">
      <div className="p-6 sm:p-12 rounded-[32px] sm:rounded-[36px] bg-[#161618]/75 border border-white/10 backdrop-blur-3xl shadow-[0_30px_70px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] space-y-8">
        
        {/* Cabecera Estilo Apple Pro */}
        <div className="space-y-2 border-b border-white/10 pb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#ff453a] font-semibold px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 inline-block">
            PROBLEMAS QUE SOLUCIONAMOS
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#f5f5f7] tracking-[-0.03em] leading-tight pt-2">
            ¿Reconoces alguna de estas señales en tu web?
          </h2>
          <p className="text-base sm:text-lg text-[#86868b] font-normal max-w-2xl">
            Cada hora que tu web pasa infectada o bloqueada daña tu reputación de marca, te hace perder ventas y destruye tu posicionamiento en Google.
          </p>
        </div>

        {/* Cuadrícula de Problemas y Soluciones con botones de WhatsApp contextuales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {problems.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-[24px] bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${p.color}`} />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#f5f5f7] leading-snug tracking-tight">
                    {p.title}
                  </h3>

                  <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                    {p.desc}
                  </p>

                  <div className="pt-3 border-t border-white/10 space-y-2 bg-sky-950/20 p-3.5 rounded-2xl border border-sky-500/20">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#38bdf8]">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-[#38bdf8]" />
                      <span>Nuestra solución directa:</span>
                    </div>
                    <p className="text-xs text-neutral-200 leading-relaxed">
                      {p.solution}
                    </p>
                  </div>
                </div>

                {/* Botón contextual de WhatsApp Apple Pill */}
                <a
                  href={p.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackWhatsAppClick({
                      service: `problema_${idx + 1}`,
                      placement: `problems_card_${idx + 1}`,
                    })
                  }
                  className={`w-full py-3.5 px-4 rounded-full border font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${p.btnClass}`}
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                  <span>{p.buttonText}</span>
                </a>
              </div>
            );
          })}
        </div>

        {/* Llamado de Acción al Pie de Problemas */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-gradient-to-r from-rose-950/30 via-[#161618] to-sky-950/30 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-[#f5f5f7]">
              ¿Tu sitio presenta uno de estos síntomas ahora mismo?
            </h4>
            <p className="text-xs sm:text-sm text-[#86868b]">
              Escríbenos el enlace de tu web. Hacemos un diagnóstico previo sin costo en menos de 2 horas.
            </p>
          </div>
          <a
            href={DEFENSATI_WHATSAPP_MESSAGES.recuperacionHackeo()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackWhatsAppClick({
                service: 'rescate_emergencia',
                placement: 'problems_footer_banner',
              })
            }
            className="px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(37,211,102,0.35)] transition-all whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
            <span>Consultar rescate de emergencia</span>
          </a>
        </div>

      </div>
    </section>
  );
}
