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
      id: 'pack-corp',
      name: 'Pack Rescate + Blindaje WAF (Web Corporativa)',
      badge: 'Recomendado • Todo Incluido',
      badgeColor: 'bg-[#2997ff]/15 border-[#2997ff]/30 text-[#38bdf8]',
      price: 'S/ 600',
      period: 'pago único (3 meses monitoreo incluidos)',
      description: 'Solución integral: desinfección forense completa, blindaje de cabeceras, Firewall WAF Cloudflare y 3 meses de monitoreo 24/7 incluidos.',
      features: [
        'Desinfección forense de archivos y base de datos con respaldo previo',
        'Blindaje de cabeceras canónicas (HSTS, CSP, X-Frame) y versiones ocultas',
        'Configuración de WAF Cloudflare activo anti-bots y ataques DDoS',
        '3 meses de monitoreo continuo 24/7 con aviso inmediato a WhatsApp',
        'Garantía formal de 30 días y atención personal de Martín Castillo',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioPackCorp(cleanUrl),
      btnText: 'Pedir Pack Web Corporativa (S/ 600)',
      highlight: true,
      extraNote: 'Solución integral llave en mano. Factura formal con RUC.',
    },
    {
      id: 'pack-ecom',
      name: 'Pack Rescate + Blindaje WAF (E-commerce)',
      badge: 'Máxima Seguridad • Tiendas Online',
      badgeColor: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      price: 'S/ 850',
      period: 'pago único (3 meses monitoreo incluidos)',
      description: 'Diseñado para tiendas WooCommerce, Shopify y Wix con pasarelas de pago (Yape, Niubiz, Culqi) y protección de checkout.',
      features: [
        'Todo lo del pack corporativo adaptado a pasarelas de pago',
        'Saneamiento y auditoría de checkout contra scripts espías (Magecart)',
        'Endurecimiento DNS con registros SPF, DKIM y DMARC anti-suplantación',
        'Reglas WAF específicas contra bots en checkout y scrapers de inventario',
        '3 meses de monitoreo prioritario 24/7 con aviso inmediato a WhatsApp',
        'Garantía por escrito de 30 días y comprobante formal con RUC',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioPackEcom(cleanUrl),
      btnText: 'Pedir Pack Tienda Online (S/ 850)',
      highlight: false,
      extraNote: 'Protección para pasarelas de pago y carritos.',
    },
    {
      id: 'rescate-emergencia',
      name: 'Rescate de Emergencia Puntual',
      badge: 'Solo Emergencia 24-48h',
      badgeColor: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      price: 'S/ 450 – S/ 650',
      period: 'por emergencia (según complejidad)',
      description: 'Para sitios caídos o infectados donde solo necesitas apagar el incendio inmediato sin contratar blindaje ni monitoreo extendido.',
      features: [
        'Diagnóstico forense previo sin costo para ver qué encontramos',
        'Copia de seguridad forense integral previa a intervenir',
        'Eliminación de virus, malware, scripts de spam y backdoors',
        'Gestión directa de desbloqueo con el hosting y retiro de pantalla roja',
        'Garantía formal de 30 días por escrito ante reinfecciones',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioRescateEmergencia(cleanUrl),
      btnText: 'Pedir Rescate de Emergencia (S/ 450 - S/ 650)',
      highlight: false,
      extraNote: 'Intervención forense urgente en 24 a 48 horas.',
    },
    {
      id: 'vigilancia',
      name: 'Monitoreo y mantenimiento mensual',
      badge: 'Vigilancia Permanente',
      badgeColor: 'bg-white/[0.08] border-white/15 text-neutral-300',
      price: 'S/ 49 / S/ 99',
      period: 'Esencial S/ 49/mes • Pro S/ 99/mes',
      description: 'Para webs previamente blindadas o al terminar los 3 meses incluidos de tu paquete. Sin contratos de permanencia.',
      features: [
        'Plan Esencial (S/ 49/mes): Uptime cada 15 min + aviso inmediato a WhatsApp',
        'Alerta preventiva ante vencimiento del certificado SSL a los 30 días',
        'Re-escaneo mensual de seguridad con informe a tu WhatsApp',
        'Nivel Pro (S/ 99/mes): Uptime cada 5 min + soporte preventivo de 1h/mes',
        'Cero permanencia: cancela en cualquier momento por WhatsApp',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioMensual(cleanUrl),
      secondaryWhatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioMensualPro(cleanUrl),
      btnText: 'Activar Plan Esencial (S/ 49/mes)',
      secondaryBtnText: 'Contratar Plan Pro (S/ 99/mes)',
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
