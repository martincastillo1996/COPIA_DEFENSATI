/**
 * TEST AUTOMATIZADO DEL MOTOR DE PUNTAJE Y DETECCIÓN DE HIPERESCALADORES
 * Protege la nota que ve el cliente: una regresión aquí cambia el diagnóstico comercial.
 *
 * Ejecutar: npm run test:score
 */
import assert from 'node:assert/strict';
import { calculateSecurityScore } from '../src/lib/scanner/scoreEngine.ts';
import { isHyperscalePlatform } from '../src/lib/hyperscalers.ts';
import { ENDPOINT_PROBES, probeExposedEndpoints } from '../src/lib/scanner/webAppScanner.ts';
import { isUnsafeUrl } from './audit/crawler.mjs';

const header = (name, status, value = null) => ({
  header: name,
  present: status !== 'missing',
  value,
  status,
  description: '',
});

const ALL_PASS = [
  header('Strict-Transport-Security', 'pass', 'max-age=63072000'),
  header('Content-Security-Policy', 'pass', "default-src 'self'"),
  header('X-Frame-Options', 'pass', 'DENY'),
  header('X-Content-Type-Options', 'pass', 'nosniff'),
  header('Referrer-Policy', 'pass', 'strict-origin-when-cross-origin'),
];
const ALL_MISSING = ALL_PASS.map((h) => header(h.header, 'missing'));

const SSL_13 = { valid: true, issuer: 'Test CA', protocol: 'TLSv1.3', daysRemaining: 80 };
const SSL_12 = { ...SSL_13, protocol: 'TLSv1.2' };
const SSL_BAD = { valid: false, issuer: '', protocol: '', daysRemaining: 0 };

const tests = [
  ['Sitio pyme perfecto: TLS 1.3 + todas las cabeceras = 85 (Grado A)', () => {
    const r = calculateSecurityScore('mitienda.pe', ALL_PASS, SSL_13);
    assert.equal(r.score, 85);
    assert.equal(r.grade, 'A');
    assert.deepEqual(r.reasons, []);
  }],
  ['Solo TLS 1.3 válido, sin cabeceras = 45 (Grado D) con 4 hallazgos', () => {
    const r = calculateSecurityScore('mitienda.pe', ALL_MISSING, SSL_13);
    assert.equal(r.score, 45);
    assert.equal(r.grade, 'D');
    assert.equal(r.reasons.length, 4);
  }],
  ['SSL inválido y sin cabeceras = 0 (Grado F)', () => {
    const r = calculateSecurityScore('mitienda.pe', ALL_MISSING, SSL_BAD);
    assert.equal(r.score, 0);
    assert.equal(r.grade, 'F');
    assert.ok(r.reasons.some((x) => x.includes('SSL/TLS')));
  }],
  ['TLS 1.2 resta 5 puntos frente a TLS 1.3', () => {
    const a = calculateSecurityScore('mitienda.pe', ALL_PASS, SSL_13).score;
    const b = calculateSecurityScore('mitienda.pe', ALL_PASS, SSL_12).score;
    assert.equal(a - b, 5);
  }],
  ['Certificado por vencer (< 30 días) resta 5 puntos y avisa', () => {
    const r = calculateSecurityScore('mitienda.pe', ALL_PASS, { ...SSL_13, daysRemaining: 10 });
    assert.equal(r.score, 80);
    assert.ok(r.reasons.some((x) => x.includes('expirar')));
  }],
  ['Cabecera en "warning" puntúa parcial (HSTS 6 en vez de 10)', () => {
    const headers = ALL_PASS.map((h) => (h.header === 'Strict-Transport-Security' ? header(h.header, 'warning', 'max-age=300') : h));
    assert.equal(calculateSecurityScore('mitienda.pe', headers, SSL_13).score, 81);
  }],
  ['El puntaje acepta la URL completa, no solo el dominio', () => {
    const r = calculateSecurityScore('https://mitienda.pe/tienda?x=1', ALL_PASS, SSL_13);
    assert.equal(r.score, 85);
  }],
  ['Una marca global se puntúa por lo medido, sin nota fija', () => {
    const r = calculateSecurityScore('google.com', ALL_MISSING, SSL_13);
    assert.equal(r.score, 45);
    assert.equal(r.grade, 'D');
  }],
  ['Una pyme cuyo dominio contiene "x.com" NO recibe la nota de hiperescalador', () => {
    const r = calculateSecurityScore('relax.com.pe', ALL_MISSING, SSL_13);
    assert.equal(r.score, 45);
    assert.equal(r.grade, 'D');
  }],
  ['isHyperscalePlatform: reconoce marcas reales y sus subdominios', () => {
    for (const d of ['google.com', 'www.google.com.pe', 'https://mail.google.com/mail', 'amazon.com.mx', 'aws.amazon.com', 'x.com', 'api.github.com', 'bcp.com.pe', 'www.interbank.pe']) {
      assert.equal(isHyperscalePlatform(d), true, d);
    }
  }],
  ['isHyperscalePlatform: rechaza parecidos, subcadenas y dominios señuelo', () => {
    for (const d of ['relax.com.pe', 'wix.com', 'fedex.com', 'google.com.mitienda.pe', 'notgoogle.com', 'mibbva.pe', 'amazonas-tours.pe', 'selvaamazon.com.fake.pe', 'google.xyz', 'amazon.top', 'www.google.vip', 'amazon.icu', 'mitienda.pe', '', null, undefined]) {
      assert.equal(isHyperscalePlatform(d), false, String(d));
    }
  }],
  ['Rutas expuestas: las huellas nuevas aciertan con cuerpos reales y no con páginas blandas', () => {
    const by = (p) => ENDPOINT_PROBES.find((x) => x.path === p);
    const positives = {
      '/metrics': '# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.\n# TYPE process_cpu_user_seconds_total counter\n',
      '/api-docs': '{"swagger":"2.0","info":{"title":"B2B API"}}',
      '/swagger-ui.html': '<html><title>Swagger UI</title><div id="swagger-ui"></div>',
      '/swagger/index.html': '<html><div id="swagger-ui"></div>',
      '/debug/pprof/': '<html><head><title>/debug/pprof/</title></head><body>Types of profiles available:',
      '/server-info': '<h1>Apache Server Information</h1>',
      '/.DS_Store': '\u0000\u0000\u0000\u0001Bud1\u0000',
      '/.htpasswd': 'admin:$apr1$abc$def\n',
      '/WEB-INF/web.xml': '<?xml version="1.0"?><web-app>',
      '/actuator': '{"_links":{"self":{"href":"http://x/actuator","templated":false},"health":{}}}',
      '/env': '{"systemProperties":{"java.version":"17"}}',
      '/package.json': '{"name":"app","dependencies":{"express":"4.18.0"}}',
      '/composer.json': '{"require":{"php":">=8.1"}}',
    };
    for (const [path, body] of Object.entries(positives)) {
      assert.ok(by(path), 'falta ' + path);
      assert.ok(by(path).fingerprint.test(body), 'no reconoce ' + path);
    }
    const soft = '<!doctype html><html><head><title>Mi tienda</title></head><body><h1>Página no encontrada</h1><p>El recurso solicitado no existe</p></body></html>';
    for (const p of ENDPOINT_PROBES) assert.equal(p.fingerprint.test(soft), false, 'falso positivo en una página blanda: ' + p.path);
    const paths = ENDPOINT_PROBES.map((p) => p.path);
    assert.equal(new Set(paths).size, paths.length, 'rutas duplicadas');
    for (const p of ENDPOINT_PROBES) assert.ok(!isUnsafeUrl(p.path), 'ruta peligrosa para un GET: ' + p.path);
  }],
  ['Directorios navegables: reconoce Apache, nginx, Python y Express, y no una página normal', () => {
    const listing = ENDPOINT_PROBES.filter((p) => p.label === 'Listado de directorio');
    assert.ok(listing.length >= 20 && listing.every((p) => p.path.endsWith('/')));
    const fp = listing[0].fingerprint;
    for (const title of ['Index of /backup', 'Directory listing for /uploads/', 'listing directory /ftp']) assert.ok(fp.test(`<html><head><title>${title}</title>`), title);
    assert.equal(fp.test('<html><head><title>Mi tienda</title></head><body>Index of products</body></html>'), false);
  }],
  ['probeExposedEndpoints: encuentra lo expuesto y descarta la aplicación que responde a todo', async () => {
    const shell = '<!doctype html><html><head><title>App</title></head><body><app-root></app-root></body></html>';
    const fake = (routes, fallback) => async (url) => {
      const path = new URL(url).pathname;
      const r = routes[path] ?? fallback;
      return r ? { status: 200, body: r } : { status: 404, body: '' };
    };
    // Una SPA responde 200 con su HTML a toda ruta: solo lo que cumple la huella cuenta
    const found = await probeExposedEndpoints('http://x', fake({ '/metrics': '# HELP process_cpu_user_seconds_total x\n# TYPE y counter', '/api-docs/': '<div id="swagger-ui"></div>', '/ftp/': '<title>listing directory /ftp</title>' }, shell));
    assert.deepEqual(found.exposed.map((e) => e.path).sort(), ['/api-docs/', '/ftp/', '/metrics']);
    assert.ok(found.findings.every((f) => f.confidence === 'confirmado' && /accesible: \//.test(f.title)));
    // Si hasta una ruta inexistente devuelve esa misma huella, no hay hallazgo (la app "responde a todo")
    const all = await probeExposedEndpoints('http://x', fake({}, '<div id="swagger-ui"></div>'));
    assert.deepEqual(all.exposed, [], 'una página que cumple la huella en cualquier ruta no es un hallazgo');
    const none = await probeExposedEndpoints('http://x', fake({}, null));
    assert.deepEqual(none.findings, []);
  }],
];

let failed = 0;
console.log('\n  DEFENSA TI · SUITE DEL MOTOR DE PUNTAJE\n');
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (e) {
    failed += 1;
    console.log(`  \x1b[31m✗ ${name}\x1b[0m\n      ${String(e.message).split('\n')[0]}`);
  }
}
console.log(`\n  ${tests.length - failed}/${tests.length} pruebas pasaron.\n`);
process.exit(failed ? 1 : 0);
