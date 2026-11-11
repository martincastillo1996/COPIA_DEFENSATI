/**
 * ZoomEye Cyberspace Search Engine Client (API v2)
 * Permite realizar reconocimiento pasivo (OSINT) de puertos, tecnologías y CVEs
 * basados en la inteligencia de Knownsec ZoomEye sin tocar directamente el servidor objetivo.
 */

export interface ZoomEyeRawMatch {
  ip: string;
  port?: number;
  protocol?: string;
  app?: string[];
  raw_data?: string;
  timestamp?: string;
  update_time?: string;
  portinfo?: {
    port?: number;
    service?: string;
    app?: string[];
    banner?: string;
  };
  geoinfo?: {
    country?: { names?: Record<string, string> };
    city?: { names?: Record<string, string> };
  };
}

export interface ZoomEyeSearchResult {
  total: number;
  matches: Array<{
    ip: string;
    port: number;
    protocol?: string;
    service?: string;
    app?: string[];
    banner?: string;
    country?: string;
    city?: string;
    update_time?: string;
  }>;
}

export interface ZoomEyeUserInfo {
  code: number;
  message?: string;
  data?: {
    username?: string;
    role?: string;
    user_info?: {
      points?: number;
      remain_free_points?: number;
      remain_pay_points?: number;
    };
  };
}

const ZOOMEYE_API_BASE = 'https://api.zoomeye.ai';

function getApiKey(): string | undefined {
  return process.env.ZOOMEYE_API_KEY;
}

/**
 * Consulta el estado y créditos de la cuenta de ZoomEye.
 */
export async function getZoomEyeUserInfo(): Promise<ZoomEyeUserInfo | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }

  try {
    const res = await fetch(`${ZOOMEYE_API_BASE}/v2/userinfo`, {
      method: 'POST',
      headers: {
        'API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as ZoomEyeUserInfo;
  } catch (error) {
    console.warn('[ZoomEye] Error consultando userinfo:', error);
    return null;
  }
}

/**
 * Busca activos en ZoomEye mediante dorks (ej: ip="1.2.3.4", site="dominio.com", app="nginx").
 * Automáticamente codifica el dork a Base64 según el estándar de ZoomEye v2.
 */
export async function searchZoomEye(
  query: string,
  options: { page?: number; pagesize?: number; subType?: 'v4' | 'v6' | 'web' | 'all' } = {}
): Promise<{ success: boolean; data?: ZoomEyeSearchResult; error?: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      success: false,
      error: 'ZOOMEYE_API_KEY no está configurada en las variables de entorno (.env.local).',
    };
  }

  try {
    const qbase64 = Buffer.from(query, 'utf-8').toString('base64');
    const payload = {
      qbase64,
      page: options.page || 1,
      pagesize: Math.min(options.pagesize || 10, 50),
      sub_type: options.subType || 'all',
    };

    const res = await fetch(`${ZOOMEYE_API_BASE}/v2/search`, {
      method: 'POST',
      headers: {
        'API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    const json = await res.json();

    // ZoomEye usa código 60000 como SUCCESS
    if (json.code === 60000 || res.ok) {
      return {
        success: true,
        data: {
          total: json.total || 0,
          matches: ((json.matches as ZoomEyeRawMatch[]) || []).map((m: ZoomEyeRawMatch) => ({
            ip: m.ip,
            port: m.portinfo?.port || m.port || 80,
            protocol: m.portinfo?.service || m.protocol,
            service: m.portinfo?.service,
            app: m.portinfo?.app || m.app,
            banner: m.portinfo?.banner || m.raw_data,
            country: m.geoinfo?.country?.names?.es || m.geoinfo?.country?.names?.en,
            city: m.geoinfo?.city?.names?.es || m.geoinfo?.city?.names?.en,
            update_time: m.timestamp || m.update_time,
          })),
        },
      };
    }

    return {
      success: false,
      error: json.message || `Error ${json.code || res.status} devuelto por ZoomEye.`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error de conexión con ZoomEye API.';
    return {
      success: false,
      error: message,
    };
  }
}
