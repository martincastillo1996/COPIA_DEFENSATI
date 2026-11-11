'use client';

import React, { useState } from 'react';
import { 
  AlertOctagon, 
  TrendingDown, 
  Ban, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';

export default function DefensatiProblems() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (idx: number) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const problems = [
    {
      title: 'Pantalla roja de advertencia en Google',
      desc: 'Google cataloga tu web como "sitio engañoso o con software malicioso". Los navegadores bloquean visitas y tus clientes huyen espantados.',
      solution: 'Desinfectamos los archivos afectados, erradicamos el código malicioso y tramitamos la solicitud de reconsideración ante Google Search Console para retirar la pantalla roja en tiempo récord.',
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
    <section id="problemas" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-6 scroll-mt-24 text-left">
      <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[36px] bg-[#161618]/75 border border-white/10 backdrop-blur-3xl shadow-[0_30px_70px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] space-y-6">
        
        {/* Cabecera Estilo Apple Pro */}
        <div className="space-y-2 border-b border-white/10 pb-5">
          <span className="text-xs font-mono uppercase tracking-widest text-[#ff453a] font-semibold px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 inline-block">
            PROBLEMAS QUE SOLUCIONAMOS
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#f5f5f7] tracking-[-0.03em] leading-tight pt-1">
            ¿Reconoces alguna de estas señales en tu web?
          </h2>
          <p className="text-sm sm:text-base text-[#86868b] font-normal max-w-2xl">
            Toca el síntoma que afecta a tu página para ver cómo lo desinfectamos y restauramos de inmediato.
          </p>
        </div>

        {/* Cuadrícula de Problemas - Compacta con Acordeones Desplegables para Móvil */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {problems.map((p, idx) => {
            const Icon = p.icon;
            const isExpanded = Boolean(expanded[idx]);
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-[24px] bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${p.color}`} />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 font-bold">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#f5f5f7] leading-snug tracking-tight">
                    {p.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
                    {p.desc}
                  </p>
                </div>

                {/* Botón Desplegable para ver la Solución */}
                <div className="pt-2 border-t border-white/10 space-y-3">
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-[#38bdf8] hover:text-white transition-colors cursor-pointer py-1"
                  >
                    <span>{isExpanded ? 'Ocultar solución' : '¿Cómo lo resolvemos?'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-sky-400' : ''}`} />
                  </button>

                  {/* Contenido Desplegable */}
                  {isExpanded && (
                    <div className="space-y-3 pt-1 animate-in fade-in-50 duration-200">
                      <div className="space-y-1.5 bg-sky-950/20 p-3 rounded-xl border border-sky-500/20 text-xs text-neutral-200 leading-relaxed">
                        <div className="flex items-center gap-1.5 font-bold text-[#38bdf8]">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>Solución aplicada:</span>
                        </div>
                        <p>{p.solution}</p>
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
                        className={`w-full py-3 px-4 rounded-full border font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm ${p.btnClass}`}
                      >
                        <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                        <span>{p.buttonText}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Llamado de Acción al Pie de Problemas */}
        <div className="p-5 sm:p-6 rounded-[24px] bg-gradient-to-r from-rose-950/30 via-[#161618] to-sky-950/30 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-0.5">
            <h4 className="text-sm sm:text-base font-bold text-[#f5f5f7]">
              ¿Tu sitio presenta uno de estos síntomas ahora mismo?
            </h4>
            <p className="text-xs text-[#86868b]">
              Escríbenos el enlace de tu web. Diagnóstico previo sin costo en menos de 2 horas.
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
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(37,211,102,0.35)] transition-all whitespace-nowrap shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
            <span>Consultar rescate de emergencia</span>
          </a>
        </div>

      </div>
    </section>
  );
}
