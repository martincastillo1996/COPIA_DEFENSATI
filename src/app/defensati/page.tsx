'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import PrintableReport from '@/components/PrintableReport';
import ScoreCircle from '@/components/ScoreCircle';
import SslResults from '@/components/SslResults';
import PortResults from '@/components/PortResults';
import HeaderResults from '@/components/HeaderResults';
import CookieResults from '@/components/CookieResults';
import RemediationList from '@/components/RemediationList';
import TechnicalLogs from '@/components/TechnicalLogs';
import NeuralScanTakeover from '@/components/NeuralScanTakeover';
import WebAuditCard from '@/components/WebAuditCard';
import PdfLeadModal from '@/components/PdfLeadModal';
import MobileStickyConversionBar from '@/components/MobileStickyConversionBar';
import { isHyperscalePlatform } from '@/lib/hyperscalers';

import DefensatiResultsReport from '@/components/defensati/DefensatiResultsReport';
import DefensatiHero from '@/components/defensati/DefensatiHero';
import DefensatiOdyssey from '@/components/defensati/odyssey/DefensatiOdyssey';
import CyberWorld from '@/components/defensati/world/CyberWorld';
import DefensatiPlans from '@/components/defensati/DefensatiPlans';
import DefensatiProcess from '@/components/defensati/DefensatiProcess';
import DefensatiFAQ from '@/components/defensati/DefensatiFAQ';
import DefensatiQuickContact from '@/components/defensati/DefensatiQuickContact';
import CompetitorComparisonSection from '@/components/CompetitorComparisonSection';
import CompetitorDuelModal from '@/components/CompetitorDuelModal';
import AttackSurfaceCard from '@/components/AttackSurfaceCard';
import WebAppSecurityCard from '@/components/WebAppSecurityCard';
import CveIntelCard from '@/components/CveIntelCard';
import ComplianceCard from '@/components/ComplianceCard';

import { siteConfig } from '@/config/site';
import { SERVICE_PAGES } from '@/config/servicePages';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';
import { useSecurityScan } from '@/features/scanner/useSecurityScan';
import { DEMO_REPORT } from '@/lib/scanner/demoReport';

const NAV = [
  ['#capitulo-reconocimiento', 'Recorrido'],
  ['#escaner-perimetral', 'Escáner'],
  ['#servicios', 'Precios'],
  ['#como-funciona', 'Metodología'],
  ['#faq', 'Preguntas'],
] as const;

export default function DefensatiPage() {
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [pdfViewMode, setPdfViewMode] = useState<'both' | 'management' | 'dev'>('both');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [competitorModalOpen, setCompetitorModalOpen] = useState(false);

  const {
    url,
    setUrl,
    loading,
    report,
    setReport,
    auditId,
    setAuditId,
    error,
    setError,
    legalConsent,
    setLegalConsent,
    setTurnstileToken,
    turnstileRef,
    resultsRef,
    handleScan,
  } = useSecurityScan();

  const handleLoadDemo = () => {
    setReport(DEMO_REPORT);
    setAuditId('DEMO-EJEMPLO-2026');
    setUrl('https://ejemplo-empresa-demo.pe');
    setLegalConsent(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const copyShareLink = () => {
    if (!auditId) return;
    try {
      if (report) localStorage.setItem(`report_${auditId}`, JSON.stringify(report));
    } catch {
      // Ignorar fallo de almacenamiento local
    }
    navigator.clipboard.writeText(`${window.location.origin}/report/${auditId}`);
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
    setTimeout(() => window.print(), 60);
  };

  const handlePrint = (mode: 'both' | 'management' | 'dev' = pdfViewMode) => {
    setPdfViewMode(mode);
    setPdfModalOpen(true);
  };

  // Reacción 3D: sincronización de estados con el canvas Three.js
  useEffect(() => {
    const detail = loading
      ? { state: 'scanning' }
      : report
      ? { state: 'done', score: report.score }
      : { state: 'idle' };
    window.dispatchEvent(new CustomEvent('defensati:scan', { detail }));
  }, [loading, report]);

  const cleanDomain = report?.url
    ? report.url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
    : '';
  const isHyperscale = report ? Boolean(report.isHyperscale) || isHyperscalePlatform(report.url) : false;

  return (
    <div className="ice relative min-h-screen font-sans antialiased overflow-x-clip selection:bg-[#cfe3ee] selection:text-[#0a0c0f]">
      <CyberWorld />
      {report && auditId && <PrintableReport report={report} auditId={auditId} pdfViewMode={pdfViewMode} />}

      <div className="relative z-10 print:hidden flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 border-b ed-line bg-[#0a0c0f]/80 backdrop-blur-md">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-14 grid grid-cols-12 items-center gap-4">
            <Link href="/defensati" className="col-span-6 lg:col-span-3 flex items-center gap-3">
              <span className="w-2 h-2 bg-[#cfe3ee]" aria-hidden />
              <span className="hud-label !text-[#e8edf1] !tracking-[0.24em]">Defensa TI</span>
            </Link>
            <nav className="hidden lg:flex col-span-6 justify-center gap-8">
              {NAV.map(([href, label], i) => (
                <a key={href} href={href} className="hud-label hover:!text-[#e8edf1] transition-colors">
                  <span className="text-[#7d8891] mr-1.5">0{i + 1}</span>{label}
                </a>
              ))}
            </nav>
            <div className="col-span-6 lg:col-span-3 flex items-center justify-end gap-2">
              <button type="button" onClick={handleLoadDemo} className="hidden md:inline-flex hud-btn !py-2 !px-3">
                Demo
              </button>
              <a
                href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ service: 'general', placement: 'sticky_header' })}
                className="hud-btn hud-btn-solid !py-2 !px-3"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current" /> Contacto
              </a>
            </div>
          </div>
          <nav className="lg:hidden border-t ed-line px-4 flex gap-6 overflow-x-auto no-scrollbar py-2.5">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="hud-label whitespace-nowrap">{label}</a>
            ))}
          </nav>
        </header>

        <DefensatiOdyssey />

        <main className="max-w-[1440px] mx-auto px-4 sm:px-8 flex-1 w-full">
          {/* Fase 06 · Detección: escáner perimetral sobre el mismo mundo 3D */}
          <div id="escaner-perimetral" data-phase="6">
            <DefensatiHero
              url={url}
              setUrl={setUrl}
              loading={loading}
              legalConsent={legalConsent}
              setLegalConsent={setLegalConsent}
              turnstileRef={turnstileRef}
              setTurnstileToken={setTurnstileToken}
              handleScan={handleScan}
              error={error}
              setError={setError}
              onLoadDemo={handleLoadDemo}
            />

            {/* Comparativa Cara a Cara de Competidores */}
            <div className="mt-6">
              <CompetitorComparisonSection />
            </div>
          </div>

          {/* Modal Overlay durante el escaneo en progreso */}
          {loading && <NeuralScanTakeover targetUrl={url || 'sitio web'} />}

          {/* 2. Screen 2: App Frame / High Density Dashboard de Auditoría */}
          {report && (
            <div ref={resultsRef} className="space-y-8 scroll-mt-20 py-16">
              <DefensatiResultsReport
                report={report}
                cleanDomain={cleanDomain}
                auditId={auditId}
                isHyperscale={isHyperscale}
                copied={copied}
                onPdf={(mode) => handlePrint(mode)}
                onShare={copyShareLink}
                onDuel={() => setCompetitorModalOpen(true)}
                onFull={() => setShowFull((v) => !v)}
                fullOpen={showFull}
              />

              {showFull && (
                <div className="space-y-8 bg-[#0a0c0f] border border-white/10 p-5 sm:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="taste-card p-6 border ed-line">
                      <ScoreCircle score={report.score} grade={report.grade || 'F'} />
                    </div>
                    <div id="section-ssl" className="md:col-span-2 taste-card p-6 border ed-line scroll-mt-24">
                      <SslResults ssl={report.ssl} />
                    </div>
                  </div>

                  {/* Diagnóstico Perimetral Avanzado: WAF, CMS/Plugins, Contenido Mixto y Malware */}
                  <WebAuditCard
                    waf={report.waf}
                    cms={report.cms}
                    mixedContent={report.mixedContent}
                    malware={report.malware}
                    commercial={report.commercial}
                    domain={report.url}
                    isHyperscale={isHyperscale}
                  />

                  {/* Inteligencia de Vulnerabilidades CVE */}
                  <CveIntelCard cveIntel={report.cveIntel} />

                  {/* Superficie de Ataque, DNS, Correo y TLS Profundo (scanTlsDeep + Buckets Públicos) */}
                  <AttackSurfaceCard asm={report.asm} />

                  {/* Seguridad de Aplicación Web (Endpoints, APIs, WordPress, CORS, Source Maps) */}
                  <WebAppSecurityCard webApp={report.webApp} />

                  {/* Cumplimiento Normativo */}
                  <ComplianceCard compliance={report.compliance} reportId={report.id} hasIntegrity={Boolean(report.integrity)} diff={report.diff} />

                  <div id="section-ports" className="taste-card p-6 border ed-line scroll-mt-24">
                    <PortResults ports={report.ports || []} verification={report.portsVerification} />
                  </div>

                  <div id="section-headers" className="taste-card p-6 border ed-line scroll-mt-24">
                    <HeaderResults headers={report.headers || []} domain={report.url} />
                  </div>

                  <CookieResults cookies={report.cookies} />

                  <div className="taste-card p-6 border ed-line">
                    <RemediationList items={report.remediations || []} />
                  </div>

                  <div className="taste-card p-6 border ed-line">
                    <TechnicalLogs id={auditId || ''} telemetry={report.telemetry} scannedAt={report.scannedAt || ''} />
                  </div>
                </div>
              )}

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

              {/* Modal de Duelo Comparativo contra Competidor */}
              <CompetitorDuelModal
                isOpen={competitorModalOpen}
                onClose={() => setCompetitorModalOpen(false)}
                userDomain={cleanDomain}
                userScore={report?.score || 0}
                userGrade={(report?.grade as 'A+' | 'A' | 'B' | 'C' | 'D' | 'F') || 'F'}
              />

              <MobileStickyConversionBar
                score={report.score ?? 50}
                grade={report.grade || 'F'}
                domain={report.url}
                auditId={auditId || undefined}
                onDownloadPdf={() => handlePrint(pdfViewMode)}
              />
            </div>
          )}

          <div className="space-y-32 sm:space-y-40 py-24">

          {/* 4. Screen 4: Precios y Catálogo Oficial DEFENSA TI */}

          <div data-phase="7">
            <DefensatiPlans targetUrl={report?.url} />
          </div>

          {/* 5. Screen 5: Metodología Sin Sorpresas + Garantía Escrita */}
          <div data-phase="8" className="space-y-32 sm:space-y-40">
          <DefensatiProcess />

          {/* 6. Screen 6: Preguntas Frecuentes & Despacho Técnico */}
          <DefensatiFAQ />

          {/* Formulario de Contacto Técnico y Contratación Rápida */}
          <DefensatiQuickContact initialUrl={url} />
          </div>
          </div>
        </main>

        {/* Footer.closing: Récord legal, RUC 10704877850 y Navegación de Servicios */}
        <footer className="border-t ed-line py-16 text-xs text-[#7d8891] mt-24">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 grid grid-cols-12 gap-y-8 lg:gap-x-12">
            <div className="col-span-12 lg:col-span-4 space-y-2">
              <p className="hud-label !text-[#e8edf1] mb-4">DEFENSA TI · RUC {siteConfig.business.ruc}</p>
              <p>Especialista a cargo: Martín Castillo</p>
              <p>Horario de auditoría: {siteConfig.contact.hours}</p>
              <a
                href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ service: 'general', placement: 'footer' })}
                className="inline-flex items-center gap-1.5 text-[#cfe3ee] hover:underline pt-1"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current" /> {siteConfig.contact.whatsappFormatted}
              </a>
              <p className="pt-1">
                <a href="mailto:contacto@neuronalgravity.com" className="hover:text-[#e8edf1]">
                  contacto@neuronalgravity.com
                </a>
              </p>
            </div>

            <nav aria-label="Servicios de DEFENSA TI" className="col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {SERVICE_PAGES.map((s) => (
                <Link key={s.slug} href={`/defensati/servicios/${s.slug}`} className="hover:text-[#e8edf1] leading-snug">
                  {s.shortName}
                </Link>
              ))}
            </nav>

            <div className="col-span-12 lg:col-span-3 space-y-2">
              <Link href="/terminos" className="block hover:text-[#e8edf1]">
                Términos, Privacidad y Ley N° 29733
              </Link>
              <Link href="/reclamaciones" className="block hover:text-[#e8edf1]">
                Libro de Reclamaciones
              </Link>
              <a href="https://neuronalgravity.com" className="block hover:text-[#e8edf1]">
                Neuronal Gravity
              </a>
              <p className="pt-2 text-[11px] text-[#4a535b]">
                Defensa perimetral pasiva. Cumplimiento estricto con la Ley N° 30096 sobre delitos informáticos.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
