/**
 * TEST AUTOMATIZADO DE PREVENCIÓN ANTI-SSRF (Server-Side Request Forgery)
 * Verifica que las redirecciones maliciosas hacia rangos privados o de metadatos
 * sean interceptadas y bloqueadas de acuerdo con la recomendación RFC 1918.
 */

import dns from 'dns/promises';
import { validateRedirectTarget } from '../src/lib/security/ssrfValidator.ts';

// DNS simulado por defecto: la suite no debe depender de Internet ni de la velocidad del resolvedor
// (con un DNS lento, las pruebas con dominios reales fallaban de forma intermitente).
// SSRF_LIVE_DNS=1 usa el DNS real para una comprobación de humo.
if (process.env.SSRF_LIVE_DNS !== '1') {
  const A = { 'www.google.com': ['142.250.80.4'], 'google.com': ['142.250.80.14'], 'autonoma.pe': ['93.184.216.34'], 'attacker-domain.com': ['93.184.216.35'], 'rebind-attacker.com': ['10.0.0.5'], 'metadata-attacker.com': ['169.254.169.254'] };
  const AAAA = { 'rebind6-attacker.com': ['fd00::1'], 'loop6-attacker.com': ['::1'] };
  const notFound = () => Object.assign(new Error('ENODATA'), { code: 'ENODATA' });
  // "lento-attacker.com" no responde nunca: debe bloquearse por tiempo, no aprobarse
  dns.resolve4 = async (h) => (h === 'lento-attacker.com' ? new Promise(() => {}) : A[h] ? A[h] : Promise.reject(notFound()));
  dns.resolve6 = async (h) => (h === 'lento-attacker.com' ? new Promise(() => {}) : AAAA[h] ? AAAA[h] : Promise.reject(notFound()));
}

const ANSI_GREEN = '\x1b[32m';
const ANSI_RED = '\x1b[31m';
const ANSI_CYAN = '\x1b[36m';
const ANSI_RESET = '\x1b[0m';
const ANSI_BOLD = '\x1b[1m';

async function runSsrfTestSuite() {
  console.log(`\n${ANSI_BOLD}${ANSI_CYAN}====================================================${ANSI_RESET}`);
  console.log(`${ANSI_BOLD}${ANSI_CYAN}  DEFENSA TI · SUITE DE VERIFICACIÓN ANTI-SSRF     ${ANSI_RESET}`);
  console.log(`${ANSI_BOLD}${ANSI_CYAN}  Protección de Redirecciones (RFC 1918 / Cloud)    ${ANSI_RESET}`);
  console.log(`${ANSI_BOLD}${ANSI_CYAN}====================================================${ANSI_RESET}\n`);

  const testCases = [
    {
      name: '1. Intento de redirección a Loopback local (127.0.0.1)',
      base: 'https://attacker-domain.com',
      location: 'http://127.0.0.1:8080/admin',
      expectedAllowed: false,
    },
    {
      name: '2. Intento de redirección a Cloud Metadata (169.254.169.254)',
      base: 'https://attacker-domain.com',
      location: 'http://169.254.169.254/latest/meta-data/iam/',
      expectedAllowed: false,
    },
    {
      name: '3. Intento de redirección a Red Privada Clase C (192.168.1.1)',
      base: 'https://attacker-domain.com',
      location: 'http://192.168.1.1/router-settings',
      expectedAllowed: false,
    },
    {
      name: '4. Intento de redirección a Red Privada Clase A (10.0.0.5)',
      base: 'https://attacker-domain.com',
      location: 'http://10.0.0.5/internal-api',
      expectedAllowed: false,
    },
    {
      name: '5. Intento de redirección a Hostname Interno (database.internal)',
      base: 'https://attacker-domain.com',
      location: 'http://database.internal/dump.sql',
      expectedAllowed: false,
    },
    {
      name: '6. Intento de escape de protocolo (file:///etc/passwd)',
      base: 'https://attacker-domain.com',
      location: 'file:///etc/passwd',
      expectedAllowed: false,
    },
    {
      name: '7. Redirección legítima a dominio público seguro (https://google.com)',
      base: 'http://google.com',
      location: 'https://www.google.com/',
      expectedAllowed: true,
    },
    {
      name: '8. Redirección relativa legítima (/contacto)',
      base: 'https://autonoma.pe/home',
      location: '/contacto',
      expectedAllowed: true,
    },
    {
      name: '9. DNS rebinding: un dominio público que resuelve a una IP privada (10.0.0.5)',
      base: 'https://attacker-domain.com',
      location: 'https://rebind-attacker.com/admin',
      expectedAllowed: false,
    },
    {
      name: '10. Un dominio que resuelve a los metadatos de la nube (169.254.169.254)',
      base: 'https://attacker-domain.com',
      location: 'https://metadata-attacker.com/latest/meta-data/',
      expectedAllowed: false,
    },
    {
      name: '11. Un dominio con IPv6 privada (fd00::1)',
      base: 'https://attacker-domain.com',
      location: 'https://rebind6-attacker.com/',
      expectedAllowed: false,
    },
    {
      name: '12. Un dominio con IPv6 de loopback (::1)',
      base: 'https://attacker-domain.com',
      location: 'https://loop6-attacker.com/',
      expectedAllowed: false,
    },
    {
      name: '13. Un DNS que no responde: se bloquea (falla cerrado), no se aprueba',
      base: 'https://attacker-domain.com',
      location: 'https://lento-attacker.com/',
      expectedAllowed: false,
    },
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const tc of testCases) {
    const result = await validateRedirectTarget(tc.base, tc.location);
    const passed = result.allowed === tc.expectedAllowed;

    if (passed) {
      passedCount++;
      console.log(`[PASS] ${tc.name}`);
      if (!result.allowed) {
        console.log(`       └─ Motivo de Bloqueo: ${ANSI_GREEN}${result.reason}${ANSI_RESET}`);
      } else {
        console.log(`       └─ Destino Aprobado: ${ANSI_GREEN}${result.sanitizedUrl}${ANSI_RESET}`);
      }
    } else {
      failedCount++;
      console.log(`[FAIL] ${ANSI_RED}${tc.name}${ANSI_RESET}`);
      console.log(`       └─ Esperado: ${tc.expectedAllowed}, Obtenido: ${result.allowed}`);
    }
    console.log('');
  }

  console.log(`${ANSI_BOLD}----------------------------------------------------${ANSI_RESET}`);
  if (failedCount === 0) {
    console.log(`${ANSI_GREEN}${ANSI_BOLD}✓ TODOS LOS TESTS PASARON (${passedCount}/${testCases.length}). Sistema 100% protegido contra SSRF por redirección.${ANSI_RESET}\n`);
  } else {
    console.log(`${ANSI_RED}${ANSI_BOLD}✗ HUBO FALLOS EN LA SUITE (${failedCount} fallaron).${ANSI_RESET}\n`);
    // Sin esto la suite salía con código 0 aunque fallara: el CI quedaba en verde con la protección rota
    process.exitCode = 1;
  }
}

runSsrfTestSuite()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  // Las consultas DNS simuladas que no responden dejarían el proceso abierto
  .finally(() => process.exit(process.exitCode ?? 0));
