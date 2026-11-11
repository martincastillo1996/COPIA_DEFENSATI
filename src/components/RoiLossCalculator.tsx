'use client';

import React, { useState } from 'react';
import { DollarSign, TrendingDown, Zap, Clock, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface RoiLossCalculatorProps {
  domain: string;
  hasAdPixel?: boolean;
  hasEcommerce?: boolean;
}

export default function RoiLossCalculator({
  domain,
  hasAdPixel,
  hasEcommerce,
}: RoiLossCalculatorProps) {
  const [monthlyBudget, setMonthlyBudget] = useState(6000);
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();

  // Fuga estimada: 20% para eCommerce/pauta o 15% para corporativo
  const lossRate = hasEcommerce || hasAdPixel ? 0.22 : 0.18;
  const estimatedMonthlyLoss = Math.round(monthlyBudget * lossRate);
  const paybackDays = Math.max(2, Math.ceil((450 / estimatedMonthlyLoss) * 30));

  const whatsappNumber = (siteConfig.contact.whatsappNumber || '17856433991').replace(/[^0-9]/g, '');
  const whatsappMsg = encodeURIComponent(
    `Hola Martín, estuve usando la calculadora de ROI para mi web ${cleanDomain}. Facturamos/invertimos aprox. S/ ${monthlyBudget.toLocaleString('es-PE')} al mes y calculé una pérdida potencial de S/ ${estimatedMonthlyLoss.toLocaleString('es-PE')}/mes. Deseo cotizar el paquete de Blindaje + WAF Cloudflare (S/ 450).`
  );

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#121316] border border-white/10 shadow-2xl space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Calculadora de Retorno de Inversión (ROI) y Ventas en Riesgo
            </h3>
            <p className="text-xs text-neutral-400">
              Estima cuánto dinero dejas de ganar por alertas de seguridad y en cuántos días se paga el blindaje.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold w-fit">
          Paquete S/ 450 Único
        </span>
      </div>

      {/* Slider Interactivo */}
      <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-300">
            {hasEcommerce ? 'Ventas mensuales estimadas en tu web:' : 'Facturación o presupuesto digital mensual:'}
          </label>
          <span className="text-base font-extrabold text-[#38bdf8] font-mono">
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
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#0071e3]"
        />

        <div className="flex justify-between text-[10px] font-mono text-neutral-500">
          <span>S/ 1,000</span>
          <span>S/ 25,000</span>
          <span>S/ 50,000</span>
        </div>
      </div>

      {/* Métricas Calculadas en Tiempo Real (2 Tarjetas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fuga Estimada */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-rose-300 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Fuga Mensual Estimada en Ventas:</span>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">
            S/ {estimatedMonthlyLoss.toLocaleString('es-PE')}
            <span className="text-xs font-normal text-rose-300 ml-1">/ mes</span>
          </div>
          <p className="text-[11px] text-neutral-300 leading-snug">
            Prospectos que rebotan por falta de candado estricto o miedo al pagar con tarjeta.
          </p>
        </div>

        {/* Retorno de Inversión */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Tiempo de Retorno (Blindaje S/ 450):</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            ¡En {paybackDays} días!
          </div>
          <p className="text-[11px] text-neutral-300 leading-snug">
            Recuperas los S/ 450 al evitar el abandono de tus primeros 1 a 2 clientes este mes.
          </p>
        </div>
      </div>

      {/* CTA Directo a WhatsApp */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-[11px] text-neutral-400">
          ⚡ Entrega en 24h &bull; Garantía de 30 días &bull; Pago único sin permanencia forzosa
        </span>
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0071e3] to-[#2997ff] hover:from-[#0077ed] hover:to-[#38bdf8] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <span>Activar Blindaje (S/ 450)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
