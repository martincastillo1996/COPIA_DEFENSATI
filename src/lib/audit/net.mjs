// Red de los motores activos: la IP se valida una vez y queda fijada durante todo el trabajo.
import dns from 'node:dns/promises';
import net from 'node:net';
import http from 'node:http';
import https from 'node:https';

const v4 = new net.BlockList();
for (const [ip, bits] of /** @type {[string, number][]} */ ([
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15],
  ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 3],
])) v4.addSubnet(ip, bits, 'ipv4');

const global6 = new net.BlockList();
global6.addSubnet('2000::', 3, 'ipv6');
const special6 = new net.BlockList();
// Teredo, documentación y 6to4 (este último puede encapsular una IPv4 privada)
for (const [ip, bits] of /** @type {[string, number][]} */ ([['2001::', 32], ['2001:db8::', 32], ['2002::', 16]])) {
  special6.addSubnet(ip, bits, 'ipv6');
}

/** @param {string} ip */
export function isPublicIp(ip) {
  if (net.isIPv4(ip)) return !v4.check(ip, 'ipv4');
  return net.isIPv6(ip) && global6.check(ip, 'ipv6') && !special6.check(ip, 'ipv6');
}

/** @param {string} host */
export async function resolvePublic(host) {
  const list = await dns.lookup(host, { all: true });
  if (!list.length || list.some((a) => !isPublicIp(a.address))) throw new Error(`${host} resuelve a una IP no pública.`);
  return (list.find((a) => a.family === 4) || list[0]).address;
}

/**
 * GET sin redirecciones hacia una IP fijada.
 * @param {string} url
 * @param {string} ip
 * @param {{headers?: Record<string, string>, maxBytes?: number, verifyTls?: boolean}} [options]
 * @returns {Promise<{status: number, headers: import('node:http').IncomingHttpHeaders, body: string}>}
 */
export function pinnedGet(url, ip, { headers = {}, maxBytes = 500000, verifyTls = true } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const family = net.isIP(ip);
    /** @type {import('node:https').RequestOptions} */
    const options = {
      agent: false,
      headers: { 'User-Agent': 'DefensaTI-AuthorizedAudit/3.0', ...headers },
      rejectUnauthorized: verifyTls,
      lookup: (_host, opts, cb) => (opts.all ? cb(null, [{ address: ip, family }]) : cb(null, ip, family)),
    };
    /** @type {Buffer[]} */
    const chunks = [];
    /** @type {import('node:http').IncomingMessage | undefined} */
    let response;
    let settled = false;
    // truncated: el servidor cortó antes de lo que declaró (ocurre con servidores mal hechos). Se conserva lo recibido.
    const finish = (truncated = false) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ status: response?.statusCode || 0, headers: response?.headers || {}, body: Buffer.concat(chunks).toString('utf8'), truncated });
    };
    const fail = (/** @type {Error} */ e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(e);
    };
    const req = (u.protocol === 'https:' ? https : http).request(u, options, (res) => {
      response = res;
      let size = 0;
      res.on('data', (chunk) => {
        chunks.push(chunk);
        size += chunk.length;
        if (size >= maxBytes) {
          finish();
          req.destroy();
        }
      });
      res.on('end', () => finish());
      res.on('aborted', () => finish(true));
      res.on('error', () => finish(true));
    });
    const timer = setTimeout(() => {
      if (response) finish(true);
      else req.destroy(new Error('Tiempo agotado.'));
    }, 10000);
    req.on('error', (e) => (response ? finish(true) : fail(e)));
    req.end();
  });
}
