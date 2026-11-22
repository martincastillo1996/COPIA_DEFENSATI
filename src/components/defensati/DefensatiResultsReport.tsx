'use client';

import React, { useMemo, useState } from 'react';
import { Download, Share2, Check, Swords } from 'lucide-react';
import { AuditReportRecord } from '@/lib/storage/reportStore';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';
import { P } from '@/config/catalog';
import HighDensitySecurityDashboard from '@/components/dashboard/HighDensitySecurityDashboard';
import EnterpriseThreatMatrix from '@/components/dashboard/EnterpriseThreatMatrix';
import { toScanApiResponse } from '@/lib/scanner/benchmarks';
import AttackSurfaceCard from '@/components/AttackSurfaceCard';
import WebAppSecurityCard from '@/components/WebAppSecurityCard';
import CveIntelCard from '@/components/CveIntelCard';

type Sev = 'critico' | 'alto' | 'medio' | 'ok';

interface Finding {
  id: string;
  sev: Sev;
  /** Frase para el dueño del negocio, sin jerga */
  title: string;
  /** Por qué le importa al negocio */
  why: string;
  /** Lo que ve el programador */
  dev: string;
  evidence: string;
  fix?: string;
  snippets?: { nginx?: string; apache?: string; express?: string };
}

const SEV_LABEL: Record<Sev, string> = { critico: 'Grave', alto: 'Importante', medio: 'Menor', ok: 'Correcto' };
const SEV_COLOR: Record<Sev, string> = { critico: '#ff4d4d', alto: '#ffb020', medio: '#38bdf8', ok: '#3ddc97' };
const PLURAL: Record<Sev, [string, string]> = { critico: ['grave', 'graves'], alto: ['importante', 'importantes'], medio: ['menor', 'menores'], ok: ['correcto', 'correctos'] };
const fmtDate = (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }); };
const SEV_ORDER: Record<Sev, number> = { critico: 0, alto: 1, medio: 2, ok: 3 };
const WHEN: Record<Sev, string> = { critico: 'Esta semana', alto: 'Este mes', medio: 'Cuando puedas', ok: '' };

/** Qué hace cada cabecera, dicho sin jerga. Solo efectos reales y verificables. */
const HEADER_PLAIN: Record<string, { title: string; why: string }> = {
  'content-security-policy': { title: 'No limita qué código puede cargar la página (Content-Security-Policy)', why: 'Sin esta regla, un script inyectado se ejecutaría sin restricción y podría leer lo que escriben los visitantes.' },
  'strict-transport-security': { title: 'No obliga a usar conexión segura (HSTS)', why: 'En una red WiFi ajena, un atacante podría forzar al visitante a usar la versión sin cifrar.' },
  'x-frame-options': { title: 'Puede mostrarse dentro de otra página (X-Frame-Options)', why: 'Un tercero podría incrustarla en su sitio y superponer botones falsos (clickjacking).' },
  'x-content-type-options': { title: 'Deja que el navegador adivine el tipo de archivo (X-Content-Type-Options)', why: 'Un archivo subido como imagen podría ejecutarse como script en ciertos navegadores.' },
  'referrer-policy': { title: 'Comparte la dirección de origen con otros sitios (Referrer-Policy)', why: 'Si la dirección incluye datos (ids, tokens), esos datos pueden llegar a sitios externos.' },
  'permissions-policy': { title: 'No limita cámara, micrófono ni ubicación (Permissions-Policy)', why: 'Un script de terceros podría solicitar esos permisos en nombre de la página.' },
};

function buildFindings(r: AuditReportRecord, isHyperscale: boolean): Finding[] {
  const out: Finding[] = [];
  const remByHeader = new Map((r.remediations || []).map((x) => [x.header.toLowerCase(), x]));

  // Certificado
  if (r.ssl) {
    if (!r.ssl.valid) {
      out.push({ id: 'ssl', sev: 'critico', title: 'El certificado de seguridad no es válido', why: 'Los navegadores muestran una advertencia de "sitio no seguro" a quien la visita.', dev: 'Certificado TLS inválido o ausente', evidence: `${r.ssl.protocol}${r.ssl.error ? ` · ${r.ssl.error}` : ''}` });
    } else if (r.ssl.daysRemaining <= 30) {
      out.push({ id: 'ssl', sev: r.ssl.daysRemaining <= 7 ? 'critico' : 'alto', title: `El certificado de seguridad vence en ${r.ssl.daysRemaining} días`, why: 'Al vencer, el navegador bloquea el acceso con una pantalla de advertencia hasta que se renueve.', dev: 'Certificado TLS próximo a vencer', evidence: `${r.ssl.issuer} · vence el ${fmtDate(r.ssl.validTo)}`, fix: 'Activar renovación automática (certbot / hosting) y alerta de expiración.' });
    } else {
      out.push({ id: 'ssl', sev: 'ok', title: 'Certificado de seguridad vigente', why: `Válido por ${r.ssl.daysRemaining} días más.`, dev: 'Certificado TLS válido', evidence: `${r.ssl.protocol} · ${r.ssl.issuer} · ${r.ssl.daysRemaining} días` });
    }
  }

  // Cabeceras
  for (const h of r.headers || []) {
    const key = (h.header || h.name || '').toLowerCase();
    const plain = HEADER_PLAIN[key];
    const rem = remByHeader.get(key);
    if (h.present && h.status === 'pass') {
      out.push({ id: `h-${key}`, sev: 'ok', title: `Protegido: ${h.name}`, why: '', dev: h.name, evidence: h.value || 'presente' });
      continue;
    }
    out.push({
      id: `h-${key}`,
      sev: h.severity === 'ALTA' ? 'alto' : 'medio',
      title: plain?.title || `Cabecera ${h.name} ${h.present ? 'mal configurada' : 'ausente'}`,
      why: plain?.why || h.description,
      dev: `Cabecera ${h.name} ${h.present ? 'mal configurada' : 'ausente'}`,
      evidence: h.value ? `Valor actual: ${h.value}` : 'No enviada por el servidor',
      fix: rem?.fix,
      snippets: rem?.snippets,
    });
  }

  // Puertos
  for (const p of (r.ports || []).filter((x) => x.isOpen)) {
    if (p.risk === 'BAJO' || p.port === 80) continue; // 80 abierto es normal (suele redirigir a HTTPS)
    out.push({
      id: `p-${p.port}`,
      sev: p.risk === 'CRÍTICO' ? 'critico' : p.risk === 'ALTO' ? 'alto' : 'medio',
      title: `Puerto ${p.port} (${p.shortName || p.service}) accesible desde internet`,
      why: p.description,
      dev: `Puerto ${p.port}/${p.service} abierto`,
      evidence: p.banner ? `Banner: ${p.banner}` : 'Conexión TCP aceptada desde internet',
      fix: `Cerrar el puerto ${p.port} en el firewall o limitarlo a IPs autorizadas.`,
    });
  }

  // Archivos sensibles
  for (const f of r.sensitiveFiles?.findings || []) {
    if (!f.isExposed) continue;
    out.push({ id: `f-${f.path}`, sev: f.severity === 'CRÍTICA' ? 'critico' : f.severity === 'ALTA' ? 'alto' : 'medio', title: `Archivo privado accesible públicamente: ${f.name}`, why: f.description, dev: `Archivo expuesto: ${f.path}`, evidence: f.evidence || 'Responde HTTP 200', fix: f.remediation });
  }

  // Malware
  if (r.malware?.isInfectedOrSuspicious) {
    out.push({ id: 'malware', sev: r.malware.threatLevel === 'CRÍTICO' ? 'critico' : 'alto', title: 'Se detectaron indicadores de infección', why: 'Un sitio infectado puede redirigir visitantes a páginas de estafa y ser marcado por Google con pantalla roja.', dev: 'Indicadores de malware', evidence: (r.malware.indicators || []).slice(0, 4).join(' · ') || r.malware.description, fix: r.malware.remediation });
  }

  // Firewall
  if (r.waf && !isHyperscale) {
    if (!r.waf.hasWaf) out.push({ id: 'waf', sev: 'alto', title: 'No se detectó un firewall delante del servidor', why: 'Sin firewall de aplicaciones (WAF), las peticiones automáticas llegan directo al servidor de origen.', dev: 'WAF no detectado', evidence: r.waf.details, fix: r.waf.remediation });
    else out.push({ id: 'waf', sev: 'ok', title: `Firewall activo${r.waf.provider ? ` (${r.waf.provider})` : ''}`, why: '', dev: 'WAF detectado', evidence: r.waf.details });
  }

  // Contenido mixto
  if (r.mixedContent?.hasMixedContent) {
    out.push({ id: 'mixed', sev: 'medio', title: `${r.mixedContent.count} elementos cargan sin cifrar dentro de una página segura`, why: 'El navegador puede quitar el candado de seguridad de la página.', dev: `${r.mixedContent.count} recursos HTTP en página HTTPS`, evidence: r.mixedContent.items.slice(0, 3).map((i) => i.url).join(' · '), fix: 'Cambiar las URLs http:// por https:// o rutas relativas.' });
  }

  // Cookies
  if (r.cookies && r.cookies.totalCookies > 0 && r.cookies.compliantCount < r.cookies.totalCookies) {
    const bad = r.cookies.items.filter((c) => !c.isCompliant);
    out.push({ id: 'cookies', sev: 'medio', title: `${r.cookies.totalCookies - r.cookies.compliantCount} de ${r.cookies.totalCookies} cookies sin protección completa`, why: 'Sin los atributos Secure y HttpOnly, la sesión de un usuario es más fácil de robar.', dev: `${bad.length}/${r.cookies.totalCookies} cookies sin Secure/HttpOnly/SameSite`, evidence: bad.slice(0, 3).map((c) => `${c.name}: ${c.issues.join(', ')}`).join(' · '), fix: 'Set-Cookie: nombre=valor; Secure; HttpOnly; SameSite=Lax' });
  }

  // Correo
  const dns = r.dnsSecurity as { dmarc?: { present?: boolean }; spf?: { present?: boolean } } | undefined;
  if (dns && (!dns.dmarc?.present || !dns.spf?.present)) {
    out.push({ id: 'mail', sev: 'medio', title: 'El dominio no tiene toda la protección de correo (SPF/DMARC)', why: 'Sin ella, terceros pueden enviar correos que aparentan venir del dominio y los legítimos pueden caer en spam.', dev: `${!dns.spf?.present ? 'SPF ausente' : ''}${!dns.spf?.present && !dns.dmarc?.present ? ' · ' : ''}${!dns.dmarc?.present ? 'DMARC ausente' : ''}`, evidence: 'Registros TXT del dominio', fix: 'Publicar SPF, DKIM y DMARC (p=quarantine) en el DNS.' });
  }

  // Amenazas de Secuestro de Datos (Ransomware)
  if (r.ransomware && r.ransomware.level !== 'BAJO') {
    out.push({
      id: 'ransomware',
      sev: r.ransomware.level === 'CRÍTICO' ? 'critico' : r.ransomware.level === 'ELEVADO' ? 'alto' : 'medio',
      title: `Riesgo de Secuestro de Datos: ${r.ransomware.level} (${r.ransomware.score}/100)`,
      why: r.ransomware.exposureSummary,
      dev: `Índice de Exposición a Ransomware: ${r.ransomware.score} pts. Perfil de amenazas: ${r.ransomware.threatActorsProfile.slice(0, 2).join(' · ')}`,
      evidence: Object.values(r.ransomware.vectors)
        .filter((v) => v.exposed)
        .flatMap((v) => v.evidence)
        .slice(0, 3)
        .join(' · ') || 'Servicios o puertos expuestos',
      fix: r.ransomware.remediationPlan[0],
    });
  }

  // DDoS & Fuga de IP de Origen
  if (r.ddos) {
    if (r.ddos.originIpLeakDetected) {
      out.push({
        id: 'ddos-leak',
        sev: 'critico',
        title: 'Fuga de IP Real del Servidor (Bypass de Protección Anti-DDoS)',
        why: 'Aunque se contrate un WAF/CDN, la dirección real del servidor está expuesta en registros de correo o DNS, permitiendo ataques que tumban la web directamente.',
        dev: 'Origin IP Leakage (MITRE T1596.001)',
        evidence: r.ddos.originLeakDetails || 'IP expuesta en registros MX/SPF',
        fix: r.ddos.remediationPlan[0] || 'Separar el correo a un servidor independiente con IP distinta a la web.',
      });
    } else if (!r.ddos.wafProtected && !isHyperscale) {
      out.push({
        id: 'ddos-unprotected',
        sev: 'alto',
        title: 'Servidor expuesto sin mitigación Anti-DDoS de borde',
        why: 'Cualquier ataque de denegación de servicio puede saturar el ancho de banda del servidor de origen.',
        dev: 'Sin WAF Anycast perimetral (MITRE T1498)',
        evidence: 'IP pública directa sin proxy inverso de filtrado',
        fix: 'Implementar Cloudflare WAF para mitigar tráfico masivo en el borde.',
      });
    }
  }

  // Cumplimiento Bancario & e-Skimming (PCI-DSS 4.0)
  if (r.banking) {
    if (r.banking.eSkimmingProtection.riskLevel === 'CRÍTICO') {
      out.push({
        id: 'pci-eskimming',
        sev: 'critico',
        title: 'Vulnerable a Robo de Tarjetas de Crédito / e-Skimming (PCI-DSS 4.0)',
        why: 'El sitio cuenta con pasarelas de pago o e-commerce pero carece de política CSP estricta. Un script malicioso puede robar números de tarjeta en el formulario.',
        dev: 'Falta de CSP restrictivo en Checkout (PCI-DSS Req 6.4.3 / MITRE T1059.007)',
        evidence: r.banking.eSkimmingProtection.details,
        fix: r.banking.eSkimmingProtection.remediation || 'Implementar directiva CSP limitando script-src y connect-src.',
      });
    }
    if (r.banking.serverLeaks.hasLeaks) {
      const topLeak = r.banking.serverLeaks.leakedHeaders[0];
      out.push({
        id: 'server-leak',
        sev: topLeak.severity === 'ALTA' ? 'alto' : 'medio',
        title: `Fuga de versión exacta de software (${topLeak.header})`,
        why: 'Informa a atacantes la versión precisa del servidor o lenguaje, facilitando la búsqueda de exploits automáticos.',
        dev: `Banner disclosure: ${topLeak.header}: ${topLeak.value}`,
        evidence: `${topLeak.header}: ${topLeak.value}`,
        fix: topLeak.remediation,
      });
    }
  }

  return out.sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]);
}

interface Props {
  report: AuditReportRecord;
  cleanDomain: string;
  auditId?: string | null;
  isHyperscale: boolean;
  copied: boolean;
  onPdf: (mode: 'management' | 'dev' | 'both') => void;
  onShare: () => void;
  onDuel?: () => void;
  onFull: () => void;
  fullOpen: boolean;
}

export default function DefensatiResultsReport({ report, cleanDomain, auditId, isHyperscale, copied, onPdf, onShare, onDuel, onFull, fullOpen }: Props) {
  const [tab, setTab] = useState<'dashboard' | 'owner' | 'dev'>('owner');
  const findings = useMemo(() => buildFindings(report, isHyperscale), [report, isHyperscale]);
  const problems = findings.filter((f) => f.sev !== 'ok');
  const oks = findings.filter((f) => f.sev === 'ok');
  const count = (s: Sev) => findings.filter((f) => f.sev === s).length;
  const grave = count('critico');
  const imp = count('alto');
  const men = count('medio');

  const loc = report.location;
  const openPorts = (report.ports || []).filter((p) => p.isOpen);
  const facts: Array<[string, string]> = [
    ['Servidor', loc ? [loc.org || loc.isp, loc.city, loc.country].filter(Boolean).join(' · ') : 'No identificado'],
    ['Certificado', report.ssl?.valid ? `${report.ssl.issuer} · vence el ${fmtDate(report.ssl.validTo)}` : 'No válido'],
    ['Firewall', report.waf?.hasWaf ? report.waf.provider || 'Detectado' : 'No detectado'],
    ['Plataforma', report.cms?.detected ? `${report.cms.name || 'CMS'}${report.cms.version ? ` ${report.cms.version}` : ''}` : 'No detectada'],
    ['Puertos abiertos', !report.ports?.length ? 'No evaluados' : openPorts.length ? openPorts.map((p) => p.port).join(', ') : 'Ninguno detectado'],
  ];

  const headline = isHyperscale
    ? `${cleanDomain} es infraestructura propia de gran escala: esto es lo que se mide desde afuera.`
    : grave > 0
      ? `Tu web tiene ${grave} ${grave === 1 ? 'problema grave' : 'problemas graves'} que conviene corregir esta semana.`
      : imp > 0
        ? `Tu web funciona, pero tiene ${imp} ${imp === 1 ? 'punto débil importante' : 'puntos débiles importantes'}.`
        : men > 0
          ? `Tu web está bien protegida. Quedan ${men} ${men === 1 ? 'mejora menor' : 'mejoras menores'}.`
          : report.ports?.length
            ? 'Tu web pasó todas las revisiones.'
            : 'Tu web pasó la revisión pública. Los puertos no se evaluaron.';

  // Plan sugerido (precios siempre desde el catálogo)
  const infected = Boolean(report.malware?.isInfectedOrSuspicious);
  const plan = infected
    ? { name: 'Rescate y limpieza de malware', price: report.cms?.isEcommerce ? P.rescateTienda : P.rescateCorporativo, note: 'pago único', what: 'Desinfección completa con respaldo previo, retiro de la pantalla roja de Google y 30 días de garantía.', rec: 'limpieza' as const }
    : problems.length > 0
      ? { name: 'Blindaje + Firewall Cloudflare', price: P.blindajeWaf, note: 'pago único', what: 'Corregimos las protecciones que faltan y activamos un firewall contra bots y ataques. Garantía de 30 días.', rec: 'blindaje' as const }
      : { name: 'Mantenimiento mensual', price: report.cms?.isEcommerce ? P.mantenimientoTiendas : P.mantenimientoBasico, note: 'al mes, sin permanencia', what: 'Vigilamos tu web todos los días y te avisamos por WhatsApp si algo cambia.', rec: 'monitoreo' as const };

  const wa = isHyperscale
    ? `https://wa.me/51987010380?text=${encodeURIComponent(`Hola Martín, vi el análisis de referencia de ${cleanDomain} en DEFENSA TI y quisiera cotizar un blindaje similar para mi empresa.`)}`
    : DEFENSATI_WHATSAPP_MESSAGES.escanerContextual({ domain: cleanDomain, score: report.score, grade: report.grade, primaryIssue: problems[0]?.title, recommendation: plan.rec });

  const date = report.scannedAt ? new Date(report.scannedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const gradeColor = grave > 0 ? SEV_COLOR.critico : imp > 0 ? SEV_COLOR.alto : men > 0 ? SEV_COLOR.medio : SEV_COLOR.ok;
  const riskLabel = isHyperscale
    ? 'Referencia'
    : grave > 0
      ? 'Riesgo alto'
      : imp > 0
        ? 'Riesgo medio'
        : men > 0
          ? 'Riesgo bajo'
          : 'Sin riesgos detectados';

  const tabBtn = (id: 'dashboard' | 'owner' | 'dev', label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
      className={`px-4 py-2.5 hud-label !tracking-[0.16em] transition-colors duration-75 ${tab === id ? '!text-[#0a0c0f] bg-[#e8edf1]' : 'hover:!text-[#e8edf1]'}`}
    >
      {label}
    </button>
  );

  return (
    <section className="relative text-left space-y-10 bg-[#0a0c0f] border border-white/10 p-5 sm:p-10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b ed-line pb-5">
        <div>
          <p className="hud-label !tracking-[0.2em]">Resultado del escaneo{date ? ` · ${date}` : ''}</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-light tracking-tight text-[#e8edf1] break-all">{cleanDomain}</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button type="button" onClick={() => onPdf(tab === 'owner' ? 'management' : 'dev')} className="ed-btn !py-2 !px-4 font-semibold">
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
          <button type="button" onClick={onShare} className="ed-btn !py-2 !px-4">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />} {copied ? 'Copiado' : 'Compartir'}
          </button>
          {onDuel && (
            <button type="button" onClick={onDuel} className="ed-btn !py-2 !px-4">
              <Swords className="w-4 h-4" /> Comparar con un competidor
            </button>
          )}
        </div>
      </div>

      {/* Veredicto */}
      <div className="grid grid-cols-12 gap-y-8 lg:gap-x-12 items-start">
        <div className="col-span-12 lg:col-span-8 border-l-4 pl-5 sm:pl-7" style={{ borderColor: gradeColor }}>
          <p className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold" style={{ color: gradeColor }}>
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: gradeColor }} />
            {riskLabel}
          </p>
          <h3 className="mt-3 font-light tracking-[-0.03em] leading-[1.08] text-[#e8edf1]" style={{ fontSize: 'clamp(1.7rem, 3.6vw, 3rem)' }}>
            {headline}
          </h3>
          {isHyperscale && (
            <p className="mt-4 max-w-[60ch] text-lg leading-snug text-[#bdbdbd]">
              Es una referencia: un dominio de esta escala gestiona su seguridad internamente, así que no ofrecemos servicio sobre él. Sirve para comparar tu web contra un estándar alto.
            </p>
          )}
        </div>
        <div className="col-span-12 lg:col-span-4 flex items-end gap-6 border-t lg:border-t-0 lg:border-l ed-line pt-6 lg:pt-0 lg:pl-8">
          <div>
            <div className="ed-display text-[5.5rem] leading-none" style={{ color: gradeColor }}>{report.grade}</div>
            <div className="mt-2 text-sm text-[#9aa6af]">Nota · {report.score} de 100</div>
          </div>
          <ul className="space-y-1.5 text-sm">
            {(['critico', 'alto', 'medio', 'ok'] as Sev[]).map((s) => (
              <li key={s} className="flex items-center gap-2 text-[#bdbdbd]">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: SEV_COLOR[s] }} />
                <span className="tabular-nums text-[#EDEDED] font-semibold">{count(s)}</span> {PLURAL[s][count(s) === 1 ? 0 : 1]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Lo medido: datos reales de este dominio */}
      <dl className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-4 border-y ed-line py-5 text-sm">
        {facts.map(([k, v]) => (
          <div key={k}><dt className="text-[#8a8a8a]">{k}</dt><dd className="mt-0.5 leading-snug text-[#EDEDED] break-words">{v}</dd></div>
        ))}
      </dl>

      {/* Matriz de Amenazas Empresariales & Cumplimiento Bancario (MITRE ATT&CK / PCI-DSS) */}
      <EnterpriseThreatMatrix
        ransomware={report.ransomware}
        ddos={report.ddos}
        banking={report.banking}
        domain={cleanDomain}
        score={report.score}
        grade={report.grade}
        wafDetected={report.waf_detected || (report.waf?.hasWaf ? report.waf.provider : 'Ninguno')}
      />

      {/* Pestañas */}
      <div role="tablist" aria-label="Vista del informe" className="inline-flex flex-wrap border ed-line p-1">
        {tabBtn('owner', 'Resumen simple')}
        {tabBtn('dev', 'Detalle técnico')}
        {tabBtn('dashboard', 'Panel completo')}
      </div>

      {tab === 'dashboard' ? (
        <div className="w-full">
          <HighDensitySecurityDashboard
            data={toScanApiResponse(report, auditId || undefined)}
            onCompareClick={onDuel}
          />
        </div>
      ) : tab === 'owner' ? (
        <div className="grid grid-cols-12 gap-y-10 lg:gap-x-12">
          <div className="col-span-12 lg:col-span-7 space-y-8">
            <h4 className="text-xl font-semibold text-[#EDEDED]">{isHyperscale ? 'Qué se midió' : problems.length > 0 ? 'Qué hacer, en orden de urgencia' : 'No hay nada urgente'}</h4>
            <ol className="space-y-7">
              {problems.slice(0, 6).map((f, i) => (
                <li key={f.id} className="grid grid-cols-[2rem_1fr] gap-x-3">
                  <span className="ed-display text-2xl text-[#8a8a8a]">{i + 1}</span>
                  <div>
                    <p className="text-lg font-semibold leading-snug text-[#EDEDED]">{f.title}</p>
                    <p className="mt-1.5 leading-relaxed text-[#bdbdbd]">{f.why}</p>
                    <p className="mt-2 text-sm text-[#8a8a8a]"><span className="font-semibold text-[#bdbdbd]">Comprobado: </span>{f.evidence}</p>
                    {!isHyperscale && (
                      <p className="mt-2 text-sm font-semibold" style={{ color: SEV_COLOR[f.sev] }}>
                        {SEV_LABEL[f.sev]} · {WHEN[f.sev]}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            {problems.length > 6 && <p className="text-sm text-[#8a8a8a]">Y {problems.length - 6} detalles menores más. Tu programador los verá en la pestaña técnica.</p>}
            {oks.length > 0 && (
              <p className="border-t ed-line pt-5 text-[#bdbdbd] leading-relaxed">
                <span className="font-semibold text-[#3ddc97]">Lo que ya está bien: </span>
                {oks.map((o) => o.title.replace(/^Protegido: /, '')).join(' · ')}.
              </p>
            )}
          </div>

          {/* Plan sugerido */}
          <aside className="col-span-12 lg:col-span-5 self-start border ng-card bg-[#0d0d0d]/90 p-6 sm:p-8">
            <p className="text-sm text-[#8a8a8a]">{isHyperscale ? 'Siguiente paso' : 'Lo que te recomendamos'}</p>
            <p className="mt-2 text-2xl font-bold leading-tight text-[#EDEDED]">{isHyperscale ? 'Mide tu propia web' : plan.name}</p>
            {!isHyperscale && (
              <p className="mt-3 flex items-baseline gap-2">
                <span className="ed-display text-5xl text-[#EDEDED]">{plan.price}</span>
                <span className="text-sm text-[#8a8a8a]">{plan.note}</span>
              </p>
            )}
            <p className="mt-4 leading-relaxed text-[#bdbdbd]">{isHyperscale ? 'Escanea tu propio dominio y compáralo con este resultado.' : plan.what}</p>
            {!isHyperscale && problems.length > 0 && (
              <p className="mt-3 text-sm leading-relaxed text-[#8a8a8a]">
                <span className="font-semibold text-[#bdbdbd]">Por qué: </span>
                {infected ? 'se detectaron indicadores de infección' : problems.slice(0, 3).map((f) => f.dev.toLowerCase()).join('; ')}.
              </p>
            )}
            {isHyperscale ? (
              <button
                type="button"
                onClick={() => document.getElementById('escaner-gratis')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="ed-btn ed-btn-solid mt-6 w-full font-semibold"
              >
                Escanear mi web
              </button>
            ) : (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ service: 'general', placement: 'report_plan_cta' })}
                className="mt-6 flex items-center justify-center rounded-full bg-[#25D366] px-6 py-4 text-center font-bold text-black transition-transform hover:-translate-y-0.5 whitespace-normal"
              >
                Hablar por WhatsApp
              </a>
            )}
            {!isHyperscale && <p className="mt-3 text-center text-xs text-[#8a8a8a]">Respaldo previo · Precio fijo · Garantía de 30 días por escrito</p>}
          </aside>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b ed-line text-[#8a8a8a]">
                  <th className="py-3 pr-4 font-medium w-28">Severidad</th>
                  <th className="py-3 pr-4 font-medium">Hallazgo</th>
                  <th className="py-3 pr-4 font-medium">Evidencia</th>
                  <th className="py-3 font-medium">Corrección</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((f) => (
                  <tr key={f.id} className="border-b ed-line align-top">
                    <td className="py-4 pr-4 font-semibold" style={{ color: SEV_COLOR[f.sev] }}>{SEV_LABEL[f.sev]}</td>
                    <td className="py-4 pr-4 text-[#EDEDED]">{f.dev}</td>
                    <td className="py-4 pr-4 font-mono text-xs leading-relaxed text-[#bdbdbd] break-words">{f.evidence}</td>
                    <td className="py-4 text-[#bdbdbd]">
                      {f.fix && <p className="leading-relaxed">{f.fix}</p>}
                      {f.snippets && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-[#00e5ff]">Ver configuración</summary>
                          {f.snippets.nginx && <pre className="mt-2 whitespace-pre-wrap break-words bg-black/50 p-3 font-mono text-xs text-[#EDEDED]"># nginx{'\n'}{f.snippets.nginx}</pre>}
                          {f.snippets.apache && <pre className="mt-2 whitespace-pre-wrap break-words bg-black/50 p-3 font-mono text-xs text-[#EDEDED]"># apache{'\n'}{f.snippets.apache}</pre>}
                          {f.snippets.express && <pre className="mt-2 whitespace-pre-wrap break-words bg-black/50 p-3 font-mono text-xs text-[#EDEDED]"># express{'\n'}{f.snippets.express}</pre>}
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
                {problems.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-[#bdbdbd]">Sin hallazgos que corregir.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {oks.length > 0 && (
            <details className="border-b ed-line pb-4">
              <summary className="cursor-pointer font-semibold text-[#3ddc97]">Revisiones correctas ({oks.length})</summary>
              <ul className="mt-3 space-y-1 font-mono text-xs text-[#bdbdbd]">
                {oks.map((o) => <li key={o.id}>{o.dev} — {o.evidence}</li>)}
              </ul>
            </details>
          )}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {[
              ['IP resuelta', report.telemetry?.targetResolvedIp || '—'],
              ['Protocolo TLS', report.ssl?.protocol || '—'],
              ['Duración', report.telemetry?.durationMs ? `${(report.telemetry.durationMs / 1000).toFixed(1)} s` : '—'],
              ['ID de auditoría', auditId ? auditId.slice(0, 8) : '—'],
            ].map(([k, v]) => (
              <div key={k}><dt className="text-[#8a8a8a]">{k}</dt><dd className="mt-0.5 font-mono text-[#EDEDED] break-all">{v}</dd></div>
            ))}
          </dl>

          {/* Módulos de Auditoría Avanzada */}
          <div className="space-y-6 pt-6 border-t ed-line">
            <h5 className="hud-label !tracking-[0.16em]">Módulos Avanzados de Auditoría Perimetral</h5>
            <AttackSurfaceCard asm={report.asm} />
            <WebAppSecurityCard webApp={report.webApp} />
            <CveIntelCard cveIntel={report.cveIntel} />
          </div>

          <button type="button" onClick={() => onPdf('dev')} className="ed-btn !py-2 !px-4 text-sm font-semibold"><Download className="w-4 h-4" /> Descargar informe técnico en PDF</button>
        </div>
      )}

      <button type="button" onClick={onFull} className="text-sm text-[#8a8a8a] underline underline-offset-4 hover:text-[#EDEDED]">
        {fullOpen ? 'Ocultar análisis completo' : 'Ver análisis completo (todos los módulos)'}
      </button>
    </section>
  );
}
