import { siteConfig } from '@/config/site';

export type WhatsAppTag = 
  | '[Hero]'
  | '[Precio-Limpieza]'
  | '[Precio-Blindaje]'
  | '[Precio-Blindaje-WAF]'
  | '[Precio-Mensual]'
  | '[Precio-Mensual-Pro]'
  | '[Escaner]'
  | '[General]';

/**
 * Genera el enlace directo a WhatsApp oficial (+1 785 643-3991) con mensaje claro y natural.
 * Se han eliminado etiquetas raras visibles para una comunicación 100% humana y comercial.
 */
export function getWhatsAppUrl(message: string): string {
  const number = (siteConfig.contact.whatsappNumber || '17856433991').replace(/[^0-9]/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message.trim())}`;
}

/**
 * Mensajes comerciales aprobados para DEFENSA TI.
 */
export const DEFENSATI_WHATSAPP_MESSAGES = {
  hero: (domain = '') => {
    const text = domain 
      ? `Hola Martín, vi tu página de DEFENSA TI. Tengo problemas con mi web (${domain}) y quisiera que me ayudes a revisarla.`
      : 'Hola Martín, vi tu página de DEFENSA TI. Tengo problemas con mi página web y quisiera que me ayudes a revisarla.';
    return getWhatsAppUrl(text);
  },
  precioLimpieza: (domain = '') => {
    const text = domain
      ? `Hola Martín, mi página web (${domain}) tiene virus o redirecciones extrañas. Quiero consultar por el servicio de limpieza y recuperación de WordPress.`
      : 'Hola Martín, mi página web tiene virus o redirecciones extrañas. Quiero consultar por el servicio de limpieza y recuperación de WordPress.';
    return getWhatsAppUrl(text);
  },
  precioBlindaje: (domain = '') => {
    const text = domain
      ? `Hola Martín, me interesa el servicio de Blindaje Preventivo de S/ 165 para proteger mi web (${domain}). ¿Cómo empezamos?`
      : 'Hola Martín, me interesa el servicio de Blindaje Preventivo de S/ 165 para proteger mi página web. ¿Cómo empezamos?';
    return getWhatsAppUrl(text);
  },
  precioBlindajeWaf: (domain = '') => {
    const text = domain
      ? `Hola Martín, quisiera cotizar la configuración de Firewall WAF (desde S/ 335) para mi sitio (${domain}).`
      : 'Hola Martín, quisiera cotizar la configuración de Firewall WAF (desde S/ 335) para mi página web.';
    return getWhatsAppUrl(text);
  },
  precioMensual: (domain = '') => {
    const text = domain
      ? `Hola Martín, me gustaría activar el Monitoreo Esencial de S/ 49/mes para mi página (${domain}) y recibir alertas directas por WhatsApp.`
      : 'Hola Martín, me gustaría activar el Monitoreo Esencial de S/ 49/mes para mi página web y recibir alertas directas por WhatsApp.';
    return getWhatsAppUrl(text);
  },
  precioMensualPro: (domain = '') => {
    const text = domain
      ? `Hola Martín, me gustaría contratar el Monitoreo Pro de S/ 99/mes para mi página (${domain}) con chequeos cada 5 minutos y soporte mensual.`
      : 'Hola Martín, me gustaría contratar el Monitoreo Pro de S/ 99/mes para mi página web con chequeos cada 5 minutos y soporte mensual.';
    return getWhatsAppUrl(text);
  },
  escaner: (domain: string, score?: number, grade?: string) => {
    const scoreText = typeof score === 'number' ? ` (Nota: ${score}/100, Grado ${grade || 'F'})` : '';
    const text = `Hola Martín, acabo de escanear mi web ${domain ? `(${domain})` : ''}${scoreText} en DEFENSA TI y quiero que me ayuden a corregir las fallas encontradas.`;
    return getWhatsAppUrl(text);
  },
};
