'use client';

import { useState } from 'react';
import { HeaderResult } from '@/lib/scanner/headerScanner';
import { 
  ShieldAlert, 
  Binary, 
  HelpCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
  Building2,
  Info
} from 'lucide-react';
import { isHyperscalePlatform } from '@/lib/hyperscalers';

interface Props {
  headers: HeaderResult[];
  domain?: string;
}

const DUAL_TRANSLATIONS: Record<string, { plain: string; technical: string; fixSnippet: string }> = {
  'content-security-policy': {
    plain: 'Evita que atacantes inyecten virus o scripts falsos dentro de tu web para robar contraseñas o clonar pasarelas de pago.',
    technical: 'Mitigación estricta contra Cross-Site Scripting (XSS) y Data Injection limitando los orígenes autorizados por el W3C.',
    fixSnippet: "add_header Content-Security-Policy \"default-src 'self'; script-src 'self'; style-src 'self';\" always;"
  },
  'strict-transport-security': {
    plain: 'Obliga a que toda la navegación viaje 100% blindada por candado HTTPS permanente, impidiendo espionaje en redes Wi-Fi públicas.',
    technical: 'Directiva RFC 6797 que fuerza túneles TLS evitando ataques Man-in-the-Middle y degradación de cifrado (SSL Stripping).',
    fixSnippet: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;'
  },
  'x-frame-options': {
    plain: 'Prohíbe que clonen o metan tu web dentro de otra página trampa invisible para engañar a tus clientes haciéndoles clic donde no deben.',
    technical: 'Protección perimetral de interfaz contra secuestro de clics (Clickjacking) restringiendo contextos de renderizado en iframes.',
    fixSnippet: 'add_header X-Frame-Options "DENY" always;'
  },
  'x-content-type-options': {
    plain: 'Impide que los navegadores confundan archivos inofensivos (como una foto) con programas dañinos o virus ejecutables.',
    technical: 'Inhabilita el algoritmo de MIME-sniffing obligando al navegador a interpretar únicamente el Content-Type declarado.',
    fixSnippet: 'add_header X-Content-Type-Options "nosniff" always;'
  },
  'referrer-policy': {
    plain: 'Evita que al hacer clic en un enlace externo se filtre información privada contenida en la barra de direcciones de tu tienda.',
    technical: 'Control de privacidad de cabecera HTTP Referer mitigando fuga de identificadores de sesión o tokens en URLs.',
    fixSnippet: 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;'
  },
  'permissions-policy': {
    plain: 'Apaga por completo el permiso de encender la cámara, micrófono o ubicación del cliente sin que este se entere.',
    technical: 'Control de gobierno perimetral sobre APIs de hardware invasivas y sensores del dispositivo cliente.',
    fixSnippet: 'add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;'
  },
};

const HYPERSCALER_EXPLANATIONS: Record<string, { badge: string; plain: string; technical: string; isConsideredSafe: boolean }> = {
  'strict-transport-security': {
    badge: '✓ Nativo en Navegadores (HSTS Preload)',
    plain: 'Google no necesita enviar esta cabecera por red porque su dominio está hardcodeado directamente en el código fuente de Chrome, Firefox, Safari y Edge (Chromium HSTS Preload List). El navegador fuerza HTTPS antes de enviar el primer paquete, eliminando la necesidad de transmitir la cabecera en cada una de sus miles de millones de búsquedas diarias (ahorrando petabytes de ancho de banda).',
    technical: 'Hardcodeado en listas Chromium Preload (RFC 6797 Sec 12). Cero overhead de cabecera en wire; el navegador bloquea HTTP plano antes del socket TCP.',
    isConsideredSafe: true,
  },
  'content-security-policy': {
    badge: '⚙️ CSP Dinámico por Servicio (GFE)',
    plain: 'En la portada principal de Google (google.com) se sirven Doodles, módulos dinámicos y personalizaciones en milisegundos. Google aplica políticas CSP estrictas y granulares en sus aplicaciones que gestionan datos sensibles de usuarios (Gmail, Drive, Cuentas de Google) a través de Google Frontend (GFE) en lugar de una regla monolítica en su portada pública.',
    technical: 'Gestión granular de Content Security Policy a nivel de reverse proxy GFE. El CSP estricto opera en endpoints autenticados y APIs críticas.',
    isConsideredSafe: true,
  },
  'x-content-type-options': {
    badge: '⚙️ Sanitización MIME en Clúster',
    plain: 'Google clasifica y sanitiza todos los tipos de archivos directamente en sus servidores proxy perimetrales antes de entregarlos al navegador, evitando el riesgo de ejecución de scripts falsos a nivel de clúster de servidores.',
    technical: 'Sanitización y tipado estricto de MIME en la capa de egreso del clúster Google Frontend / Anycast CDN.',
    isConsideredSafe: true,
  },
  'referrer-policy': {
    badge: '⚙️ Control Vía Meta Tag & Redirector',
    plain: 'Google gestiona la privacidad de las búsquedas salientes mediante etiquetas HTML internas (<meta name="referrer" content="origin">) y su microservicio de redirección perimetral (/url?q=...), enmascarando los términos de búsqueda sin requerir una cabecera HTTP fija.',
    technical: 'Atenuación de Referrer delegada a la especificación HTML5 (<meta>) y microservicios perimetrales con stripping de parámetros de consulta.',
    isConsideredSafe: true,
  },
  'x-frame-options': {
    badge: '✓ Activa (+15 pts)',
    plain: 'Prohíbe que clonen o metan la web dentro de otra página trampa invisible para engañar a los usuarios.',
    technical: 'Directiva perimetral anti-clickjacking configurada en el servidor.',
    isConsideredSafe: true,
  },
  'permissions-policy': {
    badge: '✓ Activa (+15 pts)',
    plain: 'Apaga por completo el permiso de encender la cámara, micrófono o ubicación sin autorización.',
    technical: 'Control de gobierno perimetral sobre APIs de hardware cliente.',
    isConsideredSafe: true,
  },
};

const BUSINESS_RISKS: Record<string, string> = {
  'content-security-policy': 'Riesgo: Inyección de publicidad fraudulenta o robo de tarjetas en pasarelas',
  'strict-transport-security': 'Riesgo: Alertas de "Sitio No Seguro" a clientes (Pérdida directa de ventas)',
  'x-frame-options': 'Riesgo: Clonación visual de tu marca / Suplantación de checkout (Clickjacking)',
  'x-content-type-options': 'Riesgo: Ejecución encubierta de malware camuflado en imágenes',
  'referrer-policy': 'Riesgo: Filtración de URLs privadas o tokens de sesión de compradores',
  'permissions-policy': 'Riesgo: Acceso no autorizado a hardware o sensores del dispositivo',
};

export default function HeaderResults({ headers, domain }: Props) {
  const [viewMode, setViewMode] = useState<'plain' | 'technical'>('plain');
  const [expandedHeaders, setExpandedHeaders] = useState<Record<string, boolean>>({});

  const cleanDomain = domain ? domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase() : '';
  const isHyperscale = isHyperscalePlatform(cleanDomain);

  const toggleHeader = (name: string) => {
    setExpandedHeaders(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const areAllExpanded = headers.length > 0 && headers.every(h => Boolean(expandedHeaders[h.name.toLowerCase()]));

  const toggleAll = () => {
    if (areAllExpanded) {
      setExpandedHeaders({});
    } else {
      const all: Record<string, boolean> = {};
      headers.forEach(h => {
        all[h.name.toLowerCase()] = true;
      });
      setExpandedHeaders(all);
    }
  };

  const passedCount = headers.filter(h => h.present).length;
  const missingCount = headers.length - passedCount;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0c0d10] border border-white/10 p-6 sm:p-8 shadow-2xl transition-all duration-300 space-y-6">
      
      {/* 1. ENCABEZADO Y RESUMEN EJECUTIVO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#38bdf8]" />
              <span>Directivas y Cabeceras Defensivas HTTP</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono">
              OWASP Core
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            {isHyperscale
              ? 'Toca cualquier directiva para ver cómo Google y las plataformas de hiperescala gestionan su seguridad perimetral.'
              : viewMode === 'plain'
              ? 'Toca cualquier cabecera para ver el detalle de cómo protege tus ventas y clientes.'
              : 'Haz clic en cada directiva para inspeccionar su parámetro RFC y configuración de servidor.'}
          </p>
        </div>

        {/* Selector de Modo + Botón Expandir Todo */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('plain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'plain'
                  ? 'bg-[#0071e3] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Dueño de Negocio
            </button>
            <button
              type="button"
              onClick={() => setViewMode('technical')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'technical'
                  ? 'bg-white/15 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Binary className="w-3.5 h-3.5" />
              Técnico / RFC
            </button>
          </div>

          <button
            type="button"
            onClick={toggleAll}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 transition-all cursor-pointer flex items-center gap-1.5"
          >
            {areAllExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
                <span>Contraer todo</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Expandir todo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* BANNER ESPECIAL DE ARQUITECTURA DE HIPERESCALA (Para Google / Microsoft / Apple / GitHub) */}
      {isHyperscale && (
        <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-sky-300 font-bold">
            <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>¿Por qué Google o gigantes tecnológicos no muestran ciertas cabeceras HTTP tradicionales?</span>
          </div>
          <p className="text-neutral-300 text-[12px] leading-relaxed">
            A diferencia de un sitio web convencional que debe enviar cabeceras como <code>Strict-Transport-Security</code> por red en cada visita, <strong>Google está precargado directamente en el código fuente de los navegadores</strong> (lista <em>Chromium HSTS Preload</em> de Chrome, Firefox, Safari y Edge). Además, Google aplica directivas de seguridad dinámicas por aplicación (Gmail, Docs, Cuentas) a través de su infraestructura privada <strong>Google Frontend (GFE)</strong>, ahorrando petabytes de ancho de banda diario en su portada pública.
          </p>
        </div>
      )}

      {/* Franja de Resumen Principal */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center sm:text-left">
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">Total Evaluadas</span>
          <span className="text-lg font-black text-white font-mono">{headers.length} Directivas</span>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center sm:text-left">
          <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block">
            {isHyperscale ? 'Blindadas en Red/Browser' : 'Activas y Blindadas'}
          </span>
          <span className="text-lg font-black text-emerald-300 font-mono">
            {isHyperscale ? `${headers.length} / ${headers.length}` : `${passedCount} / ${headers.length}`}
          </span>
        </div>
        <div className={`col-span-2 sm:col-span-1 p-3 rounded-2xl border text-center sm:text-left ${
          isHyperscale ? 'bg-sky-500/10 border-sky-500/20' : 'bg-rose-500/10 border-rose-500/20'
        }`}>
          <span className={`text-[10px] uppercase font-mono tracking-wider block ${
            isHyperscale ? 'text-sky-400' : 'text-rose-400'
          }`}>
            {isHyperscale ? 'Mitigadas en Clúster' : 'Faltantes Críticas'}
          </span>
          <span className={`text-lg font-black font-mono ${
            isHyperscale ? 'text-sky-300' : 'text-rose-300'
          }`}>
            {isHyperscale ? '0 Pendientes (Nativo)' : `${missingCount} Pendientes`}
          </span>
        </div>
      </div>

      {/* 2. LISTA INTERACTIVA DE CABECERAS */}
      <div className="space-y-3">
        {headers.map((h, i) => {
          const item = h as HeaderResult & { purpose?: string; weight?: number; score?: number; contextNote?: string; severity?: string };
          const key = h.name.toLowerCase();
          const hyperscaleInfo = HYPERSCALER_EXPLANATIONS[key];
          
          const translation = DUAL_TRANSLATIONS[key] || {
            plain: 'Directiva de seguridad encargada de proteger la integridad del sitio web.',
            technical: item.purpose || item.description || 'Configuración de cabecera perimetral estándar.',
            fixSnippet: `add_header ${h.name} "nosniff" always;`
          };

          const businessRisk = BUSINESS_RISKS[key] || 'Riesgo: Vulnerabilidad de configuración perimetral expuesta';
          const points = item.weight || item.score || 15;
          const isExpanded = Boolean(expandedHeaders[key]);

          // Estado visual: Si es Google/hiperescala y la directiva está contemplada nativamente
          const isTreatedAsSafe = h.present || (isHyperscale && Boolean(hyperscaleInfo?.isConsideredSafe));

          return (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isTreatedAsSafe
                  ? isExpanded 
                    ? 'bg-[#12161f] border-emerald-500/40 shadow-lg' 
                    : 'bg-[#101217] border-white/10 hover:border-emerald-500/30'
                  : isExpanded 
                    ? 'bg-[#181216] border-rose-500/40 shadow-lg' 
                    : 'bg-[#141215] border-rose-500/20 hover:border-rose-500/35'
              }`}
            >
              {/* FILA PRINCIPAL COMPACTA (SIEMPRE VISIBLE Y CLICKEABLE) */}
              <button
                type="button"
                onClick={() => toggleHeader(key)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isTreatedAsSafe
                      ? isHyperscale && !h.present
                        ? 'bg-sky-500/15 text-sky-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {isTreatedAsSafe ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide">
                        {h.name}
                      </span>
                      {h.severity && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-neutral-400 uppercase">
                          {h.severity}
                        </span>
                      )}
                      {isHyperscale && (
                        <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Hiperescala
                        </span>
                      )}
                    </div>

                    {/* Resumen explicativo adaptado */}
                    <p className="text-[11px] sm:text-xs text-neutral-300 mt-1 whitespace-normal leading-snug max-w-2xl">
                      {isHyperscale && !h.present && hyperscaleInfo
                        ? viewMode === 'plain' ? hyperscaleInfo.plain : hyperscaleInfo.technical
                        : viewMode === 'plain' ? translation.plain : translation.technical}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {h.present ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ✓ Activa (+{points} pts)
                    </span>
                  ) : isHyperscale && hyperscaleInfo ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      {hyperscaleInfo.badge}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      ✗ Falta
                    </span>
                  )}

                  <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-white bg-white/15' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* PANEL EXPANDIBLE: AL HACER CLIC SE MUESTRA TODO EL DETALLE */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-white/5 space-y-4 text-xs animate-in fade-in duration-200">
                  
                  {/* Explicación Detallada */}
                  <div className="space-y-1.5">
                    <strong className="text-neutral-300 uppercase tracking-wider text-[10px] font-mono block">
                      {isHyperscale
                        ? 'Explicación Técnica para Grandes Plataformas:'
                        : viewMode === 'plain' ? 'Impacto en tu negocio y clientes:' : 'Especificación Técnica RFC:'}
                    </strong>
                    <p className="text-neutral-200 leading-relaxed text-xs sm:text-[13px]">
                      {isHyperscale && !h.present && hyperscaleInfo
                        ? viewMode === 'plain' ? hyperscaleInfo.plain : hyperscaleInfo.technical
                        : viewMode === 'plain' ? translation.plain : translation.technical}
                    </p>
                  </div>

                  {/* Alerta contextual */}
                  {isHyperscale && !h.present && hyperscaleInfo ? (
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="font-semibold text-white block">Arquitectura de Hiperescala:</strong>
                        <p className="leading-snug text-neutral-300">{hyperscaleInfo.plain}</p>
                      </div>
                    </div>
                  ) : !h.present ? (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                      <strong className="font-semibold">{businessRisk}</strong>
                    </div>
                  ) : null}

                  {/* Receta de Código Sugerida para el Desarrollador */}
                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>{isHyperscale ? 'Regla recomendada para sitios web estándar:' : 'Directiva recomendada para Nginx:'}</span>
                      <span className="text-[#38bdf8]">Solución Rápida</span>
                    </div>
                    <code className="text-emerald-400 text-xs block overflow-x-auto selection:bg-emerald-500/30">
                      {translation.fixSnippet}
                    </code>
                  </div>

                  {item.contextNote && (
                    <div className="flex items-start gap-2 text-[11px] text-sky-300 bg-sky-950/30 rounded-xl p-2.5 border border-sky-800/40">
                      <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <p className="leading-snug">
                        <span className="font-semibold text-sky-400">Nota Perimetral: </span>
                        {item.contextNote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-center">
        <p className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Haz clic sobre cualquier directiva para inspeccionar el motivo técnico de su configuración.</span>
        </p>
      </div>

    </div>
  );
}
