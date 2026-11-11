/**
 * Sistema de Analítica y Medición de Conversiones para DEFENSA TI
 * Compatible al 100% con Google Analytics 4 (GA4) y Google Tag Manager (dataLayer).
 * No inventa identificadores de medición falsos. Utiliza window.dataLayer y window.gtag de forma segura.
 */

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
  }
}

/**
 * Despachador universal de eventos analíticos
 */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;

  const eventPayload = {
    ...params,
    event_timestamp: new Date().toISOString(),
    page_location: window.location.href,
    page_path: window.location.pathname,
  };

  // 1. Google Tag Manager / dataLayer push
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventPayload,
  });

  // 2. Google Analytics 4 gtag call
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, eventPayload);
    } catch {
      // Ignorar error si gtag no está inicializado
    }
  }

  // 3. Log de desarrollo para auditoría y verificación
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 [Analytics Event] ${eventName}:`, eventPayload);
  }
}

/**
 * Evento 1: Clic en WhatsApp
 */
export function trackWhatsAppClick(params: {
  service?: string;
  placement: string;
  domain?: string;
}) {
  trackEvent('whatsapp_click', {
    service_selected: params.service || 'general',
    cta_placement: params.placement,
    target_domain: params.domain || '',
    conversion_type: 'lead_inquiry',
  });
}

/**
 * Evento 2: Inicio del Escáner
 */
export function trackScanStart(domain: string) {
  trackEvent('scan_start', {
    target_domain: domain,
    scan_type: 'passive_perimetral',
  });
}

/**
 * Evento 3: Finalización del Escáner
 */
export function trackScanComplete(params: {
  domain: string;
  score: number;
  grade: string;
  durationMs?: number;
}) {
  trackEvent('scan_complete', {
    target_domain: params.domain,
    security_score: params.score,
    security_grade: params.grade,
    duration_ms: params.durationMs || 0,
    has_critical_issues: params.score < 60,
  });
}

/**
 * Evento 4: Solicitud de Diagnóstico
 */
export function trackDiagnosticRequest(params: {
  source: string;
  domain?: string;
  clientName?: string;
}) {
  trackEvent('diagnostic_request', {
    source_location: params.source,
    target_domain: params.domain || '',
    has_client_name: Boolean(params.clientName),
  });
}

/**
 * Evento 5: Clic en Servicios
 */
export function trackServiceClick(params: {
  serviceName: string;
  pricePen: number;
  serviceId: string;
}) {
  trackEvent('service_click', {
    service_name: params.serviceName,
    service_id: params.serviceId,
    price_pen: params.pricePen,
    currency: 'PEN',
  });
}

/**
 * Evento 6: Selección de Planes Mensuales
 */
export function trackPlanSelect(params: {
  planName: string;
  priceMonthlyPen: number;
  planId: string;
}) {
  trackEvent('plan_select', {
    plan_name: params.planName,
    plan_id: params.planId,
    price_monthly_pen: params.priceMonthlyPen,
    billing_type: 'monthly_prepaid',
    currency: 'PEN',
  });
}

/**
 * Evento 7: Envío de Formularios
 */
export function trackFormSubmit(params: {
  formId: string;
  formName: string;
  domain?: string;
  serviceRequested?: string;
}) {
  trackEvent('form_submit', {
    form_id: params.formId,
    form_name: params.formName,
    target_domain: params.domain || '',
    service_requested: params.serviceRequested || '',
  });
}
