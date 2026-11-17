'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Send, 
  Clock, 
  FileCheck, 
  AlertTriangle, 
  Lock, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  Receipt,
  User,
  Layers
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';
import { trackFormSubmit, trackWhatsAppClick } from '@/lib/analytics';

interface Props {
  initialUrl?: string;
}

export default function DefensatiQuickContact({ initialUrl = '' }: Props) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [ruc, setRuc] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetUrl, setTargetUrl] = useState(initialUrl);
  const [platform, setPlatform] = useState('wordpress');
  const [service, setService] = useState('diagnostico');
  const [note, setNote] = useState('');
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contractId, setContractId] = useState('');

  const platformsList = [
    { id: 'wordpress', label: 'WordPress / WooCommerce' },
    { id: 'shopify', label: 'Shopify' },
    { id: 'wix', label: 'Wix' },
    { id: 'prestashop', label: 'PrestaShop / Magento' },
    { id: 'custom', label: 'Desarrollo a medida / HTML / Otro' },
  ];

  const servicesList = [
    { id: 'diagnostico', label: '1. Diagnóstico preliminar gratuito (S/ 0 • Entrega < 2h)' },
    { id: 'rescate-corp', label: '2. Rescate / Limpieza de malware - Sitio Corporativo (S/ 380 • 24-48h con garantía)' },
    { id: 'rescate-woocommerce', label: '3. Rescate / Limpieza de malware - WooCommerce / Tienda Online (S/ 550 • 24-48h con garantía)' },
    { id: 'blindaje-waf', label: '4. Blindaje + WAF Cloudflare - Paquete Unificado (S/ 450 • 3 a 5 días hábiles)' },
    { id: 'mantenimiento-basico', label: '5. Mantenimiento Básico - Sitios Corporativos (S/ 90 PEN / mes • Vigilancia 24/7)' },
    { id: 'mantenimiento-tiendas', label: '6. Mantenimiento Tiendas Online con Soporte Prioritario (S/ 180 PEN / mes • 24/7)' },
  ];

  const isFormValid = Boolean(
    name.trim() &&
    email.trim() &&
    phone.trim() &&
    targetUrl.trim() &&
    acceptedDisclaimer &&
    acceptedTerms
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    setLoading(true);

    const cleanUrl = targetUrl.trim() || 'mi sitio web';
    const clientName = name.trim();
    const cleanCompany = company.trim();
    const cleanRuc = ruc.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const selectedService = servicesList.find((s) => s.id === service) || servicesList[0];
    const selectedPlatform = platformsList.find((p) => p.id === platform) || platformsList[0];
    const generatedId = `DFT-${Date.now().toString().slice(-6)}`;
    setContractId(generatedId);

    // 1. Guardar lead y confirmación legal en almacenamiento del servidor
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName,
          company: cleanCompany || 'Persona Natural',
          taxId: cleanRuc,
          email: cleanEmail,
          phone: cleanPhone,
          targetUrl: cleanUrl,
          platform: selectedPlatform.label,
          service: selectedService.label,
          details: note.trim() || 'Solicitud generada desde formulario oficial de contratación',
          acceptedTerms: true,
          acceptedDisclaimer: true,
        }),
      });
    } catch (err) {
      console.error('Error guardando solicitud de contratación:', err);
    }

    trackFormSubmit({
      formId: 'defensati_contract_form',
      formName: 'DEFENSA TI Formulario de Contratación',
      domain: cleanUrl,
      serviceRequested: service,
    });
    trackWhatsAppClick({
      service: `contratacion_${service}`,
      placement: 'contract_form_submit',
      domain: cleanUrl,
    });

    // 2. Construir mensaje oficial estructurado para WhatsApp
    const waMessage = 
`📋 *SOLICITUD FORMAL DE SERVICIO — DEFENSA TI*
━━━━━━━━━━━━━━━━━━━━━━━━━━
• *N° Solicitud:* ${generatedId}
• *Contacto:* ${clientName}
• *Empresa / Razón Social:* ${cleanCompany || 'Persona Natural con Negocio'}
• *RUC / DNI:* ${cleanRuc || 'Por confirmar'}
• *Web a intervenir:* ${cleanUrl}
• *Plataforma:* ${selectedPlatform.label}
• *Correo para informe / factura:* ${cleanEmail}
• *Teléfono / WhatsApp:* ${cleanPhone}
• *Servicio solicitado:* ${selectedService.label}
${note.trim() ? `• *Situación actual:* ${note.trim()}\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ *Declaraciones y Conformidad Legal:*
✓ Titularidad / Autorización acreditada (Ley N° 30096)
✓ Modelo de Responsabilidad Compartida aceptado
✓ Términos del Servicio y Privacidad aceptados (Ley N° 29733)
✓ Requiere comprobante formal con RUC (SUNAT)
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hola Martín, he completado la solicitud formal en la web. ¿Cuáles son los pasos para dar inicio a la revisión técnica?`;

    const waUrl = getWhatsAppUrl(waMessage);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="contratar" className="w-full max-w-4xl mx-auto scroll-mt-24 text-left">
      <div id="contacto-rapido" className="pointer-events-none" />

      <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[36px] bg-[#161618]/75 border border-white/10 backdrop-blur-3xl shadow-[0_30px_70px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] space-y-6">
        
        {/* Cabecera Estilo Apple Pro */}
        <div className="space-y-2 border-b border-white/10 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/12 text-[#2997ff] text-xs font-semibold">
              <FileCheck className="w-3.5 h-3.5" />
              <span>SOLICITA TU SERVICIO</span>
            </span>
            <span className="text-xs text-[#86868b] flex items-center gap-1.5 font-mono">
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              Factura / Boleta con RUC {siteConfig.business.ruc}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-[#f5f5f7] tracking-[-0.03em] leading-snug pt-1">
            Solicita tu servicio en un minuto
          </h3>
          <p className="text-sm sm:text-base text-[#86868b] font-normal leading-relaxed">
            Déjanos tus datos y seguimos por WhatsApp. No pagas nada hasta acordar el servicio.
          </p>
        </div>

        {submitted ? (
          /* Estado de Éxito y Resumen Formal */
          <div className="p-6 sm:p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-white">
                  ¡Solicitud {contractId} Registrada con Éxito!
                </h4>
                <p className="text-xs sm:text-sm text-neutral-300">
                  Hemos guardado tu requerimiento en el sistema con validez legal e informado a nuestro equipo técnico.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-xs text-neutral-300 font-mono">
              <p>• <strong>Solicitante:</strong> {name} {company ? `(${company})` : ''}</p>
              <p>• <strong>RUC / DNI:</strong> {ruc.trim() || 'Por confirmar'}</p>
              <p>• <strong>Web a intervenir:</strong> {targetUrl}</p>
              <p>• <strong>Correo:</strong> {email} &bull; <strong>Teléfono:</strong> {phone}</p>
              <p>• <strong>Servicio:</strong> {servicesList.find((s) => s.id === service)?.label}</p>
              <p className="text-emerald-400 pt-1">✓ Declaración Ley 30096, Términos y Privacidad aceptados formalmente.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={getWhatsAppUrl(`Hola Martín, acabo de enviar la solicitud formal de servicio código ${contractId} desde la web para ${targetUrl}. Deseo confirmar la recepción.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current" />
                <span>Continuar por WhatsApp (+51 987 010 380)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setAcceptedDisclaimer(false);
                  setAcceptedTerms(false);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold transition-all border border-white/10"
              >
                Ingresar otra solicitud
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Fila 1: Nombre y Empresa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="contract-name" className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Nombre completo o contacto responsable <span className="text-rose-400">*</span></span>
                </label>
                <input
                  id="contract-name"
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] transition-all text-sm font-normal"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contract-email" className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Correo para informe técnico y factura <span className="text-rose-400">*</span></span>
                </label>
                <input
                  id="contract-email"
                  type="email"
                  required
                  placeholder="contacto@tuempresa.pe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] transition-all text-sm font-normal"
                />
              </div>

              
            </div>

            {/* Fila 2: RUC/DNI y Correo Electrónico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              

              
            </div>

            {/* Fila 3: Teléfono y Dirección Web */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="contract-phone" className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Teléfono / WhatsApp oficial del titular <span className="text-rose-400">*</span></span>
                </label>
                <input
                  id="contract-phone"
                  type="tel"
                  required
                  placeholder="Ej. +51 987 654 321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] transition-all text-sm font-normal"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contract-url" className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Dirección web a auditar o blindar <span className="text-rose-400">*</span></span>
                </label>
                <input
                  id="contract-url"
                  type="text"
                  required
                  placeholder="https://tudominio.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] transition-all text-sm font-normal"
                />
              </div>
            </div>

            {/* Fila 4: Plataforma Web y Selector de Servicio Oficial */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              

              <div className="space-y-1.5">
                <label htmlFor="contract-service" className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Servicio oficial a solicitar <span className="text-rose-400">*</span></span>
                </label>
                <select
                  id="contract-service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#141416] border border-white/10 text-white focus:outline-none focus:border-[#0071e3] transition-all text-sm cursor-pointer"
                >
                  {servicesList.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#141416] text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 5: Detalles o Síntomas */}
            

            {/* Datos opcionales, plegados para que el formulario sea corto */}
            <details className="rounded-2xl bg-white/[0.03] border border-white/10 group">
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-[#f5f5f7] flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden">
                <span>Datos opcionales: factura, plataforma y detalles</span>
                <span className="text-[#38bdf8] text-xs font-medium group-open:hidden">Agregar</span>
                <span className="text-[#38bdf8] text-xs font-medium hidden group-open:inline">Ocultar</span>
              </summary>
              <div className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                <label htmlFor="contract-company" className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Empresa o Razón Social (Opcional)</span>
                </label>
                <input
                  id="contract-company"
                  type="text"
                  placeholder="Ej. Distribuidora Lima S.A.C."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] transition-all text-sm font-normal"
                />
              </div>
                  <div className="space-y-1.5">
                <label htmlFor="contract-ruc" className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  <span>RUC o DNI para Factura / Boleta <span className="text-neutral-500">(opcional, puedes darlo después)</span></span>
                </label>
                <input
                  id="contract-ruc"
                  type="text"
                  placeholder="Ej. 20601234567 o 45678912"
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] transition-all text-sm font-normal"
                />
              </div>
                </div>
                <div className="space-y-1.5">
                <label htmlFor="contract-platform" className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Plataforma de tu web</span>
                </label>
                <select
                  id="contract-platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#141416] border border-white/10 text-white focus:outline-none focus:border-[#0071e3] transition-all text-sm cursor-pointer"
                >
                  {platformsList.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#141416] text-white">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
                <div className="space-y-1.5">
              <label htmlFor="contract-note" className="text-xs font-medium text-neutral-300">
                Detalles de la situación técnica o síntomas (Opcional)
              </label>
              <textarea
                id="contract-note"
                rows={2}
                placeholder="Ej. El proveedor de hosting me bloqueó hoy, Google muestra pantalla roja, o es una web limpia que deseo blindar antes de lanzar campañas."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] transition-all text-sm font-normal resize-none"
              />
            </div>
              </div>
            </details>

            {/* ============================================================== */}
            {/* CASILLAS LEGALES OBLIGATORIAS (Ley 30096 + Ley 29733)           */}
            {/* ============================================================== */}
            <div className="pt-2 space-y-3">
              
              {/* Checkbox 1: Autorización Legal y No Responsabilidad (Ley 30096) */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={acceptedDisclaimer}
                  onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-[#0071e3] bg-black/60 border-white/30 focus:ring-0 focus:ring-offset-0 shrink-0 cursor-pointer"
                />
                <span className="text-xs text-neutral-300 leading-relaxed font-normal">
                  <strong className="text-white font-semibold">Declaración Bajo Juramento (Ley N° 30096) y Responsabilidad Compartida:</strong> Declaro bajo juramento que soy el titular del dominio consignado o cuento con autorización expresa y por escrito para solicitar este servicio de auditoría, remediación o blindaje. Acepto el <strong>Modelo de Responsabilidad Compartida</strong> del hosting y desligo a DEFENSA TI de responsabilidades por contraseñas débiles, plugins de terceros o alteraciones posteriores ajenas a la intervención contratada.
                </span>
              </label>

              {/* Checkbox 2: Términos del Servicio y Política de Privacidad (Ley 29733) */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-[#0071e3] bg-black/60 border-white/30 focus:ring-0 focus:ring-offset-0 shrink-0 cursor-pointer"
                />
                <span className="text-xs text-neutral-300 leading-relaxed font-normal">
                  <strong className="text-white font-semibold">Términos del Servicio y Privacidad:</strong> He leído y acepto los <Link href="/terminos" target="_blank" className="text-[#38bdf8] underline font-semibold hover:text-white">Términos del Servicio</Link> (plazos técnicos de 24-48h a 7 días hábiles, alcances y garantía por escrito de 30 días) y la <Link href="/terminos" target="_blank" className="text-[#38bdf8] underline font-semibold hover:text-white">Política de Privacidad</Link> conforme a la Ley N° 29733 y D.S. 016-2024-JUS.
                </span>
              </label>

            </div>

            {/* Aviso visual si falta marcar las casillas */}
            {(!acceptedDisclaimer || !acceptedTerms) && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Marca ambas casillas legales obligatorias para habilitar el botón de solicitud.</span>
              </div>
            )}

            {/* Botón de Envío Directo y Coordinación Apple Pill */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full py-4 px-6 rounded-full font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_24px_rgba(37,211,102,0.35)] ${
                  isFormValid && !loading
                    ? 'bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black cursor-pointer'
                    : 'bg-white/10 text-neutral-500 cursor-not-allowed border border-white/10 shadow-none'
                }`}
              >
                <WhatsAppIcon className="w-5 h-5 fill-current shrink-0" />
                <span>
                  {loading 
                    ? 'Procesando solicitud formal...' 
                    : 'Enviar solicitud y seguir por WhatsApp'}
                </span>
              </button>
            </div>

            {/* Micro-garantías de Confianza Legal */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Factura o Boleta Electrónica con RUC
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Garantía formal por escrito de 30 días
              </span>
              <span className="flex items-center gap-1.5 text-neutral-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0" />
                Yo mismo reviso tu web (sin intermediarios)
              </span>
            </div>

            {/* Horario de Atención Técnica */}
            <div className="pt-2 text-center text-xs text-neutral-400 border-t border-white/5 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              <span>Horario de atención técnica: <strong>Lunes a Sábado de 9:00 a 20:00 (Hora Perú)</strong>. Solicitudes fuera de horario se gestionan a primera hora de la mañana hábil siguiente.</span>
            </div>

          </form>
        )}

      </div>
    </section>
  );
}
