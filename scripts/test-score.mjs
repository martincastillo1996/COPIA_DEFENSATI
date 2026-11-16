/**
 * TEST AUTOMATIZADO DEL MOTOR DE PUNTAJE Y DETECCIÓN DE HIPERESCALADORES
 * Protege la nota que ve el cliente: una regresión aquí cambia el diagnóstico comercial.
 *
 * Ejecutar: npm run test:score
 */
import assert from 'node:assert/strict';
import { calculateSecurityScore } from '../src/lib/scanner/scoreEngine.ts';
import { isHyperscalePlatform } from '../src/lib/hyperscalers.ts';

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
  ['Hiperescalador real obtiene A+ aunque no envíe cabeceras', () => {
    const r = calculateSecurityScore('google.com', ALL_MISSING, SSL_13);
    assert.equal(r.grade, 'A+');
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
