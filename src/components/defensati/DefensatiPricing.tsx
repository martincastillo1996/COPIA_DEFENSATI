'use client';

import React from 'react';
import { Check, Zap, Sparkles, MessageCircle } from 'lucide-react';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

interface Props {
  targetUrl?: string;
}

export default function DefensatiPricing({ targetUrl }: Props) {
  const cleanUrl = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';

  const plans = [
    {
      id: 'limpieza',
      name: 'Limpieza de web hackeada',
      badge: 'Atención de Emergencia',
      badgeColor: 'bg-rose-500/10 border-rose-500/25 text-rose-300',
      price: 'Desde S/ 250',
      period: 'pago único (se cotiza según el caso)',
      description: 'Para sitios que ya presentan redirecciones extrañas, avisos de virus de Google o código malicioso inyectado.',
      features: [
        'Diagnóstico previo de infección sin costo',
        'Desinfección profunda de malware y virus',
        'Eliminación de scripts maliciosos y backdoors',
        'Recuperación de acceso al panel administrativo',
        'Limpieza de archivos infectados con reporte',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioLimpieza(cleanUrl),
      btnText: 'Consultar Limpieza',
      highlight: false,
      extraNote: 'Cotización exacta previa según el nivel de infección.',
    },
    {
      id: 'blindaje',
      name: 'Blindaje',
      badge: 'Más Solicitado • Recomendado',
      badgeColor: 'bg-[#2997ff]/10 border-[#2997ff]/25 text-[#38bdf8]',
      price: 'S/ 165',
      period: 'pago único por sitio web',
      description: 'Configuración técnica perimetral para proteger tu web contra intentos de hackeo y robo de información.',
      features: [
        'Cabeceras de seguridad estrictas (HSTS, CSP, X-Frame-Options)',
        'Ocultamiento de versiones de servidor y CMS para frenar robots',
        'Actualización segura de CMS (WordPress) y plugins',
        'Endurecimiento de accesos y contraseñas',
        'Entrega rápida llave en mano sin tocar tus datos privados',
      ],
      optionalAddon: 'Extra opcional: WAF perimetral activo para bloqueo de ataques avanzados y bots maliciosos.',
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioBlindaje(cleanUrl),
      btnText: 'Pedir Blindaje',
      highlight: true,
      extraNote: 'Implementación profesional directa en tu servidor o Cloudflare.',
    },
    {
      id: 'vigilancia',
      name: 'Vigilancia mensual',
      badge: 'Tranquilidad Continua',
      badgeColor: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
      price: 'S/ 49',
      period: 'al mes (sin contratos forzosos)',
      description: 'Monitoreo proactivo de tu página para enterarte de cualquier falla o vencimiento antes que tus clientes.',
      features: [
        'Aviso inmediato de caídas de tu página web',
        'Alerta preventiva ante vencimiento del certificado SSL',
        'Re-escaneo mensual de seguridad con informe a tu WhatsApp',
        'Revisión periódica de nuevas vulnerabilidades',
        'Canal de soporte directo para dudas o consultas de seguridad',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioMensual(cleanUrl),
      btnText: 'Activar Vigilancia',
      highlight: false,
      extraNote: 'Cancela en cualquier momento sin penalizaciones.',
    },
  ];

  return (
    <section id="precios" className="w-full max-w-5xl mx-auto space-y-8 scroll-mt-24 px-4 sm:px-6">
      
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

      {/* Grid de 3 Tarjetas (Apple Pro Dark Glass) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 sm:p-8 rounded-[28px] flex flex-col justify-between transition-all duration-300 relative ${
              plan.highlight
                ? 'bg-linear-to-b from-[#141b26] to-[#0f141d] border-2 border-[#0071e3] shadow-[0_20px_50px_rgba(0,113,227,0.25)] md:-translate-y-2'
                : 'bg-[#121214]/80 border border-white/10 hover:border-white/20 shadow-xl backdrop-blur-2xl'
            }`}
          >
            {/* Glow sutil para tarjeta recomendada */}
            {plan.highlight && (
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            )}

            <div className="space-y-5">
              {/* Badge del plan */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${plan.badgeColor} tracking-tight`}>
                  {plan.badge}
                </span>
              </div>

              {/* Título y descripción */}
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#f5f5f7] tracking-tight leading-snug">
                  {plan.name}
                </h3>
                <p className="text-sm text-[#a1a1a6] leading-relaxed mt-2 min-h-[42px] font-normal">
                  {plan.description}
                </p>
              </div>

              {/* Precio */}
              <div className="pt-3 pb-2 border-y border-white/10">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-semibold text-[#f5f5f7] tracking-tight font-mono">
                    {plan.price}
                  </span>
                </div>
                <span className="text-xs text-[#86868b] block mt-1 font-normal">
                  {plan.period}
                </span>
              </div>

              {/* Lista de características */}
              <ul className="space-y-3 pt-2">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-sm text-[#d1d5db] leading-snug font-normal">
                    <Check className="w-4 h-4 text-[#30d158] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Extra opcional dentro de Blindaje */}
              {plan.optionalAddon && (
                <div className="p-3.5 rounded-2xl bg-sky-950/20 border border-sky-500/25 text-sky-200 text-xs sm:text-sm flex items-start gap-2.5 leading-relaxed">
                  <Sparkles className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                  <span>{plan.optionalAddon}</span>
                </div>
              )}
            </div>

            {/* Botón WhatsApp Estilo Apple Pill */}
            <div className="pt-6 space-y-2">
              <a
                href={plan.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 px-5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  plan.highlight
                    ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-lg shadow-[#0071e3]/30 active:scale-[0.98]'
                    : 'bg-white/[0.08] hover:bg-white/[0.12] text-[#f5f5f7] border border-white/15 active:scale-[0.98]'
                }`}
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>{plan.btnText}</span>
              </a>

              <p className="text-xs text-center text-[#86868b] leading-tight font-normal">
                {plan.extraNote}
              </p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
