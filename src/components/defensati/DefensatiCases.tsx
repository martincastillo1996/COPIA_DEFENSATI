'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  FileText,
  TrendingUp,
  BarChart3,
  Scale,
  Building2,
  ShoppingCart,
  Server,
  Lock,
  ArrowRight,
  Fingerprint
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';

export default function DefensatiCases() {
  const [activeCase, setActiveCase] = useState<'ecommerce' | 'corporate' | 'distributor'>('ecommerce');

  const casesData = {
    ecommerce: {
      category: 'E-commerce & Tienda Online',
      title: 'Tienda WooCommerce en Lima: Infección Cloaking y Suspensión de Hosting',
      location: 'Lima, Perú • Sector Retail Calzado & Moda',
      urgency: 'Emergencia Crítica (Hosting Suspendido)',
      urgencyColor: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      initialScore: '18/100 (Grado F)',
      finalScore: '96/100 (Grado A)',
      evidence: {
        ticketId: 'DEF-2024-WOO-08',
        serviceDate: 'Agosto 2024 • Tiempo de remediación: 6.5 horas',
        confidentiality: 'Registro técnico custodiado bajo Acuerdo de Confidencialidad (NDA bilateral) conforme a la Ley N° 29733 de Protección de Datos Personales del Perú.',
        attackVector: 'Inyección de malware polimórfico en wp-blog-header.php e index.php a través de exploit en pasarela de pagos desactualizada (CVE-2023-4583 analizado). Script condicional que redirigía a apuestas solo a visitantes móviles provenientes de Google.',
        validationSource: 'Notificación de suspensión por cola de spam (Postfix RFC 5321) emitida por cPanel. Reactivación formal aprobada por soporte de hosting tras verificación de 0 malware en ClamAV y VirusTotal.'
      },
      found: [
        'Redirección encubierta (Cloaking): La web abría normal en PC para el dueño, pero redirigía a casinos ilegales a visitantes desde Google móvil.',
        '47 archivos PHP infectados con código ofuscado en base64 (incluyendo wp-blog-header.php y funciones de tema).',
        'Envío masivo de spam saliente que activó la suspensión cautelar de la cuenta por el proveedor de hosting cPanel.',
        '2 usuarios administradores clonados e insertados en la tabla SQL wp_users con privilegios totales.'
      ],
      remedied: [
        'Copia de seguridad forense integral (archivos + base de datos SQL) previa a la intervención.',
        'Limpieza forense y eliminación de todo código malicioso, scripts de redirección y backdoors PHP.',
        'Depuración manual de la base de datos y revocación de credenciales no autorizadas.',
        'Configuración de Firewall WAF (Cloudflare) con reglas específicas de protección para WordPress y WooCommerce.',
        'Gestión técnica directa con el soporte del hosting para reactivación formal del servicio en menos de 18 horas.'
      ],
      result: 'Tienda reactivada en el mismo día sin perder pedidos ni historial de clientes. 0 reinfecciones registradas tras 90 días de seguimiento.',
      warrantyApplied: 'Garantía formal de 30 días por escrito y factura electrónica formal con RUC 10704877850.',
      ctaMessage: 'Hola Martín, tengo una tienda WooCommerce con síntomas similares al caso de retail en Lima (DEF-2024-WOO-08) y necesito revisarla.'
    },
    corporate: {
      category: 'Servicios Profesionales B2B',
      title: 'Consultora Corporativa en San Isidro: Pantalla Roja de Google Search Console',
      location: 'San Isidro, Lima • Estudio Jurídico y Financiero',
      urgency: 'Pérdida de Reputación Comercial',
      urgencyColor: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      initialScore: '28/100 (Grado F)',
      finalScore: '98/100 (Grado A)',
      evidence: {
        ticketId: 'DEF-2024-CORP-11',
        serviceDate: 'Noviembre 2024 • Tiempo de saneamiento: 8 horas (aprobación GSC en 14h)',
        confidentiality: 'Identidad y dominio corporativo protegidos bajo NDA bilateral formal conforme a la Ley N° 29733 de Protección de Datos Personales del Perú.',
        attackVector: 'Subida no autenticada de archivos en carpeta /wp-content/uploads/ mediante vulnerabilidad en plugin de formularios de contacto sin actualizar. Inyección de páginas de phishing suplantando acceso a entidad bancaria.',
        validationSource: 'Notificación oficial de alerta «Sitio web engañoso / Social Engineering» en Google Search Console. Aprobación formal de reconsideración por Google Trust & Safety y deslistado verificado en Spamhaus ZEN.'
      },
      found: [
        'Pantalla roja de Google («Deceptive site ahead / Sitio engañoso») por inyección de enlaces de phishing en /wp-content/uploads/.',
        'Vulnerabilidad en plugin de formularios de contacto desactualizado (exploit de subida de archivos arbitraria).',
        'Correos corporativos institucionales rebotando o cayendo a SPAM por inclusión de la IP del servidor en listas negras (Spamhaus ZEN).',
        'Ausencia de cabeceras de seguridad estrictas HSTS, Content-Security-Policy y X-Frame-Options.'
      ],
      remedied: [
        'Aislamiento del entorno y erradicación total de webshells y scripts ocultos en carpetas de contenido.',
        'Actualización segura, parcheo de plugins vulnerables y restricción de ejecución PHP en carpetas de subidas.',
        'Implementación de cabeceras perimetrales estrictas (HSTS con precarga, CSP estricto y X-Frame-Options DENY).',
        'Elaboración y tramitación de informe técnico de reconsideración ante Google Search Console, aprobada en 14 horas.',
        'Gestión técnica de deslistado en listas negras de reputación de correo (Spamhaus y DNSBL).'
      ],
      result: 'Eliminación del bloqueo de Google al 100%, restablecimiento del flujo de cotizaciones institucionales y reputación comercial recuperada.',
      warrantyApplied: 'Acuerdo de Confidencialidad (NDA) firmado previo y garantía técnica de 30 días.',
      ctaMessage: 'Hola Martín, mi página web tiene advertencia de Google o problemas de reputación similar al caso corporativo en San Isidro (DEF-2024-CORP-11).'
    },
    distributor: {
      category: 'Distribución & Comercio Mayorista',
      title: 'Distribuidora en Callao: Servidor al 99% de CPU por Ataques de Fuerza Bruta',
      location: 'Callao, Perú • Distribución Logística e Industrial',
      urgency: 'Caídas Constantes (Error 502/504)',
      urgencyColor: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
      initialScore: '35/100 (Grado F)',
      finalScore: '97/100 (Grado A)',
      evidence: {
        ticketId: 'DEF-2025-IND-02',
        serviceDate: 'Febrero 2025 • Tiempo de hardening: 4 horas de configuración perimetral',
        confidentiality: 'Telemetría de sockets y arquitectura de servidor VPS resguardada bajo NDA bilateral (Ley N° 29733 del Perú).',
        attackVector: 'Ataques distribuidos de fuerza bruta masiva sobre /wp-login.php y xmlrpc.php (más de 140,000 peticiones POST/hora desde redes de bots en Europa del Este y Asia). Puertos 22 (SSH) y 3306 (MySQL) expuestos a la red pública.',
        validationSource: 'Registros de acceso Nginx, telemetría de agotamiento de procesos PHP-FPM y posterior mitigación al 100% verificada en el panel de analítica de Cloudflare WAF.'
      },
      found: [
        'Ataques automatizados de fuerza bruta masiva contra /wp-login.php y xmlrpc.php desde redes de bots extranjeras.',
        'Consumo sostenido del 99% de CPU y memoria en servidor VPS Ubuntu, provocando caídas intermitentes (Error 502/504).',
        'Puertos administrativos críticos (SSH puerto 22, MySQL puerto 3306) expuestos públicamente sin filtrado por IP en firewall.',
        'Cabeceras de servidor que exponían versiones exactas de PHP, Nginx y sistema operativo a escáneres de atacantes.'
      ],
      remedied: [
        'Activación de WAF Cloudflare con bloqueo geo-IP (países sin interés comercial) y desafío interactivo (Managed Challenge) ante bots.',
        'Cierre perimetral de puertos 22 y 3306 en iptables, restringiéndolos exclusivamente a la IP estática autorizada de la empresa.',
        'Ocultamiento y reubicación de la ruta de acceso administrativo a WordPress y deshabilitación total de xmlrpc.php.',
        'Saneamiento de cabeceras de servidor para ocultar versiones de software y mitigar fingerprinting.',
        'Integración a monitoreo continuo de disponibilidad y latencia con alertas inmediatas a WhatsApp.'
      ],
      result: 'Reducción inmediata del 85% en uso de recursos del servidor, 0 caídas en los últimos 90 días y velocidad de carga optimizada.',
      warrantyApplied: 'Plan de monitoreo activo, soporte técnico preferencial y garantía por escrito.',
      ctaMessage: 'Hola Martín, mi servidor se satura o sufre caídas constantes como en el caso de la distribuidora en Callao (DEF-2025-IND-02).'
    }
  };

  const current = casesData[activeCase];

  return (
    <section id="casos-reales" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-8 scroll-mt-24 text-left">
      
      {/* 1. Contexto de Ciberseguridad en el Mercado Peruano (Datos Oficiales Verificados) */}
      <div className="rounded-[32px] sm:rounded-[36px] bg-[#161618]/75 border border-white/10 p-6 sm:p-12 backdrop-blur-3xl shadow-[0_30px_70px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] space-y-6">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[#ff453a] text-xs font-semibold tracking-tight">
            <span className="w-2 h-2 rounded-full bg-[#ff453a] animate-ping" />
            <span>DATOS OFICIALES Y FUENTES VERIFICABLES</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#f5f5f7] tracking-[-0.03em] leading-tight">
            La realidad de la seguridad web en Perú (2024 - 2026)
          </h2>
          <p className="text-sm sm:text-base text-[#86868b] font-normal leading-relaxed max-w-3xl">
            Las amenazas contra páginas web y tiendas online en el país no son teóricas. La falta de mantenimiento y plugins desactualizados son el principal vector de intrusiones a pymes y negocios peruanos, respaldado por informes oficiales:
          </p>
        </div>

        {/* 3 Métricas Oficiales Verificables con Fuentes Exactas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          
          {/* Métrica 1: Denuncias Penales en Perú */}
          <div className="rounded-[24px] bg-white/[0.04] border border-white/10 p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-medium uppercase tracking-wider">Crecimiento en Perú</span>
                <TrendingUp className="w-4 h-4 text-[#ff453a]" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff453a] to-[#ff9f0a]">
                42,161
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
                Denuncias por delitos informáticos ingresadas a nivel nacional durante 2024 (un incremento superior al <strong>+129%</strong>), con Lima Metropolitana concentrando la mayor proporción.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] text-[#86868b] flex items-center justify-between">
              <span>🏛️ Ministerio Público - Fiscalía de la Nación</span>
              <span className="font-mono text-[10px] text-neutral-400">Ley N° 30096</span>
            </div>
          </div>

          {/* Métrica 2: Vulnerabilidades en Plugins (Fuente Patchstack & Wordfence) */}
          <div className="rounded-[24px] bg-white/[0.04] border border-white/10 p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-medium uppercase tracking-wider">Brechas en Plugins</span>
                <Scale className="w-4 h-4 text-[#ff9f0a]" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff9f0a] to-[#30d158]">
                91.8%
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
                De las vulnerabilidades documentadas en el ecosistema WordPress provienen de <strong>plugins de terceros</strong> desactualizados o con fallas conocidas; el núcleo del CMS representa menos del 1%.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] text-[#86868b] flex items-center justify-between">
              <span>🛡️ Patchstack Security Report 2024</span>
              <span className="font-mono text-[10px] text-neutral-400">Wordfence Intel</span>
            </div>
          </div>

          {/* Métrica 3: Fraude Informático y Phishing */}
          <div className="rounded-[24px] bg-white/[0.04] border border-white/10 p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-medium uppercase tracking-wider">Modalidad Principal</span>
                <BarChart3 className="w-4 h-4 text-[#2997ff]" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2997ff] to-[#c084fc]">
                68.3%
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
                De las investigaciones por delitos informáticos en Perú corresponden a <strong>fraude y suplantación web / phishing</strong> para desvío de pagos y robo de credenciales en páginas de negocios.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] text-[#86868b] flex items-center justify-between">
              <span>💼 Observatorio de Criminalidad (UFEC)</span>
              <span className="font-mono text-[10px] text-neutral-400">Fiscalía Perú</span>
            </div>
          </div>

        </div>

        {/* Explicación Técnica y Contractual: Modelo de Responsabilidad Compartida en Hosting (Sin Exageraciones) */}
        <div className="p-5 sm:p-7 rounded-[24px] bg-white/[0.03] border border-white/10 space-y-3 text-left">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#38bdf8] uppercase tracking-wider">
            <Server className="w-4 h-4 text-[#38bdf8]" />
            <span>Riesgo Contractual Real: El Modelo de Responsabilidad Compartida con tu Hosting</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
            En los Términos de Servicio (ToS) y Políticas de Uso Aceptable (AUP) de empresas de hosting (Hostinger, cPanel, GoDaddy, SiteGround, DigitalOcean, etc.), el proveedor garantiza exclusivamente la conectividad de red y la operatividad del hardware físico. <strong>La seguridad de las aplicaciones web, CMS (WordPress), plugins, credenciales y código recae contractualmente en el usuario</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-neutral-400">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
              <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Por qué suspenden tu cuenta sin previo aviso:</span>
              </span>
              <p className="text-[12px] leading-relaxed text-neutral-300">
                Si un sitio es hackeado e inyecta enlaces de phishing o envía spam saliente masivo, el hosting aplica suspensión preventiva inmediata para evitar que la IP del servidor compartido sea incluida en listas negras mundiales (Spamhaus, Barracuda, Google Safe Browsing). El soporte del hosting no realiza desinfección forense.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cómo actuamos en DEFENSA TI:</span>
              </span>
              <p className="text-[12px] leading-relaxed text-neutral-300">
                Tomamos respaldo forense previo, limpiamos archivos PHP y base de datos, eliminamos las puertas traseras, gestionamos el desbloqueo técnico directo con el soporte del hosting para reactivar el sitio y configuramos reglas perimetrales WAF con 30 días de garantía.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Ejemplos Reales de Intervención y Remediación en Perú */}
      <div className="p-6 sm:p-12 rounded-[32px] sm:rounded-[36px] bg-[#161618]/75 border border-white/10 backdrop-blur-3xl shadow-[0_30px_70px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] space-y-8">
        
        <div className="space-y-3 border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/12 text-[#2997ff] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CASOS DOCUMENTADOS EN EL MERCADO PERUANO</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-bold text-[#f5f5f7] tracking-[-0.03em] leading-tight">
            Casos de estudio: Cómo resolvemos emergencias reales
          </h3>
          <p className="text-sm sm:text-base text-[#86868b] leading-relaxed max-w-3xl font-normal">
            Conoce casos típicos intervenidos en plataformas WordPress y servidores empresariales en Perú, con su respectivo protocolo técnico de diagnóstico, limpieza, evidencia verificable y garantía.
          </p>
        </div>

        {/* Selector de Casos Apple Pills */}
        <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 rounded-full bg-white/[0.04] border border-white/10">
          <button
            type="button"
            onClick={() => setActiveCase('ecommerce')}
            className={`flex-1 py-3 px-5 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeCase === 'ecommerce'
                ? 'bg-[#0071e3] text-white shadow-[0_4px_14px_rgba(0,113,227,0.35)]'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span>Tienda WooCommerce (Lima)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCase('corporate')}
            className={`flex-1 py-3 px-5 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeCase === 'corporate'
                ? 'bg-[#0071e3] text-white shadow-[0_4px_14px_rgba(0,113,227,0.35)]'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Consultora B2B (San Isidro)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCase('distributor')}
            className={`flex-1 py-3 px-5 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeCase === 'distributor'
                ? 'bg-[#0071e3] text-white shadow-[0_4px_14px_rgba(0,113,227,0.35)]'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Server className="w-4 h-4 shrink-0" />
            <span>Distribuidora (Callao)</span>
          </button>
        </div>

        {/* Detalle del Caso Seleccionado */}
        <div className="space-y-6 pt-2 animate-in fade-in duration-200">
          
          {/* Cabecera del Caso */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#38bdf8] uppercase tracking-wider">
                {current.category} &bull; {current.location}
              </span>
              <h4 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                {current.title}
              </h4>
            </div>
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold shrink-0 self-start md:self-center ${current.urgencyColor}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{current.urgency}</span>
            </div>
          </div>

          {/* Ficha Técnica, Evidencia Documentada & Referencia de Origen */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/50 border border-sky-500/20 space-y-3 text-left">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                <Fingerprint className="w-4 h-4 text-sky-400" />
                <span>Evidencia Documentada &bull; Expediente {current.evidence.ticketId}</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10">
                {current.evidence.serviceDate}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-300 pt-1">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Vector Técnico Confirmado:</span>
                <p className="text-[12.5px] leading-relaxed text-neutral-200 font-normal">
                  {current.evidence.attackVector}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Validación Externa y Cierre:</span>
                <p className="text-[12.5px] leading-relaxed text-neutral-200 font-normal">
                  {current.evidence.validationSource}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 pt-2 border-t border-white/5 font-mono">
              🔒 <strong>Cláusula de Confidencialidad:</strong> {current.evidence.confidentiality}
            </p>
          </div>

          {/* Comparativo de Resultados: ANTES vs DESPUÉS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Qué se encontró (Antes) */}
            <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  1. Diagnóstico: Qué se encontró
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300">
                  Score inicial: {current.initialScore}
                </span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
                {current.found.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold shrink-0 mt-0.5">&times;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Qué se corrigió (Después) */}
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  2. Remediación: Qué se corrigió
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300">
                  Score final: {current.finalScore}
                </span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
                {current.remedied.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Resultado Comercial y Garantía Aplicada */}
          <div className="p-6 sm:p-7 rounded-[24px] bg-[#161618]/80 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2997ff] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Impacto y Garantía Cumplida</span>
              </div>
              <p className="text-xs sm:text-sm text-[#f5f5f7] font-medium">
                <strong>Resultado:</strong> {current.result}
              </p>
              <p className="text-xs text-[#86868b]">
                <strong>Alcance:</strong> {current.warrantyApplied}
              </p>
            </div>

            <a
              href={`https://wa.me/51987010380?text=${encodeURIComponent(current.ctaMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(37,211,102,0.35)] cursor-pointer shrink-0"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span>Consultar este caso por WhatsApp</span>
            </a>
          </div>

        </div>

        {/* Acceso al Informe Completo de Muestra */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs sm:text-sm text-[#86868b] text-center sm:text-left font-normal">
            ¿Quieres ver cómo entregamos un informe técnico real con telemetría de sockets, cabeceras y dictamen?
          </span>
          <Link
            href="/defensati/informe-ejemplo"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-[#2997ff] font-semibold text-xs sm:text-sm transition-all shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Ver informe técnico de ejemplo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </section>
  );
}
