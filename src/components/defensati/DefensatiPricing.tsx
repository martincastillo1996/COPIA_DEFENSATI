'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  Shield, 
  Clock, 
  ShoppingBag, 
  Globe, 
  Flame, 
  Radio,
  ChevronDown
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackServiceClick, trackWhatsAppClick } from '@/lib/analytics';

interface Props {
  targetUrl?: string;
}

export default function DefensatiPricing({ targetUrl }: Props) {
  const cleanUrl = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';
  const [selectedRescueType, setSelectedRescueType] = useState<'corp' | 'ecom'>('corp');
  
  // Estados para desplegables interactivos
  const [showRescueDetails, setShowRescueDetails] = useState(false);
  const [showWafDetails, setShowWafDetails] = useState(false);
  const [showMonthlyDetails, setShowMonthlyDetails] = useState(false);

  return (
    <section id="servicios" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-8 scroll-mt-24 text-left relative">
      <div id="precios" className="absolute -top-24 pointer-events-none" />
      
      {/* Cabecera Estilo Apple Pro */}
      <div className="space-y-2 border-b border-white/10 pb-5 max-w-4xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#2997ff] font-semibold px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/12 inline-block">
          SERVICIOS OFICIALES DE CIBERSEGURIDAD
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold text-[#f5f5f7] tracking-[-0.03em] leading-tight pt-2">
          Soluciones claras con precio transparente en Soles
        </h2>
        <p className="text-base sm:text-lg text-[#86868b] font-normal">
          Sin costos ocultos ni mensualidades forzosas. Te mostramos qué encontramos antes de que pagues.
        </p>
      </div>

      {/* 1. TARJETA HERO PRINCIPAL: RESCATE / LIMPIEZA DE MALWARE */}
      <div className="p-7 sm:p-10 rounded-[32px] sm:rounded-[36px] bg-gradient-to-b from-[#1a131b]/85 via-[#161618]/90 to-[#101012] border-2 border-rose-500/35 hover:border-rose-500/55 shadow-[0_30px_70px_rgba(244,63,94,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-3xl relative overflow-hidden transition-all">
        
        {/* Glow sutil de emergencia */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Badge superior y Plazos */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <span className="text-xs uppercase tracking-widest font-mono text-[#ff453a] font-semibold px-3.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              RESCATE URGENTE &bull; WORDPRESS, WOOCOMMERCE, SHOPIFY &amp; WIX
            </span>
            <span className="text-xs text-[#86868b] flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              Diagnóstico en &lt; 2h &bull; Entrega en 24-48h hábiles
            </span>
          </div>

          {/* Selector de Modalidad de Rescate */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                Selecciona tu tipo de sitio web:
              </span>
              <div className="inline-flex p-1 rounded-2xl bg-white/[0.06] border border-white/12">
                <button
                  type="button"
                  onClick={() => setSelectedRescueType('corp')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedRescueType === 'corp'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Sitio Corporativo (S/ 380)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRescueType('ecom')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedRescueType === 'ecom'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>WooCommerce / Tienda Online (S/ 550)</span>
                </button>
              </div>
            </div>

            {/* Título y Precio Dinámico */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pt-1">
              <div>
                <h3 className="text-2xl sm:text-4xl font-bold text-[#f5f5f7] tracking-tight leading-tight">
                  Rescate / Limpieza de malware:{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-rose-300">
                    {selectedRescueType === 'corp' ? 'S/ 380' : 'S/ 550'}
                  </span>
                </h3>
                <p className="text-sm sm:text-base text-[#86868b] mt-1 font-normal">
                  {selectedRescueType === 'corp'
                    ? 'Para sitios corporativos, blogs y portafolios infectados con virus, spam, redirecciones o suspensión de hosting.'
                    : 'Para tiendas online (WooCommerce, Shopify o Wix) con infección en carritos, base de datos transaccional o scripts espías.'}
                </p>
              </div>
              <div className="sm:text-right shrink-0">
                <div className="text-4xl sm:text-5xl font-black text-white font-mono">
                  {selectedRescueType === 'corp' ? 'S/ 380' : 'S/ 550'}
                </div>
                <span className="text-xs text-[#86868b] font-mono">Pago único por desinfección</span>
              </div>
            </div>

            {/* Garantía Destacada */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-sm sm:text-base flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                Garantía por escrito de 30 días: si tu web se vuelve a infectar por la misma causa remediada, la reviso y limpio gratis.
              </span>
            </div>

            {/* Botón Desplegable Interactivo para Ver Qué Incluye */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowRescueDetails(prev => !prev)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                <span>{showRescueDetails ? 'Ocultar alcance de la desinfección' : '¿Qué incluye la desinfección forense?'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showRescueDetails ? 'rotate-180 text-rose-400' : ''}`} />
              </button>

              {/* Contenido Desplegable */}
              {showRescueDetails && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 animate-in fade-in-50 duration-200">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Diagnóstico previo sin costo:</strong> Confirmamos el tipo de infección antes de que abones un solo sol.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Copia de seguridad forense:</strong> Respaldamos tus archivos y base de datos antes de intervenir.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Desinfección profunda:</strong> Eliminación de virus, troyanos, puertas traseras (backdoors) y webshells.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Recuperación y reactivación:</strong> Gestión de desbloqueo con el hosting y retiro de pantalla roja de Google.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Yo mismo reviso tu web:</strong> Intervención técnica directa de Martín Castillo, sin intermediarios.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Comprobante formal con RUC:</strong> Emisión de Factura o Boleta con RUC 10704877850 para deducción fiscal.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de Conversión Inmediata Apple Pill */}
            <div className="pt-2">
              <a
                href={
                  selectedRescueType === 'corp'
                    ? DEFENSATI_WHATSAPP_MESSAGES.precioRescateCorporativo(cleanUrl)
                    : DEFENSATI_WHATSAPP_MESSAGES.precioRescateWooCommerce(cleanUrl)
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackServiceClick({
                    serviceName: selectedRescueType === 'corp' ? 'Rescate Sitio Corporativo' : 'Rescate WooCommerce',
                    pricePen: selectedRescueType === 'corp' ? 380 : 550,
                    serviceId: selectedRescueType === 'corp' ? 'rescate_corporativo' : 'rescate_woocommerce',
                  });
                  trackWhatsAppClick({
                    service: selectedRescueType === 'corp' ? 'rescate_corporativo' : 'rescate_woocommerce',
                    placement: 'pricing_hero_rescue',
                    domain: cleanUrl,
                  });
                }}
                className="w-full py-4 px-8 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-[0_4px_24px_rgba(37,211,102,0.35)] transition-all cursor-pointer text-center"
              >
                <WhatsAppIcon className="w-5 h-5 fill-current shrink-0" />
                <span>
                  {selectedRescueType === 'corp'
                    ? 'Pedir Rescate para Sitio Corporativo (S/ 380)'
                    : 'Pedir Rescate para WooCommerce / Tienda Online (S/ 550)'}
                </span>
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* 2. SERVICIOS COMPLEMENTARIOS: BLINDAJE WAF Y MANTENIMIENTO MENSUAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Tarjeta 1: Blindaje + WAF Cloudflare (Paquete Unificado S/ 450) */}
        <div className="p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] bg-[#161618]/70 border border-[#0071e3]/40 hover:border-[#0071e3]/60 transition-all flex flex-col justify-between space-y-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,113,227,0.18),inset_0_1px_0_rgba(255,255,255,0.1)] relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center text-[#2997ff]">
                <Shield className="w-6 h-6 text-[#2997ff]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#86868b] flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10">
                  <Clock className="w-3 h-3 text-[#2997ff]" />
                  3 a 5 días hábiles
                </span>
                <span className="text-[11px] font-mono text-[#2997ff] uppercase tracking-wider bg-[#0071e3]/20 px-3 py-1 rounded-full border border-[#0071e3]/30 font-semibold">
                  Paquete Unificado
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xl sm:text-2xl font-bold text-[#f5f5f7] tracking-tight">
                Blindaje + WAF Cloudflare
              </h4>
              <p className="text-3xl sm:text-4xl font-bold text-[#f5f5f7] font-mono mt-1">
                S/ 450 <span className="text-xs text-[#86868b] font-normal font-sans">pago único por sitio</span>
              </p>
              <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed mt-2 font-normal">
                Unificamos el blindaje perimetral de cabeceras canónicas con el Firewall Cloudflare WAF activo contra ataques, bots y scrapers.
              </p>
            </div>

            {/* Desplegable de Directivas Incluidas */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowWafDetails(prev => !prev)}
                className="inline-flex items-center gap-2 text-xs text-[#38bdf8] hover:text-white px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors cursor-pointer"
              >
                <span>{showWafDetails ? 'Ocultar directivas y reglas' : '¿Qué reglas perimetrales incluye?'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showWafDetails ? 'rotate-180 text-sky-400' : ''}`} />
              </button>

              {showWafDetails && (
                <ul className="space-y-2 pt-3 text-xs text-neutral-200 animate-in fade-in-50 duration-200">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2997ff] shrink-0 mt-0.5" />
                    <span>Cabeceras estrictas (HSTS precarga, CSP, X-Frame, Referrer-Policy).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2997ff] shrink-0 mt-0.5" />
                    <span>Ocultamiento de versiones de servidor y CMS para despistar bots.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2997ff] shrink-0 mt-0.5" />
                    <span>Configuración perimetral de Firewall WAF en Cloudflare anti-scrapers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2997ff] shrink-0 mt-0.5" />
                    <span>Protección anti-DDoS capa 7 y filtros anti-fuerza bruta en logins.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2997ff] shrink-0 mt-0.5" />
                    <span>Endurecimiento DNS con registros SPF, DKIM y DMARC anti-suplantación.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2997ff] shrink-0 mt-0.5" />
                    <span>Re-medición técnica independiente con meta de Grado A.</span>
                  </li>
                </ul>
              )}
            </div>
          </div>

          <a
            href={DEFENSATI_WHATSAPP_MESSAGES.precioBlindajeWaf(cleanUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackServiceClick({
                serviceName: 'Blindaje + WAF Cloudflare',
                pricePen: 450,
                serviceId: 'blindaje_waf',
              });
              trackWhatsAppClick({
                service: 'blindaje_waf',
                placement: 'pricing_blindaje_waf_card',
                domain: cleanUrl,
              });
            }}
            className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(0,113,227,0.35)] transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
            <span>Contratar Blindaje + WAF (S/ 450)</span>
          </a>
        </div>

        {/* Tarjeta 2: Mantenimiento Mensual Recurrente */}
        <div className="p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] bg-[#161618]/70 border border-emerald-500/25 hover:border-emerald-500/45 transition-all flex flex-col justify-between space-y-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Radio className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#86868b] flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  Supervisión 24/7
                </span>
                <span className="text-[11px] font-mono text-emerald-300 uppercase tracking-wider bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/25">
                  Vigilancia Continua
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xl sm:text-2xl font-bold text-[#f5f5f7] tracking-tight">
                Mantenimiento Mensual 24/7
              </h4>
              <p className="text-3xl sm:text-4xl font-bold text-[#f5f5f7] font-mono mt-1">
                S/ 90 <span className="text-sm text-neutral-400 font-sans font-normal">Básico</span> &bull; S/ 180 <span className="text-sm text-neutral-400 font-sans font-normal">Tiendas / mes</span>
              </p>
              <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed mt-2 font-normal">
                Vigilancia continua para detectar caídas antes que tus clientes y soporte técnico mensual incluido. Cero permanencia forzosa: cancelas cuando quieras.
              </p>
            </div>

            {/* Desplegable de Comparación de Planes Mensuales */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowMonthlyDetails(prev => !prev)}
                className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-white px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors cursor-pointer"
              >
                <span>{showMonthlyDetails ? 'Ocultar detalle de planes' : '¿Qué incluye cada plan mensual?'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMonthlyDetails ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>

              {showMonthlyDetails && (
                <div className="space-y-2.5 pt-3 text-xs text-neutral-200 animate-in fade-in-50 duration-200">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <strong className="text-emerald-300 block">Plan Básico (S/ 90/mes):</strong>
                    <p className="text-neutral-400 text-[11px]">
                      Uptime cada 15 min, alerta SSL con 30 días de anticipación, informe mensual a WhatsApp y hasta 40 min de soporte directo.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <strong className="text-sky-300 block">Tiendas Online (S/ 180/mes):</strong>
                    <p className="text-neutral-400 text-[11px]">
                      Uptime cada 5 min, monitoreo de pasarelas/checkout, re-escaneos semanales de puertos y soporte prioritario de 90 min (1.5h).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioMensualBasico(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackServiceClick({
                  serviceName: 'Mantenimiento Basico',
                  pricePen: 90,
                  serviceId: 'mantenimiento_basico',
                });
                trackWhatsAppClick({
                  service: 'mantenimiento_basico',
                  placement: 'pricing_monthly_card',
                  domain: cleanUrl,
                });
              }}
              className="inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-semibold border border-emerald-500/30 backdrop-blur-xl transition-all cursor-pointer text-center"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Básico (S/ 90/m)</span>
            </a>

            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioMensualTiendas(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackServiceClick({
                  serviceName: 'Mantenimiento Tiendas Online',
                  pricePen: 180,
                  serviceId: 'mantenimiento_tiendas',
                });
                trackWhatsAppClick({
                  service: 'mantenimiento_tiendas',
                  placement: 'pricing_monthly_card',
                  domain: cleanUrl,
                });
              }}
              className="inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 text-xs font-semibold border border-blue-500/30 backdrop-blur-xl transition-all cursor-pointer text-center"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Tiendas (S/ 180/m)</span>
            </a>
          </div>
        </div>

      </div>

      {/* Nota de Transparencia de Plazos y Horario */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#86868b]">
        <div className="flex items-center gap-2 text-[#f5f5f7]">
          <Clock className="w-4 h-4 text-[#2997ff] shrink-0" />
          <span><strong>Diagnóstico preliminar 100% gratuito:</strong> te mostramos qué encontramos antes de que abones un solo sol.</span>
        </div>
        <div className="text-neutral-400">
          Atención técnica directa: <strong>Lunes a Sábado, 9:00 a 20:00 (Hora Perú) &bull; RUC 10704877850</strong>
        </div>
      </div>

    </section>
  );
}
