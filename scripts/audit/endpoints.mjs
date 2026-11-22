// Rutas de API que el propio JavaScript público del sitio revela. Sirve para aplicaciones de una sola
// página, donde el rastreador de HTML casi no ve nada. Solo lectura, mismo origen y IP fijada.
import { pinnedGet } from '../../src/lib/audit/net.mjs';
import { isUnsafeUrl } from './crawler.mjs';
import { createLimiter } from './limiter.mjs';

const STATIC = /\.(png|jpe?g|gif|webp|svg|ico|css|js|mjs|map|woff2?|ttf|html?|pdf|zip|mp4)$/i;
const PATTERNS = [
  /["'`](\/(?:api|rest|graphql|v\d+|auth|admin|internal|users?|accounts?|orders?|customers?)(?:\/[A-Za-z0-9_.-]+)*\/?)["'`]/g,
  /(?:fetch|axios(?:\.[a-z]+)?|\.(?:get|post|put|patch|delete))\(\s*["'`](\/[A-Za-z0-9_/.-]+)/g,
];

export function extractEndpoints(js) {
  const out = new Set();
  for (const re of PATTERNS) {
    for (const m of js.matchAll(re)) {
      const path = m[1].replace(/\/+$/, '');
      if (path.length > 1 && path.length <= 120 && !STATIC.test(path) && !isUnsafeUrl(path)) out.add(path);
    }
  }
  return [...out];
}

export async function discover({ origin, ip, get = pinnedGet, limiter = createLimiter(5), check = () => {} }) {
  const base = new URL(origin);
  const home = await get(`${origin}/`, ip, { maxBytes: 1.5e6 });
  if (home.status !== 200) return { endpoints: [], scripts: 0 };
  let truncated = home.truncated ? 1 : 0;
  const found = new Set(extractEndpoints(home.body));
  const sources = [...new Set([...home.body.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((m) => m[1]))];
  let scripts = 0;
  for (const src of sources) {
    let url;
    try { url = new URL(src, origin); } catch { continue; }
    if (url.origin !== base.origin || scripts >= 12) continue;
    check();
    await limiter.take();
    try {
      const res = await get(url.href, ip, { maxBytes: 2.5e6 });
      if (res.truncated) truncated++;
      if (res.status === 200) {
        scripts++;
        for (const p of extractEndpoints(res.body)) found.add(p);
      }
    } catch {}
  }
  return { endpoints: [...found].sort().slice(0, 300), scripts, truncated };
}
