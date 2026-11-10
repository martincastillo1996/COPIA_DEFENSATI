import { siteConfig } from '@/config/site';

/**
 * Genera el enlace directo a WhatsApp oficial (+1 785 643-3991) con mensaje en primera persona y sin etiquetas de tracking.
 */
export function getWhatsAppUrl(message: string): string {
  const number = (siteConfig.contact.whatsappNumber || '17856433991').replace(/[^0-9]/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message.trim())}`;
}

/**
 * Mensajes oficiales de DEFENSA TI en primera persona singular, directos y sin jerga técnica.
 */
export const DEFENSATI_WHATSAPP_MESSAGES = {
  hero: (domain = '') => {
    const text = domain 
      ? `Hola Martín, mi web tiene problemas o fue hackeada. Mi página es: ${domain}`
      : 'Hola Martín, mi web tiene problemas o fue hackeada. ¿Puedes ayudarme a revisarla?';
    return getWhatsAppUrl(text);
  },
  precioLimpieza: (domain = '') => {
    const text = domain
      ? `Hola Martín, quiero que me limpies mi web de WordPress infectada. Mi página es: ${domain}`
      : 'Hola Martín, quiero que me limpies mi web de WordPress infectada. ¿Cómo coordinamos?';
    return getWhatsAppUrl(text);
  },
  precioBlindaje: (domain = '') => {
    const text = domain
      ? `Hola Martín, quiero blindar mi web para que no vuelva a infectarse (S/ 165). Mi página es: ${domain}`
      : 'Hola Martín, quiero blindar mi web para protegerla contra ataques (S/ 165).';
    return getWhatsAppUrl(text);
  },
  precioBlindajeWaf: (domain = '') => {
    const text = domain
      ? `Hola Martín, quiero protección con Firewall WAF para mi web (Desde S/ 335). Mi página es: ${domain}`
      : 'Hola Martín, quiero protección con Firewall WAF para mi web (Desde S/ 335).';
    return getWhatsAppUrl(text);
  },
  precioMensual: (domain = '') => {
    const text = domain
      ? `Hola Martín, me interesa el servicio de monitoreo mensual para mi web (S/ 49/mes). Mi página es: ${domain}`
      : 'Hola Martín, me interesa el servicio de monitoreo mensual para mi web (S/ 49/mes).';
    return getWhatsAppUrl(text);
  },
  precioMensualPro: (domain = '') => {
    const text = domain
      ? `Hola Martín, me interesa el monitoreo mensual nivel Pro (S/ 99/mes). Mi página es: ${domain}`
      : 'Hola Martín, me interesa el monitoreo mensual nivel Pro (S/ 99/mes).';
    return getWhatsAppUrl(text);
  },
  escaner: (domain: string, score?: number, grade?: string) => {
    const scoreText = typeof score === 'number' ? ` (vi una nota de ${score}/100${grade ? `, Grado ${grade}` : ''})` : '';
    const text = `Hola Martín, acabo de revisar mi web ${domain ? `(${domain})` : ''}${scoreText} en tu escáner y quiero que tú mismo la limpies y asegures por mí.`;
    return getWhatsAppUrl(text);
  },
};
