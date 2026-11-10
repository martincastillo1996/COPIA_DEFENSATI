'use client';

import React from 'react';
import { Check, Zap, Sparkles, MessageCircle, ShieldCheck, Clock } from 'lucide-react';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

interface Props {
  targetUrl?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  whatsappUrl: string;
  btnText: string;
  highlight: boolean;
  extraNote: string;
  optionalAddon?: string;
  secondaryWhatsappUrl?: string;
  secondaryBtnText?: string;
}

export default function PreviewPricing({ targetUrl }: Props) {
  const cleanUrl = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';

  const plans: PricingPlan[] = [
    {
      id: 'rescate-corp',
      name: 'Rescate / Limpieza (Sitio Corporativo)',
      badge: 'Rescate Forense • Urgente',
      badgeColor: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      price: 'S/ 380',
      period: 'pago único por desinfección',
      description: 'Desinfección forense completa para sitios corporativos, blogs y portafolios caídos o infectados con virus y spam.',
      features: [
        'Diagnóstico forense previo sin costo para ver qué encontramos',
        'Copia de seguridad forense integral previa a intervenir',
        'Eliminación de virus, malware, troyanos, backdoors y webshells',
        'Gestión de desbloqueo con el hosting y retiro de pantalla roja de Google',
        'Garantía formal de 30 días y revisión personal de Martín Castillo',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioRescateCorporativo(cleanUrl),
      btnText: 'Pedir Rescate Corporativo (S/ 380)',
      highlight: false,
      extraNote: 'Entrega en 24 a 48 horas hábiles. Factura formal con RUC.',
    },
    {
      id: 'rescate-woocommerce',
      name: 'Rescate / Limpieza (WooCommerce / Tienda)',
      badge: 'E-commerce • Tiendas Online',
      badgeColor: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      price: 'S/ 550',
      period: 'pago único por desinfección',
      description: 'Desinfección forense integral para tiendas online (WooCommerce, Shopify o Wix) con saneamiento de checkout y pasarelas.',
      features: [
        'Respaldo integral de archivos y base de datos transaccional',
        'Eliminación de scripts maliciosos en checkout (robo de tarjetas / Magecart)',
        'Saneamiento de plantillas, temas Liquid/Wix y usuarios espía',
        'Reactivación con el servidor y retiro de bloqueos en Google',
        'Garantía formal de 30 días por escrito ante reinfecciones',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioRescateWooCommerce(cleanUrl),
      btnText: 'Pedir Rescate WooCommerce (S/ 550)',
      highlight: false,
      extraNote: 'Protección para transacciones y carritos de compra.',
    },
    {
      id: 'blindaje-waf',
      name: 'Blindaje + WAF Cloudflare (Unificado)',
      badge: 'Recomendado • Prevención Total',
      badgeColor: 'bg-[#2997ff]/15 border-[#2997ff]/30 text-[#38bdf8]',
      price: 'S/ 450',
      period: 'pago único por sitio web',
      description: 'Nadie compra solo cabeceras por separado. Unificamos el blindaje perimetral de servidor con el Firewall Cloudflare WAF.',
      features: [
        'Cabeceras canónicas estrictas (HSTS precarga, CSP, X-Frame, Referrer-Policy)',
        'Ocultamiento perimetral de versiones de servidor y CMS',
        'Configuración profesional de Cloudflare WAF anti-bots y scrapers',
        'Protección anti-DDoS capa 7 y filtros anti-fuerza bruta en login',
        'Endurecimiento DNS con registros SPF, DKIM y DMARC anti-suplantación',
        'Re-medición técnica independiente con meta Grado A',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioBlindajeWaf(cleanUrl),
      btnText: 'Contratar Blindaje + WAF (S/ 450)',
      highlight: true,
      extraNote: 'Entrega llave en mano en 3 a 5 días hábiles.',
    },
    {
      id: 'vigilancia',
      name: 'Mantenimiento Mensual 24/7',
      badge: 'Vigilancia Continua',
      badgeColor: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      price: 'S/ 90 / S/ 180',
      period: 'Básico S/ 90/mes • Tiendas S/ 180/mes',
      description: 'Supervisión continua para prevenir caídas y soporte técnico mensual incluido. Cero contratos forzosos ni penalizaciones.',
      features: [
        'Plan Básico (S/ 90/mes): Uptime cada 15 min, alerta preventiva SSL y 40 min de soporte',
        'Tiendas Online (S/ 180/mes): Uptime cada 5 min, checkout seguro y soporte prioritario de 90 min (1.5h)',
        'Aviso inmediato a WhatsApp oficial si tu página o checkout se caen',
        'Detección perimetral de malware y re-escaneos periódicos con reporte a WhatsApp',
        'Cancela en cualquier momento sin penalizaciones',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioMensualBasico(cleanUrl),
      secondaryWhatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioMensualTiendas(cleanUrl),
      btnText: 'Activar Básico (S/ 90/mes)',
      secondaryBtnText: 'Contratar Tiendas Online (S/ 180/mes)',
      highlight: false,
      extraNote: 'Supervisión ininterrumpida 24/7 sin permanencia.',
    },
  ];

  return (
    <section id="precios" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-10 scroll-mt-24">
      
      {/* Cabecera Estilo Apple Pro */}
      <div className="text-center space-y-3 max-w-3xl mx-auto p-6 sm:p-8 rounded-[32px] bg-[#121214]/80 border border-white/10 backdrop-blur-2xl shadow-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[#2997ff] text-xs font-medium tracking-tight">
          <Zap className="w-3.5 h-3.5" />
          <span>Precios transparentes en Soles</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-semibold text-[#f5f5f7] tracking-[-0.035em] leading-tight">
          Elige la solución que tu web necesita
        </h2>
        <p className="text-sm sm:text-base text-[#a1a1a6] leading-relaxed font-normal">
          Sin costos ocultos ni letras pequeñas. Te mostramos el diagnóstico antes de que decidas.
        </p>
      </div>

      {/* Banner Diagnóstico Inicial Gratis (Gancho comercial) */}
      <div className="rounded-[28px] bg-gradient-to-r from-emerald-500/10 via-[#121214] to-emerald-500/10 border border-emerald-500/30 p-5 sm:p-7 backdrop-blur-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#30d158]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#30d158] text-[11px] font-bold uppercase tracking-wider mb-1">
              <span>Gancho Comercial</span>
              <span>&bull;</span>
              <span>100% Sin Costo</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#f5f5f7] tracking-tight">
              Diagnóstico gratuito
            </h3>
            <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed font-normal">
              Solo revisiones pasivas de cabeceras, SSL y puertos. Te mostramos qué encontramos antes de que pagues.
            </p>
          </div>
        </div>
        <a
          href="#escaner-gratis"
          className="shrink-0 px-6 py-3 rounded-full bg-[#30d158] hover:bg-[#28cd41] active:scale-[0.98] text-black font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer whitespace-nowrap"
        >
          Probar escáner gratis &darr;
        </a>
      </div>

      {/* Grid de 4 Tarjetas de Servicios y Blindaje (Apple Pro Dark Glass - 2x2 Amplio y Espacioso) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 sm:p-8 rounded-[32px] flex flex-col justify-between transition-all duration-300 relative ${
              plan.highlight
                ? 'bg-linear-to-b from-[#141b26] to-[#0f141d] border-2 border-[#0071e3] shadow-[0_20px_50px_rgba(0,113,227,0.25)]'
                : 'bg-[#121214]/80 border border-white/10 hover:border-white/20 shadow-xl backdrop-blur-2xl'
            }`}
          >
            {/* Glow sutil para tarjeta recomendada */}
            {plan.highlight && (
              <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            )}

            <div className="space-y-4">
              {/* Badge del plan */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${plan.badgeColor} tracking-tight`}>
                  {plan.badge}
                </span>
              </div>

              {/* Título y descripción */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#f5f5f7] tracking-tight leading-snug">
                  {plan.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed mt-1.5 font-normal">
                  {plan.description}
                </p>
              </div>

              {/* Precio */}
              <div className="py-4 my-2 border-y border-white/10 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-[#f5f5f7] tracking-tight font-mono whitespace-nowrap">
                    {plan.price}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-[#86868b] font-normal sm:text-right">
                  {plan.period}
                </span>
              </div>

              {/* Lista de características */}
              <ul className="space-y-3 pt-2">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#d1d5db] leading-relaxed font-normal">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0 mt-0.5" />
                    <span className="whitespace-normal">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Nota opcional de WAF */}
              {plan.optionalAddon && (
                <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-sky-200 text-xs sm:text-sm flex items-start gap-2.5 leading-relaxed mt-3">
                  <Sparkles className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                  <span>{plan.optionalAddon}</span>
                </div>
              )}
            </div>

            {/* Botón WhatsApp Estilo Apple Pill */}
            <div className="pt-6 space-y-2.5">
              <a
                href={plan.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 px-6 rounded-full font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer text-center ${
                  plan.highlight
                    ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-lg shadow-[#0071e3]/30 active:scale-[0.98]'
                    : 'bg-white/[0.08] hover:bg-white/[0.14] text-[#f5f5f7] border border-white/15 active:scale-[0.98]'
                }`}
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span className="leading-snug">{plan.btnText}</span>
              </a>

              {plan.secondaryWhatsappUrl && (
                <a
                  href={plan.secondaryWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-5 rounded-full text-xs sm:text-sm font-semibold text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 border border-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                >
                  <span>{plan.secondaryBtnText || 'Ver Plan Pro (S/ 99)'}</span>
                  <span>&rarr;</span>
                </a>
              )}

              <p className="text-xs text-center text-[#86868b] leading-tight font-normal pt-1">
                {plan.extraNote}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Detalle y Límites Técnicos del Monitoreo Mensual (S/ 49 vs S/ 99) */}
      <div className="rounded-[32px] bg-[#121214]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-[#2997ff] text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Transparencia Técnica &amp; Operativa</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Límites y Alcance del Monitoreo Mensual por Escrito
            </h3>
            <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed max-w-2xl">
              Un servicio de monitoreo asequible solo es rentable y rápido si el 95% es automatizado y el soporte manual está acotado por escrito. Conoce los detalles de cada nivel:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plan Esencial S/ 49 */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Nivel Esencial</span>
                <span className="text-xl font-bold text-white font-mono">S/ 49 <span className="text-xs font-normal text-neutral-400">/ mes</span></span>
              </div>
              <h4 className="text-base font-semibold text-white">Vigilancia Básica &amp; Alertas Tempranas</h4>
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Qué se monitorea:</strong> Disponibilidad web (Uptime HTTP/HTTPS) y estado del certificado SSL/TLS.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Frecuencia:</strong> Uptime check cada 15 min. Alerta preventiva SSL con 30 días de anticipación. Re-escaneo de seguridad perimetral mensual.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Canal de alertas:</strong> Notificación inmediata a WhatsApp ante caídas + reporte mensual resumido.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Soporte manual incluido:</strong> Hasta <strong>30 minutos/mes</strong> de intervención técnica para ajustes perimetrales menores (reactivación SSL básica, cabeceras).</span>
                </li>
                <li className="flex items-start gap-2 text-neutral-400 border-t border-white/5 pt-2">
                  <span className="text-amber-400 font-bold shrink-0">•</span>
                  <span><strong>Cotización aparte:</strong> Desinfección forense por hackeo, cambios de código/diseño o caídas por infraestructura de hosting ajeno.</span>
                </li>
              </ul>
            </div>
            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioMensual(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Activar Plan Esencial (S/ 49/mes)</span>
            </a>
          </div>

          {/* Plan Pro S/ 99 */}
          <div className="p-6 rounded-2xl bg-blue-500/[0.04] border border-blue-500/25 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#38bdf8]">Nivel Pro</span>
                <span className="text-xl font-bold text-white font-mono">S/ 99 <span className="text-xs font-normal text-neutral-400">/ mes</span></span>
              </div>
              <h4 className="text-base font-semibold text-white">Vigilancia Continua &amp; Soporte Prioritario</h4>
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                  <span><strong>Qué se monitorea:</strong> Disponibilidad en tiempo real, SSL/TLS, integridad de cabeceras y escaneo contra malware conocido.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                  <span><strong>Frecuencia:</strong> Uptime check prioritario cada 5 min. Monitoreo continuo SSL. Re-escaneo semanal completo con informe consolidado.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                  <span><strong>Canal de alertas:</strong> Alerta inmediata y prioritaria a WhatsApp + reporte semanal ejecutivo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                  <span><strong>Soporte manual incluido:</strong> Hasta <strong>60 minutos (1 hora)/mes</strong> de intervención técnica directa para endurecimiento, directivas y parches perimetrales.</span>
                </li>
                <li className="flex items-start gap-2 text-neutral-400 border-t border-white/5 pt-2">
                  <span className="text-amber-400 font-bold shrink-0">•</span>
                  <span><strong>Cotización aparte:</strong> Desinfección forense por hackeo, desarrollos web a medida o problemas ajenos del datacenter.</span>
                </li>
              </ul>
            </div>
            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioMensualPro(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#0071e3]/30 transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Activar Plan Pro (S/ 99/mes)</span>
            </a>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-[#86868b] leading-relaxed flex items-center gap-2">
          <span>* Los minutos de soporte técnico son de uso dentro de cada ciclo mensual y no son acumulables. Sin permanencia obligatoria: cancela en cualquier momento avisando por WhatsApp.</span>
        </div>
      </div>

    </section>
  );
}
