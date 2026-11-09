import { siteConfig } from '@/config/site';

export type WhatsAppTag = 
  | '[Hero]'
  | '[Precio-Limpieza]'
  | '[Precio-Blindaje]'
  | '[Precio-Mensual]'
  | '[Escaner]'
  | '[General]';

/**
 * Genera el enlace directo a WhatsApp oficial (+1 785 643-3991) con el mensaje preformateado y etiqueta de seguimiento.
 */
export function getWhatsAppUrl(message: string, tag?: WhatsAppTag): string {
  const number = (siteConfig.contact.whatsappNumber || '17856433991').replace(/[^0-9]/g, '');
  const fullMessage = tag ? `${message.trim()} ${tag}` : message.trim();
  return `https://wa.me/${number}?text=${encodeURIComponent(fullMessage)}`;
}

/**
 * Mensajes oficiales de DEFENSA TI por sección para seguimiento de conversión.
 */
export const DEFENSATI_WHATSAPP_MESSAGES = {
  hero: (domain = '') => {
    const text = domain 
      ? `Hola, mi web fue hackeada. Mi página es: ${domain}`
      : 'Hola, mi web fue hackeada. Mi página es: ';
    return getWhatsAppUrl(text, '[Hero]');
  },
  precioLimpieza: (domain = '') => {
    const text = domain
      ? `Hola, quiero consultar por la Limpieza de web hackeada. Mi página es: ${domain}`
      : 'Hola, quiero consultar por la Limpieza de web hackeada. Mi página es: ';
    return getWhatsAppUrl(text, '[Precio-Limpieza]');
  },
  precioBlindaje: (domain = '') => {
    const text = domain
      ? `Hola, quiero el plan Blindaje. Mi página es: ${domain}`
      : 'Hola, quiero el plan Blindaje. Mi página es: ';
    return getWhatsAppUrl(text, '[Precio-Blindaje]');
  },
  precioMensual: (domain = '') => {
    const text = domain
      ? `Hola, quiero el plan Vigilancia mensual. Mi página es: ${domain}`
      : 'Hola, quiero el plan Vigilancia mensual. Mi página es: ';
    return getWhatsAppUrl(text, '[Precio-Mensual]');
  },
  escaner: (domain: string, score?: number, grade?: string) => {
    const scoreText = typeof score === 'number' ? ` (Nota: ${score}/100, Grado ${grade || 'F'})` : '';
    const text = `Hola, acabo de escanear mi web ${domain ? `(${domain})` : ''}${scoreText} en DEFENSA TI y quiero que la arreglen por mí.`;
    return getWhatsAppUrl(text, '[Escaner]');
  },
};
