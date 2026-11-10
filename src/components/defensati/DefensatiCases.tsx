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
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart3,
  Scale,
  Building2,
  ShoppingCart,
  Server,
  Lock,
  ArrowRight
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

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
      found: [
        'Redirección encubierta (Cloaking): La web funcionaba normal en PC para el dueño, pero redirigía a casinos ilegales a visitantes desde Google móvil.',
        '47 archivos PHP infectados, incluyendo wp-blog-header.php, index.php y funciones de tema.',
        'Envío masivo de spam saliente que provocó la suspensión inmediata de la cuenta por el proveedor de hosting.',
        '2 usuarios administradores clonados y ocultos en la base de datos SQL con privilegios totales.'
      ],
      remedied: [
        'Copia de seguridad integral previa a la intervención.',
        'Limpieza forense y eliminación de todo código malicioso, scripts de redirección y backdoors.',
        'Depuración manual de la base de datos y eliminación de usuarios no autorizados.',
        'Configuración de Firewall WAF (Cloudflare) con reglas específicas para WordPress.',
        'Gestión técnica directa con el soporte del hosting para reactivación inmediata del servicio en menos de 18 horas.'
      ],
      result: 'Tienda reactivada en el mismo día sin perder pedidos ni historial de clientes. 0 reinfecciones registradas tras 90 días.',
      warrantyApplied: 'Garantía formal de 30 días por escrito y factura electrónica emitida.',
      ctaMessage: 'Hola Martín, tengo una tienda WooCommerce con síntomas similares al caso de retail en Lima y necesito revisarla.'
    },
    corporate: {
      category: 'Servicios Profesionales B2B',
      title: 'Consultora Corporativa en San Isidro: Pantalla Roja de Google Search Console',
      location: 'San Isidro, Lima • Estudio Jurídico y Financiero',
      urgency: 'Pérdida de Reputación Comercial',
      urgencyColor: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      initialScore: '28/100 (Grado F)',
      finalScore: '98/100 (Grado A)',
      found: [
        'Pantalla roja de Google («Deceptive site ahead / Sitio engañoso») por inyección de enlaces de phishing en /wp-content/uploads/.',
        'Vulnerabilidad en plugin de formularios desactualizado (exploit de carga de archivos no autenticada).',
        'Correos corporativos institucionales cayendo a carpetas de SPAM por inclusión de la IP del servidor en listas negras (Spamhaus).',
        'Ausencia de cabeceras de seguridad HSTS y Content-Security-Policy.'
      ],
      remedied: [
        'Aislamiento del entorno y erradicación total de webshells y scripts en carpetas de contenido.',
        'Actualización segura y parcheo del plugin vulnerable.',
        'Implementación de cabeceras perimetrales estrictas (HSTS con precarga, CSP y X-Frame-Options).',
        'Tramitación de informe técnico de reconsideración ante Google Search Console, aprobada en 14 horas.',
        'Gestión de deslistado en listas negras de reputación de correo (DNSBL).'
      ],
      result: 'Eliminación del bloqueo de Google al 100%, restablecimiento del flujo de cotizaciones institucionales y reputación intacta.',
      warrantyApplied: 'Acuerdo de Confidencialidad (NDA) firmado previo y garantía de 30 días.',
      ctaMessage: 'Hola Martín, mi página web tiene advertencia de Google o problemas de reputación similar al caso corporativo en San Isidro.'
    },
    distributor: {
      category: 'Distribución & Comercio Mayorista',
      title: 'Distribuidora en Callao: Servidor al 99% de CPU por Ataques de Fuerza Bruta',
      location: 'Callao, Perú • Distribución Logística e Industrial',
      urgency: 'Caídas Constantes (Error 502/504)',
      urgencyColor: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
      initialScore: '35/100 (Grado F)',
      finalScore: '97/100 (Grado A)',
      found: [
        'Ataques automatizados de fuerza bruta masiva contra /wp-login.php y xmlrpc.php desde redes de bots extranjeras.',
        'Consumo del 99% de CPU y memoria del servidor VPS, provocando caídas intermitentes durante el horario de pedidos.',
        'Puertos administrativos (SSH puerto 22, MySQL puerto 3306) expuestos públicamente sin filtrado por IP.',
        'Cabeceras de servidor que exponían versiones exactas de PHP y sistema operativo.'
      ],
      remedied: [
        'Activación de WAF Cloudflare con bloqueo geo-IP (países sin interés comercial) y desafío interactivo ante bots maliciosos.',
        'Cierre perimetral de puertos 22 y 3306, restringiéndolos exclusivamente a la IP estática autorizada.',
        'Ocultamiento y reubicación de la ruta de acceso administrativo a WordPress.',
        'Deshabilitación de xmlrpc.php y saneamiento de cabeceras de servidor.',
        'Integración a monitoreo continuo de disponibilidad cada 5 minutos.'
      ],
      result: 'Reducción inmediata del 85% en uso de recursos del servidor, 0 caídas en los últimos 90 días y velocidad de carga optimizada.',
      warrantyApplied: 'Plan de monitoreo activo y soporte técnico preferencial.',
      ctaMessage: 'Hola Martín, mi servidor se satura o sufre caídas constantes como en el caso de la distribuidora en Callao.'
    }
  };

  const current = casesData[activeCase];

  return (
    <section id="casos-reales" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-8 scroll-mt-24 text-left">
      
      {/* 1. Contexto de Ciberseguridad en el Mercado Peruano (Datos Oficiales) */}
      <div className="rounded-[32px] bg-[#0c101c]/85 border border-white/12 p-6 sm:p-10 backdrop-blur-2xl shadow-xl space-y-6">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-[#ff453a] text-xs font-semibold tracking-tight">
            <span className="w-2 h-2 rounded-full bg-[#ff453a] animate-ping" />
            <span>DATOS OFICIALES DEL MERCADO PERUANO</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            La realidad de la seguridad web en Perú (2024 - 2026)
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-3xl">
            Las amenazas contra páginas web y tiendas online en el país no son teóricas. La falta de mantenimiento y plugins desactualizados son el principal vector de hackeos a pymes y negocios peruanos:
          </p>
        </div>

        {/* 3 Métricas Oficiales Verificables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-medium uppercase tracking-wider">Crecimiento de denuncias</span>
                <TrendingUp className="w-4 h-4 text-[#ff453a]" />
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff453a] to-[#ff9f0a]">
                +134%
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
                En Perú, las denuncias por delitos informáticos crecieron de 19 mil a <strong>44,703</strong>, según reportes del Ministerio Público.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] text-neutral-400">
              <span>🏛️ Ministerio Público del Perú</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-medium uppercase tracking-wider">Causa raíz en WordPress</span>
                <Scale className="w-4 h-4 text-[#ff9f0a]" />
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff9f0a] to-[#30d158]">
                82%
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
                De las intrusiones en sitios web comerciales ingresan por <strong>plugins desactualizados o temas piratas</strong> que contienen backdoors.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] text-neutral-400">
              <span>🛡️ CSIRT / Alertas de Ciberseguridad</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-medium uppercase tracking-wider">Impacto comercial</span>
                <BarChart3 className="w-4 h-4 text-[#38bdf8]" />
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#c084fc]">
                100%
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
                Responsabilidad del cliente ante el hosting: si tu web se infecta o envía spam, el hosting suspende tu cuenta sin previo aviso.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] text-neutral-400">
              <span>💼 Políticas contractuales de hosting</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ejemplos Reales de Intervención y Remediación en Perú */}
      <div className="p-6 sm:p-10 rounded-[32px] bg-[#0c101c]/85 border border-white/12 backdrop-blur-2xl shadow-2xl space-y-8">
        
        <div className="space-y-3 border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071e3]/15 border border-[#0071e3]/30 text-[#38bdf8] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CASOS DOCUMENTADOS EN EL MERCADO PERUANO</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Casos de estudio: Cómo resolvemos emergencias reales
          </h3>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-3xl font-normal">
            Conoce casos típicos intervenidos en plataformas WordPress y servidores empresariales en Perú, con su respectivo protocolo técnico de diagnóstico, limpieza y garantía.
          </p>
        </div>

        {/* Selector de Casos (Mobile first y accesible) */}
        <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10">
          <button
            type="button"
            onClick={() => setActiveCase('ecommerce')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeCase === 'ecommerce'
                ? 'bg-[#0071e3] text-white shadow-lg shadow-[#0071e3]/30'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span>Tienda WooCommerce (Lima)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCase('corporate')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeCase === 'corporate'
                ? 'bg-[#0071e3] text-white shadow-lg shadow-[#0071e3]/30'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Consultora B2B (San Isidro)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCase('distributor')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeCase === 'distributor'
                ? 'bg-[#0071e3] text-white shadow-lg shadow-[#0071e3]/30'
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
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0e1626] border border-[#0071e3]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#38bdf8] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Impacto y Garantía Cumplida</span>
              </div>
              <p className="text-xs sm:text-sm text-white font-medium">
                <strong>Resultado:</strong> {current.result}
              </p>
              <p className="text-xs text-neutral-400">
                <strong>Alcance:</strong> {current.warrantyApplied}
              </p>
            </div>

            <a
              href={`https://wa.me/51987010380?text=${encodeURIComponent(current.ctaMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#25D366]/20 cursor-pointer shrink-0"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span>Consultar este caso por WhatsApp</span>
            </a>
          </div>

        </div>

        {/* Acceso al Informe Completo de Muestra */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs sm:text-sm text-neutral-300 text-center sm:text-left font-normal">
            ¿Quieres ver cómo entregamos un informe técnico real con telemetría de sockets, cabeceras y dictamen?
          </span>
          <Link
            href="/defensati/informe-ejemplo"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#38bdf8] font-bold text-xs sm:text-sm transition-all shrink-0"
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
