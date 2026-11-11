'use client';

import { DnsSecurityResult } from '@/lib/scanner/dnsScanner';
import { MailCheck, MailWarning, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

interface DnsSecurityCardProps {
  dnsSecurity?: DnsSecurityResult;
  domain?: string;
}

export default function DnsSecurityCard({ dnsSecurity, domain = '' }: DnsSecurityCardProps) {
  if (!dnsSecurity) return null;

  const { dmarc, spf } = dnsSecurity;
  const hasDnsRisk = dmarc.risk !== 'BAJO' || spf.risk !== 'BAJO';
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');

  return (
    <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MailCheck className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Gobernanza DNS & Anti-Suplantación de Correo (Phishing Defense)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">DMARC / SPF Audit</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Tarjeta DMARC */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${
            dmarc.risk === 'BAJO'
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              : dmarc.risk === 'MEDIO'
              ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
              : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase">
              Registro DMARC &bull; Política {dmarc.policy.toUpperCase()}
            </span>
            {dmarc.risk === 'BAJO' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> ESTRICTO (OK)
              </span>
            ) : dmarc.risk === 'MEDIO' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                <MailWarning className="w-3.5 h-3.5" /> CUARENTENA
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" /> SUPLANTABLE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {dmarc.description}
          </p>
          {dmarc.raw && (
            <div className="pt-2 border-t border-white/10 font-mono text-[10px] text-slate-400 truncate" title={dmarc.raw}>
              DNS: {dmarc.raw}
            </div>
          )}
        </div>

        {/* Tarjeta SPF */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${
            spf.risk === 'BAJO'
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              : spf.risk === 'MEDIO'
              ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
              : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase">
              Registro SPF &bull; Remitentes Autorizados
            </span>
            {spf.risk === 'BAJO' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> ESTRICTO (-all)
              </span>
            ) : spf.risk === 'MEDIO' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                <MailWarning className="w-3.5 h-3.5" /> SOFTFAIL (~all)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" /> EXPUESTO
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {spf.description}
          </p>
          {spf.raw && (
            <div className="pt-2 border-t border-white/10 font-mono text-[10px] text-slate-400 truncate" title={spf.raw}>
              DNS: {spf.raw}
            </div>
          )}
        </div>
      </div>

      {/* Alerta de Conversión para Upsell de Blindaje de Correo & Anti-Spam */}
      {hasDnsRisk && (
        <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-sky-200 block">
              ⚠️ Riesgo de caída en Spam o suplantación de identidad (Phishing)
            </span>
            <span className="text-neutral-300 text-[11px]">
              Tus correos corporativos no están plenamente blindados ante filtros de Google y Microsoft.
            </span>
          </div>
          <a
            href={DEFENSATI_WHATSAPP_MESSAGES.upsellCorreoSpam(cleanDomain)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs shrink-0 transition-all cursor-pointer shadow-md shadow-sky-500/20 active:scale-95"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
            <span>Blindar Correo (S/ 190)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
