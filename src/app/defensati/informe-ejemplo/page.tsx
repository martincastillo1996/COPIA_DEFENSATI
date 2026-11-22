'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PrintableReport from '@/components/PrintableReport';
import { 
  ShieldCheck, 
  ArrowLeft, 
  FileText, 
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Building2,
  Code2,
  Printer,
  Copy,
  Check,
  Terminal,
  Lock,
  Server,
  AlertTriangle,
  Download,
  ExternalLink
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import HeaderWhatsAppButton from '@/components/HeaderWhatsAppButton';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { AuditReportRecord } from '@/lib/storage/reportStore';
import AuditEngineExplanation from '@/components/AuditEngineExplanation';
import HeaderResults from '@/components/HeaderResults';
import { P } from '@/config/catalog';

const DEMO_REPORT: AuditReportRecord = {
  id: 'DEMO-EJEMPLO-2026',
  url: 'https://ejemplo-empresa-demo.pe',
  score: 68,
  grade: 'C',
  scannedAt: '2026-11-06T15:30:00.000Z',
  ssl: {
    valid: true,
    protocol: 'TLSv1.3',
    daysRemaining: 54,
    validTo: '2026-12-31T23:59:59.000Z',
    issuer: "Let's Encrypt Authority X3",
    score: 95
  },
  headers: [
    { name: 'Strict-Transport-Security', header: 'Strict-Transport-Security', status: 'fail', present: false, value: null, severity: 'ALTA', description: 'Obliga conexiones HTTPS permanentes evitando degradación a HTTP plano.' },
    { name: 'Content-Security-Policy', header: 'Content-Security-Policy', status: 'fail', present: false, value: null, severity: 'ALTA', description: 'Evita inyección de scripts maliciosos y clonación de formularios de pago.' },
    { name: 'X-Frame-Options', header: 'X-Frame-Options', status: 'fail', present: false, value: null, severity: 'ALTA', description: 'Impide que terceros incrusten la web en iframes invisibles (Clickjacking).' },
    { name: 'X-Content-Type-Options', header: 'X-Content-Type-Options', status: 'pass', present: true, value: 'nosniff', severity: 'MEDIA', description: 'Protege contra la ejecución de archivos MIME alterados.' },
    { name: 'Referrer-Policy', header: 'Referrer-Policy', status: 'pass', present: true, value: 'strict-origin-when-cross-origin', severity: 'BAJA', description: 'Limita la fuga de URLs y referencias de usuarios en enlaces salientes.' },
    { name: 'Permissions-Policy', header: 'Permissions-Policy', status: 'fail', present: false, value: null, severity: 'MEDIA', description: 'Desactiva acceso a cámara, micrófono y geolocalización no autorizados.' }
  ],
  ports: [
    { port: 80, isOpen: true, service: 'HTTP (Redirección obligatoria hacia HTTPS)', risk: 'BAJO', description: 'Redirección estándar hacia puerto 443 activa.' },
    { port: 443, isOpen: true, service: 'HTTPS (Canal Seguro TLS 1.3 - Óptimo)', risk: 'BAJO', description: 'Canal cifrado obligatorio para transacciones y pagos.' },
    { port: 8080, isOpen: false, service: 'HTTP-Proxy alternativo (Cerrado)', risk: 'BAJO', description: 'Puerto cerrado y protegido.' },
    { port: 21, isOpen: false, service: 'FTP plano (Cerrado tras firewall)', risk: 'BAJO', description: 'Cerrado para prevenir transferencias sin cifrar.' },
    { port: 22, isOpen: false, service: 'SSH administración (Cerrado a internet)', risk: 'BAJO', description: 'Aislado de internet público.' },
    { port: 3306, isOpen: false, service: 'MySQL base de datos (Protegido)', risk: 'BAJO', description: 'Base de datos protegida tras firewall perimetral.' }
  ],
  telemetry: {
    targetResolvedIp: '[PROTEGIDA POR SEGURIDAD]',
    engineVersion: '1.2.0-cloud',
    durationMs: 840,
    aiModel: 'Neuronality AI Defense Core'
  }
};

export default function InformeEjemploPage() {
  const [activeTab, setActiveTab] = useState<'business' | 'dev'>('business');
  const [activeServerTab, setActiveServerTab] = useState<'nginx' | 'apache' | 'cloudflare'>('nginx');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const nginxSnippet = `# Configuración para Nginx (/etc/nginx/conf.d/security.conf o dentro de server {})
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

# Ocultar versión del servidor en cabeceras
server_tokens off;`;

  const apacheSnippet = `# Reglas para Apache (.htaccess o en el VirtualHost)
<IfModule mod_headers.c>
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>

# Ocultar versión de Apache
ServerSignature Off
ServerTokens Prod`;

  const cloudflareSnippet = `# Reglas en Cloudflare Dashboard (Rules -> Transform Rules -> Modify Response Header)
# Header 1:
Set dynamic: X-Frame-Options = "DENY"
# Header 2:
Set dynamic: X-Content-Type-Options = "nosniff"
# Header 3:
Set dynamic: Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
# Header 4:
Set dynamic: Referrer-Policy = "strict-origin-when-cross-origin"`;

  return (
    <div className="min-h-screen bg-[#080808] selection:bg-[#EDEDED] selection:text-[#080808] font-sans antialiased relative overflow-x-hidden">
      
      {/* Componente PDF que se activa con window.print() */}
      <PrintableReport report={DEMO_REPORT} auditId="DEMO-2026-TEXTIL" />

      {/* Fondo estelar limpio */}

      {/* Cabecera */}
      <header className="sticky top-0 z-50 bg-[#080808] border-b border-white/10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/defensati" className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-300 hover:text-[#EDEDED] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a DEFENSA TI</span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Botón Descargar PDF Directo */}
            <a
              href="/informe-ejemplo-defensati.pdf"
              target="_blank"
              download="informe-ejemplo-defensati.pdf"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#EDEDED] text-[#080808] hover:bg-[#EDEDED] hover:text-[#080808] text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#EDEDED]" />
              <span className="hidden sm:inline">Descargar PDF (2 Páginas)</span>
              <span className="sm:hidden">PDF</span>
            </a>

            {/* Botón Abrir PDF en pestaña */}
            <a
              href="/informe-ejemplo-defensati.pdf"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-[#EDEDED] transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#bdbdbd]" />
              <span>Abrir PDF</span>
            </a>

            <HeaderWhatsAppButton
              message="Hola Martín, vi el informe de muestra (Negocio + Dev) en DEFENSA TI y deseo solicitar la auditoría para mi web."
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-10 space-y-8 print:hidden">
        
        {/* Banner de Orientación */}
        <div className="p-6 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#bdbdbd]">
            <ShieldCheck className="w-4 h-4" />
            <span>Entregable Oficial DEFENSA TI (2 Vistas en 1 Solo Documento)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#EDEDED] tracking-tight">
            Así es el Informe Técnico y Comercial que recibes en tu Auditoría
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Te entregamos exactamente lo que necesitas: <strong>Página 1 para la Gerencia</strong> (impacto comercial, ventas y pasarelas sin tecnicismos) y <strong>Página 2 para tu Programador</strong> (receta de código lista para copiar y pegar para corregirlo en minutos).
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="/informe-ejemplo-defensati.pdf"
              target="_blank"
              download="informe-ejemplo-defensati.pdf"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EDEDED] text-[#080808] hover:bg-[#EDEDED] hover:text-[#080808] text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF Oficial de Ejemplo</span>
            </a>

            <a
              href="/informe-ejemplo-defensati.pdf"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-[#EDEDED] text-xs font-semibold transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#bdbdbd]" />
              <span>Abrir PDF en Pantalla Completa</span>
            </a>
          </div>
        </div>

        {/* SELECTOR INTERACTIVO DE LAS 2 EXPLICACIONES: NEGOCIO VS DEV */}
        <div className="flex justify-center">
          <div className="p-1.5 bg-white/5 border border-white/15 grid grid-cols-2 gap-2 w-full max-w-xl">
            <button
              type="button"
              onClick={() => setActiveTab('business')}
              className={`py-3 px-4 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'business'
                  ? ' text-[#EDEDED] '
                  : 'text-neutral-400 hover:text-[#EDEDED] hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>1. Para Dueño de Negocio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dev')}
              className={`py-3 px-4 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'dev'
                  ? ' text-[#EDEDED] '
                  : 'text-neutral-400 hover:text-[#EDEDED] hover:bg-white/5'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>2. Para Desarrollador (Dev)</span>
            </button>
          </div>
        </div>

        {/* CONTENEDOR DEL DOCUMENTO MODELO */}
        <div className="relative p-6 sm:p-10 bg-[#0f1219]/90 border border-white/10 space-y-8 overflow-hidden">
          
          {/* Marca de Agua ENCIMA EN TODOS LADOS (Web Overlay: z-40 flotante visible) */}
          <div className="absolute inset-0 pointer-events-none select-none z-40 overflow-hidden flex flex-col justify-around py-8 opacity-[0.20]">
            <div className="flex justify-around transform -rotate-25 whitespace-nowrap">
              <span className="font-black text-5xl tracking-widest text-[#EDEDED] border-4 border-white/80 px-6 py-2">
                EJEMPLO &bull; NO OFICIAL
              </span>
              <span className="font-black text-5xl tracking-widest text-[#EDEDED] border-4 border-white/80 px-6 py-2">
                MUESTRA DIDÁCTICA
              </span>
            </div>
            <div className="flex justify-around transform -rotate-25 whitespace-nowrap">
              <span className="font-black text-6xl tracking-widest text-[#EDEDED] border-4 border-white/80 px-8 py-3">
                CASO FICTICIO &bull; DEFENSA TI
              </span>
            </div>
            <div className="flex justify-around transform -rotate-25 whitespace-nowrap">
              <span className="font-black text-5xl tracking-widest text-[#EDEDED] border-4 border-white/80 px-6 py-2">
                DOCUMENTO DE MUESTRA
              </span>
              <span className="font-black text-5xl tracking-widest text-[#EDEDED] border-4 border-white/80 px-6 py-2">
                EJEMPLO &bull; NO OFICIAL
              </span>
            </div>
            <div className="flex justify-around transform -rotate-25 whitespace-nowrap">
              <span className="font-black text-5xl tracking-widest text-[#EDEDED] border-4 border-white/80 px-6 py-2">
                MUESTRA DIDÁCTICA &bull; NO VINCULANTE
              </span>
            </div>
          </div>

          <div className="relative z-10 space-y-8">
            {/* Banner de Advertencia Legal: Documento Didáctico de Muestra */}
            <div className="p-3 bg-white/[0.03] border border-white/10 text-[#EDEDED] text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#EDEDED] shrink-0" />
                <span>⚠️ DOCUMENTO DE MUESTRA Y CASO MODELO FICTICIO &bull; NO ES UN DICTAMEN OFICIAL NI AFECTA A NINGUNA ENTIDAD REAL</span>
              </span>
              <span className="px-2 py-0.5 bg-white/[0.03] text-[#EDEDED] font-mono text-[10px] uppercase font-bold shrink-0">
                EJEMPLO NO OFICIAL
              </span>
            </div>

            {/* Encabezado del dictamen */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.03] border border-white/10 text-[#bdbdbd] text-xs font-semibold mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>CASO DE AUDITORÍA MODELO (MUESTRA DIDÁCTICA)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#EDEDED] tracking-tight">
                  Auditoría Perimetral y de Riesgo Comercial
                </h2>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  Portal analizado: <strong className="text-white">ejemplo-empresa-demo.pe</strong> <span className="text-amber-400 font-bold">(Empresa Ficticia de Muestra)</span>
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-1 text-xs text-neutral-400 font-mono">
                <span>Entrega: <strong>24 a 48 Horas Laborables</strong></span>
                <span>Auditor Responsable: <strong className="text-white">Karol Martín Castillo Rojas</strong></span>
                <span>RUC: <strong>10704877850</strong> (Neuronal Gravity &bull; Lima, Perú)</span>
                <span className="text-[#EDEDED] font-semibold mt-0.5">✓ Soporte Directo y Meta Grado A (Tope 14 Días)</span>
              </div>
            </div>

          {/* ===================================================================== */}
          {/* PESTAÑA 1: VISIÓN DUEÑO DE NEGOCIO (COMERCIAL & GERENCIAL) */}
          {/* ===================================================================== */}
          {activeTab === 'business' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Badge Identificador de Vista */}
              <div className="p-3 bg-white/[0.03] border border-white/10 text-xs text-[#EDEDED] flex items-center justify-between">
                <span className="font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#bdbdbd]" />
                  <span>Explicación para el Dueño o Gerencia: Impacto en ventas, reputación y pasarelas</span>
                </span>
                <span className="font-mono text-[10px] text-[#EDEDED]">Sin jerga incomprensible</span>
              </div>

              {/* Métricas Visuales de Impacto Empresarial */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-[#080808] border border-white/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] uppercase font-mono text-neutral-400 tracking-wider">Calificación Inicial</span>
                  <span className="text-4xl sm:text-5xl font-black text-[#EDEDED] my-1.5">Grado C</span>
                  <span className="text-[11px] text-[#EDEDED] font-medium">Vulnerable a clonación de pasarela</span>
                </div>

                <div className="p-5 bg-[#080808] border border-white/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] uppercase font-mono text-neutral-400 tracking-wider">Cifrado de Clientes</span>
                  <span className="text-4xl sm:text-5xl font-black text-[#EDEDED] my-1.5">TLS 1.3</span>
                  <span className="text-[11px] text-[#EDEDED] font-medium">Canal activo y seguro</span>
                </div>

                <div className="p-5 bg-[#080808] border border-white/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] uppercase font-mono text-neutral-400 tracking-wider">Impacto Económico en Riesgo</span>
                  <span className="text-4xl sm:text-5xl font-black text-[#ff4d4d] my-1.5">Alto</span>
                  <span className="text-[11px] text-[#ff4d4d] font-medium">Robo de pedidos en Wi-Fi abierta</span>
                </div>
              </div>

              {/* Hallazgos traducidos a Lenguaje de Negocio */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#EDEDED] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#bdbdbd]" />
                    <span>3 Hallazgos Críticos Detectados y su Impacto en Ventas</span>
                  </h3>
                  <span className="text-xs text-neutral-400 hidden sm:inline">Explicado sin jerga innecesaria</span>
                </div>

                <div className="space-y-3">
                  {/* Fallo 1 */}
                  <div className="p-4 sm:p-5 bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#ff4d4d] text-xs sm:text-sm">
                        1. Tu tienda o web puede ser incrustada en páginas clonadas (Falta de X-Frame-Options)
                      </span>
                      <span className="px-2.5 py-0.5 bg-white/[0.03] border border-white/10 text-[#ff4d4d] font-mono text-[10px] font-bold uppercase">
                        🔴 Peligro Crítico
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      <strong className="text-white">Impacto en el Negocio:</strong> Un ciberdelincuente puede crear un dominio similar y meter tu web en un marco invisible. Cuando el cliente hace clic en tu botón de pago o WhatsApp, el dinero o el pedido se desvían a la cuenta del atacante.
                    </p>
                    <div className="p-2.5 bg-[#080808] border border-white/10 text-[11px] text-[#EDEDED] font-medium">
                      ✓ Solución con DEFENSA TI: Inyectamos directivas de bloqueo perimetral. Nadie fuera de tu dominio puede replicar tu web.
                    </div>
                  </div>

                  {/* Fallo 2 */}
                  <div className="p-4 sm:p-5 bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#EDEDED] text-xs sm:text-sm">
                        2. Conexión desprotegida en redes públicas de restaurantes y hoteles (Falta de HSTS)
                      </span>
                      <span className="px-2.5 py-0.5 bg-white/[0.03] border border-white/10 text-[#EDEDED] font-mono text-[10px] font-bold uppercase">
                        🟡 Riesgo Comercial
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      <strong className="text-white">Impacto en el Negocio:</strong> Si un comprador o administrador de tu empresa se conecta desde una cafetería o feria comercial, un tercero en la misma red Wi-Fi puede degradar la conexión y espiar las compras o pedidos en trámite.
                    </p>
                    <div className="p-2.5 bg-[#080808] border border-white/10 text-[11px] text-[#EDEDED] font-medium">
                      ✓ Solución con DEFENSA TI: Forzado de túnel cifrado permanente HSTS con precarga de 1 año.
                    </div>
                  </div>

                  {/* Fallo 3 */}
                  <div className="p-4 sm:p-5 bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#EDEDED] text-xs sm:text-sm">
                        3. Visibilidad de tu versión de CMS a ojos de robots atacantes (Server Tokens Expuestos)
                      </span>
                      <span className="px-2.5 py-0.5 bg-white/[0.03] border border-white/10 text-[#EDEDED] font-mono text-[10px] font-bold uppercase">
                        🟡 Alerta Preventiva
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      <strong className="text-white">Impacto en el Negocio:</strong> Los atacantes usan bots automáticos buscando tiendas con versiones antiguas. Si dejas expuesta la versión exacta de tu servidor o plugins, te conviertes en un blanco fácil en listas de ataque masivo.
                    </p>
                    <div className="p-2.5 bg-[#080808] border border-white/10 text-[11px] text-[#EDEDED] font-medium">
                      ✓ Solución con DEFENSA TI: Ocultamiento perimetral de cabeceras de servidor e insensibilización de versiones.
                    </div>
                  </div>
                </div>
              </div>

              {/* Semáforo de Cumplimiento de Ley de Protección de Datos */}
              <div className="p-4 bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#EDEDED] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Cumplimiento Legal: Ley de Protección de Datos Personales (Perú Ley N° 29733)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-white/[0.03] text-[#EDEDED] font-bold">
                    🟢 En Adecuación
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  El blindaje perimetral garantiza que las sesiones de usuarios no viajen en texto claro ni puedan ser capturadas por terceros, protegiendo a la empresa frente a sanciones administrativas de hasta 50 UIT de la Autoridad Nacional de Protección de Datos Personales.
                </p>
              </div>

              {/* Cuadro de Planes Comerciales y Retorno de Inversión (ROI) */}
              <div className="p-5 sm:p-6 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <h4 className="text-xs sm:text-sm font-bold text-[#EDEDED] uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#EDEDED]" />
                    <span>¿Cómo solucionar estos hallazgos y alcanzar Grado A? (Servicios y Precios)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-[#EDEDED] bg-white/[0.03] px-2 py-0.5 border border-white/10 font-bold self-start sm:self-center">
                    Meta de Blindaje: Grado A (90-100 pts)
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  En el Perú, las observaciones de seguridad o sanciones ante INDECOPI por falta de cifrado en datos de clientes acarrean multas de hasta 50 UIT bajo la Ley N° 29733. Implementar buenas prácticas perimetrales reduce drásticamente el riesgo operativo:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#EDEDED] text-xs">Rescate / Limpieza de malware</span>
                      <span className="text-xs font-mono font-black text-[#ff4d4d]">{P.rescateCorporativo} – {P.rescateTienda}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Desinfección forense en 24 a 48h para sitios corporativos ({P.rescateCorporativo}) o tiendas WooCommerce ({P.rescateTienda}) con respaldo integral, desbloqueo de hosting y <strong>garantía formal de 30 días</strong>.
                    </p>
                  </div>

                  <div className="p-4 bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#EDEDED] text-xs">Blindaje + WAF Cloudflare (Unificado)</span>
                      <span className="text-xs font-mono font-black text-[#bdbdbd]">{P.blindajeWaf} PEN</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Paquete unificado de prevención: cabeceras estrictas (HSTS, CSP, X-Frame) más Firewall WAF Cloudflare perimetral anti-bots, DDoS y scrapers con <strong>meta Grado A</strong>.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* PESTAÑA 2: VISIÓN DESARROLLADOR / SYSADMIN (DEV & RECETA DE CÓDIGO) */}
          {/* ===================================================================== */}
          {activeTab === 'dev' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Badge Identificador de Vista */}
              <div className="p-3 bg-white/[0.03] border border-white/10 text-xs text-[#EDEDED] flex items-center justify-between">
                <span className="font-semibold flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#bdbdbd]" />
                  <span>Explicación para el Programador o SysAdmin: Receta de configuración y telemetría RFC</span>
                </span>
                <span className="font-mono text-[10px] text-[#EDEDED]">Código Listo para Copiar</span>
              </div>

              {/* Matriz de Puertos Auditados */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#bdbdbd]" />
                    <span>Revisión de Puertos Expuestos a Internet (Sondeo Seguro)</span>
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Puerto 443 = Canal Seguro HTTPS &bull; Puerto 80 = Redirección Obligatoria
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {(DEMO_REPORT.ports || []).map((p) => {
                    const isPort443 = p.port === 443;
                    const isPort80 = p.port === 80;

                    let statusTitle = p.isOpen ? 'Abierto' : 'Cerrado';
                    let subtitle = 'Sin exposición';
                    let badgeColor = 'bg-white/5 border-white/10 text-neutral-400';

                    if (p.isOpen) {
                      if (isPort443) {
                        statusTitle = 'Abierto (Óptimo)';
                        subtitle = 'HTTPS Seguro';
                        badgeColor = 'bg-white/[0.03] border-white/10 text-[#EDEDED]';
                      } else if (isPort80) {
                        statusTitle = 'Redirección HTTPS';
                        subtitle = 'Hacia puerto 443';
                        badgeColor = 'bg-white/[0.03] border-white/10 text-[#EDEDED]';
                      } else {
                        statusTitle = 'Expuesto';
                        subtitle = 'Alerta de riesgo';
                        badgeColor = 'bg-white/[0.03] border-white/10 text-[#ff4d4d]';
                      }
                    } else {
                      subtitle = 'Protegido';
                    }

                    return (
                      <div 
                        key={p.port}
                        className={`p-2.5 border text-center ${badgeColor}`}
                      >
                        <div className="font-mono font-bold text-xs text-[#EDEDED]">Puerto {p.port}</div>
                        <div className="text-[10px] font-semibold mt-0.5">{statusTitle}</div>
                        <div className="text-[9px] opacity-70 mt-0.5">{subtitle}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Evaluación Interactiva de Cabeceras OWASP / RFC */}
              <HeaderResults headers={DEMO_REPORT.headers || []} />

              {/* RECETA DE CÓDIGO INTERACTIVA (NGINX / APACHE / CLOUDFLARE) */}
              <div className="space-y-4 p-5 sm:p-6 bg-[#080808] border border-white/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono text-[#bdbdbd] uppercase font-bold block">
                      Receta de Código para Remediación (5 Minutos)
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-[#EDEDED]">
                      Aplica estas directivas para elevar la web a Grado A
                    </h4>
                  </div>

                  {/* Selector de Servidor */}
                  <div className="inline-flex p-1 bg-white/10 border border-white/10 gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveServerTab('nginx')}
                      className={`px-3 py-1.5 font-bold transition-all cursor-pointer ${
                        activeServerTab === 'nginx' ? 'bg-[#EDEDED] text-[#080808] ' : 'text-neutral-400 hover:text-[#EDEDED]'
                      }`}
                    >
                      Nginx
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveServerTab('apache')}
                      className={`px-3 py-1.5 font-bold transition-all cursor-pointer ${
                        activeServerTab === 'apache' ? 'bg-[#EDEDED] text-[#080808] ' : 'text-neutral-400 hover:text-[#EDEDED]'
                      }`}
                    >
                      Apache
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveServerTab('cloudflare')}
                      className={`px-3 py-1.5 font-bold transition-all cursor-pointer ${
                        activeServerTab === 'cloudflare' ? 'bg-[#EDEDED] text-[#080808] ' : 'text-neutral-400 hover:text-[#EDEDED]'
                      }`}
                    >
                      Cloudflare
                    </button>
                  </div>
                </div>

                {/* Bloque de Código con botón de copia */}
                <div className="relative overflow-hidden bg-[#080808] border border-white/10 p-4">
                  <button
                    type="button"
                    onClick={() => {
                      const code = activeServerTab === 'nginx' ? nginxSnippet : activeServerTab === 'apache' ? apacheSnippet : cloudflareSnippet;
                      copyCode(code);
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-mono text-[#EDEDED] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSnippet ? <Check className="w-3.5 h-3.5 text-[#EDEDED]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <pre className="font-mono text-xs text-[#EDEDED] overflow-x-auto leading-relaxed pt-2">
                    <code>
                      {activeServerTab === 'nginx' && nginxSnippet}
                      {activeServerTab === 'apache' && apacheSnippet}
                      {activeServerTab === 'cloudflare' && cloudflareSnippet}
                    </code>
                  </pre>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 text-xs text-neutral-300 font-mono">
                  <span>Comando de verificación posterior: </span>
                  <code className="text-sky-300">curl -I https://ejemplo-empresa-demo.pe</code>
                </div>
              </div>

            </div>
          )}

          {/* Explicación Detallada de los Motores: Red Determinista + IA Consultiva */}
          <AuditEngineExplanation 
            engineVersion="1.2.0-cloud"
            aiModel="Neuronality AI (Google Gemini 1.5 Flash)"
            targetResolvedIp="[PROTEGIDA POR SEGURIDAD]"
            durationMs={840}
          />

          {/* Botones de Acción: Descargar PDF + Escaneo + WhatsApp */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/10">
            <a
              href="/informe-ejemplo-defensati.pdf"
              target="_blank"
              download="informe-ejemplo-defensati.pdf"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#EDEDED] text-[#080808] hover:bg-[#EDEDED] hover:text-[#080808] text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#EDEDED]" />
              <span>Descargar PDF de Ejemplo (2 Páginas)</span>
            </a>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href="/defensati"
                className="w-full sm:w-auto px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-[#EDEDED] text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Escanear mi Web</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={`${siteConfig.contact.whatsappLink}?text=${encodeURIComponent('Hola Martín, revisé el informe de ejemplo de DEFENSA TI (Negocio + Dev) y quiero consultar sobre la auditoría y blindaje para mi empresa.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-black text-xs sm:text-sm font-extrabold transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>

          </div>
        </div>
      </main>
    </div>
  );
}
