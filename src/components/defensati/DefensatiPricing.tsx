'use client';

import React from 'react';
import { Check, Zap, Sparkles, MessageCircle, ShieldCheck, Clock, ShieldAlert, Shield, Activity } from 'lucide-react';
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
      badge: 'Oferta Principal • Rescate Inmediato',
      badgeColor: 'bg-rose-500/20 border-rose-400/60 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
      price: 'Desde S/ 250',
      period: 'pago único (según complejidad)',
      description: 'Oferta principal para sitios que ya presentan virus, redirecciones extrañas, pantallas rojas o bloqueos de Google.',
      features: [
        'Diagnóstico previo de infección sin costo',
        'Desinfección profunda de archivos y CMS',
        'Eliminación de virus, malware y backdoors',
        'Recuperación de acceso al panel de administración',
        'Garantía de 30 días si reinfecta por la misma causa',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioLimpieza(cleanUrl),
      btnText: 'Consultar Limpieza de WordPress',
      btnStyle: 'bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-[0_4px_25px_rgba(244,63,94,0.45)] hover:shadow-[0_6px_35px_rgba(244,63,94,0.65)]',
      cardStyle: 'bg-gradient-to-b from-[#201018]/90 via-[#150b12]/90 to-[#0b060a]/95 border border-rose-500/40 hover:border-rose-400/80 shadow-[0_12px_45px_rgba(244,63,94,0.18)] hover:shadow-[0_16px_60px_rgba(244,63,94,0.32)]',
      glowColor: 'bg-rose-500/20',
      iconColor: 'text-rose-400',
      priceColor: 'drop-shadow-[0_0_18px_rgba(244,63,94,0.45)]',
      icon: ShieldAlert,
      highlight: false,
      extraNote: 'Se cotiza previamente según el nivel de complejidad.',
    },
    {
      id: 'blindaje',
      name: 'Blindaje de sitios web',
      badge: 'Configuración Esencial Recomendada',
      badgeColor: 'bg-sky-500/20 border-sky-400/60 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.35)]',
      price: 'S/ 165',
      period: 'pago único por sitio web',
      description: 'Auditoría y fortalecimiento de configuración técnica para proteger tu web contra ataques comunes e inyecciones.',
      features: [
        'Cabeceras de seguridad estrictas (HSTS, CSP, X-Frame)',
        'Ocultamiento de versiones de servidor y CMS',
        'Actualización segura de CMS (WordPress) y plugins',
        'Endurecimiento de accesos y credenciales de admin',
        'Entrega rápida llave en mano sin tocar datos privados',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioBlindaje(cleanUrl),
      btnText: 'Pedir Blindaje de Sitio Web (S/ 165)',
      btnStyle: 'bg-gradient-to-r from-[#0071e3] via-[#2997ff] to-[#38bdf8] hover:from-[#0077ed] hover:to-[#60a5fa] text-white shadow-[0_4px_25px_rgba(0,113,227,0.5)] hover:shadow-[0_6px_35px_rgba(0,113,227,0.7)]',
      cardStyle: 'bg-gradient-to-b from-[#0e192c]/90 via-[#0a1220]/90 to-[#060a12]/95 border border-sky-500/40 hover:border-sky-400/80 shadow-[0_12px_45px_rgba(56,189,248,0.18)] hover:shadow-[0_16px_60px_rgba(56,189,248,0.32)]',
      glowColor: 'bg-sky-500/20',
      iconColor: 'text-sky-400',
      priceColor: 'drop-shadow-[0_0_18px_rgba(56,189,248,0.45)]',
      icon: Shield,
      highlight: false,
      extraNote: 'Auditoría y fortalecimiento de configuración.',
    },
    {
      id: 'blindaje-waf',
      name: 'Protección mediante WAF',
      badge: '★ Máxima Protección • La Más Elegida',
      badgeColor: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold border border-indigo-300/60 shadow-[0_0_20px_rgba(99,102,241,0.6)] uppercase tracking-wider',
      price: 'Desde S/ 335',
      period: 'pago único de implementación',
      description: 'Incluye todo el Blindaje Básico + configuración experta de Firewall de Aplicaciones Web (WAF) contra ataques masivos.',
      features: [
        'Todo lo incluido en el Blindaje de sitios web (S/ 165)',
        'Configuración profesional de WAF perimetral (Cloudflare)',
        'Reglas activas anti-bots maliciosos y scrapers',
        'Mitigación de ataques DDoS de capa 7',
        'Filtro contra inyecciones SQL y ataques web',
      ],
      optionalAddon: '* Incluye configuración experta de WAF; el plan WAF de terceros puede ir aparte si aplica.',
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioBlindajeWaf(cleanUrl),
      btnText: 'Pedir Protección mediante WAF (Desde S/ 335)',
      btnStyle: 'bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#8b5cf6] hover:from-[#4338ca] hover:to-[#7c3aed] text-white shadow-[0_4px_30px_rgba(99,102,241,0.65)] hover:shadow-[0_6px_40px_rgba(99,102,241,0.85)]',
      cardStyle: 'bg-gradient-to-b from-[#181d3d]/95 via-[#11152e]/95 to-[#0a0d1d]/98 border-2 border-[#818cf8] shadow-[0_15px_55px_rgba(99,102,241,0.35)] hover:shadow-[0_20px_75px_rgba(99,102,241,0.6)] ring-1 ring-[#818cf8]/40',
      glowColor: 'bg-indigo-500/25',
      iconColor: 'text-indigo-300',
      priceColor: 'drop-shadow-[0_0_22px_rgba(129,140,248,0.6)]',
      icon: Sparkles,
      highlight: true,
      extraNote: 'Configuración perimetral de WAF llave en mano.',
    },
    {
      id: 'vigilancia',
      name: 'Monitoreo y mantenimiento mensual',
      badge: 'Tranquilidad Continua • Escudo Activo',
      badgeColor: 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.35)]',
      price: 'S/ 49 / S/ 99',
      period: 'Esencial S/ 49/mes • Pro S/ 99/mes',
      description: 'Monitoreo proactivo con alcance y límites por escrito para detectar caídas y fallas antes que tus clientes.',
      features: [
        'Plan Esencial (S/ 49/mes): Uptime cada 15 min + aviso inmediato',
        'Alerta preventiva ante vencimiento del certificado SSL (30 días)',
        'Re-escaneo mensual de seguridad con informe a tu WhatsApp',
        'Nivel Pro (S/ 99/mes): Uptime cada 5 min + escaneos semanales',
        'Soporte manual incluido: máx. 30 min/mes (Esencial) | 1.5 h/mes (Pro)',
        'Alcance y límites por escrito: cancela en cualquier momento',
      ],
      whatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioMensual(cleanUrl),
      secondaryWhatsappUrl: DEFENSATI_WHATSAPP_MESSAGES.precioMensualPro(cleanUrl),
      btnText: 'Activar Plan Esencial (S/ 49/mes)',
      secondaryBtnText: 'Contratar Plan Pro (S/ 99/mes)',
      btnStyle: 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-[0_4px_25px_rgba(16,185,129,0.45)] hover:shadow-[0_6px_35px_rgba(16,185,129,0.65)]',
      cardStyle: 'bg-gradient-to-b from-[#0c241b]/90 via-[#081912]/90 to-[#050f0c]/95 border border-emerald-500/40 hover:border-emerald-400/80 shadow-[0_12px_45px_rgba(16,185,129,0.18)] hover:shadow-[0_16px_60px_rgba(16,185,129,0.32)]',
      glowColor: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      priceColor: 'drop-shadow-[0_0_18px_rgba(16,185,129,0.45)]',
      icon: Activity,
      highlight: false,
      extraNote: 'Alcance y límites por escrito. Sin penalizaciones.',
    },
  ];

  return (
    <section id="precios" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-10 scroll-mt-24 relative">
      
      {/* Luces difusas de fondo para dar calidez y color al contenedor */}
      <div className="absolute -top-10 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Cabecera Estilo Apple Pro */}
      <div className="text-center space-y-3 max-w-3xl mx-auto p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-[#141828]/90 via-[#0f1220]/90 to-[#0a0d18]/95 border border-sky-500/30 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,113,227,0.18)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/35 text-[#38bdf8] text-xs font-semibold tracking-tight shadow-[0_0_15px_rgba(56,189,248,0.25)]">
          <Zap className="w-3.5 h-3.5" />
          <span>Precios transparentes en Soles &bull; RUC 10704877850</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-300 tracking-tight leading-tight">
          Elige la solución que tu web necesita
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
          Sin costos ocultos ni letras pequeñas. Te mostramos el diagnóstico antes de que decidas.
        </p>
      </div>

      {/* Banner Diagnóstico Inicial Gratis (Gancho comercial vibrante) */}
      <div className="rounded-[28px] bg-gradient-to-r from-emerald-950/60 via-[#0a1813] to-emerald-950/60 border-2 border-emerald-400/50 p-6 sm:p-7 backdrop-blur-2xl shadow-[0_0_40px_rgba(16,185,129,0.22)] flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <ShieldCheck className="w-7 h-7 text-[#34d399]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <span>Gancho Comercial</span>
              <span>&bull;</span>
              <span>100% Sin Costo</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Diagnóstico previo gratuito
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal mt-0.5">
              Revisiones pasivas de cabeceras, SSL y puertos. Te mostramos qué encontramos antes de que pagues.
            </p>
          </div>
        </div>

        <a
          href="#escaner-gratis"
          className="shrink-0 px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-95 text-black font-extrabold text-sm shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all cursor-pointer whitespace-nowrap relative z-10"
        >
          Probar escáner gratis &darr;
        </a>
      </div>

      {/* Grid de 4 Tarjetas de Servicios y Blindaje (Ultra llamativo y vibrante) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch relative z-10">
        {plans.map((plan) => {
          const PlanIcon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`p-6 sm:p-8 rounded-[32px] flex flex-col justify-between transition-all duration-300 relative overflow-hidden backdrop-blur-2xl ${plan.cardStyle}`}
            >
              {/* Glow ambiental interno en la esquina */}
              <div className={`absolute top-0 right-0 w-48 h-48 ${plan.glowColor} rounded-full blur-3xl pointer-events-none`} />

              <div className="space-y-4 relative z-10">
                {/* Badge del plan + Icono temático */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                  <div className={`w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center ${plan.iconColor} shadow-inner`}>
                    <PlanIcon className="w-5 h-5" />
                  </div>
                </div>

                {/* Título y descripción */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                    {plan.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-2 font-normal">
                    {plan.description}
                  </p>
                </div>

                {/* Precio con realce y drop-shadow */}
                <div className="py-4 my-2 border-y border-white/15 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 bg-white/[0.02] px-4 rounded-2xl">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl sm:text-4xl font-black text-white tracking-tight font-mono whitespace-nowrap ${plan.priceColor}`}>
                      {plan.price}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-neutral-300 font-medium sm:text-right">
                    {plan.period}
                  </span>
                </div>

                {/* Lista de características */}
                <ul className="space-y-3 pt-2">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
                      <Check className={`w-4 h-4 ${plan.iconColor} shrink-0 mt-0.5`} />
                      <span className="whitespace-normal">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Nota opcional de WAF */}
                {plan.optionalAddon && (
                  <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-400/40 text-indigo-200 text-xs sm:text-sm flex items-start gap-2.5 leading-relaxed mt-3 shadow-inner">
                    <Sparkles className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
                    <span>{plan.optionalAddon}</span>
                  </div>
                )}
              </div>

              {/* Botón WhatsApp de Acción con Gradiente Llamativo */}
              <div className="pt-6 space-y-2.5 relative z-10">
                <a
                  href={plan.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-4 px-6 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer text-center active:scale-[0.98] ${plan.btnStyle}`}
                >
                  <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                  <span className="leading-snug">{plan.btnText}</span>
                </a>

                {plan.secondaryWhatsappUrl && (
                  <a
                    href={plan.secondaryWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-5 rounded-full text-xs sm:text-sm font-bold text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/50 flex items-center justify-center gap-2 transition-all cursor-pointer text-center shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                  >
                    <span>{plan.secondaryBtnText || 'Ver Plan Pro (S/ 99)'}</span>
                    <span>&rarr;</span>
                  </a>
                )}

                <p className="text-xs text-center text-neutral-400 leading-tight font-medium pt-1">
                  {plan.extraNote}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalle y Límites Técnicos del Monitoreo Mensual (S/ 49 vs S/ 99) */}
      <div className="rounded-[32px] bg-gradient-to-b from-[#101524]/90 via-[#0b0e19]/90 to-[#070912]/95 border border-sky-500/30 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,113,227,0.15)] space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-200 text-xs font-bold shadow-[0_0_12px_rgba(56,189,248,0.25)]">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Transparencia Técnica &amp; Operativa</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Límites y Alcance del Monitoreo Mensual por Escrito
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl font-normal">
              Un servicio de monitoreo asequible solo es rentable y rápido si el 95% es automatizado y el soporte manual está acotado por escrito. Conoce los detalles de cada nivel:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Plan Esencial S/ 49 */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.1)] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/40">Nivel Esencial</span>
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
                  <span><strong>Canal de aviso:</strong> Notificación inmediata vía WhatsApp y correo del administrador.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Soporte manual incluido:</strong> Hasta 30 minutos al mes para soporte preventivo o consultas menores.</span>
                </li>
              </ul>
            </div>
            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioMensual(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 text-xs font-bold text-center transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              Pedir Plan Esencial por WhatsApp &rarr;
            </a>
          </div>

          {/* Plan Pro S/ 99 */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-sky-500/30 hover:border-sky-500/60 shadow-[0_0_20px_rgba(56,189,248,0.1)] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300 bg-sky-500/20 px-2.5 py-1 rounded-full border border-sky-500/40">Nivel Pro</span>
                <span className="text-xl font-bold text-white font-mono">S/ 99 <span className="text-xs font-normal text-neutral-400">/ mes</span></span>
              </div>
              <h4 className="text-base font-semibold text-white">Vigilancia Crítica &amp; Remediación Prioritaria</h4>
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Qué se monitorea:</strong> Uptime HTTP/HTTPS, SSL/TLS, verificación semanal de malware y estado de cabeceras.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Frecuencia:</strong> Uptime check cada 5 min. Escaneo perimetral semanal con informe directo a tu WhatsApp.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Canal de aviso:</strong> Aviso prioritario directo a WhatsApp con reporte técnico listo para el webmaster.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Soporte manual incluido:</strong> Hasta 1.5 horas al mes para aplicación de parches o mitigación de incidentes.</span>
                </li>
              </ul>
            </div>
            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioMensualPro(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-200 text-xs font-bold text-center transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]"
            >
              Pedir Plan Pro por WhatsApp &rarr;
            </a>
          </div>
        </div>
      </div>

    </section>
  );
}
