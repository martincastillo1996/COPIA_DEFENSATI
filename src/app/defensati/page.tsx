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
  Wrench,
  ChevronDown,
  Clock
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import NeuralBackground from '@/components/NeuralBackground';
import PrintableReport from '@/components/PrintableReport';
import ScoreCircle from '@/components/ScoreCircle';
import SslResults from '@/components/SslResults';
import ServerLocationCard from '@/components/ServerLocationCard';
import SslAlertWidget from '@/components/SslAlertWidget';
import BusinessOverview from '@/components/BusinessOverview';
import PortResults from '@/components/PortResults';
import HeaderResults from '@/components/HeaderResults';
import CookieResults from '@/components/CookieResults';
import RemediationList from '@/components/RemediationList';
import TechnicalLogs from '@/components/TechnicalLogs';
import NeuralScanTakeover from '@/components/NeuralScanTakeover';
import CompetitorComparisonSection from '@/components/CompetitorComparisonSection';
import WebAuditCard from '@/components/WebAuditCard';
import PdfLeadModal from '@/components/PdfLeadModal';
import RoiLossCalculator from '@/components/RoiLossCalculator';
import RecentScansTicker from '@/components/RecentScansTicker';
import SocialViralHub from '@/components/SocialViralHub';
import SecurityBenchmarkBar from '@/components/SecurityBenchmarkBar';
import AnpdpComplianceCard from '@/components/AnpdpComplianceCard';
import CompetitorDuelModal from '@/components/CompetitorDuelModal';
import MobileStickyConversionBar from '@/components/MobileStickyConversionBar';
import { Swords } from 'lucide-react';
import { isHyperscalePlatform } from '@/lib/hyperscalers';

// Componentes Oficiales DEFENSA TI
import DefensatiHero from '@/components/defensati/DefensatiHero';
import DefensatiProblems from '@/components/defensati/DefensatiProblems';
import DefensatiPricing from '@/components/defensati/DefensatiPricing';
import DefensatiMonthlyPlans from '@/components/defensati/DefensatiMonthlyPlans';
import DefensatiHowItWorks from '@/components/defensati/DefensatiHowItWorks';
import DefensatiScanScope from '@/components/defensati/DefensatiScanScope';
import DefensatiCases from '@/components/defensati/DefensatiCases';
import DefensatiWarranty from '@/components/defensati/DefensatiWarranty';
import DefensatiFAQ from '@/components/defensati/DefensatiFAQ';
import DefensatiFinalCTA from '@/components/defensati/DefensatiFinalCTA';
import DefensatiScanRecommendation from '@/components/defensati/DefensatiScanRecommendation';
import DefensatiQuickContact from '@/components/defensati/DefensatiQuickContact';
import TurnstileWidget, { TurnstileWidgetRef } from '@/components/TurnstileWidget';

import { siteConfig } from '@/config/site';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { AuditReportRecord } from '@/lib/storage/reportStore';
import { trackScanStart, trackScanComplete, trackWhatsAppClick } from '@/lib/analytics';

export default function DefensatiPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReportRecord | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'business' | 'tech'>('business');
  const [pdfViewMode, setPdfViewMode] = useState<'both' | 'management' | 'dev'>('both');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [competitorModalOpen, setCompetitorModalOpen] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
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
    const startTime = Date.now();
    trackScanStart(finalUrl);

    try {
      const scanPromise = fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: finalUrl,
          legalConsentAccepted: true,
          turnstileToken,
        }),
      });

      const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 3200));
      const [res] = await Promise.all([scanPromise, minDelayPromise]);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al ejecutar auditoría');
      }

      const reportData = data.report || data;
      setReport(reportData);
      setAuditId(data.id || (data.report && data.report.id) || 'audit-local');
      trackScanComplete({
        domain: finalUrl,
        score: reportData.score ?? 0,
        grade: reportData.grade || 'F',
        durationMs: Date.now() - startTime,
      });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de conexión con el motor perimetral';
      setError(msg);
    } finally {
      setLoading(false);
      try {
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      } catch {
        // Ignorar si no está montado
      }
    }
  }, [url, legalConsent, turnstileToken]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleSetTarget = (e: Event) => {
        const customEv = e as CustomEvent<string | { url?: string }>;
        const targetVal = typeof customEv.detail === 'string' ? customEv.detail : customEv.detail?.url;
        if (targetVal) {
          setUrl(targetVal);
          const inputEl = document.getElementById('url-scan-input-defensati');
          if (inputEl) {
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => inputEl.focus(), 300);
          }
        }
      };

      window.addEventListener('set-target-url', handleSetTarget as EventListener);

      const params = new URLSearchParams(window.location.search);
      const target = params.get('target') || params.get('url');
      if (target) {
        const timer = setTimeout(() => {
          setUrl(target);
          const inputEl = document.getElementById('url-scan-input-defensati');
          if (inputEl) {
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => inputEl.focus(), 300);
          }
        }, 150);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('set-target-url', handleSetTarget as EventListener);
        };
      }

      return () => {
        window.removeEventListener('set-target-url', handleSetTarget as EventListener);
      };
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
      // Ignorar fallo de almacenamiento local
    }
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executePrint = (mode: 'both' | 'management' | 'dev' = pdfViewMode) => {
    setPdfViewMode(mode);
    if (report?.url) {
      try {
        const cleanHost = new URL(report.url).hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const suffix = mode === 'management' ? 'Gerencia' : mode === 'dev' ? 'Dev' : 'Completo';
        document.title = `Dictamen-DEFENSA-TI-${cleanHost}-${suffix}`;
      } catch {
        // Ignorar
      }
    }
    setTimeout(() => {
      window.print();
    }, 60);
  };

  const handlePrint = (mode: 'both' | 'management' | 'dev' = pdfViewMode) => {
    setPdfViewMode(mode);
    setPdfModalOpen(true);
  };

  const cleanDomain = report?.url ? report.url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#f5f5f7] selection:bg-[#0071e3] selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Fondo estético y luces ambientales (El fondo clásico original de DEFENSA TI con +15% de visibilidad) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-95">
        <NeuralBackground />
        <div className="absolute inset-0 bg-radial from-black/10 via-black/35 to-black/65" />
      </div>

      {/* Luces cósmicas Apple Pro de fondo */}
      <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
        <div 
          className="absolute rounded-full bg-gradient-to-b from-[#0071e3]/20 via-[#7928ca]/15 to-transparent"
          style={{ top: '-80px', height: '640px', width: '1050px', filter: 'blur(140px)' }} 
        />
        <div 
          className="absolute rounded-full bg-[#38bdf8]/10"
          style={{ top: '35%', right: '-8%', height: '520px', width: '520px', filter: 'blur(160px)' }} 
        />
        <div 
          className="absolute rounded-full bg-[#7928ca]/10"
          style={{ top: '65%', left: '-8%', height: '540px', width: '540px', filter: 'blur(170px)' }} 
        />
      </div>

      {/* Reporte Impreso Oficial */}
      {report && auditId && <PrintableReport report={report} auditId={auditId} pdfViewMode={pdfViewMode} />}

      <div className="relative z-10 print:hidden flex flex-col min-h-screen">
        
        {/* Encabezado Oficial DEFENSA TI (Mobile First) */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#000000]/80 backdrop-blur-2xl transition-all">
          <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Logo de DEFENSA TI con Escudo de Ciberseguridad */}
            <div className="flex items-center gap-3">
              <Link href="/" className="mr-1 text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                <span>&larr;</span>
                <span className="font-semibold text-sky-400">Neuronal Gravity</span>
              </Link>
              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <div className="h-9 w-9 rounded-xl bg-linear-to-b from-white/15 to-white/5 border border-white/10 flex items-center justify-center shadow-inner shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none">
                  DEFENSA TI
                </span>
                <span className="text-[10px] text-neutral-400 font-normal mt-0.5">
                  Blindaje & Ciberseguridad
                </span>
              </div>
            </div>

            {/* Navegación Desktop */}
            <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-neutral-300">
              <a href="#escaner-gratis" className="text-[#38bdf8] font-bold hover:text-white transition-colors flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>Escáner gratis</span>
              </a>
              <a href="#problemas" className="hover:text-white transition-colors">Problemas</a>
              <a href="#servicios" className="hover:text-sky-400 transition-colors">Servicios</a>
              <a href="#planes" className="hover:text-[#30d158] transition-colors">Planes mensuales</a>
              <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
              <a href="#casos-reales" className="hover:text-white transition-colors">Casos reales</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </nav>

            {/* Botón WhatsApp de Contacto Oficial */}
            <div className="flex items-center gap-2.5">
              <a
                href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ service: 'general', placement: 'sticky_header' })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black text-xs sm:text-sm font-bold shadow-md shadow-[#25D366]/20 transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                <span>WhatsApp</span>
              </a>
            </div>

          </div>

          {/* Navegación Rápida Móvil (Barra horizontal de acceso con un toque) */}
          <div className="lg:hidden border-t border-white/10 bg-black/60 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <a href="#escaner-gratis" className="px-3.5 py-1 rounded-full bg-[#0071e3] text-white whitespace-nowrap font-bold shadow-sm shadow-[#0071e3]/30">Escáner gratis</a>
            <a href="#problemas" className="px-3 py-1 rounded-full bg-white/5 text-neutral-300 hover:text-white whitespace-nowrap">Problemas</a>
            <a href="#servicios" className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 hover:text-sky-300 whitespace-nowrap font-medium border border-sky-500/20">Servicios</a>
            <a href="#planes" className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 whitespace-nowrap font-medium border border-emerald-500/20">Planes</a>
            <a href="#como-funciona" className="px-3 py-1 rounded-full bg-white/5 text-neutral-300 hover:text-white whitespace-nowrap">Cómo funciona</a>
            <a href="#casos-reales" className="px-3 py-1 rounded-full bg-white/5 text-neutral-300 hover:text-white whitespace-nowrap">Casos reales</a>
            <a href="#faq" className="px-3 py-1 rounded-full bg-white/5 text-neutral-300 hover:text-white whitespace-nowrap">FAQ</a>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-14 space-y-16 sm:space-y-24 flex-1 w-full overflow-x-hidden">
          
          {/* SECCIÓN 1: HERO COMERCIAL */}
          <DefensatiHero />

          {/* SECCIÓN 2: ESCÁNER GRATUITO GIGANTE (PROMINENTE, LEAD MAGNET PRINCIPAL) */}
          <section id="escaner-gratis" className="w-full max-w-4xl xl:max-w-5xl mx-auto space-y-8 scroll-mt-24 text-center">
            
            <div className="relative space-y-6 sm:space-y-8 p-8 sm:p-14 lg:p-16 rounded-[36px] sm:rounded-[48px] bg-[#121316]/90 border-2 border-white/15 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.85),0_0_80px_rgba(0,113,227,0.18),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden">
              
              {/* Resplandor cósmico ambiental superior */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#0071e3]/25 via-[#38bdf8]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-full bg-[#0071e3]/15 border border-[#0071e3]/30 text-[#38bdf8] text-xs sm:text-sm font-bold tracking-wide shadow-[0_0_20px_rgba(0,113,227,0.25)]">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
                  <span>AUDITORÍA PERIMETRAL EN VIVO • 100% GRATUITA</span>
                </div>
                
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#f5f5f7] tracking-[-0.035em] leading-[1.1] max-w-3xl mx-auto">
                  Prueba el escáner gratuito de tu web
                </h2>
                
                <p className="text-base sm:text-lg lg:text-xl text-[#a1a1a6] font-normal leading-relaxed max-w-2xl mx-auto pt-1">
                  Analiza al instante certificados SSL/TLS, cabeceras HTTP de transporte, puertos expuestos y blindaje sin costo ni contraseñas.
                </p>
              </div>

              {/* Formulario de Escaneo con Casilla de Consentimiento */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleScan();
                }}
                className="relative z-10 pt-2 sm:pt-4 max-w-2xl xl:max-w-3xl mx-auto space-y-4 text-left"
              >
                <div className="relative p-2 sm:p-2.5 rounded-full bg-black/60 border-2 border-white/20 backdrop-blur-3xl shadow-[0_12px_40px_rgba(0,113,227,0.25)] flex items-center gap-2 sm:gap-3 ring-2 ring-white/5 focus-within:ring-4 focus-within:ring-[#0071e3]/40 focus-within:border-[#0071e3] transition-all">
                  <div className="pl-4 sm:pl-5 text-[#38bdf8] shrink-0">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <input
                    id="url-scan-input-defensati"
                    type="text"
                    placeholder="https://tudominio.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-transparent border-none py-3 sm:py-4 px-1 text-base sm:text-xl text-[#f5f5f7] placeholder-neutral-500 focus:outline-none font-medium"
                  />
                  <button
                    type="submit"
                    disabled={loading || !legalConsent || !url.trim()}
                    title={!legalConsent ? 'Marca la casilla obligatoria para activar el botón' : 'Iniciar auditoría'}
                    className={`px-6 sm:px-10 py-3.5 sm:py-4 font-bold text-sm sm:text-base rounded-full transition-all flex items-center justify-center gap-2 shrink-0 ${
                      loading || !legalConsent || !url.trim()
                        ? 'bg-neutral-800 text-neutral-500 border border-white/10 cursor-not-allowed opacity-60'
                        : 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-[0_4px_25px_rgba(0,113,227,0.5)] cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Auditando...</span>
                      </>
                    ) : (
                      <>
                        <span>Auditar</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Casilla Obligatoria de Declaración Jurada (Ley N° 30096) */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 ${
                    legalConsent
                      ? 'bg-emerald-950/25 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                      : 'bg-[#141416]/95 border-white/15 hover:border-amber-500/50 shadow-xl'
                  }`}
                >
                  <label htmlFor="sworn-declaration-defensati-checkbox" className="flex items-start gap-3.5 cursor-pointer select-none">
                    <input
                      id="sworn-declaration-defensati-checkbox"
                      type="checkbox"
                      checked={legalConsent}
                      onChange={(e) => {
                        setLegalConsent(e.target.checked);
                        if (error) setError(null);
                      }}
                      className="mt-1 w-5 h-5 rounded-md border-white/30 bg-black text-[#0071e3] focus:ring-[#0071e3] focus:ring-offset-0 cursor-pointer accent-[#0071e3] shrink-0"
                    />
                    <div className="space-y-2 flex-1">
                      <p className="text-xs sm:text-[13.5px] text-neutral-200 leading-snug font-medium whitespace-normal">
                        “Declaro bajo juramento que soy el titular del dominio que voy a auditar, o que cuento con autorización expresa y por escrito de su propietario, conforme a la{' '}
                        <Link
                          href="/terminos#delitos-informaticos"
                          className="text-[#38bdf8] underline hover:text-white font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ley N° 30096, Delitos Informáticos del Perú
                        </Link>
                        . Entiendo que auditar una web ajena sin permiso puede ser delito.”
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                        <span
                          className={`text-[10px] sm:text-[11px] font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                            legalConsent
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {legalConsent ? '✓ Casilla Marcada • Botón Habilitado' : '⚠️ Casilla Requerida para Activar el Botón'}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-neutral-400 font-mono">
                          (Guardamos dominio, fecha, hora e IP como prueba legal de autorización)
                        </span>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Widget Oficial Cloudflare Turnstile Anti-Bot */}
                <div className="pt-1 flex flex-col items-center justify-center">
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
                </div>
              </form>

              {/* Botones de 1-clic para auditorías de prueba representativas */}
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs text-neutral-300 pt-3">
                <span className="text-neutral-400 text-xs font-medium">O prueba un caso típico:</span>
                {[
                  { label: '🛒 Tienda WooCommerce', domain: 'tienda-demo.pe' },
                  { label: '🏢 Web Corporativa', domain: 'corporativo-demo.pe' },
                  { label: '⚡ bcp.com.pe', domain: 'bcp.com.pe' },
                  { label: '🐙 github.com', domain: 'github.com' },
                ].map((demo) => (
                  <button
                    key={demo.domain}
                    type="button"
                    onClick={() => {
                      const demoUrl = `https://${demo.domain}`;
                      setUrl(demoUrl);
                      setLegalConsent(true);
                      handleScan(demoUrl, true);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/15 text-sky-400 hover:text-sky-300 font-semibold text-xs transition-all cursor-pointer shadow-sm"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>

              {/* Ticker de auditorías recientes en vivo */}
              <div className="relative z-10 pt-2">
                <RecentScansTicker />
              </div>

              {/* Micro-garantías visuales de confianza técnica */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs sm:text-sm text-neutral-300 text-left sm:text-center">
                <div className="flex items-center sm:justify-center gap-2 p-2.5 rounded-xl bg-white/[0.03]">
                  <span className="text-emerald-400 text-base">⚡</span>
                  <span>Análisis perimetral 100% pasivo</span>
                </div>
                <div className="flex items-center sm:justify-center gap-2 p-2.5 rounded-xl bg-white/[0.03]">
                  <span className="text-[#38bdf8] text-base">🔒</span>
                  <span>Cero contraseñas requeridas</span>
                </div>
                <div className="flex items-center sm:justify-center gap-2 p-2.5 rounded-xl bg-white/[0.03]">
                  <span className="text-purple-400 text-base">📋</span>
                  <span>Dictamen técnico en PDF</span>
                </div>
              </div>

              {/* Comparador de Competencia */}
              <div className="relative z-10 pt-2">
                <CompetitorComparisonSection />
              </div>

              {/* Animación del Escáner */}
              {loading && <NeuralScanTakeover targetUrl={url || 'sitio web'} />}

              {error && (
                <div className="relative z-10 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

          </section>

          {/* RESULTADOS DEL ESCÁNER + BOTÓN DESTACADO "LO ARREGLAMOS POR TI" [Escaner] */}
          {report && (
            <div ref={resultsRef} className="space-y-8 pt-4 scroll-mt-20">
              
              {/* Tarjeta superior con datos analizados y descarga de dictamen */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#161618] border border-white/10 shadow-2xl backdrop-blur-2xl">
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Sitio Web Analizado</span>
                  <h3 className="text-xl font-bold text-white break-all">{report.url}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Selector de Vista del PDF: Gerencia vs Dev vs Completo */}
                  <div className="inline-flex items-center p-1 rounded-xl bg-black/50 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setPdfViewMode('management')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        pdfViewMode === 'management'
                          ? 'bg-[#0071e3] text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                      title="PDF de 1 página para el Gerente o Finanzas con pérdidas en Soles y ROI"
                    >
                      💼 Gerencia
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfViewMode('dev')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        pdfViewMode === 'dev'
                          ? 'bg-[#0071e3] text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                      title="PDF de 1 página técnica para Desarrolladores / Sysadmin con RFC y código"
                    >
                      🛠️ Dev
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfViewMode('both')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        pdfViewMode === 'both'
                          ? 'bg-[#0071e3] text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                      title="PDF completo de 2 páginas con ambas vistas"
                    >
                      Ambas
                    </button>
                  </div>

                  <button
                    onClick={() => handlePrint(pdfViewMode)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0071e3] to-[#2997ff] hover:from-[#0077ed] hover:to-[#38bdf8] active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    title="Descargar dictamen forense en formato PDF con membrete oficial"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>Descargar PDF ({pdfViewMode === 'management' ? 'Gerencia' : pdfViewMode === 'dev' ? 'Dev' : 'Completo'})</span>
                  </button>
                  <button
                    onClick={copyShareLink}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                    <span>{copied ? 'Copiado' : 'Compartir'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompetitorModalOpen(true)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-[#0071e3]/15 hover:bg-[#0071e3]/25 active:scale-[0.98] border border-[#0071e3]/30 text-[#38bdf8] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    title="Comparar tu puntaje frente a un competidor"
                  >
                    <Swords className="w-4 h-4 text-[#38bdf8]" />
                    <span>Comparar Competidor</span>
                  </button>
                </div>
              </div>

              {/* BOTÓN PROMINENTE & RECOMENDACIÓN COMERCIAL DINÁMICA POST-ESCÁNER */}
              <DefensatiScanRecommendation 
                report={report} 
                cleanDomain={cleanDomain}
                auditId={auditId || undefined}
                onNavigateToSection={(section) => {
                  if (section === 'headers' || section === 'ports') {
                    setViewMode('tech');
                  }
                  setTimeout(() => {
                    const el = document.getElementById(`section-${section}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.classList.add('ring-4', 'ring-[#0071e3]', 'shadow-[0_0_40px_rgba(0,113,227,0.5)]', 'transition-all');
                      setTimeout(() => {
                        el.classList.remove('ring-4', 'ring-[#0071e3]', 'shadow-[0_0_40px_rgba(0,113,227,0.5)]');
                      }, 2200);
                    }
                  }, 150);
                }}
              />

              {/* Selector de Perspectiva (Negocio vs Técnico) */}
              <div className="flex justify-center py-2">
                <div className="inline-flex p-1.5 rounded-2xl bg-[#161618] border border-white/15 shadow-2xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('business')}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                      viewMode === 'business'
                        ? 'bg-[#0071e3] text-white shadow-xl shadow-[#0071e3]/40 scale-[1.02]'
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
                        ? 'bg-[#0071e3] text-white shadow-xl shadow-[#0071e3]/40 scale-[1.02]'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Detalle Técnico</span>
                  </button>
                </div>
              </div>

              {/* Calificación y SSL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 rounded-3xl bg-white/2 border border-white/5 p-6 backdrop-blur-xl">
                  <ScoreCircle score={report.score} grade={report.grade || 'F'} />
                </div>
                <div id="section-ssl" className="md:col-span-2 rounded-3xl bg-white/2 border border-white/5 p-6 backdrop-blur-xl scroll-mt-24 transition-all duration-300">
                  <SslResults ssl={report.ssl} />
                </div>
              </div>

              {/* Localización y Widgets */}
              <ServerLocationCard 
                location={report.location} 
                resolvedIp={report.telemetry?.targetResolvedIp} 
                targetDomain={report.url}
              />

              <SslAlertWidget 
                domain={report.url} 
                daysRemaining={report.ssl?.daysRemaining} 
              />

              {/* Diagnóstico Perimetral Avanzado: WAF, CMS, Mixed Content y Malware */}
              <WebAuditCard
                waf={report.waf}
                cms={report.cms}
                mixedContent={report.mixedContent}
                malware={report.malware}
                commercial={report.commercial}
              />

              {/* Termómetro Comparativo: Tu Web vs. Mercado Peruano */}
              <SecurityBenchmarkBar
                score={report.score ?? 50}
                grade={report.grade || 'F'}
                domain={report.url}
              />

              {/* Detalle según modo */}
              {viewMode === 'business' ? (
                <div className="space-y-6">
                  <BusinessOverview report={report} />
                  <AnpdpComplianceCard
                    domain={report.url}
                    hasValidSsl={Boolean(report.ssl?.valid) && report.ssl?.protocol !== 'Sin HTTPS'}
                    hasDowngradeRisk={Boolean(report.headers?.some(h => !h.present && (h.header || h.name || '').toLowerCase().includes('transport-security')))}
                    hasOpenAdminPorts={Boolean(report.ports?.some(p => p.isOpen && [21, 22, 3306, 5432, 1433, 6379, 3389, 445, 27017].includes(p.port)))}
                    cookiesSecure={Boolean(!report.cookies || report.cookies.totalCookies === 0 || report.cookies.secureCookies === report.cookies.totalCookies)}
                    isHyperscale={Boolean(report.isHyperscale) || isHyperscalePlatform(report.url)}
                  />
                  <RoiLossCalculator
                    domain={report.url}
                    hasAdPixel={report.commercial?.hasActiveMarketing}
                    hasEcommerce={report.cms?.isEcommerce}
                    isOptimal={(report.score ?? 0) >= 90 && (!report.headers || report.headers.filter(h => !h.present).length === 0)}
                    isHyperscale={Boolean(report.isHyperscale) || isHyperscalePlatform(report.url)}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {Boolean(report.ports?.length) && (
                    <div id="section-ports" className="rounded-3xl bg-white/2 border border-white/5 p-6 backdrop-blur-xl scroll-mt-24 transition-all duration-300">
                      <PortResults ports={report.ports || []} />
                    </div>
                  )}

                  <div id="section-headers" className="rounded-3xl bg-white/2 border border-white/5 p-6 backdrop-blur-xl scroll-mt-24 transition-all duration-300">
                    <HeaderResults headers={report.headers || []} />
                  </div>

                  <CookieResults cookies={report.cookies} />

                  <div className="rounded-3xl bg-white/2 border border-white/5 p-6 backdrop-blur-xl">
                    <RemediationList items={report.remediations || []} />
                  </div>

                  <div className="rounded-3xl bg-white/2 border border-white/5 p-6 backdrop-blur-xl">
                    <TechnicalLogs 
                      id={auditId || ''} 
                      telemetry={report.telemetry} 
                      scannedAt={report.scannedAt || ''} 
                    />
                  </div>
                </div>
              )}

              {/* Hub de Comunidad y Difusión Viral */}
              <SocialViralHub targetUrl={report.url} score={report.score} />

              {/* Modal de Captura de Lead al Descargar PDF */}
              <PdfLeadModal
                isOpen={pdfModalOpen}
                onClose={() => setPdfModalOpen(false)}
                onConfirm={() => {
                  setPdfModalOpen(false);
                  executePrint(pdfViewMode);
                }}
                domain={report.url}
                pdfViewMode={pdfViewMode}
              />

              {/* Modal de Duelo / Comparativa con Competidor */}
              <CompetitorDuelModal
                isOpen={competitorModalOpen}
                onClose={() => setCompetitorModalOpen(false)}
                userDomain={report.url}
                userScore={report.score ?? 50}
                userGrade={report.grade || 'F'}
              />

              {/* Barra Flotante Inferior de Conversión (Móvil / Desktop) */}
              <MobileStickyConversionBar
                score={report.score ?? 50}
                grade={report.grade || 'F'}
                domain={report.url}
                auditId={auditId || undefined}
                onDownloadPdf={() => handlePrint(pdfViewMode)}
              />
            </div>
          )}

          {/* SECCIÓN 3: ALCANCE TÉCNICO (Qué SÍ detecta y qué NO detecta) */}
          <DefensatiScanScope />

          {/* SECCIÓN 4: PROBLEMAS QUE SOLUCIONAMOS */}
          <DefensatiProblems />

          {/* SECCIÓN 5: SERVICIOS OFICIALES */}
          <DefensatiPricing targetUrl={report?.url} />

          {/* SECCIÓN 6: PLANES MENSUALES (Monitoreo & Tranquilidad) */}
          <DefensatiMonthlyPlans />

          {/* SECCIÓN 7: CÓMO TRABAJAMOS (3 Pasos Simples) */}
          <DefensatiHowItWorks />

          {/* SECCIÓN 8: CASOS REALES Y CONTEXTO EN EL MERCADO PERUANO */}
          <DefensatiCases />

          {/* SECCIÓN 9: CONFIANZA & GARANTÍA OFICIAL */}
          <DefensatiWarranty />

          {/* SECCIÓN 10: FORMULARIO OFICIAL DE CONTRATACIÓN Y SOLICITUD TÉCNICA */}
          <DefensatiQuickContact initialUrl={url} />

          {/* SECCIÓN 11: PREGUNTAS FRECUENTES */}
          <DefensatiFAQ />

          {/* SECCIÓN 12: CTA FINAL DE CONVERSIÓN */}
          <DefensatiFinalCTA />

        </main>

        {/* PIE DE PÁGINA (Contacto, Confianza, RUC, WhatsApp +1, Términos y Libro de Reclamaciones) */}
        <footer className="border-t border-white/10 py-14 text-xs text-neutral-400 bg-[#000000]/95 backdrop-blur-xl mt-20">
          <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
            
            {/* Canales de Contacto */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* WhatsApp Oficial Apple Pill */}
              <a
                href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ service: 'general', placement: 'footer' })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold transition-all shadow-[0_0_15px_rgba(37,211,102,0.15)]"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                <span>WhatsApp: {siteConfig.contact.whatsappFormatted}</span>
              </a>

              {/* Email Apple Pill */}
              <a
                href="mailto:contacto@neuronalgravity.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#f5f5f7] font-medium transition-all"
              >
                <span>contacto@neuronalgravity.com</span>
              </a>

              {/* Horario de Atención Apple Pill */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[#f5f5f7] font-medium">
                <Clock className="w-4 h-4 text-[#38bdf8] shrink-0" />
                <span>Horario: {siteConfig.contact.hours}</span>
              </div>
            </div>

            {/* Créditos y Legalidad */}
            <div className="space-y-3 text-center max-w-3xl mx-auto">
              <p className="font-semibold text-white text-sm">
                &copy; 2026 DEFENSA TI &bull; Soluciones Tecnológicas &bull; RUC {siteConfig.business.ruc}
              </p>
              
              <p className="text-[11px] text-neutral-400">
                Parte del ecosistema tecnológico <a href="https://neuronalgravity.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline font-bold">NeuronalGravity.com</a>
              </p>

              {/* Enlaces Legales Requeridos (Libro de Reclamaciones y Términos) */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-300 pt-2 border-t border-white/10">
                <Link href="/terminos" className="hover:text-white transition-colors underline font-medium">
                  Términos y Política de Privacidad (Perú)
                </Link>
                <span>&bull;</span>
                <Link href="/reclamaciones" className="hover:text-amber-300 transition-colors underline font-bold text-amber-400">
                  Libro de Reclamaciones Conforme a Ley
                </Link>
              </div>

              <p className="text-[10px] text-neutral-500 leading-relaxed pt-2">
                <strong>Aviso Legal y Descargo:</strong> DEFENSA TI brinda servicios de remediación de software, limpieza y hardening perimetral de servidores y directivas de transporte HTTP según estándares públicos OWASP. El servicio se entrega con comprobante formal bajo RUC 10704877850.
              </p>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}
