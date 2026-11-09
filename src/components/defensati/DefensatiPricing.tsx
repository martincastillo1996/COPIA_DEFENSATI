'use client';

import React from 'react';
import { Check, Zap, Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

interface Props {
  targetUrl?: string;
}

export default function DefensatiPricing({ targetUrl }: Props) {
  const cleanUrl = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';

  const plans = [
    {
      id: 'limpieza',
      name: 'Limpieza de WordPress infectados',
      badge: 'Oferta Principal • Rescate',
      badgeColor: 'bg-rose-500/10 border-rose-500/25 text-rose-300',
      price: 'Desde S/ 250',
      period: 'pago único (según complejidad)',
      description: 'Oferta principal para sitios que ya presentan virus, redirecciones extrañas o bloqueos de Google.',
      features: [
        'Diagnóstico previo de infección sin costo',
        'Desinfección profunda de archivos y CMS',
        'Eliminación de virus, malware y backdoors',
        'Recuperación de acceso al panel de administración',
        'Garantía de 30 días si reinfecta por la misma causa',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioLimpieza(cleanUrl),
      btnText: 'Consultar Limpieza',
      highlight: false,
      extraNote: 'Se cotiza previamente según el nivel de complejidad.',
    },
    {
      id: 'blindaje',
      name: 'Blindaje de sitios web',
      badge: 'Configuración Esencial',
      badgeColor: 'bg-white/[0.08] border-white/15 text-[#f5f5f7]',
      price: 'S/ 165',
      period: 'pago único por sitio web',
      description: 'Auditoría y fortalecimiento de configuración técnica para proteger tu web contra ataques comunes.',
      features: [
        'Cabeceras de seguridad estrictas (HSTS, CSP, X-Frame)',
        'Ocultamiento de versiones de servidor y CMS',
        'Actualización segura de CMS (WordPress) y plugins',
        'Endurecimiento de accesos y credenciales de admin',
        'Entrega rápida llave en mano sin tocar datos privados',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioBlindaje(cleanUrl),
      btnText: 'Pedir Blindaje Web',
      highlight: false,
      extraNote: 'Auditoría y fortalecimiento de configuración.',
    },
    {
      id: 'blindaje-waf',
      name: 'Protección mediante WAF',
      badge: 'Máxima Protección • Recomendado',
      badgeColor: 'bg-[#2997ff]/10 border-[#2997ff]/25 text-[#38bdf8]',
      price: 'Desde S/ 335',
      period: 'pago único de implementación',
      description: 'Incluye todo el Blindaje Básico + configuración experta de Firewall de Aplicaciones Web (WAF).',
      features: [
        'Todo lo incluido en el Blindaje de sitios web (S/ 165)',
        'Configuración profesional de WAF perimetral (Cloudflare)',
        'Reglas activas anti-bots maliciosos y scrapers',
        'Mitigación de ataques DDoS de capa 7',
        'Filtro contra inyecciones SQL y ataques web',
      ],
      optionalAddon: '* Incluye configuración de WAF; el costo del servicio WAF de terceros puede ir aparte.',
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioBlindajeWaf(cleanUrl),
      btnText: 'Pedir Protección WAF',
      highlight: true,
      extraNote: 'Configuración perimetral de WAF llave en mano.',
    },
    {
      id: 'vigilancia',
      name: 'Monitoreo y mantenimiento mensual',
      badge: 'Tranquilidad Continua',
      badgeColor: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
      price: 'S/ 49',
      period: 'al mes (y nivel superior de S/ 99)',
      description: 'Monitoreo proactivo con alcance y límites por escrito para detectar caídas antes que tus clientes.',
      features: [
        'Plan Esencial (S/ 49/mes): Aviso inmediato de caídas de web',
        'Alerta preventiva ante vencimiento del certificado SSL',
        'Re-escaneo mensual de seguridad con informe a tu WhatsApp',
        'Nivel Superior (S/ 99/mes): Re-escaneos semanales + soporte prioritario',
        'Alcance y límites por escrito: cancela en cualquier momento',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioMensual(cleanUrl),
      btnText: 'Activar Monitoreo',
      highlight: false,
      extraNote: 'Alcance y límites por escrito. Sin penalizaciones.',
    },
  ];

  return (
    <section id="precios" className="w-full max-w-6xl mx-auto space-y-8 scroll-mt-24 px-4 sm:px-6">
      
      {/* Cabecera Estilo Apple Pro */}
      <div className="text-center space-y-3 max-w-2xl mx-auto p-6 sm:p-8 rounded-[32px] bg-[#121214]/80 border border-white/10 backdrop-blur-2xl shadow-xl">
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
      <div className="rounded-[28px] bg-gradient-to-r from-emerald-500/10 via-[#121214] to-emerald-500/10 border border-emerald-500/30 p-5 sm:p-6 backdrop-blur-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3.5">
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

      {/* Grid de 4 Tarjetas de Servicios y Blindaje (Apple Pro Dark Glass) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 sm:p-7 rounded-[28px] flex flex-col justify-between transition-all duration-300 relative ${
              plan.highlight
                ? 'bg-linear-to-b from-[#141b26] to-[#0f141d] border-2 border-[#0071e3] shadow-[0_20px_50px_rgba(0,113,227,0.25)] lg:-translate-y-2'
                : 'bg-[#121214]/80 border border-white/10 hover:border-white/20 shadow-xl backdrop-blur-2xl'
            }`}
          >
            {/* Glow sutil para tarjeta recomendada */}
            {plan.highlight && (
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            )}

            <div className="space-y-4">
              {/* Badge del plan */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${plan.badgeColor} tracking-tight`}>
                  {plan.badge}
                </span>
              </div>

              {/* Título y descripción */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#f5f5f7] tracking-tight leading-snug">
                  {plan.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed mt-1.5 min-h-[38px] font-normal">
                  {plan.description}
                </p>
              </div>

              {/* Precio */}
              <div className="pt-3 pb-2 border-y border-white/10">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-semibold text-[#f5f5f7] tracking-tight font-mono">
                    {plan.price}
                  </span>
                </div>
                <span className="text-[11px] text-[#86868b] block mt-1 font-normal">
                  {plan.period}
                </span>
              </div>

              {/* Lista de características */}
              <ul className="space-y-2.5 pt-1">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2 text-xs sm:text-sm text-[#d1d5db] leading-snug font-normal">
                    <Check className="w-3.5 h-3.5 text-[#30d158] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Nota opcional de WAF */}
              {plan.optionalAddon && (
                <div className="p-3 rounded-2xl bg-sky-950/20 border border-sky-500/25 text-sky-200 text-xs flex items-start gap-2 leading-relaxed">
                  <Sparkles className="w-3.5 h-3.5 text-[#38bdf8] shrink-0 mt-0.5" />
                  <span>{plan.optionalAddon}</span>
                </div>
              )}
            </div>

            {/* Botón WhatsApp Estilo Apple Pill */}
            <div className="pt-5 space-y-2">
              <a
                href={plan.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 px-4 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  plan.highlight
                    ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-lg shadow-[#0071e3]/30 active:scale-[0.98]'
                    : 'bg-white/[0.08] hover:bg-white/[0.12] text-[#f5f5f7] border border-white/15 active:scale-[0.98]'
                }`}
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>{plan.btnText}</span>
              </a>

              <p className="text-[11px] text-center text-[#86868b] leading-tight font-normal">
                {plan.extraNote}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Aclaración de Alcance y Qué NO cubre el servicio */}
      <div className="p-4 sm:p-5 rounded-[24px] bg-white/[0.03] border border-white/10 text-center max-w-3xl mx-auto text-xs text-[#a1a1a6] leading-relaxed backdrop-blur-xl">
        <strong className="text-[#f5f5f7]">Alcance del servicio:</strong> Nos enfocamos en auditoría de seguridad web, fortalecimiento de configuración perimetral y reducción de riesgo técnico. <span className="text-neutral-300 font-medium">Qué no cubre:</span> No cubre vulnerabilidades en código fuente personalizado, filtraciones por contraseñas débiles de usuarios ni fallos de infraestructura del proveedor de hosting.
      </div>

    </section>
  );
}
