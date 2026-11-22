/** Nodo que ejecuta la auditoría. Sin configurar es desconocido: no se inventa una ubicación. */
export function getAuditorLocation(): { provider: string; region: string; lat: number; lon: number } | null {
  const { AUDITOR_PROVIDER, AUDITOR_REGION, AUDITOR_LAT, AUDITOR_LON } = process.env;
  if (!AUDITOR_LAT || !AUDITOR_LON) return null;
  const lat = Number(AUDITOR_LAT);
  const lon = Number(AUDITOR_LON);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { provider: AUDITOR_PROVIDER || 'N/D', region: AUDITOR_REGION || 'N/D', lat, lon };
}
