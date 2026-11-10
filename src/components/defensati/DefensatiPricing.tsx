'use client';

import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  MessageCircle, 
  Check, 
  ArrowRight,
  Shield, 
  Lock, 
  Clock,
  Sparkles
} from 'lucide-react';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackServiceClick, trackWhatsAppClick } from '@/lib/analytics';

interface Props {
  targetUrl?: string;
}

export default function DefensatiPricing({ targetUrl }: Props) {
  const cleanUrl = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';

  return (
    <section id="servicios" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-8 scroll-mt-24 text-left relative">
      <div id="precios" className="absolute -top-24 pointer-events-none" />
      
      {/* Encabezado de Sección */}
      <div className="space-y-2 border-b border-white/10 pb-5 max-w-4xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#38bdf8] font-bold px-3 py-1 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/30 inline-block">
          SERVICIOS OFICIALES DE CIBERSEGURIDAD
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight pt-2">
          Soluciones puntuales con precio transparente en Soles
        </h2>
        <p className="text-base sm:text-lg text-neutral-300">
          Sin contratos forzosos ni tarifas infladas. Te mostramos qué encontramos antes de que pagues.
        </p>
      </div>

      {/* 1. TARJETA PRINCIPAL: LIMPIEZA DE WORDPRESS (Oferta Estrella de Rescate) */}
      <div className="p-8 sm:p-12 rounded-[32px] bg-gradient-to-b from-[#1c121b]/95 via-[#120a12]/95 to-[#080509]/98 border-2 border-rose-500/40 hover:border-rose-500/60 shadow-[0_20px_60px_rgba(244,63,94,0.22)] backdrop-blur-2xl relative overflow-hidden transition-all">
        
        {/* Glow sutil de emergencia */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Badge superior */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <span className="text-xs uppercase tracking-widest font-mono text-rose-400 font-bold px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30">
              RESCATE URGENTE &bull; WORDPRESS &amp; WOOCOMMERCE
            </span>
            <span className="text-xs text-neutral-400 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              Diagnóstico en &lt; 2h &bull; Entrega en 24-48h
            </span>
          </div>

          {/* Título y Precio */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Limpieza y Desinfección de WordPress:{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-rose-300">
                    desde S/ 250
                  </span>
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 mt-1">
                  Para sitios que sufren virus, redirecciones a sitios de apuestas, penalización en Google o suspensión de hosting.
                </p>
              </div>
            </div>

            {/* Garantía Destacada */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-sm sm:text-base flex items-center gap-3 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                Garantía por escrito de 30 días: si tu web se vuelve a infectar por la misma causa, la limpio gratis.
              </span>
            </div>
          </div>

          {/* Prestaciones Reales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Diagnóstico previo sin costo:</strong> Confirmamos el tipo de infección antes de que abones un solo sol.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Copia de seguridad integral:</strong> Respaldamos tus archivos y base de datos antes de intervenir.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Desinfección profunda:</strong> Eliminación de virus, scripts maliciosos, spam y puertas traseras (backdoors).</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Recuperación y reactivación:</strong> Restablecemos el acceso de administrador y ayudamos con tu hosting.</span>
            </div>
          </div>

          {/* Botón de Conversión Inmediata */}
          <div className="pt-2">
            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioLimpieza(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackServiceClick({
                  serviceName: 'Limpieza de WordPress',
                  pricePen: 250,
                  serviceId: 'limpieza_wordpress',
                });
                trackWhatsAppClick({
                  service: 'limpieza_wordpress',
                  placement: 'pricing_main_card',
                  domain: cleanUrl,
                });
              }}
              className="w-full py-4 px-8 rounded-xl bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#20ba59] hover:brightness-110 active:scale-[0.98] text-black font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-[0_10px_35px_rgba(37,211,102,0.4)] transition-all cursor-pointer text-center"
            >
              <MessageCircle className="w-5 h-5 fill-current shrink-0" />
              <span>Quiero que revisen mi web infectada</span>
            </a>
          </div>

        </div>
      </div>

      {/* 2. OPCIONES DE PREVENCIÓN: BLINDAJE ESENCIAL Y WAF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Blindaje Esencial */}
        <div className="p-7 sm:p-8 rounded-[28px] bg-[#0c101c]/85 border border-white/12 hover:border-white/20 transition-all flex flex-col justify-between space-y-5 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Shield className="w-5 h-5 text-[#38bdf8]" />
              </div>
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                Prevención Técnica
              </span>
            </div>

            <div>
              <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Blindaje Esencial de Sitios Web
              </h4>
              <p className="text-3xl font-extrabold text-white font-mono mt-1">
                S/ 165 <span className="text-xs text-neutral-400 font-normal font-sans">pago único por sitio</span>
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-2">
                Fortalecimiento técnico para páginas sanas que desean prevenir intrusiones antes de ser atacadas.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-white/10 text-xs sm:text-sm text-neutral-200">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <span>Cabeceras de seguridad estrictas (HSTS, CSP, X-Frame).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <span>Ocultamiento de versiones de servidor y CMS para despistar atacantes.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <span>Actualización segura de CMS y plugins sin romper el diseño.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <span>Endurecimiento de accesos y contraseñas de administrador.</span>
              </li>
            </ul>
          </div>

          <a
            href={DEFENSATI_WHATSAPP_MESSAGES.precioBlindaje(cleanUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackServiceClick({
                serviceName: 'Blindaje Esencial',
                pricePen: 165,
                serviceId: 'blindaje_esencial',
              });
              trackWhatsAppClick({
                service: 'blindaje_esencial',
                placement: 'pricing_blindaje_card',
                domain: cleanUrl,
              });
            }}
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-sm font-bold border border-white/15 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#38bdf8] shrink-0" />
            <span>Pedir Blindaje por WhatsApp (S/ 165)</span>
          </a>
        </div>

        {/* Protección WAF */}
        <div className="p-7 sm:p-8 rounded-[28px] bg-[#0c101c]/85 border border-[#0071e3]/40 hover:border-[#0071e3]/60 transition-all flex flex-col justify-between space-y-5 backdrop-blur-xl relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center text-[#38bdf8]">
                <Lock className="w-5 h-5 text-[#38bdf8]" />
              </div>
              <span className="text-[11px] font-mono text-[#38bdf8] uppercase tracking-wider bg-[#0071e3]/20 px-2.5 py-1 rounded-full border border-[#0071e3]/30 font-bold">
                Recomendado para Tiendas Online
              </span>
            </div>

            <div>
              <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Protección Mediante Firewall (WAF)
              </h4>
              <p className="text-3xl font-extrabold text-white font-mono mt-1">
                Desde S/ 335 <span className="text-xs text-neutral-400 font-normal font-sans">implementación técnica</span>
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-2">
                Incluye todo el Blindaje Esencial más la configuración profesional de un Firewall perimetral en Cloudflare.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-white/10 text-xs sm:text-sm text-neutral-200">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <span>Todo lo incluido en el Blindaje Esencial (S/ 165).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <span>Reglas activas para frenar bots maliciosos y scrapers.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <span>Protección anti-fuerza bruta en tus formularios de login y pasarelas de pago.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <span>Mitigación de ataques de denegación de servicio (DDoS capa 7).</span>
              </li>
            </ul>
          </div>

          <a
            href={DEFENSATI_WHATSAPP_MESSAGES.precioBlindajeWaf(cleanUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackServiceClick({
                serviceName: 'Proteccion WAF',
                pricePen: 335,
                serviceId: 'proteccion_waf',
              });
              trackWhatsAppClick({
                service: 'proteccion_waf',
                placement: 'pricing_waf_card',
                domain: cleanUrl,
              });
            }}
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-bold shadow-lg shadow-[#0071e3]/30 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current shrink-0" />
            <span>Configurar Firewall por WhatsApp (Desde S/ 335)</span>
          </a>
        </div>

      </div>

    </section>
  );
}
