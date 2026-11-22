'use client';

import React, { useState } from 'react';
import { Swords, X, ArrowRight, Loader2, CheckCircle2, ShieldAlert, ExternalLink } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { P } from '@/config/catalog';

interface CompetitorDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  userDomain: string;
  userScore: number;
  userGrade: string;
}

export default function CompetitorDuelModal({
  isOpen,
  onClose,
  userDomain,
  userScore,
  userGrade,
}: CompetitorDuelModalProps) {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [competitorResult, setCompetitorResult] = useState<{
    domain: string;
    score: number;
    grade: string;
    hasWaf: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const cleanUserDomain = userDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();

  const handleRunDuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorUrl.trim() || !legalConsent) return;

    setLoading(true);
    setError(null);
    setCompetitorResult(null);

    const target = competitorUrl.trim().startsWith('http') ? competitorUrl.trim() : `https://${competitorUrl.trim()}`;

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: target,
          legalConsentAccepted: true,
          comparison: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo auditar el dominio del competidor');
      }

      const reportData = data.report || data;
      const cleanCompetitor = target.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();

      setCompetitorResult({
        domain: cleanCompetitor,
        score: reportData.score ?? 50,
        grade: reportData.grade || 'C',
        hasWaf: Boolean(reportData.waf?.hasWaf),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al analizar competidor';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isUserWinning = competitorResult && userScore >= competitorResult.score;
  const whatsappNumber = (siteConfig.contact.whatsappNumber || '51987010380').replace(/[^0-9]/g, '');
  const whatsappMsg = encodeURIComponent(
    competitorResult
      ? `Hola Martín, comparé mi web (${cleanUserDomain} con ${userScore}/100) contra mi competencia (${competitorResult.domain} con ${competitorResult.score}/100). Quisiera asesoría para blindar mi web y asegurar ventaja competitiva.`
      : `Hola Martín, quiero cotizar el blindaje perimetral para mi web ${cleanUserDomain}.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808] animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#12141c] border border-white/15 p-6 sm:p-8 space-y-6 text-left overflow-hidden">
        
        {/* Glow Superior */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 hidden blur-3xl pointer-events-none" />

        {/* Encabezado */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/[0.06] border border-white/20 text-[#bdbdbd] flex items-center justify-center">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#EDEDED] tracking-tight">
                Duelo de Ciberseguridad: Tú vs. Tu Competidor
              </h3>
              <p className="text-xs text-neutral-400">
                Compara en vivo qué web tiene mejor blindaje, SSL y protección contra clonación.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-[#EDEDED] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario para ingresar Competidor */}
        <form onSubmit={handleRunDuel} className="relative z-10 space-y-3">
          <label className="text-xs font-semibold text-neutral-300 block">
            Ingresa el dominio o web de tu competidor comercial:
          </label>
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-[11px] leading-snug text-neutral-400">
            <input
              type="checkbox"
              checked={legalConsent}
              onChange={(e) => setLegalConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#0071e3]"
            />
            <span>
              Declaro bajo juramento que cuento con autorización para revisar este dominio, conforme a la Ley N° 30096.
              Solo se realiza una revisión pública básica (cabeceras, certificado y DNS).
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="https://competidor.pe"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              className="flex-1 bg-[#080808] border border-white/15 py-2.5 px-3.5 text-sm text-[#EDEDED] placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !competitorUrl.trim() || !legalConsent}
              className={`px-5 py-2.5 text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                loading || !competitorUrl.trim() || !legalConsent
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                  : 'bg-[#EDEDED] text-[#080808] hover:bg-[#EDEDED] hover:text-[#080808] cursor-pointer '
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditando...</span>
                </>
              ) : (
                <>
                  <span>Comparar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
          {error && <p className="text-xs text-[#ff4d4d]">{error}</p>}
        </form>

        {/* Tarjetas Cara a Cara */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Tu Sitio */}
          <div className="p-4 bg-white/[0.03] border border-white/10 space-y-2">
            <span className="text-[10px] uppercase font-mono text-[#bdbdbd] font-bold block">
              Tu Sitio Web
            </span>
            <span className="text-sm font-bold text-[#EDEDED] truncate block">
              {cleanUserDomain}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#EDEDED] font-mono">{userScore}</span>
              <span className="text-xs text-neutral-400 font-mono">/100 (Grado {userGrade})</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Auditoría oficial verificada por DEFENSA TI.
            </p>
          </div>

          {/* Competidor */}
          <div className="p-4 bg-[#080808] border border-white/10 space-y-2">
            <span className="text-[10px] uppercase font-mono text-neutral-400 font-bold block">
              Tu Competidor
            </span>
            <span className="text-sm font-bold text-neutral-300 truncate block">
              {competitorResult ? competitorResult.domain : 'Pendiente de escaneo'}
            </span>
            {competitorResult ? (
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black font-mono ${
                  isUserWinning ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {competitorResult.score}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  /100 (Grado {competitorResult.grade})
                </span>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 py-1">
                Escribe su dirección arriba para iniciar la comparativa perimetral.
              </p>
            )}
            <p className="text-[11px] text-neutral-400">
              {competitorResult
                ? competitorResult.hasWaf
                  ? 'Firewall WAF activo detectado.'
                  : 'Sin Firewall WAF perimetral.'
                : 'Sondeo perimetral pasivo no intrusivo.'}
            </p>
          </div>
        </div>

        {/* Veredicto de la Comparativa */}
        {competitorResult && (
          <div className={`relative z-10 p-3.5 border text-xs leading-relaxed space-y-1 ${
            isUserWinning
              ? 'bg-white/[0.03] border-white/10 text-[#EDEDED]'
              : 'bg-white/[0.03] border-white/10 text-[#ff4d4d]'
          }`}>
            <span className="font-bold flex items-center gap-1.5">
              {isUserWinning ? <CheckCircle2 className="w-4 h-4 text-[#EDEDED]" /> : <ShieldAlert className="w-4 h-4 text-[#ff4d4d]" />}
              {isUserWinning ? '¡Tu web supera a tu competencia en ciberseguridad!' : 'Tu competidor tiene mejor blindaje perimetral que tú'}
            </span>
            <p className="text-neutral-300 text-[11px]">
              {isUserWinning
                ? `Tienes ${userScore - competitorResult.score} puntos más que ${competitorResult.domain}. Asegura esta ventaja comercial activando el monitoreo mensual para no degradar tu estándar.`
                : `Tu competidor cuenta con mejor protección perimetral (${competitorResult.score} vs ${userScore}). Implementar el paquete unificado de Blindaje + WAF Cloudflare (${P.blindajeWaf}) cerrará esta brecha en 24h.`}
            </p>
          </div>
        )}

        {/* Footer y CTA */}
        <div className="relative z-10 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
          <span className="text-[11px] text-neutral-400">
            Diagnóstico 100% pasivo bajo directivas OWASP.
          </span>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs transition-all cursor-pointer shrink-0"
          >
            <span>Consultar con Martín por WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}
