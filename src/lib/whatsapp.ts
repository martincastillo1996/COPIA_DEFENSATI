import { siteConfig } from '@/config/site';

/**
 * Genera el enlace directo a WhatsApp oficial (+51 987 010 380) con mensaje claro,
 * sin etiquetas raras y 100% contextual para el cliente.
 */
export function getWhatsAppUrl(message: string): string {
  const number = (siteConfig.contact.whatsappNumber || '51987010380').replace(/[^0-9]/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message.trim())}`;
}

/**
 * Mensajes comerciales aprobados y contextuales para DEFENSA TI.
 */
export const DEFENSATI_WHATSAPP_MESSAGES = {
  // Hero: Consulta general
  hero: (domain = '') => {
    const text = domain 
      ? `Hola Martín, vi tu página de DEFENSA TI. Tengo mi web (${domain}) y quisiera solicitar un diagnóstico gratuito preliminar.`
      : 'Hola Martín, vi tu página de DEFENSA TI. Quisiera solicitar un diagnóstico gratuito preliminar para mi página web.';
    return getWhatsAppUrl(text);
  },

  // CTA Principal: Diagnóstico gratuito
  diagnosticoGratis: (domain = '') => {
    const text = domain
      ? `Hola Martín, quiero solicitar el diagnóstico gratuito para mi web (${domain}). ¿Podrías revisarla para ver qué vulnerabilidades tiene?`
      : 'Hola Martín, quiero solicitar el diagnóstico gratuito para mi página web. ¿Podrías revisarla para ver qué vulnerabilidades tiene?';
    return getWhatsAppUrl(text);
  },

  // Video-Diagnóstico personalizado en 2 minutos (Loom / WhatsApp)
  videoDiagnostico: (domain = '', score?: number, grade?: string) => {
    const scoreStr = typeof score === 'number' ? ` y obtuvo nota ${score}/100 (Grado ${grade || 'F'})` : '';
    const text = domain
      ? `Hola Martín, acabo de escanear mi web (${domain})${scoreStr} en DEFENSA TI. No entiendo mucho de términos técnicos: ¿podrías grabarme un video corto de 2 minutos explicándome en simple qué fallas tiene y cómo corregirlas?`
      : 'Hola Martín, acabo de escanear mi web en DEFENSA TI. No entiendo mucho de tecnicismos: ¿podrías grabarme un video corto de 2 minutos explicándome qué fallas tiene y cómo corregirlas?';
    return getWhatsAppUrl(text);
  },

  // CTA Secundario: Desinfección y limpieza de páginas infectadas / Emergencia
  recuperacionHackeo: (domain = '') => {
    const text = domain
      ? `🚨 Hola Martín, ¡urgente! Mi página web (${domain}) tiene virus o sospecha de infección por malware/spam. Necesito ayuda técnica para desinfectarla y limpiarla cuanto antes.`
      : '🚨 Hola Martín, ¡urgente! Mi página web tiene virus o sospecha de infección por malware/spam. Necesito ayuda técnica para desinfectarla y limpiarla cuanto antes.';
    return getWhatsAppUrl(text);
  },

  // Problema 1: Pantalla roja de Google
  problemaGoogleRed: (domain = '') => {
    const text = domain
      ? `Hola Martín, mi sitio (${domain}) muestra la pantalla roja de advertencia en Google ("sitio engañoso"). Necesito desinfectarlo y solicitar la reconsideración a Google.`
      : 'Hola Martín, mi página web muestra la pantalla roja de advertencia en Google ("sitio engañoso"). Necesito desinfectarla y solicitar la reconsideración a Google.';
    return getWhatsAppUrl(text);
  },

  // Problema 2: Redirecciones maliciosas o spam
  problemaRedirecciones: (domain = '') => {
    const text = domain
      ? `Hola Martín, mi web (${domain}) está redirigiendo a páginas de apuestas o spam al hacer clic. Necesito eliminar el malware y limpiar la base de datos.`
      : 'Hola Martín, mi página web está redirigiendo a páginas de apuestas o spam al hacer clic. Necesito eliminar el malware y limpiar la base de datos.';
    return getWhatsAppUrl(text);
  },

  // Problema 3: Cuenta suspendida por hosting
  problemaHosting: (domain = '') => {
    const text = domain
      ? `Hola Martín, mi hosting suspendió mi web (${domain}) por sospecha de malware o alto consumo. Necesito limpiarla para que me levanten la suspensión.`
      : 'Hola Martín, mi proveedor de hosting suspendió mi web por sospecha de malware o alto consumo. Necesito limpiarla para que me levanten la suspensión.';
    return getWhatsAppUrl(text);
  },

  // Servicio 1: Rescate / Limpieza de malware (Sitio Corporativo: S/ 380)
  precioRescateCorporativo: (domain = '') => {
    const text = domain
      ? `Hola Martín, mi sitio corporativo (${domain}) tiene malware o redirecciones y necesito el Rescate / Limpieza de malware con garantía de 30 días (S/ 380).`
      : 'Hola Martín, mi sitio corporativo tiene malware o redirecciones y necesito el Rescate / Limpieza de malware con garantía de 30 días (S/ 380).';
    return getWhatsAppUrl(text);
  },

  // Servicio 2: Rescate / Limpieza de malware (WooCommerce / Tienda Online: S/ 550)
  precioRescateWooCommerce: (domain = '') => {
    const text = domain
      ? `Hola Martín, mi tienda online (${domain}) presenta infección o fallas de seguridad. Deseo contratar el Rescate de WooCommerce / Tienda Online con garantía (S/ 550).`
      : 'Hola Martín, mi tienda online presenta infección o fallas de seguridad. Deseo contratar el Rescate de WooCommerce / Tienda Online con garantía (S/ 550).';
    return getWhatsAppUrl(text);
  },

  // Servicio 3: Blindaje + WAF Cloudflare Unificado (S/ 450)
  precioBlindajeWaf: (domain = '') => {
    const text = domain
      ? `Hola Martín, me interesa contratar el paquete unificado de Blindaje + WAF Cloudflare (S/ 450) para blindar mi web (${domain}) contra ataques y bots.`
      : 'Hola Martín, me interesa contratar el paquete unificado de Blindaje + WAF Cloudflare (S/ 450) para blindar mi página web contra ataques y bots.';
    return getWhatsAppUrl(text);
  },

  // Planes Mensuales: Mantenimiento Básico (S/ 90/mes)
  precioMensualBasico: (domain = '') => {
    const text = domain
      ? `Hola Martín, deseo activar el Mantenimiento Básico de S/ 90/mes para mi web (${domain}) con chequeos 24/7 y alertas a WhatsApp.`
      : 'Hola Martín, deseo activar el Mantenimiento Básico de S/ 90/mes para mi web con chequeos 24/7 y alertas a WhatsApp.';
    return getWhatsAppUrl(text);
  },

  // Planes Mensuales: Mantenimiento Tiendas Online con Soporte Prioritario (S/ 180/mes)
  precioMensualTiendas: (domain = '') => {
    const text = domain
      ? `Hola Martín, quisiera suscribirme al Mantenimiento para Tiendas Online de S/ 180/mes para mi tienda (${domain}) con chequeos cada 5 min y soporte prioritario.`
      : 'Hola Martín, quisiera suscribirme al Mantenimiento para Tiendas Online de S/ 180/mes para mi tienda con chequeos cada 5 min y soporte prioritario.';
    return getWhatsAppUrl(text);
  },

  // Aliases de compatibilidad retroactiva
  precioLimpieza: (domain = '') => {
    const text = domain
      ? `Hola Martín, mi web (${domain}) presenta malware. Quisiera contratar el Rescate / Limpieza de malware (Corporativo S/ 380 | WooCommerce S/ 550).`
      : 'Hola Martín, mi web presenta malware. Quisiera contratar el Rescate / Limpieza de malware (Corporativo S/ 380 | WooCommerce S/ 550).';
    return getWhatsAppUrl(text);
  },

  precioBlindaje: (domain = '') => {
    const text = domain
      ? `Hola Martín, deseo blindar mi sitio web (${domain}) con el paquete unificado de Blindaje + WAF Cloudflare (S/ 450).`
      : 'Hola Martín, deseo blindar mi sitio web con el paquete unificado de Blindaje + WAF Cloudflare (S/ 450).';
    return getWhatsAppUrl(text);
  },

  precioPackCorp: (domain = '') => {
    return DEFENSATI_WHATSAPP_MESSAGES.precioRescateCorporativo(domain);
  },

  precioPackEcom: (domain = '') => {
    return DEFENSATI_WHATSAPP_MESSAGES.precioRescateWooCommerce(domain);
  },

  precioRescateEmergencia: (domain = '') => {
    return DEFENSATI_WHATSAPP_MESSAGES.precioRescateCorporativo(domain);
  },

  precioMensual: (domain = '') => {
    return DEFENSATI_WHATSAPP_MESSAGES.precioMensualBasico(domain);
  },

  precioMensualPro: (domain = '') => {
    return DEFENSATI_WHATSAPP_MESSAGES.precioMensualTiendas(domain);
  },

  // Escáner contextual con diagnóstico dinámico y enlace de dictamen
  escanerContextual: (params: {
    domain: string;
    score?: number;
    grade?: string;
    primaryIssue?: string;
    recommendation?: 'limpieza' | 'blindaje' | 'monitoreo' | 'optimo';
    reportUrl?: string;
  }) => {
    const { domain, score, grade, primaryIssue, recommendation, reportUrl } = params;
    const scoreStr = typeof score === 'number' ? `Nota ${score}/100 (Grado ${grade || 'F'})` : '';
    const linkStr = reportUrl ? ` Ver dictamen: ${reportUrl} -` : '';

    if (recommendation === 'monitoreo') {
      return getWhatsAppUrl(
        `Hola Martín, acabo de auditar mi web (${domain}) en DEFENSA TI.${linkStr} Obtuvo buena calificación (${scoreStr}), pero me interesa mantenerla protegida con el Plan de Monitoreo Mensual.`
      );
    }

    if (recommendation === 'limpieza') {
      return getWhatsAppUrl(
        `Hola Martín, acabo de auditar mi web (${domain}) en DEFENSA TI.${linkStr} Obtuvo ${scoreStr} con alerta crítica (${primaryIssue || 'riesgo de infección'}). Quisiera que me ayudes a desinfectarla y blindarla.`
      );
    }

    if (recommendation === 'optimo') {
      return getWhatsAppUrl(
        `Hola Martín, acabo de auditar mi web (${domain}) en DEFENSA TI.${linkStr} Obtuvo calificación máxima (${scoreStr}). Quisiera hacerte una consulta sobre soporte o ciberseguridad.`
      );
    }

    // Default blindaje
    const issueText = primaryIssue ? ` Se detectó: ${primaryIssue}.` : '';
    return getWhatsAppUrl(
      `Hola Martín, acabo de auditar mi web (${domain}) en DEFENSA TI y obtuvo ${scoreStr}.${issueText}${linkStr} Quisiera cotizar el blindaje perimetral para corregirlo.`
    );
  },

  // Escáner simple (compatibilidad retroactiva)
  escaner: (domain: string, score?: number, grade?: string) => {
    const scoreText = typeof score === 'number' ? ` (Nota: ${score}/100, Grado ${grade || 'F'})` : '';
    const text = `Hola Martín, acabo de escanear mi web ${domain ? `(${domain})` : ''}${scoreText} en DEFENSA TI y quiero que me ayuden a corregir las fallas encontradas.`;
    return getWhatsAppUrl(text);
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SERVICIOS COMPLEMENTARIOS & UPSELLS ESPECIALIZADOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 1. Blindaje de Correo & Anti-Spam (SPF, DKIM, DMARC) - S/ 190
  upsellCorreoSpam: (domain = '') => {
    const text = domain
      ? `Hola Martín, mis correos con dominio (${domain}) están cayendo en spam o temo suplantación de identidad. Deseo contratar el Blindaje de Correo & Anti-Spam (SPF, DKIM, DMARC) por S/ 190.`
      : 'Hola Martín, mis correos corporativos caen en spam o temo suplantación. Deseo contratar el Blindaje de Correo & Anti-Spam (SPF, DKIM, DMARC) por S/ 190.';
    return getWhatsAppUrl(text);
  },

  // 2. Migración Limpia y Segura de Hosting - S/ 290 (Corp) / S/ 450 (Ecom)
  upsellMigracionHosting: (domain = '', tipo: 'corp' | 'ecom' = 'corp') => {
    const precio = tipo === 'corp' ? 'S/ 290' : 'S/ 450';
    const tipoStr = tipo === 'corp' ? 'sitio web' : 'tienda online / e-commerce';
    const text = domain
      ? `Hola Martín, necesito migrar mi ${tipoStr} (${domain}) a un hosting/servidor más rápido y seguro sin caídas (${precio}). ¿Cómo coordinamos el respaldo y traslado?`
      : `Hola Martín, necesito migrar mi ${tipoStr} a un servidor más rápido y seguro sin caídas (${precio}). ¿Cómo coordinamos el respaldo y traslado?`;
    return getWhatsAppUrl(text);
  },

  // 3. Optimización de Velocidad Web (WPO) + Core Web Vitals - S/ 320 (Corp) / S/ 480 (Ecom)
  upsellVelocidadWpo: (domain = '', tipo: 'corp' | 'ecom' = 'corp') => {
    const precio = tipo === 'corp' ? 'S/ 320' : 'S/ 480';
    const tipoStr = tipo === 'corp' ? 'sitio web' : 'tienda e-commerce';
    const text = domain
      ? `Hola Martín, mi ${tipoStr} (${domain}) carga lenta en celulares y pierde visitas. Me interesa el servicio de Optimización de Velocidad Web (WPO) + Core Web Vitals (${precio}).`
      : `Hola Martín, mi ${tipoStr} carga lenta en celulares y pierde visitas. Me interesa el servicio de Optimización de Velocidad Web (WPO) + Core Web Vitals (${precio}).`;
    return getWhatsAppUrl(text);
  },

  // 4. Adecuación Legal Web (Ley N° 29733 - ANPDP Perú) - S/ 350 (Básico) / S/ 500 (Integral)
  upsellLegalAnpdp: (domain = '', tipo: 'basico' | 'integral' = 'basico') => {
    const precio = tipo === 'basico' ? 'S/ 350' : 'S/ 500';
    const tipoStr = tipo === 'basico' ? 'Plan Esencial (Banner cookies + Políticas)' : 'Plan Integral (Registro de Banco de Datos MINJUS)';
    const text = domain
      ? `Hola Martín, deseo adecuar mi web (${domain}) a la Ley N° 29733 de Protección de Datos Personales (${tipoStr} - ${precio}) para evitar sanciones de la ANPDP.`
      : `Hola Martín, deseo adecuar mi web a la Ley N° 29733 de Protección de Datos Personales (${tipoStr} - ${precio}) para evitar sanciones de la ANPDP.`;
    return getWhatsAppUrl(text);
  },

  // 5. Auditoría Técnica de Pasarelas de Pago & Checkout - S/ 420
  upsellPasarelaPago: (domain = '') => {
    const text = domain
      ? `Hola Martín, tengo una pasarela de pago en mi web (${domain}) y necesito una Auditoría Técnica de Checkout & Pasarelas (S/ 420) para blindar los cobros contra scripts espías y fraude.`
      : 'Hola Martín, tengo una pasarela de pago en mi web y necesito una Auditoría Técnica de Checkout & Pasarelas (S/ 420) para blindar los cobros contra scripts espías y fraude.';
    return getWhatsAppUrl(text);
  },
};
