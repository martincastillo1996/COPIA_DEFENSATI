'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  Shield, 
  Lock, 
  Clock,
  Sparkles,
  ShoppingBag,
  Globe,
  Flame,
  Radio
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackServiceClick, trackWhatsAppClick } from '@/lib/analytics';

interface Props {
  targetUrl?: string;
}

export default function DefensatiPricing({ targetUrl }: Props) {
  const cleanUrl = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';
  const [selectedPlanType, setSelectedPlanType] = useState<'corp' | 'ecom'>('corp');

  return (
    <section id="servicios" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-8 scroll-mt-24 text-left relative">
      <div id="precios" className="absolute -top-24 pointer-events-none" />
      
      {/* Cabecera Estilo Apple Pro */}
      <div className="space-y-2 border-b border-white/10 pb-5 max-w-4xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#2997ff] font-semibold px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/12 inline-block">
          PAQUETES COMPLETOS DE CIBERSEGURIDAD
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold text-[#f5f5f7] tracking-[-0.03em] leading-tight pt-2">
          Todo en uno: Rescate, Blindaje y 3 meses de Monitoreo
        </h2>
        <p className="text-base sm:text-lg text-[#86868b] font-normal">
          No vendemos parches a medias. Limpiamos la infección, blindamos tu servidor con Cloudflare WAF y vigilamos tu web por 3 meses completos para que nunca más te vuelva a pasar.
        </p>
      </div>

      {/* 1. TARJETA INSIGNIA PRINCIPAL: PAQUETE TODO EN UNO (Rescate + Blindaje WAF + 3 Meses Monitoreo) */}
      <div className="p-7 sm:p-12 rounded-[32px] sm:rounded-[36px] bg-gradient-to-b from-[#10192e]/90 via-[#121622]/90 to-[#0c0e14] border-2 border-[#2997ff]/40 hover:border-[#2997ff]/60 shadow-[0_30px_80px_rgba(41,151,255,0.18),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-3xl relative overflow-hidden transition-all">
        
        {/* Aura sutil */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0071e3]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          
          {/* Badge superior y Plazos */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <span className="text-xs uppercase tracking-widest font-mono text-[#38bdf8] font-bold px-3.5 py-1.5 rounded-full bg-[#0071e3]/20 border border-[#0071e3]/35 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              OFERTA INSIGNIA TODO INCLUIDO • LLAVE EN MANO
            </span>
            <span className="text-xs text-[#86868b] flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              Desinfección en 24-48h hábiles &bull; Blindaje y WAF en 3-5 días
            </span>
          </div>

          {/* Selector de Modalidad: Web Corporativa vs E-commerce */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                Selecciona el tipo de sitio:
              </span>
              <div className="inline-flex p-1 rounded-2xl bg-white/[0.06] border border-white/12">
                <button
                  type="button"
                  onClick={() => setSelectedPlanType('corp')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedPlanType === 'corp'
                      ? 'bg-[#0071e3] text-white shadow-lg shadow-[#0071e3]/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Web Corporativa / Blog (S/ 600)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlanType('ecom')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedPlanType === 'ecom'
                      ? 'bg-[#0071e3] text-white shadow-lg shadow-[#0071e3]/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>E-commerce / Tienda Online (S/ 850)</span>
                </button>
              </div>
            </div>

            {/* Título y Precio Dinámico */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-[#f5f5f7] tracking-tight leading-tight">
                    Rescate + Blindaje WAF Cloudflare + 3 Meses de Monitoreo
                  </h3>
                  <p className="text-sm sm:text-base text-[#86868b] mt-1 font-normal">
                    {selectedPlanType === 'corp'
                      ? 'Para sitios web corporativos, institucionales, blogs y portafolios en WordPress, Wix o a medida.'
                      : 'Para tiendas online transaccionales con pasarelas de pago y carritos (WooCommerce, Shopify o Wix).'}
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-white font-mono">
                    {selectedPlanType === 'corp' ? 'S/ 600' : 'S/ 850'}
                  </div>
                  <span className="text-xs text-[#86868b] font-mono">Pago único • Sin mensualidades forzosas</span>
                </div>
              </div>

              {/* Banner de Garantía y Monitoreo Incluido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Garantía por escrito de 30 días:</strong> si tu web vuelve a infectarse por la causa remediada, la resuelvo gratis.
                  </span>
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-sky-200 text-xs sm:text-sm flex items-center gap-3">
                  <Radio className="w-5 h-5 text-sky-400 shrink-0" />
                  <span>
                    <strong>3 meses de monitoreo 24/7 incluidos:</strong> alertas inmediatas a WhatsApp ante caídas y reportes mensuales.
                  </span>
                </div>
              </div>
            </div>

            {/* Todo lo que incluye el paquete */}
            <div className="pt-2">
              <span className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-semibold block mb-3">
                ¿Qué incluye este paquete llave en mano?
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Rescate & Desinfección Forense:</strong> Respaldo integral previo y eliminación de virus, malware, backdoors, spam y webshells.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Recuperación de Hosting y Google:</strong> Gestión directa de desbloqueo con el soporte del hosting y retiro de pantalla roja.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Blindaje Perimetral Estricto:</strong> Implementación de cabeceras canónicas (HSTS, CSP, X-Frame) y ocultamiento de versiones.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Firewall WAF en Cloudflare:</strong> Reglas activas contra bots fraudulentos, scrapers, ataques de denegación DDoS y fuerza bruta.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Endurecimiento DNS Anti-Suplantación:</strong> Configuración estricta de registros SPF, DKIM y DMARC para proteger tus correos corporativos.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>3 Meses de Vigilancia 24/7:</strong> Chequeos continuos de disponibilidad y alerta directa a tu WhatsApp personal ante cualquier caída.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Yo mismo reviso tu web:</strong> Auditoría y ejecución técnica personal por Martín Castillo. Sin intermediarios ni juniors.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Comprobante Formal con RUC:</strong> Emisión de Factura o Boleta Electrónica con RUC 10704877850 para deducción fiscal.</span>
                </div>
              </div>
            </div>

            {/* Botones de Conversión */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={
                  selectedPlanType === 'corp'
                    ? DEFENSATI_WHATSAPP_MESSAGES.precioPackCorp(cleanUrl)
                    : DEFENSATI_WHATSAPP_MESSAGES.precioPackEcom(cleanUrl)
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackServiceClick({
                    serviceName: selectedPlanType === 'corp' ? 'Pack Todo Incluido Corporativo' : 'Pack Todo Incluido E-commerce',
                    pricePen: selectedPlanType === 'corp' ? 600 : 850,
                    serviceId: selectedPlanType === 'corp' ? 'pack_corp' : 'pack_ecom',
                  });
                  trackWhatsAppClick({
                    service: selectedPlanType === 'corp' ? 'pack_corp' : 'pack_ecom',
                    placement: 'pricing_flagship_pack',
                    domain: cleanUrl,
                  });
                }}
                className="w-full sm:w-auto flex-1 py-4 px-8 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-[0_4px_24px_rgba(37,211,102,0.35)] transition-all cursor-pointer text-center"
              >
                <WhatsAppIcon className="w-5 h-5 fill-current shrink-0" />
                <span>
                  {selectedPlanType === 'corp'
                    ? 'Contratar Pack Todo Incluido Web Corporativa (S/ 600)'
                    : 'Contratar Pack Todo Incluido E-commerce (S/ 850)'}
                </span>
              </a>

              <a
                href="#contratar"
                className="w-full sm:w-auto py-4 px-6 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold text-sm border border-white/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Llenar solicitud con RUC</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* 2. OPCIONES ADICIONALES: RESCATE DE EMERGENCIA PUNTUAL & MONITOREO MENSUAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Tarjeta: Rescate de Emergencia Puntual */}
        <div className="p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] bg-[#161618]/70 border border-rose-500/25 hover:border-rose-500/45 transition-all flex flex-col justify-between space-y-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Flame className="w-6 h-6 text-rose-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#86868b] flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10">
                  <Clock className="w-3 h-3 text-rose-400" />
                  24 a 48h hábiles
                </span>
                <span className="text-[11px] font-mono text-rose-300 uppercase tracking-wider bg-rose-500/15 px-3 py-1 rounded-full border border-rose-500/25">
                  Solo Emergencia
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xl sm:text-2xl font-bold text-[#f5f5f7] tracking-tight">
                Rescate de Emergencia Puntual
              </h4>
              <p className="text-3xl sm:text-4xl font-bold text-[#f5f5f7] font-mono mt-1">
                S/ 450 – S/ 650 <span className="text-xs text-[#86868b] font-normal font-sans">por emergencia</span>
              </p>
              <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed mt-2 font-normal">
                Para sitios caídos o infectados donde solo necesitas apagar el incendio inmediato sin contratar el blindaje perimetral ni el monitoreo extendido.
              </p>
            </div>

            <ul className="space-y-2.5 pt-3 border-t border-white/10 text-xs sm:text-sm text-neutral-200">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Diagnóstico forense previo sin costo para ver qué encontramos.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Copia de seguridad forense integral previa a intervenir.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Eliminación de virus, malware, scripts de spam y backdoors.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Gestión de desbloqueo con el hosting y retiro de pantalla roja en Google.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Garantía formal de 30 días si reinfecta por la misma causa.</span>
              </li>
            </ul>
          </div>

          <a
            href={DEFENSATI_WHATSAPP_MESSAGES.precioRescateEmergencia(cleanUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackServiceClick({
                serviceName: 'Rescate de Emergencia Puntual',
                pricePen: 450,
                serviceId: 'rescate_emergencia',
              });
              trackWhatsAppClick({
                service: 'rescate_emergencia',
                placement: 'pricing_emergency_card',
                domain: cleanUrl,
              });
            }}
            className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-sm font-semibold border border-rose-500/30 backdrop-blur-xl transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Pedir Rescate de Emergencia (S/ 450 - S/ 650)</span>
          </a>
        </div>

        {/* Tarjeta: Monitoreo y Mantenimiento Mensual Recurrente */}
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
                Monitoreo y Mantenimiento Mensual
              </h4>
              <p className="text-3xl sm:text-4xl font-bold text-[#f5f5f7] font-mono mt-1">
                S/ 49 <span className="text-base text-neutral-400 font-sans font-normal">Esencial</span> &bull; S/ 99 <span className="text-base text-neutral-400 font-sans font-normal">Pro / mes</span>
              </p>
              <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed mt-2 font-normal">
                Para sitios previamente blindados o tras vencer los 3 meses incluidos en tu paquete. Cero contratos de permanencia: cancelas cuando quieras.
              </p>
            </div>

            <ul className="space-y-2.5 pt-3 border-t border-white/10 text-xs sm:text-sm text-neutral-200">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Muestreo de disponibilidad web (Uptime) cada 15 min (Esencial) o 5 min (Pro).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Alerta preventiva 30 días antes del vencimiento de tu certificado SSL.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Aviso prioritario e inmediato a tu WhatsApp oficial si tu web se cae.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Re-escaneos periódicos perimetrales con informe ejecutivo mensual.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Soporte técnico directo incluido: 30 min/mes (Esencial) | 60 min/mes (Pro).</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioMensual(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackServiceClick({
                  serviceName: 'Monitoreo Esencial',
                  pricePen: 49,
                  serviceId: 'monitoreo_esencial',
                });
                trackWhatsAppClick({
                  service: 'monitoreo_esencial',
                  placement: 'pricing_monthly_card',
                  domain: cleanUrl,
                });
              }}
              className="inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-semibold border border-emerald-500/30 backdrop-blur-xl transition-all cursor-pointer text-center"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Esencial (S/ 49/m)</span>
            </a>

            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.precioMensualPro(cleanUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackServiceClick({
                  serviceName: 'Monitoreo Pro',
                  pricePen: 99,
                  serviceId: 'monitoreo_pro',
                });
                trackWhatsAppClick({
                  service: 'monitoreo_pro',
                  placement: 'pricing_monthly_card',
                  domain: cleanUrl,
                });
              }}
              className="inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 text-xs font-semibold border border-blue-500/30 backdrop-blur-xl transition-all cursor-pointer text-center"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Pro (S/ 99/m)</span>
            </a>
          </div>
        </div>

      </div>

      {/* Nota de Transparencia de Plazos y Horario */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#86868b]">
        <div className="flex items-center gap-2 text-[#f5f5f7]">
          <Clock className="w-4 h-4 text-[#2997ff] shrink-0" />
          <span><strong>Diagnóstico previo 100% gratuito:</strong> te mostramos qué encontramos antes de que abones un solo sol.</span>
        </div>
        <div className="text-neutral-400">
          Atención técnica directa: <strong>Lunes a Sábado, 9:00 a 20:00 (Hora Perú) &bull; RUC 10704877850</strong>
        </div>
      </div>

    </section>
  );
}