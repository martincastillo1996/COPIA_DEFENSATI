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
  Cpu
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
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
import CompetitorComparisonSection from '@/components/CompetitorComparisonSection';

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
  const [legalConsent, setLegalConsent] = useState(false);
  const [showCyberHud, setShowCyberHud] = useState(false);
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
        body: JSON.stringify({ url: finalUrl, legalConsentAccepted: true }),
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
    }
  }, [url, legalConsent]);

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
    <div className="relative min-h-screen bg-[#000000] text-[#f5f5f7] selection:bg-[#0071e3] selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Fondo interactivo y luces ambientales (El fondo clásico original de DEFENSA TI) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50">
        <NeuralBackground 
          onSelectDomain={(selectedDomain) => {
            setUrl(`https://${selectedDomain}`);
            const inputEl = document.getElementById('url-scan-input-defensati');
            if (inputEl) {
              inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setTimeout(() => inputEl.focus(), 300);
            }
          }}
        />
        <div className="absolute inset-0 bg-radial from-[#000000]/30 via-[#000000]/55 to-[#000000]/80" />
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
      {report && auditId && <PrintableReport report={report} auditId={auditId} />}

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
              <a href="#problemas" className="hover:text-white transition-colors">Problemas</a>
              <a href="#servicios" className="hover:text-sky-400 transition-colors">Servicios</a>
              <a href="#planes" className="hover:text-[#30d158] transition-colors">Planes mensuales</a>
              <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
              <a href="#casos-reales" className="hover:text-white transition-colors">Casos reales</a>
              <a href="#escaner-gratis" className="hover:text-[#38bdf8] transition-colors">Escáner gratis</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </nav>

            {/* Botón WhatsApp de Contacto Oficial */}
            <div className="flex items-center gap-2.5">
              <a
                href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ service: 'general', placement: 'sticky_header' })}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black text-xs sm:text-sm font-bold shadow-md shadow-[#25D366]/20 transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                <span>WhatsApp</span>
              </a>
            </div>

          </div>

          {/* Navegación Rápida Móvil (Barra horizontal de acceso con un toque) */}
          <div className="lg:hidden border-t border-white/10 bg-black/60 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <a href="#problemas" className="px-3 py-1 rounded-full bg-white/5 text-neutral-300 hover:text-white whitespace-nowrap">Problemas</a>
            <a href="#servicios" className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 hover:text-sky-300 whitespace-nowrap font-medium border border-sky-500/20">Servicios</a>
            <a href="#planes" className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 whitespace-nowrap font-medium border border-emerald-500/20">Planes</a>
            <a href="#como-funciona" className="px-3 py-1 rounded-full bg-white/5 text-neutral-300 hover:text-white whitespace-nowrap">Cómo funciona</a>
            <a href="#casos-reales" className="px-3 py-1 rounded-full bg-white/5 text-neutral-300 hover:text-white whitespace-nowrap">Casos reales</a>
            <a href="#escaner-gratis" className="px-3 py-1 rounded-full bg-[#0071e3]/20 text-[#38bdf8] hover:text-white whitespace-nowrap font-medium border border-[#0071e3]/30">Escáner gratis</a>
            <a href="#faq" className="px-3 py-1 rounded-full bg-white/5 text-neutral-300 hover:text-white whitespace-nowrap">FAQ</a>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-14 space-y-16 sm:space-y-24 flex-1 w-full overflow-x-hidden">
          
          {/* SECCIÓN 1: HERO COMERCIAL */}
          <DefensatiHero />

          {/* SECCIÓN 2: PROBLEMAS QUE SOLUCIONAMOS */}
          <DefensatiProblems />

          {/* SECCIÓN 3: SERVICIOS OFICIALES */}
          <DefensatiPricing targetUrl={report?.url} />

          {/* SECCIÓN 4: PLANES MENSUALES (Monitoreo & Tranquilidad) */}
          <DefensatiMonthlyPlans />

          {/* SECCIÓN 5: CÓMO TRABAJAMOS (3 Pasos Simples) */}
          <DefensatiHowItWorks />

          {/* SECCIÓN 6: ESCÁNER GRATUITO (Con Declaración Jurada Ley N° 30096) */}
          <section id="escaner-gratis" className="w-full max-w-3xl mx-auto space-y-6 scroll-mt-24 text-center">
            
            <div className="space-y-3 p-6 sm:p-7 rounded-3xl bg-[#141416]/90 border border-white/10 backdrop-blur-2xl shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-semibold">
                <Search className="w-3.5 h-3.5" />
                <span>Auditoría Perimetral Gratuita</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                Prueba el escáner gratuito de tu web
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl mx-auto">
                Analiza en segundos certificados SSL/TLS, cabeceras de transporte HTTP y puertos expuestos.
              </p>

              {/* Formulario de Escaneo con Casilla de Consentimiento */}
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
                    id="url-scan-input-defensati"
                    type="text"
                    placeholder="https://tudominio.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-transparent border-none py-2 text-[16px] sm:text-sm text-white placeholder-neutral-500 focus:outline-none font-normal"
                  />
                  <button
                    type="submit"
                    disabled={loading || !legalConsent || !url.trim()}
                    title={!legalConsent ? 'Marca la casilla obligatoria para activar el botón' : 'Iniciar auditoría'}
                    className={`px-4 sm:px-5 py-2.5 font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                      loading || !legalConsent || !url.trim()
                        ? 'bg-neutral-800 text-neutral-500 border border-white/5 cursor-not-allowed opacity-60'
                        : 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-lg shadow-[#0071e3]/30 cursor-pointer active:scale-[0.98]'
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

                {/* Casilla Obligatoria de Declaración Jurada (Ley N° 30096) */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 ${
                    legalConsent
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.12)]'
                      : 'bg-[#141416]/90 border-white/10 hover:border-amber-500/40 shadow-lg'
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
                      className="mt-1 w-4 h-4 rounded border-white/30 bg-black text-[#0071e3] focus:ring-[#0071e3] focus:ring-offset-0 cursor-pointer accent-[#0071e3] shrink-0"
                    />
                    <div className="space-y-1.5 flex-1">
                      <p className="text-xs sm:text-[12.5px] text-neutral-200 leading-snug font-medium whitespace-normal">
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
                          className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            legalConsent
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                          }`}
                        >
                          {legalConsent ? '✓ Casilla Marcada • Botón Habilitado' : '⚠️ Casilla Requerida para Activar el Botón'}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          (Guardamos dominio, fecha, hora e IP como prueba legal de autorización)
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </form>

              {/* Botones de ejemplo rápido */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-400 pt-2">
                <span>O prueba con un dominio modelo:</span>
                <button
                  type="button"
                  onClick={() => {
                    setUrl('https://github.com');
                    setLegalConsent(true);
                    handleScan('https://github.com', true);
                  }}
                  className="text-sky-400 hover:underline font-semibold cursor-pointer"
                >
                  github.com
                </button>
              </div>

              {/* Comparador de Competencia */}
              <div className="pt-4">
                <CompetitorComparisonSection />
              </div>

              {/* Animación del Escáner */}
              {loading && <NeuralScanTakeover targetUrl={url || 'sitio web'} />}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Explicación de Alcance Técnico: Qué SÍ detecta y qué NO detecta */}
            <DefensatiScanScope />

            {/* Formulario Sencillo de Consulta Directa por WhatsApp */}
            <DefensatiQuickContact initialUrl={url} />

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
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>Descargar PDF</span>
                  </button>
                  <button
                    onClick={copyShareLink}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0071e3]/30 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                    <span>{copied ? 'Enlace Copiado' : 'Compartir'}</span>
                  </button>
                </div>
              </div>

              {/* BOTÓN PROMINENTE & RECOMENDACIÓN COMERCIAL DINÁMICA POST-ESCÁNER */}
              <DefensatiScanRecommendation report={report} cleanDomain={cleanDomain} />

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
                <div className="md:col-span-2 rounded-3xl bg-white/2 border border-white/5 p-6 backdrop-blur-xl">
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

              {/* Detalle según modo */}
              {viewMode === 'business' ? (
                <BusinessOverview report={report} />
              ) : (
                <div className="space-y-6">
                  {Boolean(report.ports?.length) && (
                    <div className="rounded-3xl bg-white/2 border border-white/5 p-6 backdrop-blur-xl">
                      <PortResults ports={report.ports || []} />
                    </div>
                  )}

                  <div className="rounded-3xl bg-white/2 border border-white/5 p-6 backdrop-blur-xl">
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

              {/* Desplegable de Telemetría e Infraestructura (Solo visible tras escanear) */}
              <div className="rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setShowCyberHud(!showCyberHud)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-[#38bdf8] shrink-0">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        Telemetría y Motor Perimetral (Inspección a Nivel Sockets)
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Ver arquitectura técnica de sondeo asíncrono, RFC 1918 y puertos
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#38bdf8] bg-sky-500/10 px-3.5 py-1.5 rounded-full border border-sky-500/25 shrink-0 ml-3">
                    <span>{showCyberHud ? 'Ocultar telemetría' : 'Ver telemetría'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showCyberHud ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {showCyberHud && (
                  <div className="p-4 sm:p-6 pt-0 border-t border-white/5 animate-in fade-in duration-300">
                    <AppleCyberHud />
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SECCIÓN 7: CASOS REALES Y CONTEXTO EN EL MERCADO PERUANO */}
          <DefensatiCases />

          {/* SECCIÓN 8: CONFIANZA & GARANTÍA OFICIAL */}
          <DefensatiWarranty />

          {/* SECCIÓN 9: PREGUNTAS FRECUENTES */}
          <DefensatiFAQ />

          {/* SECCIÓN 10: CTA FINAL DE CONVERSIÓN */}
          <DefensatiFinalCTA />

        </main>

        {/* PIE DE PÁGINA (Contacto, Confianza, RUC, WhatsApp +1, Términos y Libro de Reclamaciones) */}
        <footer className="border-t border-white/10 py-14 text-xs text-neutral-400 bg-[#000000]/95 backdrop-blur-xl mt-20">
          <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
            
            {/* Canales de Contacto */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* WhatsApp Oficial */}
              <a
                href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ service: 'general', placement: 'footer' })}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold transition-all shadow-[0_0_15px_rgba(37,211,102,0.15)]"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                <span>WhatsApp: {siteConfig.contact.whatsappFormatted}</span>
              </a>

              {/* Email */}
              <a
                href="mailto:contacto@neuronalgravity.com"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
              >
                <span>contacto@neuronalgravity.com</span>
              </a>
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
