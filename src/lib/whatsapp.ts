import { siteConfig } from '@/config/site';

/**
 * Genera el enlace directo a WhatsApp oficial (+1 785 643-3991) con mensaje claro,
 * sin etiquetas raras y 100% contextual para el cliente.
 */
export function getWhatsAppUrl(message: string): string {
  const number = (siteConfig.contact.whatsappNumber || '17856433991').replace(/[^0-9]/g, '');
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

  // CTA Secundario: Recuperación de páginas hackeadas / Emergencia
  recuperacionHackeo: (domain = '') => {
    const text = domain
      ? `🚨 Hola Martín, ¡urgente! Mi página web (${domain}) fue hackeada o tiene problemas de seguridad. Necesito ayuda para limpiarla y recuperarla cuanto antes.`
      : '🚨 Hola Martín, ¡urgente! Mi página web fue hackeada o tiene problemas de seguridad. Necesito ayuda para limpiarla y recuperarla cuanto antes.';
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

  // Paquete Insignia 1: Rescate + Blindaje WAF Cloudflare + 3 Meses de Monitoreo - Web Corporativa (S/ 600)
  precioPackCorp: (domain = '') => {
    const text = domain
      ? `Hola Martín, me interesa contratar el Pack Completo: Rescate + Blindaje WAF Cloudflare + 3 meses de monitoreo (S/ 600) para mi web corporativa (${domain}).`
      : 'Hola Martín, me interesa contratar el Pack Completo: Rescate + Blindaje WAF Cloudflare + 3 meses de monitoreo (S/ 600) para mi web corporativa.';
    return getWhatsAppUrl(text);
  },

  // Paquete Insignia 2: Rescate + Blindaje WAF Cloudflare + 3 Meses de Monitoreo - E-commerce / Tienda Online (S/ 850)
  precioPackEcom: (domain = '') => {
    const text = domain
      ? `Hola Martín, me interesa contratar el Pack Completo: Rescate + Blindaje WAF Cloudflare + 3 meses de monitoreo (S/ 850) para mi tienda online (${domain}).`
      : 'Hola Martín, me interesa contratar el Pack Completo: Rescate + Blindaje WAF Cloudflare + 3 meses de monitoreo (S/ 850) para mi tienda online.';
    return getWhatsAppUrl(text);
  },

  // Rescate de Emergencia Puntual (S/ 450 - S/ 650)
  precioRescateEmergencia: (domain = '') => {
    const text = domain
      ? `Hola Martín, tengo una urgencia con mi web (${domain}) por virus, redirecciones o caída. Deseo contratar el Rescate de Emergencia (S/ 450 - S/ 650).`
      : 'Hola Martín, tengo una urgencia con mi web por virus, redirecciones o caída. Deseo contratar el Rescate de Emergencia (S/ 450 - S/ 650).';
    return getWhatsAppUrl(text);
  },

  // Aliases de compatibilidad retroactiva orientados a los nuevos paquetes
  precioLimpieza: (domain = '') => {
    const text = domain
      ? `Hola Martín, mi sitio web (${domain}) presenta infección o malware. Quisiera contratar el rescate y blindaje con garantía (Pack Completo desde S/ 600 o Emergencia S/ 450 - S/ 650).`
      : 'Hola Martín, mi sitio web presenta infección o malware. Quisiera contratar el rescate y blindaje con garantía (Pack Completo desde S/ 600 o Emergencia S/ 450 - S/ 650).';
    return getWhatsAppUrl(text);
  },

  precioBlindaje: (domain = '') => {
    const text = domain
      ? `Hola Martín, deseo blindar mi sitio web (${domain}) con el Pack Llave en Mano: Rescate + Blindaje WAF Cloudflare + 3 meses de monitoreo (S/ 600).`
      : 'Hola Martín, deseo blindar mi sitio web con el Pack Llave en Mano: Rescate + Blindaje WAF Cloudflare + 3 meses de monitoreo (S/ 600).';
    return getWhatsAppUrl(text);
  },

  precioBlindajeWaf: (domain = '') => {
    const text = domain
      ? `Hola Martín, quiero implementar la Protección WAF Cloudflare con el Pack Completo de blindaje y 3 meses de monitoreo (S/ 600 - S/ 850) en mi web (${domain}).`
      : 'Hola Martín, quiero implementar la Protección WAF Cloudflare con el Pack Completo de blindaje y 3 meses de monitoreo (S/ 600 - S/ 850) en mi web.';
    return getWhatsAppUrl(text);
  },

  // Planes Mensuales: Plan Esencial (S/ 49/mes)
  precioMensual: (domain = '') => {
    const text = domain
      ? `Hola Martín, me interesa activar el Plan de Monitoreo Esencial de S/ 49/mes para mi web (${domain}) para recibir alertas de caídas y re-escaneos mensuales.`
      : 'Hola Martín, me interesa activar el Plan de Monitoreo Esencial de S/ 49/mes para mi página web para recibir alertas de caídas y re-escaneos mensuales.';
    return getWhatsAppUrl(text);
  },

  // Planes Mensuales: Plan Pro (S/ 99/mes)
  precioMensualPro: (domain = '') => {
    const text = domain
      ? `Hola Martín, quisiera suscribirme al Plan de Monitoreo Pro de S/ 99/mes para mi web (${domain}) con chequeos cada 5 min y soporte técnico preventivo.`
      : 'Hola Martín, quisiera suscribirme al Plan de Monitoreo Pro de S/ 99/mes para mi página web con chequeos cada 5 min y soporte técnico preventivo.';
    return getWhatsAppUrl(text);
  },

  // Escáner contextual con diagnóstico dinámico
  escanerContextual: (params: {
    domain: string;
    score?: number;
    grade?: string;
    primaryIssue?: string;
    recommendation?: 'limpieza' | 'blindaje' | 'monitoreo';
  }) => {
    const { domain, score, grade, primaryIssue, recommendation } = params;
    const scoreStr = typeof score === 'number' ? `Nota ${score}/100 (Grado ${grade || 'F'})` : '';

    if (recommendation === 'monitoreo') {
      return getWhatsAppUrl(
        `Hola Martín, acabo de auditar mi web (${domain}) en DEFENSA TI. Obtuvo buena calificación (${scoreStr}), pero me interesa mantenerla protegida con el Plan de Monitoreo Mensual.`
      );
    }

    if (recommendation === 'limpieza') {
      return getWhatsAppUrl(
        `Hola Martín, acabo de auditar mi web (${domain}) en DEFENSA TI. Obtuvo ${scoreStr} con alerta crítica (${primaryIssue || 'riesgo de infección'}). Quisiera que me ayudes a desinfectarla y blindarla.`
      );
    }

    // Default blindaje
    const issueText = primaryIssue ? ` Se detectó: ${primaryIssue}.` : '';
    return getWhatsAppUrl(
      `Hola Martín, acabo de auditar mi web (${domain}) en DEFENSA TI y obtuvo ${scoreStr}.${issueText} Quisiera cotizar el blindaje perimetral para corregirlo.`
    );
  },

  // Escáner simple (compatibilidad retroactiva)
  escaner: (domain: string, score?: number, grade?: string) => {
    const scoreText = typeof score === 'number' ? ` (Nota: ${score}/100, Grado ${grade || 'F'})` : '';
    const text = `Hola Martín, acabo de escanear mi web ${domain ? `(${domain})` : ''}${scoreText} en DEFENSA TI y quiero que me ayuden a corregir las fallas encontradas.`;
    return getWhatsAppUrl(text);
  },
};
