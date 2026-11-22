import dns from 'dns';
import net from 'net';
import http from 'http';
import https from 'https';
import zlib from 'zlib';
import {
  isPrivateIpv4,
  isPrivateIpv6,
  isPrivateOrLocalHost,
  validateRedirectTarget,
} from '@/lib/security/ssrfValidator';

/**
 * Red saliente segura para el motor de auditoría (Anti-SSRF en el momento de conectar).
 *
 * Validar el DNS antes y conectar después deja una ventana: el dominio puede responder una IP
 * pública en la validación y 127.0.0.1 en la conexión (DNS rebinding). Aquí la comprobación se
 * hace dentro del propio `lookup` del socket, así la IP validada es exactamente la IP a la que
 * se conecta. Todos los sockets hacia destinos indicados por el visitante (HTTP, TLS, TCP)
 * deben usar `safeLookup` o `safeHttpGet`.
 */

export function isBlockedAddress(address: string): boolean {
  if (net.isIPv4(address)) return isPrivateIpv4(address);
  if (net.isIPv6(address)) return isPrivateIpv6(address);
  return true;
}

function ssrfError(message: string): NodeJS.ErrnoException {
  const err = new Error(message) as NodeJS.ErrnoException;
  err.code = 'ESSRFBLOCKED';
  return err;
}

/**
 * Sustituto de dns.lookup para net.connect / tls.connect / http(s).request.
 * Rechaza la conexión si CUALQUIERA de las direcciones resueltas es privada o reservada.
 */
export const safeLookup: net.LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { family: options.family, hints: options.hints, all: true }, (err, addresses) => {
    if (err) {
      callback(err, '', 0);
      return;
    }
    const list = addresses as dns.LookupAddress[];
    if (!list || list.length === 0) {
      callback(ssrfError(`No se pudo resolver ${hostname}.`), '', 0);
      return;
    }
    const blocked = list.find((a) => isBlockedAddress(a.address));
    if (blocked) {
      callback(ssrfError(`Destino bloqueado: ${hostname} resuelve a una dirección privada o reservada (${blocked.address}).`), '', 0);
      return;
    }
    if (options.all) {
      callback(null, list);
    } else {
      callback(null, list[0].address, list[0].family);
    }
  });
};

export interface SafeHttpOptions {
  headers?: Record<string, string>;
  /** Tiempo total máximo de la operación, incluidas redirecciones y lectura del cuerpo. */
  timeoutMs?: number;
  /** Bytes máximos del cuerpo (ya descomprimido). 0 = solo cabeceras. */
  maxBytes?: number;
  /** Redirecciones que se siguen, cada una validada contra SSRF. */
  maxRedirects?: number;
  /** Método HTTP (por defecto GET). Solo métodos de lectura/inspección. */
  method?: 'GET' | 'HEAD' | 'OPTIONS';
}

export interface SafeHttpResult {
  status: number;
  headers: Headers;
  body: string;
  finalUrl: string;
  truncated: boolean;
  /** Motivo, si una redirección fue bloqueada por apuntar a un destino no permitido. */
  blockedRedirect?: string;
}

interface RawResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: string;
  truncated: boolean;
}

const REDIRECT_STATUS = [301, 302, 303, 307, 308];

function requestOnce(url: URL, headers: Record<string, string>, maxBytes: number, deadline: number, method: string = 'GET'): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const host = url.hostname.replace(/^\[|\]$/g, '');
    // Las IP literales no pasan por lookup: se comprueban aquí.
    if (isPrivateOrLocalHost(host)) {
      reject(ssrfError(`Destino bloqueado: ${host} es privado, loopback o reservado.`));
      return;
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      reject(new Error('Tiempo de espera agotado.'));
      return;
    }

    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(
      url,
      {
        method,
        headers: { ...headers, 'Accept-Encoding': 'gzip, deflate, br' },
        lookup: safeLookup,
        agent: false,
      },
      (res) => {
        const status = res.statusCode || 0;

        // Redirecciones y peticiones de solo cabeceras: no se lee el cuerpo.
        if (maxBytes <= 0 || REDIRECT_STATUS.includes(status)) {
          settle(() => resolve({ status, headers: res.headers, body: '', truncated: false }));
          req.destroy();
          return;
        }

        const encoding = String(res.headers['content-encoding'] || '').toLowerCase();
        let stream: NodeJS.ReadableStream = res;
        if (encoding.includes('br')) stream = res.pipe(zlib.createBrotliDecompress());
        else if (encoding.includes('gzip')) stream = res.pipe(zlib.createGunzip());
        else if (encoding.includes('deflate')) stream = res.pipe(zlib.createInflate());

        const chunks: Buffer[] = [];
        let size = 0;
        const finish = (truncated: boolean) =>
          settle(() => resolve({ status, headers: res.headers, body: Buffer.concat(chunks).toString('utf8'), truncated }));

        stream.on('data', (chunk: Buffer) => {
          if (settled) return;
          const room = maxBytes - size;
          if (chunk.length >= room) {
            // Tope alcanzado: se corta la descarga para no agotar memoria ni quedar colgado.
            chunks.push(chunk.subarray(0, room));
            size = maxBytes;
            finish(true);
            req.destroy();
            return;
          }
          chunks.push(chunk);
          size += chunk.length;
        });
        stream.on('end', () => finish(false));
        stream.on('error', () => finish(true));
        res.on('error', () => finish(true));
      }
    );

    const timer = setTimeout(() => {
      settle(() => reject(new Error('Tiempo de espera agotado.')));
      req.destroy();
    }, remaining);

    req.on('error', (err) => settle(() => reject(err)));
    req.end();
  });
}

function toHeaders(raw: http.IncomingHttpHeaders): Headers {
  const out = new Headers();
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    for (const v of Array.isArray(value) ? value : [value]) {
      try {
        out.append(key, v);
      } catch {
        // Cabecera con caracteres inválidos: se ignora
      }
    }
  }
  return out;
}

/**
 * GET saliente con: resolución DNS validada al conectar, redirecciones validadas una a una,
 * tiempo total acotado y cuerpo limitado en bytes.
 */
export async function safeHttpGet(rawUrl: string, options: SafeHttpOptions = {}): Promise<SafeHttpResult> {
  const headers = options.headers || {};
  const maxBytes = options.maxBytes ?? 0;
  const maxRedirects = options.maxRedirects ?? 0;
  const deadline = Date.now() + (options.timeoutMs ?? 5000);

  let current = new URL(rawUrl);
  if (current.protocol !== 'http:' && current.protocol !== 'https:') {
    throw ssrfError(`Protocolo no permitido (${current.protocol}).`);
  }

  for (let hop = 0; ; hop++) {
    const raw = await requestOnce(current, headers, maxBytes, deadline, options.method || 'GET');
    const result: SafeHttpResult = {
      status: raw.status,
      headers: toHeaders(raw.headers),
      body: raw.body,
      finalUrl: current.toString(),
      truncated: raw.truncated,
    };

    const location = raw.headers.location;
    if (!REDIRECT_STATUS.includes(raw.status) || !location || hop >= maxRedirects) {
      return result;
    }

    const validation = await validateRedirectTarget(current.toString(), location);
    if (!validation.allowed || !validation.sanitizedUrl) {
      return { ...result, blockedRedirect: validation.reason || 'Redirección no permitida.' };
    }
    if (validation.sanitizedUrl === current.toString()) {
      return result;
    }
    current = new URL(validation.sanitizedUrl);
  }
}
