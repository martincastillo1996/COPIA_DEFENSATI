'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';
import { trackFormSubmit, trackWhatsAppClick } from '@/lib/analytics';
import { P } from '@/config/catalog';

interface Props {
  initialUrl?: string;
}

const PLATFORMS = [
  { id: 'wordpress', label: 'WordPress / WooCommerce' },
  { id: 'shopify', label: 'Shopify' },
  { id: 'wix', label: 'Wix' },
  { id: 'prestashop', label: 'PrestaShop / Magento' },
  { id: 'custom', label: 'A medida / otro' },
];

const SERVICES = [
  { id: 'diagnostico', label: 'Diagnóstico gratuito', price: 'S/ 0' },
  { id: 'rescate-corp', label: 'Rescate de malware · web', price: P.rescateCorporativo },
  { id: 'rescate-woocommerce', label: 'Rescate de malware · tienda', price: P.rescateTienda },
  { id: 'blindaje-waf', label: 'Blindaje + WAF Cloudflare', price: P.blindajeWaf },
  { id: 'mantenimiento-basico', label: 'Mantenimiento · web', price: `${P.mantenimientoBasico}/mes` },
  { id: 'mantenimiento-tiendas', label: 'Mantenimiento · tienda', price: `${P.mantenimientoTiendas}/mes` },
];

const field =
  'w-full px-3.5 py-3 bg-[#0a0c0f]/80 border border-white/10 text-[#e8edf1] placeholder-[#4a535b] text-sm focus:outline-none focus:border-[#cfe3ee]/60 transition-colors';

export default function DefensatiQuickContact({ initialUrl = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetUrl, setTargetUrl] = useState(initialUrl);
  const [service, setService] = useState('diagnostico');
  const [company, setCompany] = useState('');
  const [ruc, setRuc] = useState('');
  const [platform, setPlatform] = useState('wordpress');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contractId, setContractId] = useState('');

  const isFormValid = Boolean(name.trim() && email.trim() && phone.trim() && targetUrl.trim() && consent);
  const selected = SERVICES.find((s) => s.id === service) || SERVICES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    setLoading(true);

    const cleanUrl = targetUrl.trim();
    const serviceLabel = `${selected.label} (${selected.price})`;
    const platformLabel = (PLATFORMS.find((p) => p.id === platform) || PLATFORMS[0]).label;
    const generatedId = `DFT-${Date.now().toString().slice(-6)}`;
    setContractId(generatedId);

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim() || 'Persona Natural',
          taxId: ruc.trim(),
          email: email.trim(),
          phone: phone.trim(),
          targetUrl: cleanUrl,
          platform: platformLabel,
          service: serviceLabel,
          details: note.trim() || 'Solicitud generada desde el formulario de DEFENSA TI',
          acceptedTerms: consent,
          acceptedDisclaimer: consent,
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
    trackWhatsAppClick({ service: `contratacion_${service}`, placement: 'contract_form_submit', domain: cleanUrl });

    const waMessage = `📋 *SOLICITUD DE SERVICIO — DEFENSA TI*
• *N°:* ${generatedId}
• *Contacto:* ${name.trim()}${company.trim() ? ` (${company.trim()})` : ''}
• *RUC / DNI:* ${ruc.trim() || 'Por confirmar'}
• *Web:* ${cleanUrl}
• *Plataforma:* ${platformLabel}
• *Correo:* ${email.trim()}
• *WhatsApp:* ${phone.trim()}
• *Servicio:* ${serviceLabel}
${note.trim() ? `• *Situación:* ${note.trim()}\n` : ''}✓ Titularidad o autorización declarada (Ley N° 30096)
✓ Términos y Privacidad aceptados (Ley N° 29733)

Hola Martín, acabo de enviar la solicitud desde la web. ¿Cuáles son los siguientes pasos?`;

    window.open(getWhatsAppUrl(waMessage), '_blank', 'noopener,noreferrer');
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="contratar" className="w-full max-w-3xl scroll-mt-24 text-left lg:ml-[25%]">
      <div id="contacto-rapido" className="pointer-events-none" />

      <div className={`border backdrop-blur-sm transition-colors duration-200 ${open ? 'border-[#cfe3ee]/40 bg-[#0a0c0f]/90' : 'border-white/10 bg-[#0a0c0f]/60 hover:border-[#cfe3ee]/40'}`}>
        {/* Cabecera: abre o cierra el formulario */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="form-contratar"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 py-5 text-left cursor-pointer group"
        >
          <span>
            <span className="hud-label block">Solicitar servicio · 1 minuto</span>
            <span className="mt-1.5 block text-xl sm:text-2xl font-light tracking-tight text-[#e8edf1]">
              ¿Prefieres que te escribamos?
            </span>
          </span>
          <span
            aria-hidden
            className={`w-9 h-9 shrink-0 grid place-items-center border font-mono text-lg transition-all duration-200 ${
              open ? 'border-[#cfe3ee] text-[#0a0c0f] bg-[#cfe3ee] rotate-45' : 'border-white/15 text-[#cfe3ee] group-hover:border-[#cfe3ee]'
            }`}
          >
            +
          </span>
        </button>

        <div
          id="form-contratar"
          className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ gridTemplateRows: open ? 'minmax(0, 1fr)' : 'minmax(0, 0fr)' }}
        >
          <div className="overflow-hidden">
            <div className="px-4 sm:px-6 pb-6 border-t ed-line pt-5">
              {submitted ? (
                <div className="space-y-4">
                  <p className="flex items-center gap-2 text-lg font-light text-[#e8edf1]">
                    <CheckCircle2 className="w-5 h-5 text-[#cfe3ee]" /> Solicitud {contractId} enviada
                  </p>
                  <p className="text-sm text-[#9aa6af]">Te responderemos por WhatsApp. No pagas nada hasta acordar el servicio.</p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={getWhatsAppUrl(`Hola Martín, envié la solicitud ${contractId} para ${targetUrl}. Deseo confirmar la recepción.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hud-btn hud-btn-solid"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-current" /> Abrir WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setConsent(false);
                      }}
                      className="hud-btn"
                    >
                      Otra solicitud
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Servicio: chips con precio */}
                  <fieldset>
                    <legend className="hud-label mb-2">Servicio</legend>
                    <div className="flex flex-wrap gap-2">
                      {SERVICES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          aria-pressed={service === s.id}
                          onClick={() => setService(s.id)}
                          className={`px-3 py-2 border text-xs transition-colors duration-75 cursor-pointer ${
                            service === s.id
                              ? 'bg-[#e8edf1] text-[#0a0c0f] border-[#e8edf1]'
                              : 'border-white/10 text-[#9aa6af] hover:border-[#cfe3ee]/60 hover:text-[#e8edf1]'
                          }`}
                        >
                          {s.label} <span className="font-mono opacity-70">· {s.price}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="hud-label block">Nombre</span>
                      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Carlos Mendoza" autoComplete="name" className={field} />
                    </label>
                    <label className="space-y-1">
                      <span className="hud-label block">WhatsApp</span>
                      <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+51 987 654 321" autoComplete="tel" className={field} />
                    </label>
                    <label className="space-y-1">
                      <span className="hud-label block">Correo</span>
                      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.pe" autoComplete="email" className={field} />
                    </label>
                    <label className="space-y-1">
                      <span className="hud-label block">Tu web</span>
                      <input required inputMode="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://tudominio.com" className={field} />
                    </label>
                  </div>

                  {/* Datos opcionales plegados */}
                  <div className="border-t ed-line">
                    <button
                      type="button"
                      aria-expanded={showMore}
                      onClick={() => setShowMore((v) => !v)}
                      className="w-full flex items-center justify-between py-3 text-left cursor-pointer group"
                    >
                      <span className="hud-label group-hover:!text-[#e8edf1]">Opcional: factura, plataforma y detalles</span>
                      <span className={`font-mono text-[#cfe3ee] transition-transform duration-200 ${showMore ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    <div className={`grid transition-all duration-300 ${showMore ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                      style={{ gridTemplateRows: showMore ? 'minmax(0, 1fr)' : 'minmax(0, 0fr)' }}>
                      <div className="overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3">
                          <label className="space-y-1">
                            <span className="hud-label block">Empresa</span>
                            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Distribuidora Lima S.A.C." className={field} />
                          </label>
                          <label className="space-y-1">
                            <span className="hud-label block">RUC o DNI</span>
                            <input value={ruc} onChange={(e) => setRuc(e.target.value)} placeholder="20601234567" className={field} />
                          </label>
                          <label className="space-y-1 sm:col-span-2">
                            <span className="hud-label block">Plataforma</span>
                            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={`${field} cursor-pointer`}>
                              {PLATFORMS.map((p) => (
                                <option key={p.id} value={p.id} className="bg-[#0a0c0f]">
                                  {p.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-1 sm:col-span-2">
                            <span className="hud-label block">¿Qué está pasando?</span>
                            <textarea
                              rows={2}
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="Ej. el hosting bloqueó mi web, Google muestra pantalla roja…"
                              className={`${field} resize-none`}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Un solo consentimiento legal */}
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#cfe3ee] shrink-0 cursor-pointer"
                    />
                    <span className="text-xs text-[#9aa6af] leading-relaxed">
                      Declaro que la web es mía o tengo autorización (Ley N° 30096) y acepto los{' '}
                      <Link href="/terminos" target="_blank" className="text-[#e8edf1] underline hover:text-white">
                        Términos y la Política de Privacidad
                      </Link>{' '}
                      (Ley N° 29733).
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <span className="hud-label">Factura o boleta · RUC {siteConfig.business.ruc}</span>
                    <button type="submit" disabled={!isFormValid || loading} className="hud-btn hud-btn-solid group/btn">
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                      <span>{loading ? 'Enviando…' : 'Enviar por WhatsApp'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
