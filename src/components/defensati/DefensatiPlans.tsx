'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import SectionHead from './SectionHead';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackServiceClick, trackWhatsAppClick } from '@/lib/analytics';
import { P, PRICES } from '@/config/catalog';
import { siteConfig } from '@/config/site';

interface Props {
  targetUrl?: string;
}

type SiteType = 'corp' | 'ecom';

/** Botón "+" que gira a "×" al abrir. */
function Toggle({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={`w-9 h-9 shrink-0 grid place-items-center border font-mono text-lg transition-all duration-200 ${
        open ? 'border-[#cfe3ee] text-[#0a0c0f] bg-[#cfe3ee] rotate-45' : 'border-white/15 text-[#cfe3ee] group-hover:border-[#cfe3ee]'
      }`}
    >
      +
    </span>
  );
}

/** Contenedor desplegable con altura animada (CSS grid 0fr → 1fr). */
function Collapse({ open, id, children }: { open: boolean; id?: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ gridTemplateRows: open ? 'minmax(0, 1fr)' : 'minmax(0, 0fr)' }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

export default function DefensatiPlans({ targetUrl }: Props) {
  const cleanUrl = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';
  const [siteType, setSiteType] = useState<SiteType>('corp');
  const [openPlan, setOpenPlan] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const isShop = siteType === 'ecom';

  const plans = [
    {
      id: isShop ? 'rescate_woocommerce' : 'rescate_corporativo',
      situation: 'Mi web ya tiene un problema',
      name: 'Rescate y limpieza de malware',
      price: isShop ? PRICES.rescateTienda : PRICES.rescateCorporativo,
      unit: 'pago único',
      time: 'Resuelto en 24 a 48 horas',
      features: [
        'Respaldo completo de archivos y base de datos antes de intervenir',
        'Eliminación de virus, puertas traseras y scripts espías',
        'Gestión formal del desbloqueo con hosting y Google Safe Browsing',
        'Garantía por escrito de 30 días contra reinfección',
      ],
      cta: 'Solicitar rescate urgente',
      href: isShop
        ? DEFENSATI_WHATSAPP_MESSAGES.precioRescateWooCommerce(cleanUrl)
        : DEFENSATI_WHATSAPP_MESSAGES.precioRescateCorporativo(cleanUrl),
    },
    {
      id: 'blindaje_waf',
      situation: 'Funciona, pero quiero protegerla',
      name: 'Blindaje + Firewall Cloudflare',
      price: PRICES.blindajeWaf,
      unit: 'pago único',
      time: 'Listo en 3 a 5 días hábiles',
      features: [
        'Firewall WAF activo con reglas anti-scraping y anti-DDoS',
        'Cabeceras de seguridad estrictas: HSTS, CSP, X-Frame-Options',
        'Ocultamiento de firmas de servidor, PHP y gestor de contenidos',
        'Si la auditoría no alcanza calificación Grado A, devolvemos el pago',
      ],
      cta: 'Implementar blindaje',
      href: DEFENSATI_WHATSAPP_MESSAGES.precioBlindajeWaf(cleanUrl),
    },
    {
      id: isShop ? 'mantenimiento_tiendas' : 'mantenimiento_basico',
      situation: 'Quiero monitoreo preventivo continuo',
      name: 'Mantenimiento y monitoreo',
      price: isShop ? PRICES.mantenimientoTiendas : PRICES.mantenimientoBasico,
      unit: 'al mes, sin permanencia',
      time: 'Vigilancia continua 24/7',
      features: isShop
        ? [
            'Monitoreo perimetral continuo cada 5 minutos',
            'Alerta inmediata a WhatsApp ante caídas o cambios DNS',
            'Re-escaneo de vulnerabilidades cada semana',
            'Hasta 90 minutos de soporte técnico prioritario al mes',
          ]
        : [
            'Monitoreo perimetral cada 15 minutos',
            'Aviso con 15 días de anticipación al vencimiento de SSL',
            'Reporte mensual técnico consolidado a WhatsApp',
            'Hasta 40 minutos de soporte técnico al mes',
          ],
      cta: 'Activar monitoreo',
      href: isShop
        ? DEFENSATI_WHATSAPP_MESSAGES.precioMensualTiendas(cleanUrl)
        : DEFENSATI_WHATSAPP_MESSAGES.precioMensualBasico(cleanUrl),
    },
  ];

  const extras = [
    {
      id: 'correo_antispam',
      name: 'Blindaje de correo (SPF/DKIM/DMARC)',
      price: P.correoSpfDkimDmarc,
      pricePen: PRICES.correoSpfDkimDmarc,
      href: DEFENSATI_WHATSAPP_MESSAGES.upsellCorreoSpam(cleanUrl),
    },
    {
      id: 'pasarela_pago',
      name: 'Auditoría de pasarela de pago',
      price: P.auditoriaPasarelas,
      pricePen: PRICES.auditoriaPasarelas,
      href: DEFENSATI_WHATSAPP_MESSAGES.upsellPasarelaPago(cleanUrl),
    },
    {
      id: 'migracion_hosting',
      name: 'Migración de hosting sin caída',
      price: isShop ? P.migracionTienda : P.migracionCorporativa,
      pricePen: isShop ? PRICES.migracionTienda : PRICES.migracionCorporativa,
      href: DEFENSATI_WHATSAPP_MESSAGES.upsellMigracionHosting(cleanUrl, isShop ? 'ecom' : 'corp'),
    },
  ];

  return (
    <section id="servicios" className="scroll-mt-24 space-y-10">
      <SectionHead
        index="07"
        label="Contención · Precios"
        title={
          <>
            Precios cerrados,
            <br />
            <span className="text-[#8b97a2]">sin sorpresas.</span>
          </>
        }
      />
      <div className="grid grid-cols-12">
        <div className="col-span-12 lg:col-span-9 lg:col-start-4 space-y-8">
          {/* Tipo de sitio: cambia los precios al instante */}
          <div role="tablist" aria-label="Tipo de sitio" className="inline-flex border ed-line p-1 bg-[#0a0c0f]/70 backdrop-blur-sm">
            {[
              { id: 'corp' as SiteType, label: 'Web corporativa' },
              { id: 'ecom' as SiteType, label: 'Tienda online' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={siteType === id}
                onClick={() => setSiteType(id)}
                className={`hud-label !tracking-[0.18em] px-4 py-2.5 transition-colors duration-75 cursor-pointer select-none ${
                  siteType === id ? '!text-[#0a0c0f] bg-[#e8edf1]' : 'hover:!text-[#e8edf1]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Planes: el precio siempre a la vista, el detalle se despliega */}
          <div className="border-t ed-line">
            {plans.map((plan, i) => {
              const open = openPlan === plan.id;
              const recommended = plan.id === 'blindaje_waf';
              return (
                <article
                  key={plan.id}
                  className={`border-b ed-line backdrop-blur-sm transition-colors duration-150 ${
                    open ? 'bg-[#0a0c0f]/85' : 'bg-[#0a0c0f]/45 hover:bg-[#0a0c0f]/75'
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`plan-${plan.id}`}
                    onClick={() => setOpenPlan(open ? null : plan.id)}
                    className="w-full grid grid-cols-12 items-center gap-x-4 gap-y-3 px-3 sm:px-5 py-5 sm:py-6 text-left cursor-pointer group focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#cfe3ee]"
                  >
                    <span className="col-span-2 sm:col-span-1 font-mono text-[11px] tracking-[0.2em] text-[#7d8891]">0{i + 1}</span>
                    <span className="col-span-10 sm:col-span-6">
                      <span className="hud-label block">
                        {plan.situation}
                        {recommended && <span className="ml-2 !text-[#0a0c0f] bg-[#cfe3ee] px-1.5 py-0.5">Recomendado</span>}
                      </span>
                      <span className="mt-1.5 block text-xl sm:text-2xl font-light tracking-tight text-[#e8edf1]">{plan.name}</span>
                    </span>
                    <span className="col-span-9 col-start-3 sm:col-span-4 sm:col-start-auto sm:text-right">
                      <span className="block text-4xl sm:text-5xl font-light tracking-[-0.04em] text-[#e8edf1] tabular-nums">
                        S/ {plan.price}
                      </span>
                      <span className="hud-label block mt-1">{plan.unit}</span>
                    </span>
                    <span className="col-span-1 justify-self-end">
                      <Toggle open={open} />
                    </span>
                  </button>
                  <Collapse open={open} id={`plan-${plan.id}`}>
                    <div className="grid grid-cols-12 gap-x-4 gap-y-5 px-3 sm:px-5 pb-6">
                      <ul className="col-span-12 sm:col-span-6 sm:col-start-2 space-y-2">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="text-sm text-[#9aa6af] leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-[#4a535b]"
                          >
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="col-span-12 sm:col-span-5 flex flex-col sm:items-end justify-between gap-4">
                        <p className="hud-label">{plan.time}</p>
                        <a
                          href={plan.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            trackServiceClick({ serviceName: plan.name, pricePen: plan.price, serviceId: plan.id });
                            trackWhatsAppClick({ service: plan.id, placement: 'pricing_card', domain: cleanUrl });
                          }}
                          className={`hud-btn group/btn ${recommended ? 'hud-btn-solid' : ''}`}
                        >
                          <span>{plan.cta}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                        </a>
                      </div>
                    </div>
                  </Collapse>
                </article>
              );
            })}
          </div>

          {/* Condiciones en una línea; el detalle se despliega */}
          <div className="border-b ed-line">
            <button
              type="button"
              aria-expanded={showTerms}
              onClick={() => setShowTerms((v) => !v)}
              className="w-full flex items-center justify-between gap-4 py-3 text-left cursor-pointer group"
            >
              <span className="hud-label !tracking-[0.18em] group-hover:!text-[#e8edf1]">
                50% al iniciar · Factura o boleta · Sin permanencia
              </span>
              <Toggle open={showTerms} />
            </button>
            <Collapse open={showTerms}>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm pb-4">
                <div>
                  <dt className="hud-label">Pago</dt>
                  <dd className="mt-1 text-[#9aa6af]">50% al iniciar y 50% tras verificar la mejora.</dd>
                </div>
                <div>
                  <dt className="hud-label">Comprobante</dt>
                  <dd className="mt-1 text-[#9aa6af]">Factura o boleta con RUC {siteConfig.business.ruc}.</dd>
                </div>
                <div>
                  <dt className="hud-label">Permanencia</dt>
                  <dd className="mt-1 text-[#9aa6af]">Ninguna. El monitoreo se cancela cuando quieras.</dd>
                </div>
              </dl>
            </Collapse>
          </div>

          {/* Servicios complementarios */}
          <div className="border-b ed-line">
            <button
              type="button"
              aria-expanded={showExtras}
              onClick={() => setShowExtras((v) => !v)}
              className="w-full flex items-center justify-between gap-4 py-3 text-left cursor-pointer group"
            >
              <span className="hud-label !tracking-[0.18em] group-hover:!text-[#e8edf1]">
                Servicios complementarios · {extras.length}
              </span>
              <Toggle open={showExtras} />
            </button>
            <Collapse open={showExtras}>
              <ul className="pb-2">
                {extras.map((extra) => (
                  <li key={extra.id} className="border-t ed-line">
                    <a
                      href={extra.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackServiceClick({ serviceName: extra.name, pricePen: extra.pricePen, serviceId: extra.id });
                        trackWhatsAppClick({ service: extra.id, placement: 'pricing_extras', domain: cleanUrl });
                      }}
                      className="flex items-baseline justify-between gap-4 py-4 px-2 -mx-2 text-[#e8edf1] transition-colors duration-75 hover:bg-[#e8edf1] hover:text-[#0a0c0f]"
                    >
                      <span className="text-base font-light">{extra.name}</span>
                      <span className="font-mono text-sm shrink-0 tabular-nums">{extra.price} →</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Collapse>
          </div>
        </div>
      </div>
    </section>
  );
}
