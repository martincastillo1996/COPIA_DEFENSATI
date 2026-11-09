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
      badgeColor: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
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
      badgeColor: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
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
      badgeColor: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
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
      
      {/* Cabecera */}
      <div className="text-center space-y-3 max-w-2xl mx-auto p-6 sm:p-7 rounded-3xl bg-[#141416]/90 border border-white/10 backdrop-blur-2xl shadow-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-sky-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Precios transparentes en Soles</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
          Elige la solución que tu web necesita
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Sin costos ocultos ni letras pequeñas. Te mostramos el diagnóstico antes de que decidas.
        </p>
      </div>

      {/* Grid de 3 Tarjetas (Mobile first: apiladas verticalmente en móvil, 3 columnas en desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 sm:p-7 rounded-3xl flex flex-col justify-between transition-all duration-300 relative ${
              plan.highlight
                ? 'bg-linear-to-b from-[#161c28] to-[#0e121a] border-2 border-[#0071e3] shadow-[0_0_40px_rgba(0,113,227,0.25)] md:-translate-y-2'
                : 'bg-[#141416]/90 border border-white/10 hover:border-white/20 shadow-xl'
            }`}
          >
            {/* Glow sutil para tarjeta recomendada */}
            {plan.highlight && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            )}

            <div className="space-y-5">
              {/* Badge del plan */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${plan.badgeColor} uppercase tracking-wider`}>
                  {plan.badge}
                </span>
              </div>

              {/* Título y descripción */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {plan.name}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed mt-2 min-h-[38px]">
                  {plan.description}
                </p>
              </div>

              {/* Precio */}
              <div className="pt-2 pb-1 border-y border-white/10">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                    {plan.price}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 block mt-1 font-medium">
                  {plan.period}
                </span>
              </div>

              {/* Lista de características */}
              <ul className="space-y-3 pt-2">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-xs text-neutral-200 leading-snug">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Extra opcional dentro de Blindaje */}
              {plan.optionalAddon && (
                <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 text-sky-200 text-xs flex items-start gap-2 leading-relaxed">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{plan.optionalAddon}</span>
                </div>
              )}
            </div>

            {/* Botón WhatsApp */}
            <div className="pt-6 space-y-2">
              <a
                href={plan.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  plan.highlight
                    ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-lg shadow-[#0071e3]/30 active:scale-[0.98]'
                    : 'bg-white/10 hover:bg-white/15 text-white border border-white/15 active:scale-[0.98]'
                }`}
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>{plan.btnText}</span>
              </a>

              <p className="text-[10px] text-center text-neutral-400 leading-tight">
                {plan.extraNote}
              </p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
