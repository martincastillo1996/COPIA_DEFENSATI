'use client';

import React, { useState } from 'react';
import { DollarSign, TrendingDown, Zap, Clock, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { P } from '@/config/catalog';

interface RoiLossCalculatorProps {
  domain: string;
  hasAdPixel?: boolean;
  hasEcommerce?: boolean;
  isOptimal?: boolean;
  isHyperscale?: boolean;
}

export default function RoiLossCalculator({
  domain,
  hasAdPixel,
  hasEcommerce,
  isOptimal = false,
  isHyperscale = false,
}: RoiLossCalculatorProps) {
  const [monthlyBudget, setMonthlyBudget] = useState(6000);
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();

  // Fuga estimada: 20% para eCommerce/pauta o 15% para corporativo
  const lossRate = hasEcommerce || hasAdPixel ? 0.22 : 0.18;
  const estimatedMonthlyLoss = Math.round(monthlyBudget * lossRate);
  const paybackDays = Math.max(2, Math.ceil((450 / estimatedMonthlyLoss) * 30));

  const whatsappNumber = (siteConfig.contact.whatsappNumber || '51987010380').replace(/[^0-9]/g, '');
  const whatsappMsg = encodeURIComponent(
    isHyperscale
      ? `Hola Martín, estuve revisando el análisis de referencia corporativa para ${cleanDomain} en DEFENSA TI y quisiera cotizar una arquitectura de blindaje perimetral para mi empresa.`
      : isOptimal
      ? `Hola Martín, estuve revisando el análisis de mi web ${cleanDomain} en DEFENSA TI. Mi web cuenta con calificación óptima (Grado A) y quisiera hacerte una consulta sobre soporte o monitoreo continuo.`
      : `Hola Martín, estuve usando la calculadora de ROI para mi web ${cleanDomain}. Facturamos/invertimos aprox. S/ ${monthlyBudget.toLocaleString('es-PE')} al mes y calculé una pérdida potencial de S/ ${estimatedMonthlyLoss.toLocaleString('es-PE')}/mes. Deseo cotizar el paquete de Blindaje + WAF Cloudflare (${P.blindajeWaf}).`
  );

  return (
    <div className="p-6 sm:p-7 bg-[#121316] border border-white/10 space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 flex items-center justify-center ${
            isHyperscale
              ? 'bg-white/[0.03] border border-white/10 text-[#EDEDED]'
              : isOptimal
              ? 'bg-white/[0.03] border border-white/10 text-[#EDEDED]'
              : 'bg-white/[0.03] border border-white/10 text-[#EDEDED]'
          }`}>
            {isHyperscale ? <ShieldCheck className="w-4 h-4" /> : isOptimal ? <ShieldCheck className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#EDEDED] tracking-tight">
              {isHyperscale
                ? 'Referencia de Escala e Infraestructura Corporativa'
                : isOptimal
                ? 'Impacto Comercial y Protección de Ventas Activa'
                : 'Calculadora de Retorno de Inversión (ROI) y Ventas en Riesgo'}
            </h3>
            <p className="text-xs text-neutral-400">
              {isHyperscale
                ? 'Los gigantes multinacionales operan infraestructura Anycast dedicada con equipos de ciberdefensa 24/7.'
                : isOptimal
                ? 'Tu portal cuenta con directivas de seguridad óptimas que blindan tus transacciones.'
                : 'Estima cuánto dinero dejas de ganar por alertas de seguridad y en cuántos días se paga el blindaje.'}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-[10px] font-mono font-bold w-fit ${
          isHyperscale
            ? 'bg-white/[0.03] text-[#EDEDED] border border-white/10'
            : isOptimal
            ? 'bg-white/[0.03] text-[#EDEDED] border border-white/10'
            : 'bg-white/[0.03] text-[#EDEDED] border border-white/10'
        }`}>
          {isHyperscale ? '🏢 Caso de Estudio Global' : isOptimal ? '✅ 100% Protegido' : `Paquete ${P.blindajeWaf} Único`}
        </span>
      </div>

      {isHyperscale ? (
        /* Caso de Estudio para Gigantes Multinacionales */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white/[0.03] border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#EDEDED] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mitigación Perimetral Global:</span>
            </div>
            <div className="text-xl font-black text-[#EDEDED] font-mono tracking-tight">
              Red Distribuida Anycast
            </div>
            <p className="text-[11px] text-neutral-300 leading-snug">
              Mitigan ataques volumétricos masivos de terabits mediante centros de datos mundiales y clusters dedicados.
            </p>
          </div>

          <div className="p-4 bg-white/[0.03] border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#EDEDED] font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Replicable para tu Organización:</span>
            </div>
            <div className="text-xl font-black text-[#EDEDED] font-mono tracking-tight">
              Blindaje Accesible con WAF
            </div>
            <p className="text-[11px] text-neutral-300 leading-snug">
              DEFENSA TI implementa el mismo nivel de blindaje defensivo para tu empresa mediante WAF Cloudflare y cabeceras OWASP.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Slider Interactivo */}
          <div className="space-y-3 p-4 bg-[#080808] border border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                {hasEcommerce ? 'Ventas mensuales estimadas en tu web:' : 'Facturación o presupuesto digital mensual:'}
              </label>
              <span className="text-base font-extrabold text-[#bdbdbd] font-mono">
                S/ {monthlyBudget.toLocaleString('es-PE')} PEN
              </span>
            </div>

            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              className="w-full h-2 bg-neutral-800 appearance-none cursor-pointer accent-[#0071e3]"
            />

            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>S/ 1,000</span>
              <span>S/ 25,000</span>
              <span>S/ 50,000</span>
            </div>
          </div>

          {/* Métricas Calculadas en Tiempo Real (2 Tarjetas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isOptimal ? (
              <>
                {/* Ventas Blindadas */}
                <div className="p-4 bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#EDEDED] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Ventas y Tráfico Blindados:</span>
                  </div>
                  <div className="text-2xl font-black text-[#EDEDED] font-mono tracking-tight">
                    S/ {estimatedMonthlyLoss.toLocaleString('es-PE')}
                    <span className="text-xs font-normal text-[#EDEDED] ml-1">/ mes protegidos</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-snug">
                    Clientes que compran con total confianza gracias a tus túneles HTTPS estrictos y sin alertas.
                  </p>
                </div>

                {/* Estado de Conversión */}
                <div className="p-4 bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#EDEDED] font-semibold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Estatus de Pasarelas y Checkouts:</span>
                  </div>
                  <div className="text-2xl font-black text-[#EDEDED] font-mono tracking-tight">
                    ¡100% Óptimo!
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-snug">
                    Cero rebotes por alertas de navegador ni bloqueos en cobros con tarjeta de crédito/débito.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Fuga Estimada */}
                <div className="p-4 bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#ff4d4d] font-semibold">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Fuga Mensual Estimada en Ventas:</span>
                  </div>
                  <div className="text-2xl font-black text-[#ff4d4d] font-mono tracking-tight">
                    S/ {estimatedMonthlyLoss.toLocaleString('es-PE')}
                    <span className="text-xs font-normal text-[#ff4d4d] ml-1">/ mes</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-snug">
                    Prospectos que rebotan por falta de candado estricto o miedo al pagar con tarjeta.
                  </p>
                </div>

                {/* Retorno de Inversión */}
                <div className="p-4 bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#EDEDED] font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tiempo de Retorno (Blindaje {P.blindajeWaf}):</span>
                  </div>
                  <div className="text-2xl font-black text-[#EDEDED] font-mono tracking-tight">
                    ¡En {paybackDays} días!
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-snug">
                    Recuperas los {P.blindajeWaf} al evitar el abandono de tus primeros 1 a 2 clientes este mes.
                  </p>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* CTA Directo a WhatsApp */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-[11px] text-neutral-400">
          {isHyperscale
            ? '⚡ Caso de estudio didáctico. Replicamos esta arquitectura perimetral para empresas y comercios.'
            : isOptimal
            ? '⚡ Tu configuración actual cumple con las directivas de seguridad OWASP para comercio digital.'
            : '⚡ Entrega en 24h • Garantía de 30 días • Pago único sin permanencia forzosa'}
        </span>
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[#EDEDED] text-xs font-bold transition-all cursor-pointer shrink-0"
        >
          <span>{isHyperscale ? 'Cotizar Arquitectura Corporativa' : isOptimal ? 'Consultar Soporte Técnico' : `Activar Blindaje (${P.blindajeWaf})`}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
