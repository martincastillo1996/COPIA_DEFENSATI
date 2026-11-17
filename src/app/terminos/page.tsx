'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import NeuralBackground from '@/components/NeuralBackground';
import NeuronalGravityBrandLogo from '@/components/NeuronalGravityBrandLogo';
import HeaderWhatsAppButton from '@/components/HeaderWhatsAppButton';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Database, 
  Scale, 
  BookOpen, 
  Server,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function TerminosYPrivacidadPage() {
  const [activeTab, setActiveTab] = useState<'todos' | 'terminos' | 'privacidad'>('todos');

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-[#0071e3] selection:text-white font-sans antialiased relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <NeuralBackground showDomains={false} />
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/70 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <NeuronalGravityBrandLogo />
          <div className="flex items-center gap-2.5 sm:gap-3">
            <HeaderWhatsAppButton
              message="Hola Martín, estoy revisando los Términos y Condiciones de Neuronal Gravity y deseo hacer una consulta."
            />
            <Link 
              href="/reclamaciones" 
              className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold transition-colors border border-amber-400/30 px-3 py-1.5 rounded-xl bg-amber-400/10"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Libro de Reclamaciones</span>
            </Link>
            <Link href="/" className="text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10 text-neutral-200">
        
        {/* Cabecera Principal */}
        <div className="space-y-4 border-b border-white/10 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Scale className="w-3.5 h-3.5" />
              <span>Marco Legal República del Perú</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Ley N° 29733 &bull; D.S. 016-2024-JUS &bull; Ley N° 30096</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Términos del Servicio y Política de Privacidad
          </h1>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 space-y-1.5">
            <p>
              <strong>Titular y Prestador:</strong> Karol Martin Castillo Rojas (Persona Natural con Negocio) &bull; <strong>RUC:</strong> 10704877850 &bull; Domicilio: Lima, República del Perú.
            </p>
            <p>
              <strong>Contacto Oficial y Ejercicio de Derechos:</strong> Correo Institucional: <a href="mailto:contacto@neuronalgravity.com" className="text-[#38bdf8] underline">contacto@neuronalgravity.com</a> &bull; WhatsApp Oficial: <a href="https://wa.me/51987010380" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">+51 987 010 380</a>.
            </p>
            <p>
              <strong>Horario Oficial de Atención y Soporte Técnico:</strong> Lunes a Sábado de 9:00 a 20:00 (Hora Oficial de la República del Perú &bull; UTC-5). Solicitudes fuera de horario o en días domingos/feriados se gestionan al inicio de la jornada hábil siguiente.
            </p>
            <p className="text-[11px] text-neutral-400">
              * Vigente a partir de 2026. Documento unificado de observancia obligatoria para contrataciones y uso en todo el territorio nacional peruano.
            </p>
          </div>

          {/* Filtros de navegación rápida */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'todos' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              Ver Documento Completo
            </button>
            <button
              onClick={() => setActiveTab('terminos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'terminos' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              Términos del Servicio (Ley 30096 y Código Consumidor)
            </button>
            <button
              onClick={() => setActiveTab('privacidad')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'privacidad' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              Protección de Datos (Ley 29733 / D.S. 016-2024-JUS)
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PARTE I: TÉRMINOS Y CONDICIONES DEL SERVICIO */}
        {/* ========================================================================= */}
        {(activeTab === 'todos' || activeTab === 'terminos') && (
          <div className="space-y-8">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-emerald-400">
              <Scale className="w-5 h-5" />
              <h2 className="text-xl font-extrabold uppercase tracking-wider text-white">
                Parte I: Términos y Condiciones del Servicio
              </h2>
            </div>

            {/* 1. Ámbito Territorial y Exclusividad Perú */}
            <section className="space-y-3 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white">1. Ámbito Territorial Exclusivo (República del Perú)</h3>
              <p>
                Los servicios de auditoría perimetral y blindaje web ofrecidos por <strong>DEFENSA TI</strong> y la plataforma <strong>Neuronal Gravity</strong> están destinados y prestados <strong>exclusivamente a personas naturales y personas jurídicas domiciliadas o que desarrollen actividades comerciales en la República del Perú</strong>.
              </p>
              <p>
                No realizamos prospección, venta activa ni contratación de servicios para mercados extranjeros. Todo pago, comprobante tributario y relación contractual se estructura bajo la legislación peruana y las normativas de la Superintendencia Nacional de Aduanas y de Administración Tributaria (SUNAT).
              </p>
            </section>

            {/* 2. Declaración y Garantía de Autorización (Ley 30096 - Delitos Informáticos) */}
            <section id="delitos-informaticos" className="space-y-3 text-sm leading-relaxed scroll-mt-20">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>2. Declaración y Garantía de Titularidad (Ley N° 30096)</span>
              </h3>
              <p>
                En estricto cumplimiento de la <strong>Ley N° 30096 (Ley de Delitos Informáticos del Perú)</strong> y sus modificatorias:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-neutral-300">
                <li>
                  <strong>Declaración Bajo Juramento:</strong> Toda persona natural o jurídica que ingrese un dominio en el escáner declara y garantiza expresamente ser el propietario legítimo del dominio web ingresado, o contar con poder formal y por escrito de la empresa para someterlo a diagnóstico y remediación perimetral.
                </li>
                <li>
                  <strong>Técnica No Intrusiva:</strong> DEFENSA TI realiza análisis perimetrales externos y deterministas no intrusivos (cabeceras HTTP, certificados SSL/TLS, DNS y sondeo de puertos de transporte expuestos). <strong>Quedan prohibidas y expresamente excluidas cualquier maniobra de inyección destructiva, denegación de servicio (DDoS), interceptación o vulneración no autorizada de bases de datos.</strong>
                </li>
                <li>
                  <strong>Cláusula de Indemnidad:</strong> Si el dominio fuera ingresado por un tercero sin autorización legal, dicho usuario asumirá toda la responsabilidad penal, civil y administrativa conforme al Código Penal y la Ley N° 30096, eximiendo y manteniendo indemne a Karol Martin Castillo Rojas y a la plataforma DEFENSA TI.
                </li>
              </ul>
            </section>

            {/* 3. Definición de Planes, Precios en Soles y Tiempos de Entrega */}
            <section className="space-y-4 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white">3. Modalidades de Contratación y Plazos Técnicos de Entrega</h3>
              <p>
                Las tarifas oficiales se expresan en moneda nacional (PEN / Nuevos Soles) e integran los servicios oficiales comercializados por DEFENSA TI con sus respectivos alcances y plazos de ejecución:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">1. Diagnóstico gratuito</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Sin Costo</span>
                  </div>
                  <p className="text-neutral-300">Escaneo perimetral pasivo no intrusivo en pantalla. Diagnóstico preliminar de orientación por WhatsApp en <strong>menos de 2 horas</strong> (dentro del horario de atención).</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">2. Rescate (Sitio Corporativo)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">S/. 380 PEN</span>
                  </div>
                  <p className="text-neutral-300">Desinfección forense completa de archivos y base de datos para webs corporativas, blogs y portafolios (WordPress, Wix o a medida). Retiro de virus, troyanos, backdoors, desbloqueo con el hosting y retiro de pantalla roja de Google en <strong>24 a 48 horas hábiles</strong> con garantía de 30 días.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">3. Rescate (WooCommerce / Tienda)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">S/. 550 PEN</span>
                  </div>
                  <p className="text-neutral-300">Desinfección forense integral para tiendas online (WooCommerce, Shopify o Wix) con saneamiento de plantillas Liquid/Wix, checkout y pasarelas contra robo de tarjetas (Magecart) en <strong>24 a 48 horas hábiles</strong> con garantía de 30 días.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">4. Blindaje + WAF Cloudflare</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">S/. 450 PEN</span>
                  </div>
                  <p className="text-neutral-300">Paquete unificado de prevención perimetral: cabeceras estrictas canónicas (HSTS, CSP, X-Frame) más Firewall WAF en Cloudflare anti-bots, scrapers y ataques DDoS en <strong>3 a 5 días hábiles</strong> con meta de Grado A (no se comercializan cabeceras por separado).</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5 md:col-span-2 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">5. Mantenimiento mensual 24/7</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">S/. 90 y S/. 180 / mes</span>
                  </div>
                  <p className="text-neutral-300">Activación en <strong>menos de 24 horas</strong>. Vigilancia ininterrumpida 24/7 (Uptime checks, alertas preventivas de SSL y dominio) con aviso inmediato a WhatsApp; re-escaneos periódicos y soporte técnico directo incluido sin permanencia forzosa.</p>
                </div>
              </div>

              {/* Caja de Reglas de Cómputo y Horario Oficial */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-neutral-300 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Clock className="w-4 h-4 text-[#38bdf8]" />
                  <span>Reglas de Cómputo de Plazos y Horario de Atención Oficial:</span>
                </div>
                <p>
                  <strong>Horario de Atención Técnica:</strong> Lunes a Sábado de 9:00 a 20:00 (Hora Oficial de la República del Perú &bull; UTC-5). Los días domingos y feriados nacionales peruanos no computan para el cálculo de días hábiles. Las solicitudes ingresadas fuera de horario o en domingos inician su cómputo a las 9:00 horas del siguiente día hábil.
                </p>
                <p>
                  <strong>Inicio del Cómputo de Plazos:</strong> Todo plazo de ejecución técnica comienza a computarse a partir de la entrega efectiva por parte del cliente de las credenciales y accesos técnicos requeridos (cPanel, SSH, SFTP, CMS o Cloudflare) y su validación como operativos por nuestro equipo.
                </p>
              </div>
              {/* 3.1. Diferenciación Técnica y Alcance según la Plataforma (WordPress vs. Shopify y Wix) */}
              <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/25 text-xs text-neutral-300 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>3.1. Alcance Técnico según Arquitectura de Plataforma (WordPress vs. Shopify y Wix):</span>
                </div>
                <p>
                  Para garantizar total transparencia técnica y delimitar las responsabilidades de cada parte, los servicios de DEFENSA TI se estructuran según la naturaleza del software del cliente:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-300">
                  <li>
                    <strong>CMS Auto-alojados (WordPress, WooCommerce, PrestaShop, Magento):</strong> El cliente cuenta con servidor propio o compartido (cPanel, SSH, SFTP). El servicio de rescate abarca desinfección forense de archivos PHP, tablas SQL, retiro de webshells/backdoors y remediación ante la suspensión preventiva impuesta por la empresa de hosting (S/ 380 en sitios corporativos | S/ 550 en WooCommerce).
                  </li>
                  <li>
                    <strong>Plataformas SaaS en la Nube (Shopify, Wix, Squarespace):</strong> Al tratarse de entornos cerrados administrados internacionalmente por Shopify Inc. o Wix.com, la infraestructura de servidor físico y el núcleo del CMS son gestionados por el proveedor. Por consiguiente, <strong>no existen virus de archivos PHP ni acceso a base de datos de servidor</strong>. El servicio de DEFENSA TI en estas plataformas atiende los riesgos reales aplicables a tiendas en la nube: (i) <em>Saneamiento de Temas y Apps</em> (detección y remoción de scripts maliciosos insertados en plantillas Liquid o código Wix para robo de tarjetas/Magecart y revocación de apps no autorizadas con tarifa de S/ 550); (ii) <em>Blindaje + WAF Cloudflare</em> (S/ 450, que incluye cabeceras compatibles, registros estrictos SPF, DKIM y DMARC en el DNS del dominio para evitar que atacantes envíen correos fraudulentos a nombre de la tienda, y WAF perimetral para mitigar scrapers de precios/inventario y bots en checkout); y (iii) <em>Mantenimiento Mensual</em> (S/ 90 y S/ 180 / mes, con aviso prioritario a WhatsApp ante caídas de la pasarela o de la tienda).
                  </li>
                </ul>
              </div>
            </section>

            {/* 3.2. Condiciones Específicas del Monitoreo Mensual */}
            <section className="space-y-3 text-sm leading-relaxed p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span>3.2. Condiciones Específicas del Mantenimiento y Monitoreo Mensual (Planes S/. 90 y S/. 180 PEN)</span>
              </h4>
              <p className="text-xs text-neutral-300">
                Los servicios de mantenimiento mensual están estructurados sobre procesos de supervisión automatizada continua para garantizar un precio asequible y una detección inmediata de incidencias. Para asegurar la viabilidad técnica y operativa, el soporte manual de intervención humana está taxativamente acotado:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Plan Básico (S/. 90 PEN / mes)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Sitios Corporativos</span>
                  </div>
                  <ul className="space-y-1.5 text-neutral-300">
                    <li>• <strong>Qué se monitorea:</strong> Disponibilidad web (Uptime HTTP/HTTPS) y fecha de expiración del certificado SSL/TLS.</li>
                    <li>• <strong>Frecuencia:</strong> Muestreo de disponibilidad cada 15 minutos; alerta preventiva de SSL a los 30 días previos; re-escaneo perimetral mensual.</li>
                    <li>• <strong>Canal de alertas:</strong> Mensaje inmediato a WhatsApp oficial del cliente ante caída confirmada y reporte mensual consolidado.</li>
                    <li>• <strong>Límite de soporte manual incluido:</strong> Hasta un <strong>máximo de 40 minutos al mes</strong> de soporte técnico para ajustes menores de configuración perimetral o renovación básica de SSL.</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Plan Tiendas Online (S/. 180 PEN / mes)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">Soporte Prioritario</span>
                  </div>
                  <ul className="space-y-1.5 text-neutral-300">
                    <li>• <strong>Qué se monitorea:</strong> Disponibilidad en tiempo real, SSL/TLS, integridad de cabeceras, salud del checkout y detección perimetral de malware.</li>
                    <li>• <strong>Frecuencia:</strong> Muestreo de disponibilidad cada 5 minutos; monitoreo continuo de SSL; re-escaneo perimetral semanal con informe detallado.</li>
                    <li>• <strong>Canal de alertas:</strong> Notificación inmediata y prioritaria a WhatsApp + reporte ejecutivo semanal.</li>
                    <li>• <strong>Límite de soporte manual incluido:</strong> Hasta un <strong>máximo de 90 minutos (1.5 horas) al mes</strong> para optimización de cabeceras, reglas WAF y parches rápidos de seguridad.</li>
                  </ul>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 space-y-1.5">
                <strong className="text-white block font-semibold">Términos Operativos y Exclusiones de la Suscripción:</strong>
                <p>
                  <strong>a) No acumulación de horas:</strong> Los minutos u horas de soporte técnico mensual incluidos caducan al cierre de cada ciclo mensual y en ningún caso son transferibles ni acumulables para meses futuros.
                </p>
                <p>
                  <strong>b) Exclusiones estrictas y cotizaciones independientes:</strong> La cuota mensual no cubre desinfección forense tras hackeos masivos o infecciones sobrevenidas en la web del cliente (cotizado bajo la tarifa de Rescate de malware de S/. 380 en sitios corporativos o S/. 550 en WooCommerce), ni desarrollo web a medida, diseño, creación de nuevas funciones, ni fallas derivadas de caídas del datacenter o hosting del cliente.
                </p>
                <p>
                  <strong>c) Baja voluntaria sin penalizaciones:</strong> El cliente puede cancelar el servicio de monitoreo en cualquier momento antes de la fecha de su siguiente ciclo mensual mediante aviso por WhatsApp o correo electrónico, sin penalizaciones ni cláusulas de permanencia obligatoria.
                </p>
              </div>
            </section>

            {/* 4. Meta Grado A con Re-medición y Límites Técnicos del Servicio */}
            <section id="garantia" className="space-y-3 text-sm leading-relaxed scroll-mt-20">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>4. Alcance de la Meta Grado A, Re-medición, Topes de Tiempo y Límite de Responsabilidad Patrimonial</span>
              </h3>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 leading-relaxed space-y-3">
                <p>
                  <strong>Compromiso Técnico Acotado y Tope de Alcance:</strong> En el plan contratado de Blindaje + WAF Cloudflare (S/. 450 PEN), nos comprometemos a implementar las directivas perimetrales canónicas (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy y Permissions-Policy) junto con Cloudflare WAF con meta técnica de alcanzar Grado A (90-100 pts) al momento de la entrega formal. Si tras la primera intervención no se alcanza dicho Grado en el re-escaneo oficial, aplicaremos hasta un <strong>máximo de dos (2) ciclos de ajuste técnico y re-medición sin costo adicional</strong> dentro de un <strong>plazo perentorio de catorce (14) días calendario</strong> contados desde el inicio de los trabajos. Vencido dicho plazo o completados los dos ciclos de ajuste, el servicio se considerará plenamente concluido y entregado.
                </p>
                <p>
                  <strong>Alcance del servicio:</strong> Nos enfocamos en auditoría de seguridad web, fortalecimiento de configuración perimetral y reducción de riesgo técnico. <strong>Qué no cubre:</strong> No cubre vulnerabilidades en código fuente personalizado, filtraciones por contraseñas débiles de usuarios ni fallos de infraestructura del proveedor de hosting.
                </p>
                <p>
                  <strong>Exclusión de Código y Sistemas Ajenos:</strong> El servicio perimetral no incluye reprogramación de la lógica de negocio del cliente, reparación de bases de datos corruptas, remediación de plugins incompatibles de terceros ni solución a deficiencias de infraestructura atribuibles al proveedor de hosting del cliente.
                </p>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 space-y-1.5">
                  <strong className="text-white block font-semibold">Tope Máximo de Responsabilidad Patrimonial (Límite al Valor del Servicio):</strong>
                  <p>
                    Dado que el servicio es prestado bajo la modalidad de Persona Natural con Negocio (Karol Martín Castillo Rojas &bull; RUC 10704877850), la responsabilidad patrimonial total, acumulada y máxima del prestador frente al cliente por cualquier concepto (contractual, extracontractual, civil o comercial) <strong>queda estrictamente topada y limitada al cien por ciento (100%) del importe efectivamente pagado por el cliente por dicho plan contratado</strong> (ej. S/. 380 o S/. 550 PEN en rescates de malware, S/. 450 PEN en Blindaje + WAF, o el valor de la última mensualidad efectivamente pagada en planes recurrentes de S/. 90 o S/. 180 PEN).
                  </p>
                  <p>
                    Bajo ninguna circunstancia existirá responsabilidad indemnizatoria sobre el patrimonio personal del titular, ni por lucro cesante, daño emergente, pérdida de ventas, retenciones preventivas de pasarelas de pago independientes (Yape, Niubiz, Culqi, etc.) ni reclamaciones de terceros.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 space-y-1.5">
                  <strong className="text-white block font-semibold">Exclusión Expresa de Responsabilidad por Ataques Futuros y Promesas Absolutas:</strong>
                  <p>
                    DEFENSA TI y Neuronal Gravity <strong>no asumen responsabilidad alguna por ataques cibernéticos futuros, intrusiones, suplantaciones, brechas de datos o incidentes que ocurran con posterioridad</strong> a la entrega formal del servicio o la emisión del dictamen.
                  </p>
                  <p>
                    Ningún servicio perimetral puede garantizar de forma absoluta &ldquo;cero bloqueos&rdquo; ni &ldquo;inmunidad infalible&rdquo;, ya que las entidades bancarias y pasarelas aplican políticas internas de riesgo ajenas a la configuración técnica del servidor.
                  </p>
                </div>
                <div className="space-y-1.5 text-neutral-300">
                  <strong className="text-white block">Responsabilidades Exclusivas del Cliente a Futuro:</strong>
                  <p>
                    Es deber y responsabilidad única del cliente en todo momento futuro:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-400">
                    <li>Mantener intactas y no remover las cabeceras defensivas inyectadas durante actualizaciones o nuevos despliegues futuros de su web.</li>
                    <li>En CMS auto-alojados (WordPress, WooCommerce, Magento): Mantener actualizados permanentemente el núcleo del CMS, plugins, módulos y temas frente a vulnerabilidades conocidas. En plataformas SaaS administradas (Shopify, Wix): Auditar periódicamente las aplicaciones de terceros conectadas a la tienda, desinstalar apps obsoletas o no utilizadas, revocar accesos de ex-colaboradores y mantener activado obligatoriamente el doble factor de autenticación (2FA) para todo el personal.</li>
                    <li>Renovar oportunamente sus certificados SSL/TLS y gestionar contraseñas seguras y doble factor de autenticación (2FA) para sus administradores.</li>
                    <li>Monitorear caídas o fallas de configuración de su proveedor de hosting o servidor privado.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. Medios de Pago y Aclaración sobre Tarjetas (Culqi) */}
            <section className="space-y-3 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white">5. Medios de Pago y Aclaración sobre Procesamiento de Tarjetas (Culqi)</h3>
              <p>
                Los pagos por servicios de auditoría, blindaje o donaciones pueden realizarse mediante transferencias bancarias directas, billeteras digitales (Yape / Plin) o tarjetas de crédito y débito.
              </p>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs text-neutral-300">
                <p>
                  <strong>Aclaración Estricta sobre Tarjetas Bancarias:</strong> <strong>DEFENSA TI / Neuronal Gravity nunca captura, almacena, procesa ni tiene acceso directamente en sus servidores a números de tarjetas de crédito o débito, fechas de vencimiento, códigos CVV ni claves bancarias de los usuarios.</strong> Toda nuestra arquitectura opera bajo el principio de cero conocimiento respecto a instrumentos financieros.
                </p>
                <p>
                  <strong>Procesamiento Externo y Delegado vía Culqi (Grupo Credicorp):</strong> Para los pagos o aportes con tarjeta de crédito o débito, la transacción es gestionada de manera <strong>100% externa y delegada</strong> por la pasarela de pagos regulada <strong>Culqi (Compañía Incubadora de Soluciones Móviles S.A.C., empresa del Grupo Credicorp en el Perú)</strong>. Culqi cuenta con la certificación internacional de seguridad <strong>PCI-DSS Nivel 1</strong>. La captura y validación de los datos de la tarjeta ocurre de forma cifrada exclusivamente en los servidores certificados de Culqi, sin que DEFENSA TI reciba ni almacene jamás dicha información confidencial.
                </p>
                <p>
                  Por cada servicio contratado se emite la constancia técnica de entrega del blindaje perimetral.
                </p>
              </div>
            </section>

            {/* 6. Libro de Reclamaciones */}
            <section className="space-y-3 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>6. Libro de Reclamaciones Virtual (INDECOPI)</span>
              </h3>
              <p>
                En cumplimiento del <strong>Decreto Supremo N° 011-2011-PCM</strong> y el <strong>Código de Protección y Defensa del Consumidor (Ley N° 29571)</strong>, ponemos a disposición de todos los usuarios nuestro Libro de Reclamaciones Virtual para asentar quejas o reclamos. Toda comunicación ingresada será atendida en un plazo máximo e improrrogable de <strong>quince (15) días hábiles</strong>.
              </p>
              <div className="pt-1">
                <Link
                  href="/reclamaciones"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold text-xs transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Acceder al Libro de Reclamaciones Virtual</span>
                </Link>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PARTE II: POLÍTICA DE PROTECCIÓN DE DATOS PERSONALES */}
        {/* ========================================================================= */}
        {(activeTab === 'todos' || activeTab === 'privacidad') && (
          <div className="space-y-8 pt-6">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-sky-400">
              <Lock className="w-5 h-5" />
              <h2 className="text-xl font-extrabold uppercase tracking-wider text-white">
                Parte II: Política de Privacidad y Tratamiento de Datos Personales
              </h2>
            </div>

            {/* 1. Marco Legal Peruano */}
            <section className="space-y-3 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white">1. Marco Normativo Vigente</h3>
              <p>
                El tratamiento de datos personales en esta plataforma se rige conforme a la <strong>Ley N° 29733 (Ley de Protección de Datos Personales)</strong> y su <strong>Nuevo Reglamento aprobado mediante Decreto Supremo N° 016-2024-JUS</strong> (vigente desde marzo de 2025), garantizando los principios de legalidad, consentimiento previo, informado, expreso e inequívoco, finalidad, proporcionalidad y seguridad técnica.
              </p>
            </section>

            {/* 2. Banco de Datos Personales */}
            <section className="space-y-3 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white">2. Banco de Datos Personales y Registro ANPDP</h3>
              <p>
                Los datos personales recopilados a través del sitio web, chats o formularios se incorporan en el banco de datos denominado <strong>&ldquo;Clientes y Contactos Comerciales DEFENSA TI&rdquo;</strong>, de titularidad de <strong>Karol Martin Castillo Rojas</strong> (RUC 10704877850).
              </p>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 space-y-2">
                <p>
                  <strong>Estado Registral ante la Autoridad:</strong> En cumplimiento de la Ley N° 29733 y del Reglamento aprobado por el <strong>Decreto Supremo N° 016-2024-JUS</strong>, el titular ha formulado el trámite de inscripción ante el Registro Nacional de Protección de Datos Personales (RNPDP) de la Autoridad Nacional de Protección de Datos Personales (ANPDP) del Ministerio de Justicia y Derechos Humanos (MINJUS), encontrándose dicho registro en proceso administrativo formal de asignación de código definitivo.
                </p>
                <p>
                  <strong>Finalidad Exclusiva:</strong> Los datos se tratan estrictamente para: (i) emisión de informes perimetrales y cotizaciones solicitadas; (ii) prestación de servicios de remediación de software y blindaje WAF; (iii) emisión y remisión de comprobantes de pago electrónicos oficiales (Factura o Boleta de Venta electrónica con RUC conforme a SUNAT); y (iv) atención de consultas posventa y soporte técnico.
                </p>
                <p>
                  <strong>Medidas de Seguridad Aplicadas:</strong> Conforme a la Directiva de Seguridad de la ANPDP, se aplican medidas organizativas y técnicas de nivel medio/alto: cifrado de comunicaciones en tránsito mediante protocolo TLS 1.3, servidores con cortafuegos perimetral, política de acceso restringido bajo necesidad de servicio y exclusión estricta de captura o almacenamiento de credenciales administrativas o contraseñas bancarias de clientes.
                </p>
              </div>
            </section>

            {/* 3. Datos que Recopilamos y Datos Técnicos */}
            <section className="space-y-3 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400" />
                <span>3. Datos Recopilados y Plazos Específicos de Conservación</span>
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-neutral-300">
                <li>
                  <strong>Datos de Contacto y Cotización (Nombre, teléfono, correo):</strong> Se conservan durante el tiempo necesario para la relación comercial y hasta por un plazo máximo de <strong>2 años</strong> tras el último contacto, salvo solicitud de supresión anticipada.
                </li>
                <li>
                  <strong>Dirección IP y Registro de Escaneos Públicos:</strong> Registrados para control de abuso y limitación de tasa (rate limiting). Los resultados de escáner se almacenan en memoria caché por un máximo de <strong>24 horas</strong> y luego son depurados.
                </li>
                <li>
                  <strong>Datos Tributarios y de Facturación (DNI/RUC, Razón Social, Dirección):</strong> Se conservan durante <strong>cinco (5) años</strong> en estricto cumplimiento del Código Tributario y obligaciones ante SUNAT.
                </li>
                <li>
                  <strong>Registros del Libro de Reclamaciones:</strong> Se conservan durante <strong>dos (2) años</strong> conforme a la directiva de INDECOPI para fiscalización.
                </li>
              </ul>
            </section>

            {/* 4. Terceros Encargados y Flujo Transfronterizo */}
            <section className="space-y-3 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>4. Terceros Encargados del Tratamiento y Transferencia Transfronteriza</span>
              </h3>
              <p>
                DEFENSA TI no comercializa, cede ni vende datos personales bajo ninguna circunstancia. Para la operatividad técnica de la plataforma, el escaneo perimetral determinista y la entrega de servicios, determinados datos técnicos (direcciones IP, nombres de dominio y registros de conexión) son procesados por proveedores tecnológicos especializados, configurando un <strong>flujo transfronterizo de datos</strong> conforme a la arquitectura real del sistema:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <strong className="text-white block">Cloudflare Inc. (EE. UU.)</strong>
                  <span className="text-neutral-400">Proxy inverso, cortafuegos perimetral (WAF), mitigación DDoS y cifrado de transporte TLS 1.3 para el tráfico de la web.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <strong className="text-white block">DigitalOcean LLC (EE. UU.)</strong>
                  <span className="text-neutral-400">Servidor en la nube (Droplet VPS con certificación SOC 2 / ISO 27001) para la ejecución del motor de auditoría perimetral y base de datos local en Lima.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <strong className="text-white block">Meta Platforms Inc. / WhatsApp LLC (EE. UU.)</strong>
                  <span className="text-neutral-400">Canal cifrado de extremo a extremo para mensajería directa, coordinación de soporte técnico y envío de dictámenes al número oficial +51 987 010 380.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <strong className="text-white block">Google LLC (EE. UU.)</strong>
                  <span className="text-neutral-400">Servicios de telemetría y analítica web (Google Analytics 4 / Google Search Console) bajo Cláusulas Contractuales Tipo (SCC).</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <strong className="text-white block">Culqi / Compañía Incubadora (Perú - Tratamiento Nacional)</strong>
                  <span className="text-neutral-400">Pasarela regulada en el Perú (PCI-DSS Nivel 1) para pagos con tarjeta. No constituye flujo transfronterizo al procesarse en territorio peruano.</span>
                </div>
              </div>
            </section>

            {/* 5. Privacidad en Modelos de Inteligencia Artificial */}
            <section className="space-y-3 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white">5. Política de Inteligencia Artificial</h3>
              <p>
                Los resúmenes y parches técnicos sugeridos se procesan mediante llamadas aisladas a modelos de lenguaje vía API empresarial. <strong>Ningún dato personal, credencial o información confidencial de clientes en Perú es utilizada para entrenar modelos públicos de inteligencia artificial.</strong>
              </p>
            </section>

            {/* 6. Derechos ARCO y Revocatoria */}
            <section className="space-y-3 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span>6. Ejercicio de Derechos ARCO y Revocatoria del Consentimiento</span>
              </h3>
              <p>
                El titular de los datos personales puede ejercer en cualquier momento sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong>, así como el derecho de revocar el consentimiento previamente otorgado, sin costo alguno:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-300">
                <li>
                  Enviando una solicitud al correo oficial: <strong>contacto@neuronalgravity.com</strong> indicando en el asunto &ldquo;Ejercicio de Derechos ARCO&rdquo; y adjuntando copia simple de su DNI/RUC.
                </li>
                <li>
                  <strong>Plazos de Respuesta según D.S. 016-2024-JUS:</strong> Acceso (20 días hábiles); Rectificación, Cancelación u Oposición (10 días hábiles).
                </li>
                <li>
                  <strong>Tutela ante la Autoridad:</strong> En caso de denegatoria o disconformidad con la respuesta, el titular tiene expedito su derecho a recurrir en reclamación ante la Dirección de Protección de Datos Personales del MINJUS en Lima, Perú.
                </li>
              </ul>
            </section>

            {/* 7. Política sobre Menores de Edad */}
            <section className="space-y-3 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white">7. Usuarios Mayores de Edad</h3>
              <p>
                Los servicios de auditoría y ciberseguridad están diseñados estrictamente para empresas, negocios y mayores de 18 años con capacidad legal para contratar según el Código Civil Peruano. No recopilamos conscientemente datos de menores de edad.
              </p>
            </section>
          </div>
        )}

        {/* Pie de Página Unificado */}
        <div className="pt-8 border-t border-white/10 text-center space-y-3 text-xs text-neutral-400">
          <p>
            &copy; 2026 DEFENSA TI &bull; Neuronal Gravity &bull; RUC 10704877850 &bull; Karol Martin Castillo Rojas.
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>&bull;</span>
            <Link href="/defensati" className="hover:text-white transition-colors text-[#38bdf8]">DEFENSA TI</Link>
            <span>&bull;</span>
            <Link href="/reclamaciones" className="hover:text-amber-300 transition-colors">Libro de Reclamaciones</Link>
          </div>
        </div>

      </main>
    </div>
  );
}
