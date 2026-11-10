'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  AlertTriangle, 
  Download, 
  Share2, 
  Check, 
  Briefcase, 
  Terminal, 
  MessageCircle,
  Wrench,
  ArrowLeft
} from 'lucide-react';
import NeuralBackground from '@/components/NeuralBackground';
import PrintableReport from '@/components/PrintableReport';
import ScoreCircle from '@/components/ScoreCircle';
import SslResults from '@/components/SslResults';
import ServerLocationCard from '@/components/ServerLocationCard';
import VerifiedBadgeWidget from '@/components/VerifiedBadgeWidget';
import SslAlertWidget from '@/components/SslAlertWidget';
import BusinessOverview from '@/components/BusinessOverview';
import PortResults from '@/components/PortResults';
import HeaderResults from '@/components/HeaderResults';
import CookieResults from '@/components/CookieResults';
import RemediationList from '@/components/RemediationList';
import TechnicalLogs from '@/components/TechnicalLogs';
import NeuralScanTakeover from '@/components/NeuralScanTakeover';
import AppleCyberHud from '@/components/AppleCyberHud';
import OpenSourceSupportBanner from '@/components/OpenSourceSupportBanner';
import SocialViralHub from '@/components/SocialViralHub';
import NeuronalGravityHub from '@/components/NeuronalGravityHub';
import DonationModal from '@/components/DonationModal';
import CompetitorComparisonSection from '@/components/CompetitorComparisonSection';

import { siteConfig } from '@/config/site';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { AuditReportRecord } from '@/lib/storage/reportStore';

export default function EscanerTecnicoPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReportRecord | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'business' | 'tech'>('tech');
  const [legalConsent, setLegalConsent] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleScan = useCallback(async (targetUrl?: string, overrideConsent?: boolean) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl) return;

    const hasConsent = overrideConsent ?? legalConsent;
    if (!hasConsent) {
      setError('Debes marcar la casilla obligatoria de declaración jurada bajo la Ley N° 30096 para poder auditar el dominio.');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setAuditId(null);

    try {
      const scanPromise = fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl, legalConsentAccepted: true }),
      });

      const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 3200));
      const [res] = await Promise.all([scanPromise, minDelayPromise]);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al ejecutar auditoría');
      }

      setReport(data.report || data);
      setAuditId(data.id || (data.report && data.report.id) || 'audit-local');

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de conexión con el motor perimetral';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [url, legalConsent]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const target = params.get('target') || params.get('url');
      if (target) {
        setTimeout(() => setUrl(target), 0);
      }
    }
  }, []);

  const copyShareLink = () => {
    if (!auditId) return;
    const shareableUrl = `${window.location.origin}/report/${auditId}`;
    try {
      if (report) {
        localStorage.setItem(`report_${auditId}`, JSON.stringify(report));
      }
    } catch {
      // Ignorar
    }
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (report?.url) {
      try {
        const cleanHost = new URL(report.url).hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
        document.title = `Dictamen-DEFENSA-TI-${cleanHost}`;
      } catch {
        // Ignorar
      }
    }
    window.print();
  };

  const cleanDomain = report?.url ? report.url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';

  return (
    <div className="relative min-h-screen bg-[#060814] text-[#f5f5f7] selection:bg-[#0071e3] selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Fondo interactivo 3D */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <NeuralBackground showDomains={true} />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#060814]/35 pointer-events-none" />
      </div>

      {report && auditId && <PrintableReport report={report} auditId={auditId} />}

      <div className="relative z-10 print:hidden flex flex-col min-h-screen">
        
        {/* Encabezado */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060814]/80 backdrop-blur-2xl transition-all">
          <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            <div className="flex items-center gap-3">
              <Link 
                href="/defensati" 
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>Volver a DEFENSA TI</span>
              </Link>
              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  Escáner Técnico Perimetral
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-neutral-300">
              <Link href="/defensati" className="hover:text-white transition-colors">Inicio</Link>
              <Link href="/planes" className="hover:text-white transition-colors">Planes y Precios</Link>
            </nav>

            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black text-xs sm:text-sm font-bold transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current shrink-0" />
              <span>WhatsApp</span>
            </a>

          </div>
        </header>

        {/* Contenido Principal */}
        <main className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 flex-1 w-full overflow-x-hidden">
          
          {/* Formulario del Escáner */}
          <section className="w-full max-w-3xl mx-auto space-y-6 text-center">
            <div className="space-y-3 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#141828]/90 via-[#0f1220]/90 to-[#0a0d18]/95 border border-sky-500/30 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,113,227,0.18)]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-[#38bdf8] text-xs font-bold shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                <Search className="w-3.5 h-3.5" />
                <span>Auditoría Técnica Perimetral</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-300 tracking-tight leading-tight">
                Auditoría Completa de Seguridad Web
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl mx-auto font-normal">
                Verifica certificados SSL/TLS, cabeceras de transporte HTTP, puertos abiertos expuestos y telemetría de red en segundos.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleScan();
                }}
                className="pt-4 max-w-xl mx-auto space-y-3 text-left"
              >
                <div className="relative p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,113,227,0.15)] flex items-center gap-2 ring-1 ring-white/10 focus-within:ring-[#0071e3]/80 focus-within:border-[#0071e3]/80 transition-all">
                  <div className="pl-3.5 text-neutral-500">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="https://tudominio.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-transparent border-none py-2 text-[16px] sm:text-sm text-white placeholder-neutral-500 focus:outline-none font-normal"
                  />
                  <button
                    type="submit"
                    disabled={loading || !legalConsent || !url.trim()}
                    className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                      loading || !legalConsent || !url.trim()
                        ? 'bg-neutral-800 text-neutral-500 border border-white/5 cursor-not-allowed opacity-60'
                        : 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-lg shadow-[#0071e3]/40 cursor-pointer active:scale-95'
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Auditando...</span>
                      </>
                    ) : (
                      <>
                        <span>Auditar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                <div
                  className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 ${
                    legalConsent
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.12)]'
                      : 'bg-[#141416]/90 border-white/10 hover:border-amber-500/40 shadow-lg'
                  }`}
                >
                  <label htmlFor="sworn-declaration-checkbox" className="flex items-start gap-3.5 cursor-pointer select-none">
                    <input
                      id="sworn-declaration-checkbox"
                      type="checkbox"
                      checked={legalConsent}
                      onChange={(e) => {
                        setLegalConsent(e.target.checked);
                        if (error) setError(null);
                      }}
                      className="mt-1 w-4 h-4 rounded border-white/30 bg-black text-[#0071e3] focus:ring-[#0071e3] cursor-pointer accent-[#0071e3] shrink-0"
                    />
                    <div className="space-y-1.5 flex-1">
                      <p className="text-xs sm:text-[12.5px] text-neutral-200 leading-snug font-medium">
                        “Declaro bajo juramento que soy el titular del dominio que voy a auditar, o que cuento con autorización expresa de su propietario, conforme a la{' '}
                        <Link
                          href="/terminos#delitos-informaticos"
                          className="text-[#38bdf8] underline hover:text-white font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ley N° 30096, Delitos Informáticos del Perú
                        </Link>
                        .”
                      </p>
                      <span
                        className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                          legalConsent
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                        }`}
                      >
                        {legalConsent ? '✓ Casilla Marcada • Listo para Auditar' : '⚠️ Casilla Obligatoria por Ley'}
                      </span>
                    </div>
                  </label>
                </div>
              </form>

              {loading && <NeuralScanTakeover targetUrl={url || 'sitio web'} />}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </section>

          {/* RESULTADOS TÉCNICOS DETALLADOS */}
          {report && (
            <div ref={resultsRef} className="space-y-8 pt-4 scroll-mt-20">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#161618] border border-white/10 shadow-2xl backdrop-blur-2xl">
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Sitio Web Analizado</span>
                  <h3 className="text-xl font-bold text-white break-all">{report.url}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrint}
                    className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>Descargar PDF</span>
                  </button>
                  <button
                    onClick={copyShareLink}
                    className="px-5 py-2.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                    <span>{copied ? 'Enlace Copiado' : 'Compartir'}</span>
                  </button>
                </div>
              </div>

              {/* Botón WhatsApp de remediación directa */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-[#101b14] to-[#0b140f] border-2 border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Remediación Técnica Directa</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    ¿Quieres que yo mismo parchee y limpie tu web?
                  </h4>
                  <p className="text-sm text-neutral-300 max-w-xl font-normal">
                    Reviso el reporte contigo, elimino las fallas y te entrego tu página asegurada y blindada.
                  </p>
                </div>

                <a
                  href={DEFENSATI_WHATSAPP_MESSAGES.escaner(cleanDomain, report.score, report.grade)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#25D366] to-emerald-400 text-black font-extrabold text-base shadow-[0_10px_30px_rgba(37,211,102,0.4)] flex items-center justify-center gap-3 transition-all shrink-0 cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                  <span className="whitespace-nowrap">Coordinar con Martín</span>
                </a>
              </div>

              {/* Selector de Perspectiva (Negocio vs Técnico) */}
              <div className="flex justify-center py-2">
                <div className="inline-flex p-1.5 rounded-2xl bg-[#161618] border border-white/15 shadow-2xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('business')}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                      viewMode === 'business'
                        ? 'bg-[#0071e3] text-white shadow-xl shadow-[#0071e3]/40'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Visión Ejecutiva</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('tech')}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                      viewMode === 'tech'
                        ? 'bg-[#0071e3] text-white shadow-xl shadow-[#0071e3]/40'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Detalle Técnico</span>
                  </button>
                </div>
              </div>

              {/* Puntuación y SSL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
                  <ScoreCircle score={report.score} grade={report.grade || 'F'} />
                </div>
                <div className="md:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
                  <SslResults ssl={report.ssl} />
                </div>
              </div>

              {/* Localización y Widgets */}
              <ServerLocationCard 
                location={report.location} 
                resolvedIp={report.telemetry?.targetResolvedIp} 
                targetDomain={report.url}
              />

              <VerifiedBadgeWidget 
                domain={report.url} 
                auditId={auditId || undefined} 
                grade={report.grade} 
                score={report.score} 
                badgeToken={report.badgeToken}
              />

              <SslAlertWidget 
                domain={report.url} 
                daysRemaining={report.ssl?.daysRemaining} 
              />

              {viewMode === 'business' ? (
                <BusinessOverview report={report} />
              ) : (
                <div className="space-y-6">
                  {Boolean(report.ports?.length) && (
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
                      <PortResults ports={report.ports || []} />
                    </div>
                  )}

                  <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
                    <HeaderResults headers={report.headers || []} />
                  </div>

                  <CookieResults cookies={report.cookies} />

                  <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
                    <RemediationList items={report.remediations || []} />
                  </div>

                  <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
                    <TechnicalLogs 
                      id={auditId || ''} 
                      telemetry={report.telemetry} 
                      scannedAt={report.scannedAt || ''} 
                    />
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Comparador de Motores */}
          <CompetitorComparisonSection />

          {/* Telemetría Apple Cyber HUD */}
          <AppleCyberHud />

          {/* Banner de Apoyo Open Source */}
          <OpenSourceSupportBanner />

          {/* Hubs de Ecosistema */}
          <SocialViralHub targetUrl={report?.url} score={report?.score} />
          <NeuronalGravityHub />

        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 text-xs text-neutral-400 bg-black/90 text-center">
          <div className="max-w-6xl mx-auto px-4 space-y-4">
            <p className="font-semibold text-white">
              &copy; {new Date().getFullYear()} DEFENSA TI &bull; Martín Castillo &bull; RUC {siteConfig.business.ruc}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-300">
              <Link href="/defensati" className="hover:text-white transition-colors underline">DEFENSA TI</Link>
              <span>&bull;</span>
              <Link href="/planes" className="hover:text-white transition-colors underline">Planes y Precios</Link>
              <span>&bull;</span>
              <Link href="/terminos" className="hover:text-white transition-colors underline">Términos y Privacidad</Link>
              <span>&bull;</span>
              <Link href="/reclamaciones" className="hover:text-amber-400 transition-colors underline text-amber-400">Libro de Reclamaciones</Link>
            </div>
          </div>
        </footer>

      </div>

      <DonationModal />
    </div>
  );
}
