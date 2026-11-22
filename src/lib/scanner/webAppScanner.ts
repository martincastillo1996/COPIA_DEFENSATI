/**
 * Motor de Seguridad de Aplicación Web (DEFENSA TI WebApp v1.0)
 *
 * Pasivo en modo público (solo descarga lo que descargaría un navegador):
 *   - Calidad real de la Content-Security-Policy.
 *   - Scripts/estilos de terceros sin Subresource Integrity (SRI).
 *   - Librerías JavaScript con versiones vulnerables conocidas.
 *   - Secretos y rutas internas dentro del JavaScript propio.
 *   - security.txt (RFC 9116).
 * Activo, solo en modo "full" (auditoría autorizada, peticiones de inspección acotadas):
 *   - Métodos HTTP anunciados (OPTIONS), configuración CORS con orígenes hostiles.
 *   - Source maps accesibles, documentación de API, GraphQL, Actuator, paneles y depuradores.
 *
 * No se envían cargas de explotación, no se prueban credenciales y no se modifican datos.
 */

import { safeHttpGet, SafeHttpResult } from '@/lib/security/safeNet';
import { ScanFinding, sortFindings, redact } from '@/lib/scanner/findingTypes';

export interface JsLibraryFinding {
  name: string;
  version: string;
  vulnerable: boolean;
  advice: string;
  cves: string[];
  source: string;
}

export interface WebAppResult {
  csp: { present: boolean; reportOnly: boolean; weaknesses: string[] };
  thirdParty: { origins: string[]; scriptsWithoutSri: number };
  libraries: JsLibraryFinding[];
  secretsFound: number;
  securityTxt: { present: boolean; expired?: boolean };
  active?: {
    allowedMethods: string[];
    cors: { reflectsOrigin: boolean; allowsCredentials: boolean; allowsNull: boolean };
    exposedEndpoints: Array<{ path: string; label: string }>;
    sourceMaps: string[];
  };
  /** Resumen de Nuclei (solo modo full, si el binario está instalado). */
  nuclei?: { available: boolean; ran: boolean; complete?: boolean; durationMs: number; templatesMatched: number };
  findings: ScanFinding[];
  mode: 'public' | 'full';
  generatedAt: string;
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 DefensaTI-Audit/2.0';
const BASE_HEADERS = { 'User-Agent': UA, Accept: '*/*', 'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8' };

async function get(url: string, extra: { maxBytes?: number; headers?: Record<string, string>; method?: 'GET' | 'HEAD' | 'OPTIONS'; timeoutMs?: number } = {}): Promise<SafeHttpResult | null> {
  try {
    return await safeHttpGet(url, {
      headers: { ...BASE_HEADERS, ...(extra.headers || {}) },
      timeoutMs: extra.timeoutMs ?? 4500,
      maxBytes: extra.maxBytes ?? 200_000,
      maxRedirects: 2,
      method: extra.method,
    });
  } catch {
    return null;
  }
}

// ─────────────────────────── CSP ───────────────────────────

export function analyzeCsp(value: string | undefined, reportOnly: boolean): string[] {
  const issues: string[] = [];
  if (!value) return issues;
  const dirs = new Map<string, string[]>();
  for (const part of value.split(';')) {
    const toks = part.trim().split(/\s+/).filter(Boolean);
    if (toks.length) dirs.set(toks[0].toLowerCase(), toks.slice(1).map((t) => t.toLowerCase()));
  }
  const eff = (name: string) => dirs.get(name) ?? dirs.get('default-src');
  const script = eff('script-src');

  if (reportOnly) issues.push('La política está en modo "Report-Only": solo informa, no bloquea nada.');
  if (script) {
    if (script.includes("'unsafe-inline'") && !script.some((t) => t.startsWith("'nonce-") || t.startsWith("'sha"))) {
      issues.push("script-src permite 'unsafe-inline': un XSS inyectado se ejecuta sin restricción.");
    }
    if (script.includes("'unsafe-eval'")) issues.push("script-src permite 'unsafe-eval': habilita eval() y facilita la ejecución de código inyectado.");
    if (script.includes('*')) issues.push('script-src usa comodín (*): cualquier origen puede servir scripts.');
    if (script.includes('data:')) issues.push('script-src permite data: URIs: vector clásico para evadir la política.');
    if (script.includes('http:')) issues.push('script-src permite http: en claro: un intermediario puede sustituir los scripts.');
    if (script.some((t) => /^https:\/\/\*\.(googleapis|cloudfront|amazonaws|azureedge|herokuapp|firebaseapp|appspot)\./.test(t) || t === 'https:')) {
      issues.push('script-src autoriza un dominio compartido o esquema completo (https:): cualquier cuenta en esa plataforma puede alojar un script permitido.');
    }
  } else {
    issues.push('No restringe script-src ni default-src: la política no protege contra XSS.');
  }
  if (!dirs.has('object-src') && !dirs.has('default-src')) issues.push("Falta object-src 'none': permite plugins y objetos incrustados.");
  if (!dirs.has('base-uri')) issues.push("Falta base-uri: un atacante puede cambiar la URL base y secuestrar rutas relativas.");
  if (!dirs.has('frame-ancestors')) issues.push('Falta frame-ancestors: no protege contra clickjacking (X-Frame-Options sigue siendo necesario).');
  return issues;
}

// ─────────────────────────── Librerías JS vulnerables ───────────────────────────

interface LibRule {
  name: string;
  match: RegExp;
  /** Devuelve null si la versión está bien, o el aviso si es vulnerable. */
  check: (v: string) => { advice: string; cves: string[] } | null;
}

function vnum(v: string): number[] {
  return v.split('.').map((n) => parseInt(n, 10) || 0);
}
function vlt(a: string, b: string): boolean {
  const x = vnum(a);
  const y = vnum(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d !== 0) return d < 0;
  }
  return false;
}

const LIB_RULES: LibRule[] = [
  {
    name: 'jQuery',
    match: /jquery(?:\.min)?(?:[-@/]|\/)v?(\d+\.\d+(?:\.\d+)?)(?:\.min)?(?:\.js|\/|$)/i,
    check: (v) => (vlt(v, '3.5.0') ? { advice: 'Actualizar a jQuery 3.7.x. Las versiones anteriores a 3.5.0 permiten XSS al procesar HTML no confiable (htmlPrefilter) y las anteriores a 3.4.0 contaminación de prototipos.', cves: ['CVE-2020-11022', 'CVE-2020-11023', 'CVE-2019-11358'] } : null),
  },
  {
    name: 'jQuery UI',
    match: /jquery-?ui(?:\.min)?[-@/]v?(\d+\.\d+(?:\.\d+)?)/i,
    check: (v) => (vlt(v, '1.13.2') ? { advice: 'Actualizar jQuery UI a 1.13.2 o superior (XSS en varios componentes: datepicker, dialog, tooltip).', cves: ['CVE-2021-41184', 'CVE-2022-31160'] } : null),
  },
  {
    name: 'Bootstrap',
    match: /bootstrap(?:\.min|\.bundle(?:\.min)?)?[-@/]v?(\d+\.\d+(?:\.\d+)?)/i,
    check: (v) => (vlt(v, '3.4.1') || (!vlt(v, '4.0.0') && vlt(v, '4.3.1')) ? { advice: 'Actualizar Bootstrap a 3.4.1/4.3.1 o superior (XSS en tooltip y popover).', cves: ['CVE-2019-8331'] } : vlt(v, '4.0.0') ? { advice: 'Bootstrap 3 está fuera de soporte: migrar a la rama 5.x.', cves: [] } : null),
  },
  {
    name: 'Lodash',
    match: /lodash(?:\.min|\.core)?[-@/]v?(\d+\.\d+(?:\.\d+)?)/i,
    check: (v) => (vlt(v, '4.17.21') ? { advice: 'Actualizar Lodash a 4.17.21 (contaminación de prototipos e inyección de comandos en plantillas).', cves: ['CVE-2021-23337', 'CVE-2020-8203', 'CVE-2019-10744'] } : null),
  },
  {
    name: 'Moment.js',
    match: /moment(?:\.min)?[-@/]v?(\d+\.\d+(?:\.\d+)?)/i,
    check: (v) => (vlt(v, '2.29.4') ? { advice: 'Actualizar Moment.js a 2.29.4 (ReDoS y path traversal). El proyecto está en modo mantenimiento: valorar Luxon o date-fns.', cves: ['CVE-2022-31129', 'CVE-2022-24785'] } : null),
  },
  {
    name: 'AngularJS',
    match: /angular(?:\.min)?[-@/]v?(1\.\d+(?:\.\d+)?)/i,
    check: () => ({ advice: 'AngularJS 1.x terminó su soporte en diciembre de 2021 y acumula vulnerabilidades sin parche (XSS por plantillas, escape del sandbox). Migrar a Angular moderno.', cves: [] }),
  },
  {
    name: 'Vue 2',
    match: /vue(?:\.min|\.runtime(?:\.min)?)?[-@/]v?(2\.\d+(?:\.\d+)?)/i,
    check: () => ({ advice: 'Vue 2 terminó su soporte el 31-dic-2023 y ya no recibe parches de seguridad. Migrar a Vue 3.', cves: [] }),
  },
];

function detectLibraries(srcUrls: string[]): JsLibraryFinding[] {
  const out: JsLibraryFinding[] = [];
  const seen = new Set<string>();
  for (const url of srcUrls) {
    const path = url.split('?')[0];
    for (const rule of LIB_RULES) {
      const m = path.match(rule.match);
      if (!m) continue;
      const key = `${rule.name}@${m[1]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const verdict = rule.check(m[1]);
      out.push({ name: rule.name, version: m[1], vulnerable: Boolean(verdict), advice: verdict?.advice || 'Versión sin vulnerabilidades conocidas en la base local.', cves: verdict?.cves || [], source: url.slice(0, 120) });
    }
  }
  return out;
}

// ─────────────────────────── Secretos en JS ───────────────────────────

const SECRET_PATTERNS: Array<{ id: string; label: string; re: RegExp; severity: 'CRÍTICO' | 'ALTO' | 'MEDIO'; note: string }> = [
  { id: 'aws-key', label: 'Clave de acceso de AWS', re: /\bAKIA[0-9A-Z]{16}\b/g, severity: 'CRÍTICO', note: 'Con la clave secreta asociada da acceso a la cuenta de AWS.' },
  { id: 'private-key', label: 'Clave privada criptográfica', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g, severity: 'CRÍTICO', note: 'Permite suplantar al servidor o descifrar comunicaciones.' },
  { id: 'stripe-secret', label: 'Clave secreta de Stripe (live)', re: /\b(?:sk|rk)_live_[0-9a-zA-Z]{20,}\b/g, severity: 'CRÍTICO', note: 'Permite cobrar, reembolsar y leer datos de clientes.' },
  { id: 'github-token', label: 'Token de GitHub', re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g, severity: 'CRÍTICO', note: 'Da acceso a repositorios privados según sus permisos.' },
  { id: 'slack-token', label: 'Token de Slack', re: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/g, severity: 'ALTO', note: 'Permite leer o publicar mensajes en el espacio de trabajo.' },
  { id: 'google-api', label: 'Clave de API de Google', re: /\bAIza[0-9A-Za-z_-]{35}\b/g, severity: 'MEDIO', note: 'Verifique que esté restringida por dominio/API: sin restricción se usa para consumir cuota facturable.' },
  { id: 'sendgrid', label: 'Clave de SendGrid', re: /\bSG\.[0-9A-Za-z_-]{16,}\.[0-9A-Za-z_-]{16,}\b/g, severity: 'ALTO', note: 'Permite enviar correo suplantando al dominio.' },
];
const PRIVATE_URL_RE = /https?:\/\/(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|[a-z0-9-]+\.(?:internal|corp|local|intranet|lan))(?::\d+)?[^\s"'`)]*/gi;

// ─────────────────────────── Sondeos activos (full) ───────────────────────────

interface EndpointProbe {
  path: string;
  label: string;
  severity: 'CRÍTICO' | 'ALTO' | 'MEDIO' | 'BAJO';
  /** La huella evita falsos positivos por páginas 200 "blandas". */
  fingerprint: RegExp;
  attack: string;
  fix: string;
}

// Apache y nginx ("Index of"), Python ("Directory listing for") y Express serve-index ("listing directory")
const LISTING_FP = /<title>\s*(?:Index of \/|Directory listing for \/|listing directory \/)/i;

export const ENDPOINT_PROBES: EndpointProbe[] = [
  { path: '/swagger.json', label: 'Swagger/OpenAPI', severity: 'MEDIO', fingerprint: /"swagger"\s*:|"openapi"\s*:/i, attack: 'La especificación completa de la API (rutas, parámetros, modelos) acelera el reconocimiento: el atacante prueba cada endpoint en busca de BOLA/IDOR y falta de autenticación.', fix: 'No publicar la documentación en producción o protegerla con autenticación.' },
  { path: '/openapi.json', label: 'OpenAPI', severity: 'MEDIO', fingerprint: /"openapi"\s*:/i, attack: 'Revela el mapa completo de la API para encontrar endpoints sin autenticación.', fix: 'Restringir la documentación a redes internas o usuarios autenticados.' },
  { path: '/v3/api-docs', label: 'Spring OpenAPI docs', severity: 'MEDIO', fingerprint: /"openapi"\s*:|"paths"\s*:/i, attack: 'Expone el mapa de la API de Spring Boot.', fix: 'Deshabilitar springdoc en producción (springdoc.api-docs.enabled=false).' },
  { path: '/swagger-ui/index.html', label: 'Swagger UI', severity: 'MEDIO', fingerprint: /swagger-ui/i, attack: 'La consola interactiva permite probar la API desde el navegador sin herramientas adicionales.', fix: 'Deshabilitar Swagger UI en producción.' },
  { path: '/graphql?query=%7B__typename%7D', label: 'GraphQL expuesto', severity: 'MEDIO', fingerprint: /"__typename"|"data"\s*:\s*\{/i, attack: 'Un endpoint GraphQL público con introspección permite descargar el esquema completo y consultar relaciones entre datos.', fix: 'Deshabilitar la introspección en producción, limitar profundidad/complejidad de consultas y exigir autenticación.' },
  { path: '/actuator/env', label: 'Spring Actuator /env', severity: 'CRÍTICO', fingerprint: /"propertySources"|"activeProfiles"/i, attack: 'Expone variables de entorno y propiedades de la aplicación, a menudo con credenciales de bases de datos y claves de API.', fix: 'Restringir Actuator a la red de gestión: management.endpoints.web.exposure.include=health,info y autenticación.' },
  { path: '/actuator/heapdump', label: 'Spring Actuator /heapdump', severity: 'CRÍTICO', fingerprint: /JAVA PROFILE|HPROF/i, attack: 'El volcado de memoria contiene contraseñas, tokens de sesión y datos de usuarios en claro.', fix: 'Deshabilitar el endpoint heapdump y proteger Actuator.' },
  { path: '/actuator/mappings', label: 'Spring Actuator /mappings', severity: 'ALTO', fingerprint: /"dispatcherServlet"|"handlerMappings"/i, attack: 'Lista todas las rutas internas de la aplicación.', fix: 'Restringir Actuator.' },
  { path: '/server-status', label: 'Apache server-status', severity: 'MEDIO', fingerprint: /Apache Server Status|Server Version:/i, attack: 'Muestra peticiones en curso con URLs, IP de clientes y, a veces, tokens en la query string.', fix: 'Restringir /server-status a 127.0.0.1 o eliminarlo.' },
  { path: '/phpinfo.php', label: 'phpinfo()', severity: 'ALTO', fingerprint: /phpinfo\(\)|PHP Version|php\.ini/i, attack: 'Revela versión exacta, módulos, rutas del servidor y variables de entorno.', fix: 'Eliminar el archivo phpinfo.' },
  { path: '/phpmyadmin/', label: 'phpMyAdmin', severity: 'ALTO', fingerprint: /phpMyAdmin/i, attack: 'Panel de administración de bases de datos expuesto: objetivo de fuerza bruta, credenciales reutilizadas y CVE históricos.', fix: 'Retirar de Internet o restringir por IP/VPN y MFA.' },
  { path: '/adminer.php', label: 'Adminer', severity: 'ALTO', fingerprint: /Adminer/i, attack: 'Cliente de base de datos en un solo archivo, usado en ataques tras una intrusión inicial.', fix: 'Eliminar el archivo del servidor de producción.' },
  { path: '/manager/html', label: 'Tomcat Manager', severity: 'ALTO', fingerprint: /Tomcat Web Application Manager|401 Unauthorized/i, attack: 'Un Tomcat Manager accesible permite desplegar WAR maliciosos con credenciales débiles o por defecto.', fix: 'Restringir por IP y eliminar el manager de producción.' },
  { path: '/console', label: 'Consola de depuración (Werkzeug/Spring)', severity: 'CRÍTICO', fingerprint: /Werkzeug|Interactive Console|console\.js/i, attack: 'La consola de depuración ejecuta código en el servidor: es ejecución remota directa.', fix: 'Desactivar el modo debug (FLASK_DEBUG=0) en producción.' },
  { path: '/_profiler/', label: 'Symfony Profiler', severity: 'ALTO', fingerprint: /Symfony Profiler|sf-toolbar/i, attack: 'Expone consultas SQL, variables de entorno y configuración.', fix: 'Deshabilitar el perfilador fuera de desarrollo (APP_ENV=prod).' },
  { path: '/telescope', label: 'Laravel Telescope', severity: 'ALTO', fingerprint: /Laravel Telescope/i, attack: 'Registra peticiones, consultas, correos y excepciones con datos reales.', fix: 'Restringir Telescope con autorización o desactivarlo en producción.' },
  { path: '/elmah.axd', label: 'ELMAH (errores .NET)', severity: 'ALTO', fingerprint: /Error Log for|ELMAH/i, attack: 'El registro de errores filtra trazas, rutas, cadenas de conexión y cookies de sesión.', fix: 'Proteger elmah.axd con autenticación o eliminarlo.' },
  { path: '/trace.axd', label: 'ASP.NET Trace', severity: 'ALTO', fingerprint: /Application Trace|Request Details/i, attack: 'Muestra el rastro de peticiones, cabeceras y datos de sesión.', fix: 'Deshabilitar trace en web.config.' },
  { path: '/wp-json/wp/v2/users', label: 'WordPress: enumeración de usuarios', severity: 'MEDIO', fingerprint: /"slug"\s*:|"link"\s*:\s*"[^"]*author/i, attack: 'La API lista los nombres de usuario reales, que se usan luego en fuerza bruta y relleno de credenciales contra wp-login.', fix: 'Restringir /wp-json/wp/v2/users a usuarios autenticados y limitar intentos de login.' },
  { path: '/.well-known/openid-configuration', label: 'OpenID Connect (informativo)', severity: 'BAJO', fingerprint: /"issuer"\s*:/i, attack: 'Documento público por diseño; revela endpoints de autenticación. Útil para ubicar el proveedor de identidad.', fix: 'Sin acción si es intencional; verificar que el proveedor esté actualizado y con MFA.' },
  { path: '/metrics', label: 'Métricas Prometheus', severity: 'MEDIO', fingerprint: /^# (?:HELP|TYPE) |process_cpu_(?:user_)?seconds_total|nodejs_(?:heap|version)/m, attack: 'Revela versión del entorno, uso de memoria, rutas y volumen de tráfico: un mapa para planear un ataque y para medir su efecto.', fix: 'Servir /metrics solo en una interfaz interna o con autenticación.' },
  { path: '/api-docs', label: 'Documentación de API (Swagger/OpenAPI)', severity: 'MEDIO', fingerprint: /"swagger"\s*:|"openapi"\s*:|swagger-ui/i, attack: 'La especificación completa de la API acelera el reconocimiento: el atacante prueba cada ruta en busca de BOLA/IDOR y de falta de autenticación.', fix: 'No publicar la documentación en producción o protegerla con autenticación.' },
  { path: '/api-docs/', label: 'Documentación de API (Swagger/OpenAPI)', severity: 'MEDIO', fingerprint: /"swagger"\s*:|"openapi"\s*:|swagger-ui/i, attack: 'La especificación completa de la API acelera el reconocimiento: el atacante prueba cada ruta en busca de BOLA/IDOR y de falta de autenticación.', fix: 'No publicar la documentación en producción o protegerla con autenticación.' },
  { path: '/swagger-ui.html', label: 'Swagger UI', severity: 'MEDIO', fingerprint: /swagger-ui/i, attack: 'La consola interactiva permite probar la API desde el navegador sin herramientas.', fix: 'Retirarla de producción o exigir autenticación.' },
  { path: '/swagger/index.html', label: 'Swagger UI', severity: 'MEDIO', fingerprint: /swagger-ui/i, attack: 'La consola interactiva permite probar la API desde el navegador sin herramientas.', fix: 'Retirarla de producción o exigir autenticación.' },
  { path: '/debug/pprof/', label: 'Perfilador Go (pprof)', severity: 'ALTO', fingerprint: /Types of profiles available|<title>\/debug\/pprof\//i, attack: 'Expone volcados de memoria y trazas de ejecución que contienen secretos y permiten agotar el servidor.', fix: 'No exponer /debug/pprof fuera de localhost.' },
  { path: '/server-info', label: 'Apache server-info', severity: 'MEDIO', fingerprint: /Apache Server Information|Server Settings/i, attack: 'Revela módulos, rutas y la configuración completa del servidor.', fix: 'Deshabilitar mod_info o restringirlo a localhost.' },
  { path: '/.DS_Store', label: 'Archivo .DS_Store de macOS', severity: 'BAJO', fingerprint: /Bud1/, attack: 'Lista los nombres de archivos y carpetas del directorio, incluidos los que no están enlazados.', fix: 'Eliminar los .DS_Store del servidor y bloquearlos en el servidor web.' },
  { path: '/.htpasswd', label: 'Archivo .htpasswd', severity: 'CRÍTICO', fingerprint: /^[\w.@-]+:(?:\$apr1\$|\$2[aby]\$|\{SHA\}|[./\w]{13})/m, attack: 'Contiene usuarios y hashes de contraseña que se descifran sin conexión.', fix: 'Retirarlo del directorio público y rotar esas contraseñas.' },
  { path: '/WEB-INF/web.xml', label: 'WEB-INF/web.xml', severity: 'ALTO', fingerprint: /<web-app/i, attack: 'Revela la configuración interna de la aplicación Java: rutas, filtros y a veces credenciales.', fix: 'Bloquear el acceso a WEB-INF en el servidor.' },
  { path: '/actuator', label: 'Spring Actuator (índice)', severity: 'MEDIO', fingerprint: /"_links"\s*:\s*\{[^}]*"self"/, attack: 'El índice anuncia los endpoints de gestión disponibles, varios de los cuales exponen entorno y volcados.', fix: 'Exponer solo /health y proteger el resto.' },
  { path: '/env', label: 'Spring Boot /env', severity: 'ALTO', fingerprint: /"systemProperties"|"propertySources"/, attack: 'Expone propiedades del sistema y de la aplicación, a veces con credenciales.', fix: 'Deshabilitar el endpoint o protegerlo.' },
  { path: '/package.json', label: 'package.json', severity: 'MEDIO', fingerprint: /"(?:dev)?[dD]ependencies"\s*:/, attack: 'Revela las dependencias y sus versiones exactas: el atacante busca CVE para cada una.', fix: 'No publicar el directorio del proyecto; servir solo los archivos compilados.' },
  { path: '/composer.json', label: 'composer.json', severity: 'MEDIO', fingerprint: /"require"\s*:\s*\{/, attack: 'Revela las dependencias PHP y sus versiones.', fix: 'Mantener vendor y composer.json fuera de la raíz pública.' },
  { path: '/backup/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/backups/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/uploads/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/files/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/logs/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/log/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/old/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/tmp/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/temp/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/private/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/keys/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/config/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/conf/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/data/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/db/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/dump/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/ftp/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/dev/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/test/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/src/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/include/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
  { path: '/includes/', label: 'Listado de directorio', severity: 'MEDIO', fingerprint: LISTING_FP, attack: 'Un directorio navegable muestra todos sus archivos, incluidas copias de seguridad, registros y configuraciones que nadie enlazó.', fix: 'Desactivar el listado (autoindex off en nginx, Options -Indexes en Apache) y no dejar archivos sensibles en la raíz pública.' },
];

export type ProbeFetch = (url: string, opts: { maxBytes: number; timeoutMs: number }) => Promise<{ status: number; body: string } | null | undefined>;

/**
 * Sondea las rutas expuestas conocidas. Una huella evita los falsos positivos y se descarta la ruta si una
 * página inexistente ya responde 200 con esa misma huella (aplicaciones que "responden a todo").
 * `fetcher` se inyecta para poder probarlo y para medirlo contra un laboratorio local.
 */
export async function probeExposedEndpoints(
  origin: string,
  fetcher: ProbeFetch,
  probes: EndpointProbe[] = ENDPOINT_PROBES
): Promise<{ exposed: Array<{ path: string; label: string }>; findings: ScanFinding[] }> {
  const findings: ScanFinding[] = [];
  const baseline = await fetcher(origin + `/zz-defensati-${Math.random().toString(36).slice(2, 8)}`, { maxBytes: 3000, timeoutMs: 4000 });
  const baselineSoft200 = baseline?.status === 200;
  const exposed: Array<{ path: string; label: string }> = [];
  let idx = 0;
  const workers = Array.from({ length: 4 }, async () => {
    while (true) {
      const p = probes[idx++];
      if (!p) return;
      const r = await fetcher(origin + p.path, { maxBytes: 6000, timeoutMs: 3500 });
      if (!r || r.status !== 200) continue;
      if (!p.fingerprint.test(r.body) && !(p.path.endsWith('heapdump') && /JAVA PROFILE/.test(r.body))) continue;
      // Descarta una página blanda que casualmente cumple la huella con baseline idéntico
      if (baselineSoft200 && baseline && p.fingerprint.test(baseline.body)) continue;
      exposed.push({ path: p.path.split('?')[0], label: p.label });
      findings.push({
        id: `api-${p.path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`,
        category: 'api',
        title: `${p.label} accesible: ${p.path.split('?')[0]}`,
        severity: p.severity,
        confidence: 'confirmado',
        attackVector: p.attack,
        mitigation: p.fix,
        evidence: `GET ${p.path.split('?')[0]} → HTTP 200 con huella de ${p.label}`,
      });
    }
  });
  await Promise.all(workers);
  return { exposed, findings };
}

async function activeChecks(origin: string, html: string, jsUrls: string[]): Promise<{ result: NonNullable<WebAppResult['active']>; findings: ScanFinding[] }> {
  const findings: ScanFinding[] = [];

  // Métodos HTTP anunciados
  const opt = await get(origin + '/', { method: 'OPTIONS', maxBytes: 0, timeoutMs: 4000 });
  const allowHeader = opt?.headers.get('allow') || opt?.headers.get('access-control-allow-methods') || '';
  const allowedMethods = allowHeader.split(',').map((m) => m.trim().toUpperCase()).filter(Boolean);
  const dangerous = allowedMethods.filter((m) => ['TRACE', 'TRACK', 'PUT', 'DELETE', 'CONNECT', 'PATCH'].includes(m));
  const verbose = dangerous.filter((m) => ['TRACE', 'TRACK', 'PUT', 'DELETE', 'CONNECT'].includes(m));
  if (verbose.length > 0) {
    findings.push({
      id: 'web-http-methods',
      category: 'webapp',
      title: `Métodos HTTP peligrosos anunciados: ${verbose.join(', ')}`,
      severity: verbose.includes('PUT') || verbose.includes('DELETE') ? 'ALTO' : 'MEDIO',
      confidence: 'probable',
      attackVector: 'TRACE permite el robo de cabeceras y cookies mediante Cross-Site Tracing; PUT y DELETE sin control permiten subir o borrar archivos en el servidor.',
      mitigation: 'Limitar los métodos a GET, HEAD y POST (Apache: "TraceEnable off" y <LimitExcept>; nginx: "limit_except"), y confirmar con una prueba funcional.',
      evidence: `Allow: ${allowHeader}`,
    });
  }

  // CORS con orígenes hostiles
  const evil = 'https://evil.defensati-test.example';
  const [corsEvil, corsNull] = await Promise.all([
    get(origin + '/', { headers: { Origin: evil }, maxBytes: 0, timeoutMs: 4000 }),
    get(origin + '/', { headers: { Origin: 'null' }, maxBytes: 0, timeoutMs: 4000 }),
  ]);
  const acao = corsEvil?.headers.get('access-control-allow-origin') || '';
  const acac = (corsEvil?.headers.get('access-control-allow-credentials') || '').toLowerCase() === 'true';
  const acaoNull = corsNull?.headers.get('access-control-allow-origin') === 'null';
  const reflects = acao === evil;
  const cors = { reflectsOrigin: reflects, allowsCredentials: acac, allowsNull: acaoNull };
  if (reflects && acac) {
    findings.push({
      id: 'web-cors-reflect-creds',
      category: 'webapp',
      title: 'CORS refleja cualquier origen y permite credenciales',
      severity: 'CRÍTICO',
      confidence: 'confirmado',
      attackVector: 'Cualquier página maliciosa que visite un usuario autenticado puede leer respuestas de tu aplicación con su sesión (datos personales, saldos, tokens) desde el navegador de la víctima.',
      mitigation: 'Sustituir la reflexión por una lista blanca estricta de orígenes y no combinar Access-Control-Allow-Credentials con orígenes dinámicos.',
      evidence: `Origin: ${evil} → Access-Control-Allow-Origin: ${acao}; Allow-Credentials: true`,
    });
  } else if (reflects || (acaoNull && acac)) {
    findings.push({
      id: 'web-cors-permissive',
      category: 'webapp',
      title: reflects ? 'CORS refleja orígenes arbitrarios' : 'CORS acepta el origen "null" con credenciales',
      severity: acaoNull && acac ? 'ALTO' : 'MEDIO',
      confidence: 'confirmado',
      attackVector: 'Una política CORS demasiado permisiva permite que sitios de terceros lean respuestas de tu API; combinada con cookies o tokens se convierte en robo de datos entre sitios. El origen "null" puede generarse desde iframes con sandbox.',
      mitigation: 'Usar una lista blanca explícita de orígenes y no aceptar "null".',
      evidence: `Access-Control-Allow-Origin: ${acao || 'null'}`,
    });
  }

  // Source maps accesibles
  const sourceMaps: string[] = [];
  const mapRefs = new Set<string>();
  for (const u of jsUrls.slice(0, 4)) {
    const js = await get(u, { maxBytes: 250_000, timeoutMs: 4000 });
    const m = js?.body.match(/\/\/[#@]\s*sourceMappingURL=([^\s]+)/);
    if (m && !m[1].startsWith('data:')) {
      try {
        mapRefs.add(new URL(m[1], u).toString());
      } catch {
        // URL inválida
      }
    }
  }
  for (const mu of [...mapRefs].slice(0, 3)) {
    const r = await get(mu, { maxBytes: 4000, timeoutMs: 4000 });
    if (r && r.status === 200 && /"sources"\s*:|"mappings"\s*:|"version"\s*:\s*3/.test(r.body)) sourceMaps.push(mu);
  }
  if (sourceMaps.length > 0) {
    findings.push({
      id: 'web-sourcemaps',
      category: 'webapp',
      title: 'Source maps accesibles públicamente',
      severity: 'MEDIO',
      confidence: 'confirmado',
      attackVector: 'Los source maps reconstruyen el código fuente original (comentarios, rutas de API, lógica de validación). El atacante audita tu aplicación como si tuviera el repositorio.',
      mitigation: 'No publicar los archivos .map en producción (productionSourceMap: false / devtool: false) o subirlos solo a la herramienta de errores.',
      evidence: sourceMaps.slice(0, 2).map((s) => s.slice(0, 100)).join(' | '),
    });
  }

  // Endpoints sensibles con huella
  const probed = await probeExposedEndpoints(origin, (url, opts) => get(url, opts));
  const exposedEndpoints = probed.exposed;
  findings.push(...probed.findings);

  void html;
  return { result: { allowedMethods, cors, exposedEndpoints, sourceMaps }, findings };
}

// ─────────────────────────── Motor ───────────────────────────

export async function scanWebApp(
  targetUrl: string,
  opts: { mode: 'public' | 'full'; isPremium?: boolean; rawHeaders?: Record<string, string> }
): Promise<WebAppResult> {
  const findings: ScanFinding[] = [];
  const origin = new URL(targetUrl).origin;
  const hdr = opts.rawHeaders || {};

  // CSP
  const cspEnforced = hdr['content-security-policy'];
  const cspReport = hdr['content-security-policy-report-only'];
  const cspValue = cspEnforced || cspReport;
  const weaknesses = analyzeCsp(cspValue, !cspEnforced && Boolean(cspReport));
  if (cspValue && weaknesses.length > 0) {
    const serious = weaknesses.some((w) => /unsafe-inline|comodín|unsafe-eval|no protege contra XSS|Report-Only|data:/.test(w));
    findings.push({
      id: 'web-csp-weak',
      category: 'webapp',
      title: `Content-Security-Policy débil (${weaknesses.length} problema${weaknesses.length > 1 ? 's' : ''})`,
      severity: serious ? 'MEDIO' : 'BAJO',
      confidence: 'confirmado',
      attackVector: 'Una CSP con estas debilidades existe pero no detiene un XSS: el atacante que logre inyectar un script lo ejecutará igualmente y podrá robar sesiones o datos de formularios.',
      mitigation: "Eliminar 'unsafe-inline'/'unsafe-eval' usando nonces o hashes, listar orígenes concretos, añadir object-src 'none', base-uri 'self' y frame-ancestors, y pasar de Report-Only a modo de bloqueo.",
      evidence: weaknesses.slice(0, 4).join(' · '),
    });
  }

  // Portada
  const home = await get(targetUrl, { maxBytes: 350_000 });
  const html = home?.body || '';
  const baseForRel = home?.finalUrl || targetUrl;
  const tags = [...html.matchAll(/<script\b[^>]*>/gi)].map((m) => m[0]);
  const linkTags = [...html.matchAll(/<link\b[^>]*rel=["']?stylesheet[^>]*>/gi)].map((m) => m[0]);
  const srcOf = (tag: string, attr: 'src' | 'href') => tag.match(new RegExp(`${attr}=["']?([^"'\\s>]+)`, 'i'))?.[1];

  const scriptUrls: string[] = [];
  const thirdPartyOrigins = new Set<string>();
  let withoutSri = 0;
  let host: string;
  try {
    host = new URL(baseForRel).hostname.replace(/^www\./, '');
  } catch {
    host = new URL(origin).hostname.replace(/^www\./, '');
  }
  const consider = (tag: string, attr: 'src' | 'href') => {
    const raw = srcOf(tag, attr);
    if (!raw) return;
    let abs: URL;
    try {
      abs = new URL(raw, baseForRel);
    } catch {
      return;
    }
    if (!/^https?:$/.test(abs.protocol)) return;
    scriptUrls.push(abs.toString());
    const h = abs.hostname.toLowerCase();
    const sameSite = h === host || h.endsWith(`.${host}`) || h === `www.${host}`;
    if (!sameSite) {
      thirdPartyOrigins.add(abs.origin);
      if (!/\sintegrity=/i.test(tag)) withoutSri++;
    }
  };
  tags.forEach((t) => consider(t, 'src'));
  linkTags.forEach((t) => consider(t, 'href'));

  if (withoutSri > 0) {
    findings.push({
      id: 'web-no-sri',
      category: 'webapp',
      title: `${withoutSri} recurso(s) de terceros sin Subresource Integrity (SRI)`,
      severity: withoutSri >= 4 ? 'MEDIO' : 'BAJO',
      confidence: 'confirmado',
      attackVector: 'Si el CDN o el proveedor de un script externo es comprometido, el atacante modifica ese archivo y ataca a todos tus visitantes (robo de tarjetas tipo Magecart, redirecciones, malware). Es el ataque a la cadena de suministro web más frecuente.',
      mitigation: 'Añadir integrity="sha384-…" y crossorigin="anonymous" a cada script/estilo externo, o alojarlos localmente. En páginas de pago, PCI-DSS 4.0 (6.4.3) exige un inventario y control de cada script.',
      evidence: [...thirdPartyOrigins].slice(0, 6).join(', '),
    });
  }

  // Librerías
  const libraries = detectLibraries(scriptUrls);
  for (const lib of libraries.filter((l) => l.vulnerable)) {
    findings.push({
      id: `web-lib-${lib.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${lib.version}`,
      category: 'webapp',
      title: `${lib.name} ${lib.version} con vulnerabilidades conocidas${lib.cves.length ? ` (${lib.cves.slice(0, 3).join(', ')})` : ' / sin soporte'}`,
      severity: lib.cves.some((c) => /10744|23337|8203/.test(c)) || lib.name === 'AngularJS' ? 'ALTO' : 'MEDIO',
      confidence: 'confirmado',
      attackVector: 'El atacante identifica la versión por el nombre del archivo y aplica la técnica pública de esa vulnerabilidad: XSS contra tus usuarios, contaminación de prototipos para evadir controles o denegación de servicio.',
      mitigation: lib.advice,
      evidence: lib.source,
    });
  }

  // Secretos en JS propio
  const firstParty = scriptUrls.filter((u) => {
    try {
      const h = new URL(u).hostname;
      return h === host || h.endsWith(`.${host}`);
    } catch {
      return false;
    }
  });
  const bodies: Array<{ url: string; body: string }> = [{ url: baseForRel, body: html }];
  for (const u of firstParty.slice(0, 5)) {
    const r = await get(u, { maxBytes: 300_000, timeoutMs: 4000 });
    if (r && r.status === 200) bodies.push({ url: u, body: r.body });
  }
  let secretsFound = 0;
  const seenSecret = new Set<string>();
  for (const { url, body } of bodies) {
    for (const p of SECRET_PATTERNS) {
      for (const m of body.matchAll(p.re)) {
        const key = `${p.id}:${m[0]}`;
        if (seenSecret.has(key)) continue;
        seenSecret.add(key);
        secretsFound++;
        findings.push({
          id: `secret-${p.id}-${secretsFound}`,
          category: 'secrets',
          title: `${p.label} expuesta en el código del navegador`,
          severity: p.severity,
          confidence: 'confirmado',
          attackVector: `${p.note} Cualquier visitante puede leerla desde el JavaScript público; los bots rastrean continuamente estos patrones y los explotan en minutos.`,
          mitigation: 'Revocar y rotar la credencial de inmediato, moverla al servidor (backend) y revisar los registros de uso en busca de accesos no autorizados. No basta con borrarla del código: ya está expuesta.',
          evidence: `${redact(m[0])} en ${url.slice(0, 90)}`,
        });
      }
    }
    const priv = body.match(PRIVATE_URL_RE);
    if (priv && priv.length > 0 && !seenSecret.has('private-url')) {
      seenSecret.add('private-url');
      findings.push({
        id: 'secret-internal-urls',
        category: 'secrets',
        title: 'Direcciones de red interna reveladas en el código',
        severity: 'BAJO',
        confidence: 'confirmado',
        attackVector: 'El JavaScript revela nombres o IP de servidores internos, útiles para mapear la red y para ataques SSRF.',
        mitigation: 'Quitar referencias a hosts internos de los bundles del cliente; usar variables de entorno solo en el servidor.',
        evidence: priv.slice(0, 2).join(' | ').slice(0, 140),
      });
    }
  }

  // security.txt
  const sec = await get(origin + '/.well-known/security.txt', { maxBytes: 8000, timeoutMs: 4000 });
  const secPresent = Boolean(sec && sec.status === 200 && /Contact:/i.test(sec.body));
  let secExpired: boolean | undefined;
  if (secPresent) {
    const exp = sec!.body.match(/^Expires:\s*(.+)$/im)?.[1];
    if (exp) {
      const d = new Date(exp.trim());
      if (!Number.isNaN(d.getTime())) secExpired = d.getTime() < Date.now();
    }
  }
  if (!secPresent) {
    findings.push({
      id: 'web-no-security-txt',
      category: 'webapp',
      title: 'Sin security.txt (RFC 9116): no hay canal para reportar vulnerabilidades',
      severity: 'BAJO',
      confidence: 'informativo',
      attackVector: 'Sin un canal oficial, los investigadores que encuentran un fallo no saben a quién avisar: acaban publicándolo o vendiéndolo. Los organismos reguladores esperan un proceso de divulgación coordinada.',
      mitigation: 'Publicar /.well-known/security.txt con Contact, Expires, Policy y Preferred-Languages.',
    });
  } else if (secExpired) {
    findings.push({
      id: 'web-security-txt-expired',
      category: 'webapp',
      title: 'security.txt caducado',
      severity: 'BAJO',
      confidence: 'confirmado',
      attackVector: 'Un security.txt vencido indica un canal de divulgación abandonado.',
      mitigation: 'Renovar el campo Expires.',
    });
  }

  // Escaneo activo profundo (CORS, métodos HTTP, source maps, APIs, WordPress, endpoints expuestos) - Solo en Premium o Full
  let active: WebAppResult['active'];
  if (opts.mode === 'full' || opts.isPremium === true) {
    try {
      const a = await activeChecks(origin, html, firstParty);
      active = a.result;
      findings.push(...a.findings);
    } catch {
      // Si falla la verificación activa, continúa con el análisis pasivo
    }
  }

  return {
    csp: { present: Boolean(cspValue), reportOnly: !cspEnforced && Boolean(cspReport), weaknesses },
    thirdParty: { origins: [...thirdPartyOrigins].slice(0, 20), scriptsWithoutSri: withoutSri },
    libraries,
    secretsFound,
    securityTxt: { present: secPresent, expired: secExpired },
    active,
    findings: sortFindings(findings),
    mode: opts.mode,
    generatedAt: new Date().toISOString(),
  };
}
