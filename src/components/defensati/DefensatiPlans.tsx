'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackServiceClick, trackWhatsAppClick } from '@/lib/analytics';

interface Props {
  targetUrl?: string;
}

type SiteType = 'corp' | 'ecom';

/**
 * Precios oficiales del catálogo DEFENSA TI (AGENTS.md, regla 7).
 * Un único selector de tipo de web ajusta todos los precios a la vez.
 */
export default function DefensatiPlans({ targetUrl }: Props) {
  const cleanUrl = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';
  const [siteType, setSiteType] = useState<SiteType>('corp');
  const [showExtras, setShowExtras] = useState(false);
  const isShop = siteType === 'ecom';

  const plans = [
    {
      id: isShop ? 'rescate_woocommerce' : 'rescate_corporativo',
      situation: 'Mi web ya tiene un problema',
      name: 'Rescate y limpieza de malware',
      price: isShop ? 550 : 380,
      unit: 'pago único',
      time: 'Lista en 24 a 48 horas',
      accent: '#ff453a',
      features: [
        'Respaldo completo antes de tocar nada',
        'Eliminamos virus, spam y accesos ocultos',
        'Gestionamos el desbloqueo con tu hosting y con Google',
        'Garantía de 30 días por escrito',
      ],
      cta: 'Pedir rescate',
      href: isShop
        ? DEFENSATI_WHATSAPP_MESSAGES.precioRescateWooCommerce(cleanUrl)
        : DEFENSATI_WHATSAPP_MESSAGES.precioRescateCorporativo(cleanUrl),
    },
    {
      id: 'blindaje_waf',
      situation: 'Funciona, pero quiero protegerla',
      name: 'Blindaje + Firewall Cloudflare',
      price: 450,
      unit: 'pago único',
      time: 'Lista en 3 a 5 días hábiles',
      accent: '#38bdf8',
      features: [
        'Firewall activo contra bots, scrapers y ataques',
        'Cabeceras de seguridad estrictas (HSTS, CSP, X-Frame)',
        'Ocultamos versiones de servidor y gestor de contenidos',
        'Si tu calificación no mejora, te devolvemos el pago',
      ],
      cta: 'Pedir blindaje',
      href: DEFENSATI_WHATSAPP_MESSAGES.precioBlindajeWaf(cleanUrl),
    },
    {
      id: isShop ? 'mantenimiento_tiendas' : 'mantenimiento_basico',
      situation: 'Quiero que alguien la vigile',
      name: 'Mantenimiento mensual',
      price: isShop ? 180 : 90,
      unit: 'al mes, sin permanencia',
      time: 'Vigilancia continua 24/7',
      accent: '#30d158',
      features: isShop
        ? [
            'Revisamos que tu tienda esté en línea cada 5 minutos',
            'Alerta prioritaria a tu WhatsApp si se cae',
            'Re-escaneo de seguridad cada semana',
            'Hasta 90 minutos de soporte prioritario al mes',
          ]
        : [
            'Revisamos que tu web esté en línea cada 15 minutos',
            'Aviso antes de que venza tu certificado SSL',
            'Reporte mensual a tu WhatsApp',
            'Hasta 40 minutos de soporte al mes',
          ],
      cta: 'Pedir mantenimiento',
      href: isShop
        ? DEFENSATI_WHATSAPP_MESSAGES.precioMensualTiendas(cleanUrl)
        : DEFENSATI_WHATSAPP_MESSAGES.precioMensualBasico(cleanUrl),
    },
  ];

  const extras = [
    {
      id: 'correo_antispam',
      name: 'Blindaje de correo y anti-spam',
      detail: 'Tus correos dejan de caer en spam y nadie puede suplantar tu dominio (SPF, DKIM, DMARC).',
      price: 'S/ 190',
      pricePen: 190,
      href: DEFENSATI_WHATSAPP_MESSAGES.upsellCorreoSpam(cleanUrl),
    },
    {
      id: 'migracion_hosting',
      name: 'Migración segura de hosting',
      detail: 'Trasladamos tu web a un servidor mejor, con respaldo y sin que se caiga.',
      price: isShop ? 'S/ 450' : 'S/ 290',
      pricePen: isShop ? 450 : 290,
      href: DEFENSATI_WHATSAPP_MESSAGES.upsellMigracionHosting(cleanUrl, siteType),
    },
    {
      id: 'velocidad_wpo',
      name: 'Optimización de velocidad',
      detail: 'Tu web carga más rápido en celulares y mejora en Core Web Vitals.',
      price: isShop ? 'S/ 480' : 'S/ 320',
      pricePen: isShop ? 480 : 320,
      href: DEFENSATI_WHATSAPP_MESSAGES.upsellVelocidadWpo(cleanUrl, siteType),
    },
    {
      id: 'legal_anpdp',
      name: 'Adecuación legal (Ley N° 29733)',
      detail: 'Banner de cookies, políticas y cláusulas de consentimiento. Básica S/ 350, integral S/ 500.',
      price: 'Desde S/ 350',
      pricePen: 350,
      href: DEFENSATI_WHATSAPP_MESSAGES.upsellLegalAnpdp(cleanUrl, 'basico'),
    },
    {
      id: 'pasarela_pago',
      name: 'Auditoría de pasarela de pago',
      detail: 'Revisamos tu checkout (Niubiz, Culqi, Izipay, MercadoPago o Stripe) contra robo de datos.',
      price: 'S/ 420',
      pricePen: 420,
      href: DEFENSATI_WHATSAPP_MESSAGES.upsellPasarelaPago(cleanUrl),
    },
  ];

  return (
    <section id="servicios" className="relative w-full max-w-6xl xl:max-w-7xl mx-auto scroll-mt-24 text-left space-y-8 sm:space-y-10">
      <div id="precios" className="absolute -top-24 pointer-events-none" />

      {/* Cabecera */}
      <div className="max-w-3xl space-y-4">
        <p className="text-sm font-semibold text-[#38bdf8]">Precios</p>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#f5f5f7] tracking-[-0.04em] leading-[1.06]">
          Elige según lo que le pasa a tu web.
        </h2>
        <p className="text-base sm:text-lg text-[#a1a1a6] leading-relaxed">
          Tres servicios, precio fijo en soles. Si no sabes cuál necesitas, empieza por el diagnóstico gratuito: no pagas nada hasta saber qué tiene tu web.
        </p>
      </div>

      {/* Selector único de tipo de web */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#86868b]">¿Qué tipo de web tienes?</p>
        <div className="inline-flex p-1 rounded-full bg-white/[0.06] border border-white/10" role="group" aria-label="Tipo de web">
          {[
            { id: 'corp' as const, label: 'Web corporativa' },
            { id: 'ecom' as const, label: 'Tienda online' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={siteType === option.id}
              onClick={() => setSiteType(option.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                siteType === option.id ? 'bg-[#f5f5f7] text-black shadow-md' : 'text-[#d1d1d6] hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tres opciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className="rounded-[28px] sm:rounded-[32px] bg-[#141416] border border-white/10 hover:border-white/20 transition-colors duration-300 p-6 sm:p-8 flex flex-col gap-6"
          >
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold leading-snug" style={{ color: plan.accent }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: plan.accent }} />
                {plan.situation}
              </p>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#f5f5f7] tracking-[-0.03em] leading-tight">{plan.name}</h3>
            </div>

            <div className="space-y-1">
              <p className="flex items-baseline gap-2 flex-wrap">
                <span className="text-5xl sm:text-6xl font-semibold tracking-[-0.045em] text-white tabular-nums">S/ {plan.price}</span>
                <span className="text-sm text-[#a1a1a6]">{plan.unit}</span>
              </p>
              <p className="text-sm text-[#a1a1a6]">{plan.time}</p>
            </div>

            <ul className="space-y-2.5 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-[#d1d1d6] leading-snug">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: plan.accent }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href={plan.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackServiceClick({ serviceName: plan.name, pricePen: plan.price, serviceId: plan.id });
                trackWhatsAppClick({ service: plan.id, placement: 'pricing_card', domain: cleanUrl });
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-semibold text-base transition-all"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span>{plan.cta}</span>
            </a>
          </article>
        ))}
      </div>

      {/* Condiciones en una línea clara */}
      <div className="rounded-[24px] bg-[#0e1118] border border-white/10 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm text-[#d1d1d6] leading-snug">
          <li><strong className="text-white font-semibold">Pagas en dos partes.</strong> Rescate y blindaje: 50 % al empezar y 50 % al verificar. El mantenimiento se paga mes a mes.</li>
          <li><strong className="text-white font-semibold">Yape, Plin o transferencia.</strong> Con factura o boleta electrónica.</li>
          <li><strong className="text-white font-semibold">Sin sorpresas.</strong> El precio que ves es el precio final.</li>
        </ul>
        <a
          href="#escaner-gratis"
          className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white font-semibold text-sm transition-all"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span>Empezar con el diagnóstico gratis</span>
        </a>
      </div>

      {/* Servicios adicionales, plegados */}
      <div className="rounded-[24px] bg-[#141416] border border-white/10 overflow-hidden">
        <button
          type="button"
          aria-expanded={showExtras}
          onClick={() => setShowExtras((prev) => !prev)}
          className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer hover:bg-white/[0.03] transition-colors"
        >
          <span>
            <span className="block text-base sm:text-lg font-semibold text-[#f5f5f7]">Servicios adicionales</span>
            <span className="block text-sm text-[#a1a1a6] leading-snug">Correo, migración, velocidad, adecuación legal y pasarelas de pago.</span>
          </span>
          <ChevronDown className={`w-5 h-5 shrink-0 text-[#38bdf8] transition-transform duration-200 ${showExtras ? 'rotate-180' : ''}`} />
        </button>

        {showExtras && (
          <ul className="border-t border-white/10 divide-y divide-white/10">
            {extras.map((extra) => (
              <li key={extra.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 max-w-xl">
                  <p className="text-base font-semibold text-[#f5f5f7] leading-snug">{extra.name}</p>
                  <p className="text-sm text-[#a1a1a6] leading-snug">{extra.detail}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-lg font-semibold text-white tabular-nums whitespace-nowrap">{extra.price}</span>
                  <a
                    href={extra.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackServiceClick({ serviceName: extra.name, pricePen: extra.pricePen, serviceId: extra.id });
                      trackWhatsAppClick({ service: extra.id, placement: 'pricing_extras', domain: cleanUrl });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/12 text-[#f5f5f7] font-semibold text-sm transition-all"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366] shrink-0" />
                    <span>Consultar</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
