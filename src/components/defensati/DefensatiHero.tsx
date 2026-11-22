'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, Skull, Zap, Building2, Server, ShieldCheck } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import TurnstileWidget, { type TurnstileWidgetRef } from '@/components/TurnstileWidget';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';

interface DefensatiHeroProps {
  url: string;
  setUrl: (url: string) => void;
  loading: boolean;
  legalConsent: boolean;
  setLegalConsent: (consent: boolean) => void;
  turnstileRef: React.RefObject<TurnstileWidgetRef | null>;
  setTurnstileToken: (token: string | null) => void;
  handleScan: (targetUrl?: string, overrideConsent?: boolean) => void;
  error: string | null;
  setError: (err: string | null) => void;
  onLoadDemo?: () => void;
  serialKey?: string;
  setSerialKey?: (key: string) => void;
  isPremiumMode?: boolean;
  setIsPremiumMode?: (premium: boolean) => void;
}

export default function DefensatiHero({
  url,
  setUrl,
  loading,
  legalConsent,
  setLegalConsent,
  turnstileRef,
  setTurnstileToken,
  handleScan,
  error,
  setError,
  onLoadDemo,
  serialKey,
  setSerialKey,
  isPremiumMode = false,
  setIsPremiumMode,
}: DefensatiHeroProps) {
  const canScan = !loading && legalConsent && Boolean(url.trim());

  return (
    <section data-enter className="relative min-h-[100svh] grid grid-cols-12 content-center gap-y-10 lg:gap-x-8 pt-24 pb-16">

      {/* HUD superior */}
      <div className="relative z-10 col-span-12 flex flex-wrap justify-between gap-4">
        <span className="hud-label !tracking-[0.2em]">Fase 06 · Detección</span>
        <span className="hud-label !tracking-[0.2em] hidden sm:inline">Escaneo no intrusivo · Anti-SSRF</span>
      </div>

      {/* Titular */}
      <div className="relative z-10 col-span-12 lg:col-span-9 self-end">
        <h1
          className="hud-display !font-normal !leading-[0.88] !tracking-[-0.05em]"
          style={{ fontSize: 'clamp(2.6rem, 6vw, 6.5rem)' }}
        >
          Ahora mira tu web
          <br />
          <span className="text-[#8b97a2]">como la ven ellos.</span>
        </h1>
      </div>
      <div className="relative z-10 col-span-12 lg:col-span-3 self-end">
        <p className="text-base leading-relaxed text-[#c3ccd3] max-w-[36ch] bg-[#0a0c0f]/85 p-4 border-l border-[#cfe3ee]/30">
          Motor perimetral de grado bancario. En 60 segundos audita precursores de secuestro de datos (Ransomware), resiliencia anti-DDoS, bypass WAF y cumplimiento PCI-DSS 4.0.
        </p>
      </div>

      {/* Consola de escaneo con física y micro-resplandor */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleScan();
        }}
        className="relative z-10 col-span-12 lg:col-span-8 hud-frame bg-[#0a0c0f]/85 backdrop-blur-md transition-all duration-300 focus-within:border-[#cfe3ee]/40 focus-within:shadow-[0_0_30px_-5px_rgba(207,227,238,0.12)]"
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b ed-line">
          <span className="hud-label">Consola / scan</span>
          <span className="hud-label flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-[#cfe3ee] animate-pulse shadow-[0_0_8px_#cfe3ee]' : 'bg-[#4a535b]'}`} />
            <span className={loading ? 'text-[#cfe3ee] font-medium' : ''}>{loading ? 'Auditando...' : 'Listo'}</span>
          </span>
        </div>

        {/* Selector de Nivel: Lite (Gratuito) vs. Premium (Clave Serial) */}
        <div className="flex border-b ed-line text-xs font-mono">
          <button
            type="button"
            onClick={() => setIsPremiumMode?.(false)}
            className={`flex-1 py-2 px-3 text-center transition-colors ${
              !isPremiumMode ? 'bg-white/[0.08] text-[#EDEDED] font-bold border-b-2 border-emerald-400' : 'text-[#8b97a2] hover:text-[#EDEDED]'
            }`}
          >
            ⚡ Auditoría Lite (Gratuita)
          </button>
          <button
            type="button"
            onClick={() => setIsPremiumMode?.(true)}
            className={`flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
              isPremiumMode ? 'bg-white/[0.08] text-[#EDEDED] font-bold border-b-2 border-amber-400' : 'text-[#8b97a2] hover:text-[#EDEDED]'
            }`}
          >
            💎 Auditoría Premium (Forense)
          </button>
        </div>

        {isPremiumMode && (
          <div className="px-4 py-3 bg-amber-500/[0.04] border-b ed-line space-y-2">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-amber-400 shrink-0 font-bold">Clave Serial / Licencia:</span>
              <input
                type="text"
                placeholder="Ej. DEFENSA-VIP-2026"
                value={serialKey || ''}
                onChange={(e) => setSerialKey?.(e.target.value)}
                className="w-full bg-black/60 border border-amber-500/30 px-2.5 py-1 text-xs font-mono text-amber-200 placeholder-amber-500/40 focus:outline-none focus:border-amber-400"
              />
              <a
                href="https://wa.me/51987010380?text=Hola%20Mart%C3%ADn%2C%20quisiera%20solicitar%20mi%20clave%20serial%20para%20la%20Auditor%C3%ADa%20Premium."
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-amber-300 underline hover:text-amber-100 shrink-0 whitespace-nowrap"
              >
                Pedir clave por WhatsApp
              </a>
            </div>
            <p className="text-[11px] text-amber-300/80 font-mono leading-relaxed flex items-center gap-1.5">
              <span>⏱️</span> Entrega en 24 horas (1 día): Para evitar saturar tu servidor y procesar sondeos profundos (.env, buckets y TLS), el dictamen forense completo se procesa en cola y se entrega certificado en 24 h.
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row">
          <label htmlFor="url-scan-input-defensati" className="flex flex-1 items-center gap-3 px-4 py-4 cursor-text">
            <span className="font-mono text-[#4a535b] select-none">&gt;</span>
            <input
              id="url-scan-input-defensati"
              type="text"
              inputMode="url"
              placeholder="https://tudominio.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-transparent font-mono text-base sm:text-lg text-[#e8edf1] placeholder-[#4a535b] focus:outline-none transition-colors"
            />
          </label>
          <button
            type="submit"
            disabled={!canScan}
            className="hud-btn hud-btn-solid sm:border-l-0 !py-4 active:scale-[0.98] transition-all duration-200 select-none touch-manipulation group"
          >
            {loading ? (
              'Auditando…'
            ) : (
              <>
                <span>Auditar</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
        <div className="border-t ed-line px-4 py-3 flex flex-wrap items-center gap-x-2 gap-y-2">
          {onLoadDemo && (
            <button
              type="button"
              onClick={onLoadDemo}
              className="hud-label !text-[#cfe3ee] hover:text-white hover:underline sm:ml-auto transition-colors active:scale-95 py-0.5"
            >
              Ver demo →
            </button>
          )}
        </div>
        <div className="border-t ed-line px-4 py-3 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              id="sworn-declaration-defensati-checkbox"
              type="checkbox"
              checked={legalConsent}
              onChange={(e) => {
                setLegalConsent(e.target.checked);
                if (error) setError(null);
              }}
              className="mt-0.5 w-3.5 h-3.5 accent-[#cfe3ee] shrink-0 cursor-pointer"
            />
            <span className="text-xs text-[#8b97a2] leading-relaxed">
              Confirmo que esta web es mía o tengo autorización para auditarla, conforme a la{' '}
              <Link href="/terminos#delitos-informaticos" className="text-[#e8edf1] underline hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                Ley N° 30096
              </Link>
              .
            </span>
          </label>
          <TurnstileWidget
            ref={turnstileRef}
            action="scan"
            theme="dark"
            onVerify={(token) => {
              setTurnstileToken(token);
              if (error) setError(null);
            }}
            onExpire={() => setTurnstileToken(null)}
          />
          {error && (
            <p className="flex items-center gap-2 font-mono text-xs text-[#ff6b6b]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
            </p>
          )}
        </div>
      </form>

      {/* Acceso directo para quien ya fue hackeado */}
      <div className="relative z-10 col-span-12 lg:col-span-4 self-end">
        <a
          href={DEFENSATI_WHATSAPP_MESSAGES.recuperacionHackeo()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick({ service: 'desinfeccion_malware', placement: 'hero_hud' })}
          className="group/wa flex items-center justify-between gap-4 border border-white/15 bg-[#0a0c0f] p-5 hud-label !text-[#e8edf1] hover:border-[#cfe3ee] transition-colors"
        >
          <span className="flex items-center gap-2">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-[#25D366]" />
            ¿Web hackeada? Rescate urgente
          </span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/wa:translate-x-1" />
        </a>
      </div>

      {/* Chips de Auditoría Avanzada de Amenazas (Estándar Bancario & MITRE ATT&CK) */}
      <div className="relative z-10 col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 rounded bg-[#0a0c0f]/90 border border-white/10 backdrop-blur-md flex items-start gap-3">
          <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
            <Skull className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white font-mono">Secuestro de Datos</h4>
            <p className="text-[11px] text-[#8b97a2] mt-0.5 leading-snug">
              Precursores Ransomware (RDP, SMB, DBs, fuga de .env). MITRE T1133 / T1486.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded bg-[#0a0c0f]/90 border border-white/10 backdrop-blur-md flex items-start gap-3">
          <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white font-mono">Resiliencia Anti-DDoS</h4>
            <p className="text-[11px] text-[#8b97a2] mt-0.5 leading-snug">
              Detección de Fuga de IP de Origen (WAF Bypass) y amplificación Capa 7.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded bg-[#0a0c0f]/90 border border-white/10 backdrop-blur-md flex items-start gap-3">
          <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white font-mono">Grado Bancario / PCI</h4>
            <p className="text-[11px] text-[#8b97a2] mt-0.5 leading-snug">
              Protección anti-e-Skimming en checkout, registros CAA y bastionado de cookies.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded bg-[#0a0c0f]/90 border border-white/10 backdrop-blur-md flex items-start gap-3">
          <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white font-mono">36 Puertos Canónicos</h4>
            <p className="text-[11px] text-[#8b97a2] mt-0.5 leading-snug">
              Servicios, banners y versiones expuestos, cuando demuestras que el dominio es tuyo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}