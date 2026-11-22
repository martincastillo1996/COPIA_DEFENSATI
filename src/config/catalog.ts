/**
 * Catálogo oficial de precios de DEFENSA TI (Soles PEN).
 * ÚNICA fuente de verdad: ningún componente, mensaje de WhatsApp, PDF, metadata o prompt
 * de IA debe escribir un precio a mano. Cambia el número aquí y se propaga a todo el sitio.
 * Alineado con AGENTS.md, regla 7.
 */
export const PRICES = {
  // Servicios principales (pago único)
  rescateCorporativo: 380,
  rescateTienda: 550,
  blindajeWaf: 450,
  // Mantenimiento mensual (sin permanencia)
  mantenimientoBasico: 90,
  mantenimientoTiendas: 180,
  // Complementarios / upsells (pago único)
  correoSpfDkimDmarc: 190,
  migracionCorporativa: 290,
  migracionTienda: 450,
  wpoCorporativo: 320,
  wpoTienda: 480,
  legalBasica: 350,
  legalIntegral: 500,
  auditoriaPasarelas: 420,
} as const;

export type PriceKey = keyof typeof PRICES;

/** Formato canónico de precio: `S/ 380`. */
export const soles = (amount: number): string => `S/ ${amount}`;

/** Precio formateado listo para mostrar, por clave del catálogo: `P.blindajeWaf` → `S/ 450`. */
export const P = Object.fromEntries(
  Object.entries(PRICES).map(([key, value]) => [key, soles(value)]),
) as { readonly [K in PriceKey]: string };

/** Rango del servicio de rescate: `S/ 380 – S/ 550`. */
export const RESCATE_RANGE = `${P.rescateCorporativo} – ${P.rescateTienda}`;

/** Rango de toda la oferta (schema.org priceRange). */
export const PRICE_RANGE = `${P.mantenimientoBasico} - ${P.rescateTienda}`;
