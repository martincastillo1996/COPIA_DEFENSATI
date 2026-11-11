'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  FileText,
  TrendingUp,
  BarChart3,
  Scale,
  Building2,
  ShoppingCart,
  Server,
  Fingerprint,
  Download,
  ChevronDown
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';

export default function DefensatiCases() {
  const [activeCase, setActiveCase] = useState<'ecommerce' | 'corporate' | 'distributor'>('ecommerce');
  const [showStats, setShowStats] = useState(false);
  const [showCaseDetail, setShowCaseDetail] = useState(false);

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
        confidentiality: 'Atención directa del fundador: yo mismo reviso tu web personalmente con estricta reserva conforme a la Ley N° 29733 de Protección de Datos Personales del Perú.',
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
        confidentiality: 'Sin intermediarios ni juniors: yo mismo reviso tu web y resguardo tus accesos conforme a la Ley N° 29733 del Perú.',
        attackVector: 'Subida no autenticada de archivos en carpeta /wp-content/uploads/ mediante vulnerabilidad en plugin de formularios de contacto sin actualizar. Inyección de páginas de phishing suplantando acceso a entidad bancaria.',
        validationSource: 'Notificación oficial de alerta «Sitio web engañoso / Social Engineering» en Google Search Console. Aprobación formal de reconsideración por Google Trust & Safety y deslistado verificado en Spamhaus ZEN.'
      },
      found: [
        'Pantalla roja de Google («Deceptive site ahead / Sitio engañoso») por inyección de enlaces de phishing en /wp-content/uploads/.',
        'Vulnerabilidad en plugin de formularios de contacto desactualizado (exploit de subida de archivos arbitraria).',
        'Correos corporativos rebotando o cayendo a SPAM por inclusión de la IP del servidor en listas negras (Spamhaus ZEN).',
        'Ausencia de cabeceras de seguridad estrictas HSTS, Content-Security-Policy y X-Frame-Options.'
      ],
      remedied: [
        'Aislamiento del entorno y erradicación total de webshells y scripts ocultos en carpetas de contenido.',
        'Actualización segura, parcheo de plugins vulnerables y restricción de ejecución PHP en carpetas de subidas.',
        'Implementación de cabeceras perimetrales estrictas (HSTS con precarga, CSP estricto y X-Frame-Options DENY).',
        'Elaboración y tramitación de informe técnico de reconsideración ante Google Search Console, aprobada en 14 horas.',
        'Gestión técnica de deslistado en listas negras de reputación de correo (Spamhaus y DNSBL).'
      ],
      result: 'Eliminación del bloqueo de Google al 100%, restablecimiento del flujo de cotizaciones y reputación comercial recuperada.',
      warrantyApplied: 'Atención técnica directa por Martín Castillo (yo mismo reviso tu web) y garantía de 30 días.',
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
        confidentiality: 'Trato directo y personal: yo mismo reviso tu web y configuro el blindaje con total reserva y ética profesional.',
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
    <section id="casos-reales" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-6 scroll-mt-24 text-left">
      
      {/* 1. Contexto de Ciberseguridad en el Mercado Peruano */}
      <div className="rounded-[32px] sm:rounded-[36px] bg-[#161618]/75 border border-white/10 p-6 sm:p-10 backdrop-blur-3xl shadow-[0_30px_70px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] space-y-5">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[#ff453a] text-xs font-semibold tracking-tight">
            <span className="w-2 h-2 rounded-full bg-[#ff453a] animate-ping" />
            <span>DATOS OFICIALES Y FUENTES VERIFICABLES</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#f5f5f7] tracking-[-0.03em] leading-tight">
            La realidad de la seguridad web en Perú (2024 - 2026)
          </h2>
          <p className="text-xs sm:text-sm text-[#86868b] font-normal leading-relaxed max-w-3xl">
            La falta de mantenimiento y plugins desactualizados son el principal vector de intrusiones en negocios peruanos según la Fiscalía de la Nación y reportes forenses.
          </p>
        </div>

        {/* Botón Desplegable para ver Estadísticas y Responsabilidad del Hosting */}
        <div>
          <button
            type="button"
            onClick={() => setShowStats(prev => !prev)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#38bdf8] hover:text-white px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 transition-colors cursor-pointer"
          >
            <span>{showStats ? 'Ocultar estadísticas oficiales' : 'Ver estadísticas del Ministerio Público y cláusulas de hosting'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showStats ? 'rotate-180 text-sky-400' : ''}`} />
          </button>

          {showStats && (
            <div className="space-y-5 pt-4 animate-in fade-in-50 duration-200">
              {/* 3 Métricas Oficiales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Métrica 1 */}
                <div className="rounded-[20px] bg-white/[0.04] border border-white/10 p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Denuncias en Perú</span>
                    <TrendingUp className="w-4 h-4 text-[#ff453a]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff453a] to-[#ff9f0a]">
                    42,161
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    Denuncias por delitos informáticos ingresadas ante el Ministerio Público en 2024 (+129% de aumento).
                  </p>
                </div>

                {/* Métrica 2 */}
                <div className="rounded-[20px] bg-white/[0.04] border border-white/10 p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Brechas en Plugins</span>
                    <Scale className="w-4 h-4 text-[#ff9f0a]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff9f0a] to-[#30d158]">
                    91.8%
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    De vulnerabilidades provienen de plugins desactualizados; el núcleo del CMS representa menos del 1%.
                  </p>
                </div>

                {/* Métrica 3 */}
                <div className="rounded-[20px] bg-white/[0.04] border border-white/10 p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Fraude y Phishing</span>
                    <BarChart3 className="w-4 h-4 text-[#2997ff]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2997ff] to-[#c084fc]">
                    68.3%
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    De investigaciones policiales en Perú corresponden a fraude y suplantación web para desvío de pagos.
                  </p>
                </div>

              </div>

              {/* Responsabilidad Compartida en Hosting */}
              <div className="p-4 sm:p-5 rounded-[20px] bg-white/[0.03] border border-white/10 space-y-2 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-[#38bdf8] uppercase tracking-wider">
                  <Server className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Cláusula de Responsabilidad Compartida con tu Hosting</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                  Los proveedores de hosting (Hostinger, cPanel, GoDaddy, DigitalOcean) solo responden por la máquina física. <strong>La seguridad de WordPress, plugins y código es 100% tuya</strong>. Si tu web se infecta, el hosting suspende tu cuenta sin ayudarte a desinfectar.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 2. Ejemplos Reales de Intervención en Perú */}
      <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[36px] bg-[#161618]/75 border border-white/10 backdrop-blur-3xl shadow-[0_30px_70px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] space-y-6">
        
        <div className="space-y-2 border-b border-white/10 pb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/12 text-[#2997ff] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CASOS DOCUMENTADOS EN EL MERCADO PERUANO</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-bold text-[#f5f5f7] tracking-[-0.03em] leading-tight">
            Casos de estudio: Cómo resolvemos emergencias reales
          </h3>
          <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed max-w-3xl font-normal">
            Selecciona un caso para ver cómo diagnosticamos, desinfectamos y blindamos negocios en Perú.
          </p>
        </div>

        {/* Selector de Casos Apple Pills */}
        <div className="flex flex-col sm:flex-row gap-2 p-1 rounded-full bg-white/[0.04] border border-white/10">
          <button
            type="button"
            onClick={() => setActiveCase('ecommerce')}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeCase === 'ecommerce'
                ? 'bg-[#0071e3] text-white shadow-[0_4px_14px_rgba(0,113,227,0.35)]'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            <span>Tienda WooCommerce</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCase('corporate')}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeCase === 'corporate'
                ? 'bg-[#0071e3] text-white shadow-[0_4px_14px_rgba(0,113,227,0.35)]'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>Consultora B2B</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCase('distributor')}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeCase === 'distributor'
                ? 'bg-[#0071e3] text-white shadow-[0_4px_14px_rgba(0,113,227,0.35)]'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Server className="w-3.5 h-3.5 shrink-0" />
            <span>Distribuidora Callao</span>
          </button>
        </div>

        {/* Resumen del Caso Seleccionado (Ultra Directo) */}
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          
          {/* Cabecera del Caso con Scores */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-[#38bdf8] uppercase tracking-wider block">
                {current.category} &bull; {current.location}
              </span>
              <h4 className="text-base sm:text-xl font-bold text-white tracking-tight">
                {current.title}
              </h4>
            </div>
            
            {/* Medición Antes vs Después */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {current.initialScore}
              </span>
              <span className="text-neutral-400 text-xs">&rarr;</span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {current.finalScore}
              </span>
            </div>
          </div>

          {/* Resultado Conciso */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-neutral-300 space-y-1">
            <strong className="text-emerald-400 block font-semibold">Resultado de la Intervención:</strong>
            <p className="leading-relaxed">{current.result}</p>
          </div>

          {/* Botón Desplegable para ver la Bitácora Forense */}
          <div>
            <button
              type="button"
              onClick={() => setShowCaseDetail(prev => !prev)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#38bdf8] hover:text-white px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors cursor-pointer"
            >
              <span>{showCaseDetail ? 'Ocultar bitácora técnica' : 'Ver expediente forense y remediación paso a paso'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showCaseDetail ? 'rotate-180 text-sky-400' : ''}`} />
            </button>

            {/* Contenido Desplegable: Diagnóstico vs Remediación */}
            {showCaseDetail && (
              <div className="space-y-4 pt-3 animate-in fade-in-50 duration-200">
                
                {/* Ficha Técnica */}
                <div className="p-4 rounded-xl bg-black/60 border border-sky-500/20 text-xs text-neutral-300 space-y-2">
                  <div className="flex items-center justify-between text-sky-400 font-bold uppercase tracking-wider text-[11px] border-b border-white/5 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5" />
                      Expediente {current.evidence.ticketId}
                    </span>
                    <span className="font-mono text-neutral-400">{current.evidence.serviceDate}</span>
                  </div>
                  <p><strong>Vector detectado:</strong> {current.evidence.attackVector}</p>
                  <p><strong>Validación:</strong> {current.evidence.validationSource}</p>
                </div>

                {/* ANTES vs DESPUÉS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Qué se encontró */}
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/25 space-y-2">
                    <span className="font-bold text-rose-400 uppercase tracking-wider text-[11px] block">
                      1. Qué se encontró (Diagnóstico):
                    </span>
                    <ul className="space-y-1.5 text-neutral-300">
                      {current.found.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold shrink-0">&times;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Qué se corrigió */}
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/25 space-y-2">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] block">
                      2. Qué se corrigió (Remediación):
                    </span>
                    <ul className="space-y-1.5 text-neutral-300">
                      {current.remedied.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Botón WhatsApp de Consulta del Caso */}
          <div className="pt-2">
            <a
              href={`https://wa.me/17856433991?text=${encodeURIComponent(current.ctaMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(37,211,102,0.35)] cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span>Consultar caso similar por WhatsApp</span>
            </a>
          </div>

        </div>

        {/* Acceso al Informe Completo de Muestra */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <span className="text-xs text-[#f5f5f7] font-semibold block">
              ¿Quieres ver qué entregamos antes de contratar?
            </span>
            <span className="text-[11px] text-[#86868b] block">
              Revisa el Dictamen Técnico formal de muestra con telemetría y recetas de código.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/informe-ejemplo-defensati.pdf"
              target="_blank"
              download="informe-ejemplo-defensati.pdf"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-200" />
              <span>Descargar PDF Ejemplo</span>
            </a>

            <Link
              href="/defensati/informe-ejemplo"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-[#f5f5f7] font-semibold text-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#2997ff]" />
              <span>Ver Online</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </Link>
          </div>
        </div>

      </div>

    </section>
  );
}
