/**
 * Motor de Inteligencia de Vulnerabilidades (DEFENSA TI CVE-Intel v3.0)
 *
 * Inferencia PASIVA: no envía exploits ni sondeos adicionales al objetivo. Cruza las
 * tecnologías ya identificadas (cabeceras, CMS, banners de servicios) con:
 *   1. Base local curada de vulnerabilidades de alto impacto usadas contra bancos,
 *      gobiernos y grandes empresas (con explicación de ataque y mitigación).
 *   2. CISA KEV  — catálogo oficial de vulnerabilidades explotadas activamente.
 *   3. NVD 2.0   — CVEs por CPE/versión (CVSS, CWE).
 *   4. FIRST EPSS — probabilidad de explotación en los próximos 30 días.
 *
 * A los servicios externos solo se envían nombres de producto/versión e IDs de CVE,
 * nunca el dominio auditado. Si alguna fuente falla, el motor sigue con la base local.
 */

import type { PortCheckResult } from '@/lib/scanner/portScanner';

export type CveSeverity = 'CRÍTICO' | 'ALTO' | 'MEDIO' | 'BAJO';
/** confirmado = versión exacta vulnerable; probable = depende de configuración o backport; exposicion = superficie de ataque sin versión */
export type CveConfidence = 'confirmado' | 'probable' | 'exposicion';

export interface DetectedTechnology {
  product: string;
  label: string;
  version?: string;
  source: 'cabecera' | 'cms' | 'banner' | 'puerto';
  evidence: string;
  distroPatched?: boolean;
}

export interface CveIntelFinding {
  id: string;
  title: string;
  product: string;
  detectedVersion?: string;
  cves: string[];
  cvss?: number;
  severity: CveSeverity;
  confidence: CveConfidence;
  kev: boolean;
  kevRansomware?: boolean;
  kevDateAdded?: string;
  epss?: number;
  cwe?: string;
  attackVector: string;
  mitigation: string;
  detail?: string;
  references: string[];
  source: 'base-local' | 'nvd';
}

export interface CveIntelResult {
  technologies: DetectedTechnology[];
  findings: CveIntelFinding[];
  stats: { total: number; critical: number; high: number; kevCount: number; maxEpss: number };
  sources: { kev: boolean; nvd: boolean; epss: boolean };
  riskLevel: CveSeverity;
  summary: string;
  generatedAt: string;
}

export interface CveIntelInput {
  rawHeaders?: Record<string, string>;
  cms?: { name?: string; version?: string; detectedPlugins?: string[] };
  ports?: PortCheckResult[];
  /** Servicios con versión ya identificados por nmap -sV (auditoría autorizada). */
  extra?: Array<{ product: string; label?: string; version?: string; evidence?: string; distroPatched?: boolean }>;
}

// ─────────────────────────── Utilidades de versión ───────────────────────────

function vparts(v: string): number[] {
  // "8.2p1" → [8,2,1]; "1.0.1f" → [1,0,1,6]; "4.94.2" → [4,94,2]
  const out: number[] = [];
  for (const tok of v.toLowerCase().match(/\d+|[a-z]/g) || []) {
    if (/\d/.test(tok)) out.push(parseInt(tok, 10));
    else if (tok !== 'p') out.push(tok.charCodeAt(0) - 96);
  }
  return out;
}

export function cmpVersion(a: string, b: string): number {
  const pa = vparts(a);
  const pb = vparts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

const lt = (v: string, b: string) => cmpVersion(v, b) < 0;
const gte = (v: string, b: string) => cmpVersion(v, b) >= 0;
const between = (v: string, lo: string, hiExcl: string) => gte(v, lo) && lt(v, hiExcl);
const mm = (v: string) => v.split('.').slice(0, 2).join('.');

function sevFromCvss(c?: number): CveSeverity {
  if (c === undefined) return 'MEDIO';
  if (c >= 9) return 'CRÍTICO';
  if (c >= 7) return 'ALTO';
  if (c >= 4) return 'MEDIO';
  return 'BAJO';
}

const DISTRO_RE = /ubuntu|debian|deb\d|\bel\d|centos|red ?hat|rhel|amzn|amazon|suse|almalinux|rocky/i;

// ─────────────────────────── Fingerprinting ───────────────────────────

const SERVER_TOKENS: Array<{ re: RegExp; product: string; label: string }> = [
  { re: /Apache\/([0-9][0-9.]*)/i, product: 'apache', label: 'Apache HTTP Server' },
  { re: /nginx\/([0-9][0-9.]*)/i, product: 'nginx', label: 'nginx' },
  { re: /openresty\/([0-9][0-9.]*)/i, product: 'openresty', label: 'OpenResty' },
  { re: /Microsoft-IIS\/([0-9][0-9.]*)/i, product: 'iis', label: 'Microsoft IIS' },
  { re: /lighttpd\/([0-9][0-9.]*)/i, product: 'lighttpd', label: 'lighttpd' },
  { re: /OpenSSL\/([0-9][0-9.]*[a-z]?)/i, product: 'openssl', label: 'OpenSSL' },
  { re: /PHP\/([0-9][0-9.]*(?:-dev)?)/i, product: 'php', label: 'PHP' },
];

export function fingerprint(input: CveIntelInput): DetectedTechnology[] {
  const techs: DetectedTechnology[] = [];
  const seen = new Set<string>();
  const add = (t: DetectedTechnology) => {
    const k = `${t.product}:${t.version || ''}`;
    if (seen.has(k)) return;
    seen.add(k);
    techs.push(t);
  };

  const h = input.rawHeaders || {};
  const server = h['server'] || '';
  const powered = h['x-powered-by'] || '';
  const headerBlob = `${server} ${powered}`;
  const distro = DISTRO_RE.test(server);

  for (const tok of SERVER_TOKENS) {
    const m = headerBlob.match(tok.re);
    if (m) {
      add({
        product: tok.product,
        label: tok.label,
        version: m[1],
        source: 'cabecera',
        evidence: m[0],
        distroPatched: distro,
      });
    }
  }
  if (/next\.js/i.test(powered)) add({ product: 'nextjs', label: 'Next.js', source: 'cabecera', evidence: `X-Powered-By: ${powered}` });
  if (/express/i.test(powered)) add({ product: 'express', label: 'Express (Node.js)', source: 'cabecera', evidence: `X-Powered-By: ${powered}` });
  if (h['x-aspnet-version']) {
    add({ product: 'aspnet', label: 'ASP.NET', version: h['x-aspnet-version'], source: 'cabecera', evidence: `X-AspNet-Version: ${h['x-aspnet-version']}` });
  }
  const gen = h['x-generator'] || '';
  const drupal = gen.match(/Drupal\s+(\d+)/i);
  if (drupal) add({ product: 'drupal', label: 'Drupal', version: drupal[1], source: 'cabecera', evidence: `X-Generator: ${gen}` });

  if (input.cms?.name) {
    const name = input.cms.name.toLowerCase();
    const product = name.includes('wordpress') ? 'wordpress'
      : name.includes('drupal') ? 'drupal'
      : name.includes('joomla') ? 'joomla'
      : name.includes('magento') ? 'magento'
      : name.includes('prestashop') ? 'prestashop'
      : name.includes('shopify') ? 'shopify'
      : name;
    add({
      product,
      label: input.cms.name,
      version: input.cms.version,
      source: 'cms',
      evidence: input.cms.version ? `meta generator ${input.cms.name} ${input.cms.version}` : `firmas de ${input.cms.name} en el HTML`,
    });
  }

  for (const p of input.ports || []) {
    if (!p.isOpen) continue;
    const b = p.banner || '';
    const ssh = b.match(/OpenSSH[_-]([0-9][0-9.]*p?\d*)/i);
    if (ssh) add({ product: 'openssh', label: 'OpenSSH', version: ssh[1], source: 'banner', evidence: `SSH ${b}`, distroPatched: DISTRO_RE.test(b) });
    const my = b.match(/MySQL\s+([0-9]+\.[0-9]+\.[0-9]+)/i);
    if (my) {
      const isMaria = /mariadb/i.test(b);
      add({ product: isMaria ? 'mariadb' : 'mysql', label: isMaria ? 'MariaDB' : 'MySQL', version: my[1], source: 'banner', evidence: b });
    }
    const exim = b.match(/Exim\s+([0-9][0-9.]*)/i);
    if (exim) add({ product: 'exim', label: 'Exim MTA', version: exim[1], source: 'banner', evidence: b.slice(0, 60) });
    if (/Microsoft ESMTP/i.test(b)) add({ product: 'exchange', label: 'Microsoft Exchange (SMTP)', source: 'banner', evidence: b.slice(0, 60) });
    const vsf = b.match(/vsFTPd\s+([0-9][0-9.]*)/i);
    if (vsf) add({ product: 'vsftpd', label: 'vsftpd', version: vsf[1], source: 'banner', evidence: b });
    const pro = b.match(/ProFTPD\s+([0-9][0-9.a-z]*)/i);
    if (pro) add({ product: 'proftpd', label: 'ProFTPD', version: pro[1], source: 'banner', evidence: b });
  }
  for (const t of input.extra || []) {
    add({ product: t.product, label: t.label || t.product, version: t.version, source: 'banner', evidence: t.evidence || 'nmap -sV', distroPatched: t.distroPatched });
  }
  return techs;
}

// ─────────────────────────── Base local curada ───────────────────────────

interface VersionRule {
  id: string;
  product: string;
  applies: (v: string, t: DetectedTechnology, ctx: { windows: boolean }) => boolean;
  title: string;
  cves: string[];
  cvss?: number;
  severity?: CveSeverity;
  /** true = la explotación depende de un módulo/configuración que no se observa desde fuera */
  conditional?: boolean;
  attackVector: string;
  mitigation: string;
  references?: string[];
}

const VERSION_RULES: VersionRule[] = [
  // Apache HTTP Server
  {
    id: 'apache-path-traversal-2021', product: 'apache',
    applies: (v) => v === '2.4.49' || v === '2.4.50',
    title: 'Apache 2.4.49/2.4.50: Path Traversal y ejecución remota de código',
    cves: ['CVE-2021-41773', 'CVE-2021-42013'], cvss: 9.8,
    attackVector: 'El atacante envía rutas codificadas (%2e%2e) que el normalizador de rutas no filtra y lee archivos fuera del DocumentRoot (configuraciones, claves). Si mod_cgi está activo, la misma técnica ejecuta comandos del sistema sin autenticación. Fue explotada masivamente a las pocas horas de publicarse.',
    mitigation: 'Actualizar a la última versión de Apache 2.4.x. Mantener "Require all denied" en <Directory />. Desactivar mod_cgi/mod_cgid si no se usan.',
  },
  {
    id: 'apache-mod-proxy-ssrf', product: 'apache',
    applies: (v) => between(v, '2.4.0', '2.4.49'),
    title: 'Apache ≤ 2.4.48: SSRF en mod_proxy',
    cves: ['CVE-2021-40438'], cvss: 9.0, conditional: true,
    attackVector: 'Con mod_proxy activo, una URI manipulada hace que el servidor reenvíe la petición a un destino elegido por el atacante (SSRF): servicios internos, paneles de administración o el endpoint de metadatos de la nube para robar credenciales temporales.',
    mitigation: 'Actualizar Apache. Restringir ProxyPass a destinos explícitos y bloquear 169.254.169.254 a nivel de red; en la nube exigir IMDSv2.',
  },
  {
    id: 'apache-confusion-2024', product: 'apache',
    applies: (v) => between(v, '2.4.0', '2.4.60'),
    title: 'Apache ≤ 2.4.59: "Confusion Attacks" (mod_rewrite / manejadores)',
    cves: ['CVE-2024-38476', 'CVE-2024-38474', 'CVE-2024-38475'], cvss: 9.8, conditional: true,
    attackVector: 'Inconsistencias entre módulos permiten que una URL o cabecera de respuesta manipulada haga que Apache sirva el código fuente de scripts, ejecute scripts en directorios no previstos o realice SSRF a través de cabeceras del backend.',
    mitigation: 'Actualizar a Apache ≥ 2.4.60 (preferible la última). Revisar reglas RewriteRule que usen sustituciones con variables del cliente.',
  },
  // nginx
  {
    id: 'nginx-resolver-2021', product: 'nginx',
    applies: (v) => between(v, '0.6.18', '1.20.1'),
    title: 'nginx < 1.20.1: corrupción de memoria en el resolver DNS',
    cves: ['CVE-2021-23017'], cvss: 7.7, conditional: true,
    attackVector: 'Si la directiva "resolver" está configurada, una respuesta DNS falsificada provoca una escritura fuera de límites en el proceso worker: caída del servicio y potencial ejecución de código.',
    mitigation: 'Actualizar nginx a la rama estable vigente. Usar resolvers internos de confianza.',
  },
  {
    id: 'nginx-eol', product: 'nginx',
    applies: (v) => lt(v, '1.26.0'),
    title: 'nginx en rama fuera de soporte',
    cves: [], severity: 'MEDIO',
    attackVector: 'nginx solo publica parches para la rama estable y mainline vigentes. Una rama antigua acumula fallos (HTTP/2, resolver, módulos) que nunca se corregirán, y la versión visible en la cabecera Server facilita elegir el exploit.',
    mitigation: 'Migrar a la rama estable actual y añadir "server_tokens off;".',
  },
  // OpenSSH
  {
    id: 'openssh-regresshion', product: 'openssh',
    applies: (v) => between(v, '8.5', '9.8') || lt(v, '4.4'),
    title: 'OpenSSH: "regreSSHion" — ejecución remota como root sin autenticación',
    cves: ['CVE-2024-6387'], cvss: 8.1,
    attackVector: 'Condición de carrera en el manejador de señales de sshd (Linux/glibc): el atacante abre miles de conexiones sin completar la autenticación hasta ganar la carrera y ejecutar código como root. Lenta pero automatizable; es uno de los fallos SSH más graves en dos décadas.',
    mitigation: 'Actualizar a OpenSSH ≥ 9.8p1 o al paquete parcheado de la distribución. Mitigación temporal: "LoginGraceTime 0" (expone a DoS). Restringir el puerto 22 por firewall, VPN o bastión.',
  },
  {
    id: 'openssh-terrapin', product: 'openssh',
    applies: (v) => lt(v, '9.6'),
    title: 'OpenSSH < 9.6: ataque "Terrapin" (truncado del handshake)',
    cves: ['CVE-2023-48795'], cvss: 5.9,
    attackVector: 'Un atacante en posición de intermediario elimina mensajes del inicio de la sesión SSH sin ser detectado y desactiva extensiones de seguridad cuando se negocian ChaCha20-Poly1305 o modos *-etm.',
    mitigation: 'Actualizar a OpenSSH ≥ 9.6 (cliente y servidor). Si no es posible, deshabilitar chacha20-poly1305@openssh.com y los MAC *-etm@openssh.com.',
  },
  // PHP
  {
    id: 'php-backdoor-81dev', product: 'php',
    applies: (v) => v.toLowerCase() === '8.1.0-dev',
    title: 'PHP 8.1.0-dev con puerta trasera (commit malicioso de 2021)',
    cves: [], cvss: 10, severity: 'CRÍTICO',
    attackVector: 'Esta compilación incluye código insertado por atacantes en el repositorio oficial: ejecuta código PHP recibido en una cabecera HTTP manipulada. Basta una sola petición para tomar el servidor.',
    mitigation: 'Sustituir inmediatamente el binario por una versión estable oficial, revisar el servidor en busca de persistencia y rotar todas las credenciales.',
  },
  {
    id: 'php-cgi-4577', product: 'php',
    applies: (v, _t, ctx) => ctx.windows && (lt(v, '8.1.29') || between(v, '8.2.0', '8.2.20') || between(v, '8.3.0', '8.3.8')),
    title: 'PHP-CGI en Windows: inyección de argumentos (RCE)',
    cves: ['CVE-2024-4577'], cvss: 9.8, conditional: true,
    attackVector: 'En Windows, la conversión "Best-Fit" de caracteres transforma un carácter especial de la URL en un guion, permitiendo inyectar opciones a php-cgi y ejecutar código remoto. Fue usada por grupos de ransomware días después de publicarse.',
    mitigation: 'Actualizar PHP. Ejecutar PHP con PHP-FPM o mod_php en lugar de CGI. Aplicar una regla de bloqueo en el WAF para el patrón de inyección.',
  },
  {
    id: 'php-eol', product: 'php',
    applies: (v) => lt(mm(v), '8.2'),
    title: 'PHP fuera de soporte de seguridad',
    cves: [], severity: 'ALTO',
    attackVector: 'Las ramas de PHP sin soporte ya no reciben parches: cada fallo publicado después del fin de vida queda abierto para siempre. Los atacantes filtran objetivos por la cabecera X-Powered-By.',
    mitigation: 'Migrar a PHP 8.3 o superior y poner "expose_php = Off" en php.ini.',
  },
  // Microsoft IIS
  {
    id: 'iis6-webdav', product: 'iis',
    applies: (v) => mm(v) === '6.0',
    title: 'IIS 6.0: desbordamiento en WebDAV (RCE)',
    cves: ['CVE-2017-7269'], cvss: 9.8,
    attackVector: 'Una petición PROPFIND con una cabecera "If" excesivamente larga desborda un búfer del servicio WebDAV y ejecuta código remoto. Herramienta filtrada del arsenal de Shadow Brokers.',
    mitigation: 'Windows Server 2003 está fuera de soporte: migrar la aplicación. De inmediato, deshabilitar WebDAV.',
  },
  {
    id: 'iis-eol', product: 'iis',
    applies: (v) => lt(v, '10.0'),
    title: 'IIS sobre Windows Server sin soporte',
    cves: [], severity: 'ALTO',
    attackVector: 'Las versiones de IIS anteriores a la 10 corresponden a Windows Server 2012 o previos, sin parches. Cualquier fallo nuevo del sistema operativo o del stack HTTP (HTTP.sys) queda sin corregir.',
    mitigation: 'Migrar a Windows Server 2022/2025 con IIS 10 y ocultar la cabecera Server (removeServerHeader).',
  },
  // OpenSSL
  {
    id: 'openssl-heartbleed', product: 'openssl',
    applies: (v) => /^1\.0\.1[a-f]?$/i.test(v),
    title: 'OpenSSL Heartbleed — fuga de memoria del servidor',
    cves: ['CVE-2014-0160'], cvss: 7.5,
    attackVector: 'Un mensaje "heartbeat" malformado hace que el servidor devuelva hasta 64 KB de su memoria por petición: claves privadas TLS, cookies de sesión y contraseñas, sin dejar rastro en los logs.',
    mitigation: 'Actualizar OpenSSL, reemitir y revocar los certificados, invalidar sesiones y rotar contraseñas.',
  },
  {
    id: 'openssl-eol', product: 'openssl',
    applies: (v) => lt(v, '3.0'),
    title: 'OpenSSL 1.x sin soporte',
    cves: [], severity: 'ALTO',
    attackVector: 'OpenSSL 1.0.x y 1.1.x ya no reciben parches públicos. Los fallos criptográficos nuevos (denegación de servicio, fugas por canal lateral) no se corrigen.',
    mitigation: 'Migrar a OpenSSL 3.x LTS y ocultar la versión en la cabecera Server.',
  },
  // Correo
  {
    id: 'exim-wizard', product: 'exim',
    applies: (v) => between(v, '4.87', '4.92'),
    title: 'Exim 4.87–4.91: "Return of the WIZard" — comandos como root',
    cves: ['CVE-2019-10149'], cvss: 9.8,
    attackVector: 'Una dirección de destinatario manipulada durante la sesión SMTP hace que Exim ejecute comandos como root. Agencias de inteligencia atribuyeron su explotación a grupos estatales contra infraestructura crítica.',
    mitigation: 'Actualizar Exim a la última versión y restringir el acceso SMTP a los relays necesarios.',
  },
  {
    id: 'exim-21nails', product: 'exim',
    applies: (v) => lt(v, '4.94.2'),
    title: 'Exim < 4.94.2: "21Nails" (21 vulnerabilidades encadenables)',
    cves: ['CVE-2020-28018', 'CVE-2020-28017'], cvss: 9.8,
    attackVector: 'Conjunto de fallos de memoria que, encadenados, dan ejecución remota sin autenticación y escalada a root en el servidor de correo.',
    mitigation: 'Actualizar a Exim ≥ 4.94.2 (preferible la última).',
  },
  // FTP
  {
    id: 'vsftpd-backdoor', product: 'vsftpd',
    applies: (v) => v === '2.3.4',
    title: 'vsftpd 2.3.4 troyanizado (puerta trasera)',
    cves: ['CVE-2011-2523'], cvss: 9.8,
    attackVector: 'El paquete distribuido con esta versión fue alterado: un nombre de usuario especial abre una shell de root en un puerto secundario.',
    mitigation: 'Reinstalar desde una fuente verificada y migrar a SFTP. Revisar el servidor en busca de compromisos previos.',
  },
  {
    id: 'proftpd-modcopy', product: 'proftpd',
    applies: (v) => v.toLowerCase().startsWith('1.3.5') && !/^1\.3\.5[a-z]/i.test(v),
    title: 'ProFTPD 1.3.5: copia de archivos sin autenticación (mod_copy)',
    cves: ['CVE-2015-3306'], cvss: 9.8, conditional: true,
    attackVector: 'Los comandos SITE CPFR/CPTO de mod_copy funcionan sin iniciar sesión: el atacante copia archivos arbitrarios y deja una webshell en la carpeta pública del sitio.',
    mitigation: 'Actualizar ProFTPD y deshabilitar mod_copy. Migrar a SFTP.',
  },
  // Bases de datos / CMS
  {
    id: 'mysql-eol', product: 'mysql',
    applies: (v) => lt(v, '8.4'),
    title: 'MySQL en versión sin soporte',
    cves: [], severity: 'ALTO',
    attackVector: 'MySQL 5.7 y 8.0 llegaron a fin de vida: los parches trimestrales de Oracle ya no los cubren. Combinado con el puerto 3306 expuesto, permite fuerza bruta y explotación de fallos conocidos del servidor.',
    mitigation: 'Migrar a MySQL 8.4 LTS y cerrar el puerto 3306 a Internet.',
  },
  {
    id: 'drupal7-eol', product: 'drupal',
    applies: (v) => v.split('.')[0] === '7' || lt(v, '10'),
    title: 'Drupal en versión fuera de soporte',
    cves: ['CVE-2018-7600'], severity: 'ALTO', conditional: true,
    attackVector: 'Drupal 7 terminó su soporte en enero de 2025 (Drupal 8/9 antes). Instalaciones no actualizadas siguen siendo blanco de "Drupalgeddon 2", explotado de forma masiva contra portales de gobierno y universidades para minar criptomonedas y desfigurar sitios.',
    mitigation: 'Migrar a Drupal 10/11 o a un proveedor de soporte extendido, y ocultar la cabecera X-Generator.',
  },
];

interface ExposureRule {
  id: string;
  ports?: number[];
  product?: string;
  title: string;
  relatedCves: string[];
  severity: CveSeverity;
  attackVector: string;
  mitigation: string;
}

const EXPOSURE_RULES: ExposureRule[] = [
  {
    id: 'exp-docker', ports: [2375], severity: 'CRÍTICO', relatedCves: [],
    title: 'API de Docker sin TLS expuesta a Internet',
    attackVector: 'Cualquiera puede crear un contenedor privilegiado que monte el disco del host y obtener root en el servidor. Botnets de criptominería escanean este puerto continuamente.',
    mitigation: 'Cerrar 2375 de inmediato. Usar el socket Unix local o TLS mutuo en 2376 restringido por firewall.',
  },
  {
    id: 'exp-redis', ports: [6379], severity: 'CRÍTICO', relatedCves: ['CVE-2025-49844', 'CVE-2022-0543'],
    title: 'Redis accesible desde Internet',
    attackVector: 'Sin contraseña, el atacante lee sesiones y tokens, o reescribe la configuración para dejar una llave SSH o tarea cron y tomar el servidor. Con versiones sin parchear, scripts Lua maliciosos permiten ejecución remota ("RediShell").',
    mitigation: 'bind 127.0.0.1, protected-mode yes, ACL con contraseña robusta, actualizar Redis y bloquear 6379 en el firewall.',
  },
  {
    id: 'exp-mongo', ports: [27017], severity: 'CRÍTICO', relatedCves: ['CVE-2025-14847'],
    title: 'MongoDB expuesto a Internet',
    attackVector: 'Instancias sin autenticación son vaciadas y "secuestradas" con nota de rescate en minutos. Versiones sin parchear filtran memoria del servidor sin credenciales ("MongoBleed").',
    mitigation: 'Activar autenticación, escuchar solo en red privada, actualizar MongoDB y bloquear 27017.',
  },
  {
    id: 'exp-elastic', ports: [9200, 5601], severity: 'CRÍTICO', relatedCves: [],
    title: 'Elasticsearch / Kibana accesibles públicamente',
    attackVector: 'La API REST permite leer, exportar o borrar todos los índices: es la causa de muchas de las mayores filtraciones de datos de clientes de bancos y operadoras.',
    mitigation: 'Activar la seguridad de Elastic (usuarios + TLS), exponer solo por VPN o proxy autenticado.',
  },
  {
    id: 'exp-rdp', ports: [3389], severity: 'CRÍTICO', relatedCves: ['CVE-2019-0708'],
    title: 'Escritorio remoto (RDP) expuesto',
    attackVector: 'Es el primer vector de entrada del ransomware: fuerza bruta y credenciales filtradas, y en Windows antiguos sin parche, ejecución remota sin credenciales ("BlueKeep").',
    mitigation: 'Retirar RDP de Internet: acceso solo por VPN/ZTNA con MFA, activar NLA y bloqueo de cuentas.',
  },
  {
    id: 'exp-smb', ports: [445, 139], severity: 'CRÍTICO', relatedCves: ['CVE-2017-0144', 'CVE-2020-0796'],
    title: 'SMB / NetBIOS expuesto a Internet',
    attackVector: 'El vector de WannaCry y NotPetya ("EternalBlue"): ejecución remota y propagación de gusano en toda la red interna. También permite robo de hashes NTLM.',
    mitigation: 'Bloquear 445/139 en el perímetro, deshabilitar SMBv1 y aplicar parches de Windows.',
  },
  {
    id: 'exp-etcd', ports: [2379], severity: 'CRÍTICO', relatedCves: [],
    title: 'etcd (Kubernetes) expuesto',
    attackVector: 'etcd guarda todos los secretos del clúster: tokens de servicio, credenciales de bases de datos y claves de la nube. Sin TLS cliente, se leen con una sola petición.',
    mitigation: 'Exigir TLS mutuo, restringir a los nodos del plano de control y cifrar secretos en reposo.',
  },
  {
    id: 'exp-telnet', ports: [23], severity: 'CRÍTICO', relatedCves: [],
    title: 'Telnet activo',
    attackVector: 'Credenciales en texto plano y blanco principal de botnets tipo Mirai que prueban contraseñas por defecto.',
    mitigation: 'Desactivar Telnet y usar SSH con llaves.',
  },
  {
    id: 'exp-vnc', ports: [5900, 5901], severity: 'CRÍTICO', relatedCves: [],
    title: 'VNC expuesto',
    attackVector: 'Control total del escritorio con contraseñas cortas o sin ellas; el tráfico no va cifrado.',
    mitigation: 'Acceso solo por VPN o túnel SSH, con contraseña robusta.',
  },
  {
    id: 'exp-exchange', product: 'exchange', severity: 'ALTO',
    relatedCves: ['CVE-2021-26855', 'CVE-2021-34473', 'CVE-2022-41040'],
    title: 'Microsoft Exchange on-premise expuesto',
    attackVector: 'Exchange local es uno de los blancos favoritos de grupos estatales y de ransomware (ProxyLogon, ProxyShell, ProxyNotShell). Exchange 2016/2019 terminó su soporte en octubre de 2025.',
    mitigation: 'Migrar a Exchange Online o Subscription Edition, aplicar el último CU/SU y publicar OWA solo tras un proxy con MFA.',
  },
  {
    id: 'exp-nextjs', product: 'nextjs', severity: 'MEDIO',
    relatedCves: ['CVE-2025-29927', 'CVE-2025-55182'],
    title: 'Next.js identificado por cabecera: verificar versión',
    attackVector: 'Versiones de Next.js sin parchear permiten saltarse el middleware de autenticación con una cabecera interna, y las de React Server Components sin parche permiten ejecución remota ("React2Shell"). La cabecera X-Powered-By confirma al atacante el framework.',
    mitigation: 'Mantener Next.js/React en la última versión parcheada y poner "poweredByHeader: false" en next.config.',
  },
  {
    id: 'exp-aspnet', product: 'aspnet', severity: 'MEDIO', relatedCves: [],
    title: 'Versión de ASP.NET divulgada',
    attackVector: 'La cabecera X-AspNet-Version revela la versión exacta del framework y facilita escoger exploits de deserialización o ViewState.',
    mitigation: 'Añadir <httpRuntime enableVersionHeader="false" /> en web.config.',
  },
];

// ─────────────────────────── Fuentes externas (con caché) ───────────────────────────

interface KevEntry { dateAdded?: string; ransomware?: boolean }

const g = globalThis as unknown as {
  __kevCache?: { at: number; map: Map<string, KevEntry> };
  __epssCache?: Map<string, { at: number; v: number }>;
  __nvdCache?: Map<string, { at: number; items: NvdItem[] }>;
};
if (!g.__epssCache) g.__epssCache = new Map();
if (!g.__nvdCache) g.__nvdCache = new Map();

const KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
const KEV_TTL = 12 * 60 * 60 * 1000;
const EPSS_TTL = 24 * 60 * 60 * 1000;
const NVD_TTL = 24 * 60 * 60 * 1000;

async function fetchJson(url: string, timeoutMs: number, headers?: Record<string, string>): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: 'application/json', ...headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadKev(): Promise<Map<string, KevEntry> | null> {
  if (g.__kevCache && Date.now() - g.__kevCache.at < KEV_TTL) return g.__kevCache.map;
  try {
    const data = (await fetchJson(KEV_URL, 7000)) as {
      vulnerabilities?: Array<{ cveID: string; dateAdded?: string; knownRansomwareCampaignUse?: string }>;
    };
    const map = new Map<string, KevEntry>();
    for (const v of data.vulnerabilities || []) {
      map.set(v.cveID.toUpperCase(), { dateAdded: v.dateAdded, ransomware: v.knownRansomwareCampaignUse === 'Known' });
    }
    g.__kevCache = { at: Date.now(), map };
    return map;
  } catch {
    return g.__kevCache?.map ?? null; // caché vencida es mejor que nada
  }
}

async function loadEpss(cves: string[]): Promise<Map<string, number> | null> {
  const out = new Map<string, number>();
  const missing: string[] = [];
  for (const c of cves) {
    const hit = g.__epssCache!.get(c);
    if (hit && Date.now() - hit.at < EPSS_TTL) out.set(c, hit.v);
    else missing.push(c);
  }
  if (missing.length === 0) return out;
  try {
    for (let i = 0; i < missing.length; i += 80) {
      const batch = missing.slice(i, i + 80);
      const data = (await fetchJson(`https://api.first.org/data/v1/epss?cve=${batch.join(',')}`, 5000)) as {
        data?: Array<{ cve: string; epss: string }>;
      };
      for (const d of data.data || []) {
        const v = parseFloat(d.epss);
        if (!Number.isNaN(v)) {
          out.set(d.cve.toUpperCase(), v);
          g.__epssCache!.set(d.cve.toUpperCase(), { at: Date.now(), v });
        }
      }
    }
    return out;
  } catch {
    return out.size ? out : null;
  }
}

interface NvdItem { id: string; cvss?: number; cwe?: string; description?: string; kev?: boolean }

const CPE_MAP: Record<string, string> = {
  apache: 'apache:http_server',
  nginx: 'f5:nginx',
  openssh: 'openbsd:openssh',
  php: 'php:php',
  iis: 'microsoft:internet_information_services',
  openssl: 'openssl:openssl',
  exim: 'exim:exim',
  proftpd: 'proftpd:proftpd',
  vsftpd: 'beasts:vsftpd',
  mysql: 'oracle:mysql',
  mariadb: 'mariadb:mariadb',
  wordpress: 'wordpress:wordpress',
  drupal: 'drupal:drupal',
  joomla: 'joomla:joomla\\!',
  lighttpd: 'lighttpd:lighttpd',
  postgresql: 'postgresql:postgresql',
  redis: 'redis:redis',
  mongodb: 'mongodb:mongodb',
  elasticsearch: 'elastic:elasticsearch',
  tomcat: 'apache:tomcat',
  samba: 'samba:samba',
  memcached: 'memcached:memcached',
};

function cpeFor(t: DetectedTechnology): string | null {
  const base = CPE_MAP[t.product];
  if (!base || !t.version || !/^\d+\.\d+/.test(t.version)) return null;
  if (t.product === 'openssh') {
    const m = t.version.match(/^([0-9.]+)(p\d+)?$/);
    if (!m) return null;
    return `cpe:2.3:a:${base}:${m[1]}${m[2] ? `:${m[2]}` : ''}`;
  }
  return `cpe:2.3:a:${base}:${t.version}`;
}

async function queryNvd(cpe: string): Promise<NvdItem[] | null> {
  const hit = g.__nvdCache!.get(cpe);
  if (hit && Date.now() - hit.at < NVD_TTL) return hit.items;
  try {
    const key = process.env.NVD_API_KEY?.trim();
    const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?virtualMatchString=${encodeURIComponent(cpe)}&noRejected&resultsPerPage=200`;
    const data = (await fetchJson(url, 6000, key ? { apiKey: key } : undefined)) as {
      vulnerabilities?: Array<{
        cve: {
          id: string;
          cisaExploitAdd?: string;
          descriptions?: Array<{ lang: string; value: string }>;
          weaknesses?: Array<{ description?: Array<{ value: string }> }>;
          metrics?: Record<string, Array<{ cvssData?: { baseScore?: number } }> | undefined>;
        };
      }>;
    };
    const items: NvdItem[] = (data.vulnerabilities || []).map(({ cve }) => {
      const m = cve.metrics || {};
      const score = (m.cvssMetricV40 || m.cvssMetricV31 || m.cvssMetricV30 || m.cvssMetricV2)?.[0]?.cvssData?.baseScore;
      const cwe = cve.weaknesses?.flatMap((w) => w.description || []).map((d) => d.value).find((v) => /^CWE-\d+$/.test(v));
      return {
        id: cve.id.toUpperCase(),
        cvss: typeof score === 'number' ? score : undefined,
        cwe,
        description: cve.descriptions?.find((d) => d.lang === 'en')?.value?.slice(0, 400),
        kev: Boolean(cve.cisaExploitAdd),
      };
    });
    g.__nvdCache!.set(cpe, { at: Date.now(), items });
    return items;
  } catch {
    return null;
  }
}

// Explicación por clase de debilidad (CWE) para CVEs que llegan desde NVD
const CWE_PLAYBOOK: Record<string, { attack: string; fix: string }> = {
  'CWE-79': { attack: 'Cross-Site Scripting: el atacante inyecta JavaScript que se ejecuta en el navegador de tus usuarios para robar sesiones o redirigir a phishing.', fix: 'Actualizar el componente, escapar toda salida y aplicar una Content-Security-Policy estricta.' },
  'CWE-89': { attack: 'Inyección SQL: parámetros manipulados alteran las consultas a la base de datos para extraer, modificar o borrar datos de clientes.', fix: 'Actualizar y usar consultas parametrizadas; activar reglas SQLi en el WAF.' },
  'CWE-22': { attack: 'Path Traversal: rutas con "../" permiten leer archivos fuera de la carpeta pública (configuraciones, credenciales).', fix: 'Actualizar y validar/normalizar rutas en el servidor.' },
  'CWE-78': { attack: 'Inyección de comandos del sistema: el atacante ejecuta órdenes en el servidor con los privilegios del servicio.', fix: 'Actualizar de inmediato y ejecutar el servicio con mínimos privilegios.' },
  'CWE-77': { attack: 'Inyección de comandos: entradas manipuladas se convierten en comandos ejecutados por el servidor.', fix: 'Actualizar y aislar el servicio (contenedor, usuario sin privilegios).' },
  'CWE-94': { attack: 'Inyección de código: el atacante consigue que el servidor evalúe código propio (ejecución remota).', fix: 'Actualizar de inmediato; revisar indicios de webshells.' },
  'CWE-787': { attack: 'Escritura fuera de límites de memoria: una petición manipulada corrompe memoria y puede derivar en ejecución remota o caída del servicio.', fix: 'Actualizar a la versión corregida; mantener ASLR/DEP y aislamiento.' },
  'CWE-125': { attack: 'Lectura fuera de límites: filtra fragmentos de memoria del proceso (claves, tokens) o lo hace caer.', fix: 'Actualizar a la versión corregida.' },
  'CWE-119': { attack: 'Corrupción de memoria: entradas malformadas desbordan búferes, con riesgo de ejecución remota.', fix: 'Actualizar a la versión corregida.' },
  'CWE-416': { attack: 'Uso de memoria liberada: peticiones encadenadas reutilizan memoria liberada para ejecutar código.', fix: 'Actualizar a la versión corregida.' },
  'CWE-287': { attack: 'Fallo de autenticación: es posible acceder a funciones protegidas sin credenciales válidas.', fix: 'Actualizar y añadir MFA y restricción por IP a los paneles administrativos.' },
  'CWE-306': { attack: 'Función crítica sin autenticación: el atacante la invoca directamente.', fix: 'Actualizar y restringir el acceso por red.' },
  'CWE-862': { attack: 'Falta de autorización: un usuario sin permisos accede a datos o acciones de otros.', fix: 'Actualizar y revisar controles de acceso.' },
  'CWE-918': { attack: 'SSRF: el servidor hace peticiones a destinos elegidos por el atacante (red interna, metadatos de la nube).', fix: 'Actualizar, filtrar destinos salientes y exigir IMDSv2.' },
  'CWE-502': { attack: 'Deserialización insegura: datos manipulados se convierten en objetos que ejecutan código en el servidor.', fix: 'Actualizar y no deserializar datos no confiables.' },
  'CWE-434': { attack: 'Subida de archivos sin restricción: el atacante sube una webshell y la ejecuta.', fix: 'Actualizar, validar tipo/extensión y no ejecutar scripts en la carpeta de subidas.' },
  'CWE-352': { attack: 'CSRF: una web maliciosa hace que el navegador del administrador ejecute acciones sin que lo note.', fix: 'Actualizar y usar tokens anti-CSRF y cookies SameSite.' },
  'CWE-611': { attack: 'XXE: un XML con entidades externas lee archivos internos o hace SSRF.', fix: 'Actualizar y deshabilitar entidades externas en el parser XML.' },
  'CWE-400': { attack: 'Consumo de recursos: peticiones diseñadas agotan CPU o memoria y tiran el servicio (DoS).', fix: 'Actualizar, aplicar rate limiting y protección DDoS.' },
  'CWE-200': { attack: 'Exposición de información: el servicio revela datos internos útiles para el siguiente paso del ataque.', fix: 'Actualizar y minimizar la información expuesta.' },
  'CWE-20': { attack: 'Validación de entrada insuficiente: datos malformados provocan comportamientos no previstos explotables.', fix: 'Actualizar a la versión corregida.' },
};

const GENERIC_PLAY = {
  attack: 'Vulnerabilidad publicada para esta versión exacta. Los atacantes automatizan la búsqueda de servidores que muestran versiones afectadas y aplican el exploit público.',
  fix: 'Actualizar el componente a la versión corregida y ocultar la versión en las cabeceras/banners.',
};

// ─────────────────────────── Motor ───────────────────────────

async function withBudget<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);
}

export async function scanCveIntel(input: CveIntelInput, opts: { online?: boolean } = {}): Promise<CveIntelResult> {
  const online = opts.online !== false;
  const technologies = fingerprint(input);
  const server = input.rawHeaders?.['server'] || '';
  const ctx = { windows: /win|iis/i.test(server) || technologies.some((t) => t.product === 'iis' || t.product === 'aspnet') };
  const findings: CveIntelFinding[] = [];

  // 1. Base local por versión
  for (const t of technologies) {
    if (!t.version) continue;
    for (const r of VERSION_RULES) {
      if (r.product !== t.product) continue;
      let applies = false;
      try { applies = r.applies(t.version, t, ctx); } catch { applies = false; }
      if (!applies) continue;
      const confidence: CveConfidence = r.conditional || t.distroPatched ? 'probable' : 'confirmado';
      findings.push({
        id: r.id,
        title: r.title,
        product: t.label,
        detectedVersion: t.version,
        cves: r.cves,
        cvss: r.cvss,
        severity: r.severity ?? sevFromCvss(r.cvss),
        confidence,
        kev: false,
        attackVector: r.attackVector,
        mitigation: r.mitigation,
        detail: t.distroPatched ? 'La distribución Linux puede haber aplicado el parche sin cambiar el número de versión (backport): verifique el paquete instalado.' : undefined,
        references: [...r.cves.map((c) => `https://nvd.nist.gov/vuln/detail/${c}`), ...(r.references || [])],
        source: 'base-local',
      });
    }
  }

  // 2. Exposición sin versión (puertos y productos)
  const openPorts = new Set((input.ports || []).filter((p) => p.isOpen).map((p) => p.port));
  for (const r of EXPOSURE_RULES) {
    const hitPort = r.ports?.find((p) => openPorts.has(p));
    const hitTech = r.product ? technologies.find((t) => t.product === r.product) : undefined;
    if (hitPort === undefined && !hitTech) continue;
    findings.push({
      id: r.id,
      title: r.title,
      product: hitTech?.label || `Puerto ${hitPort}`,
      detectedVersion: hitTech?.version,
      cves: r.relatedCves,
      severity: r.severity,
      confidence: 'exposicion',
      kev: false,
      attackVector: r.attackVector,
      mitigation: r.mitigation,
      references: r.relatedCves.map((c) => `https://nvd.nist.gov/vuln/detail/${c}`),
      source: 'base-local',
    });
  }

  // 3. Divulgación de versión (facilita todo lo anterior)
  const versioned = technologies.filter((t) => t.version && t.source !== 'puerto');
  if (versioned.length > 0) {
    findings.push({
      id: 'version-disclosure',
      title: 'Divulgación de versiones de software',
      product: versioned.map((t) => `${t.label} ${t.version}`).join(', '),
      cves: [],
      severity: 'BAJO',
      confidence: 'confirmado',
      kev: false,
      attackVector: 'Los atacantes usan buscadores de dispositivos para listar en minutos todos los servidores con una versión vulnerable concreta. Mostrar la versión te pone en esa lista el mismo día que se publica un exploit.',
      mitigation: 'Apache: "ServerTokens Prod" y "ServerSignature Off". nginx: "server_tokens off". PHP: "expose_php = Off". IIS: removeServerHeader. SSH/FTP/SMTP: personalizar el banner.',
      references: ['https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/02-Fingerprint_Web_Server'],
      source: 'base-local',
    });
  }

  // 4. Enriquecimiento online: NVD → KEV → EPSS
  const sources = { kev: false, nvd: false, epss: false };
  if (online) {
    const cpeTargets = technologies
      .map((t) => ({ t, cpe: cpeFor(t) }))
      .filter((x): x is { t: DetectedTechnology; cpe: string } => Boolean(x.cpe))
      .slice(0, 4);

    const [kev, nvdResults] = await Promise.all([
      withBudget(loadKev(), 7500),
      withBudget(Promise.all(cpeTargets.map((x) => queryNvd(x.cpe))), 7500),
    ]);

    const known = new Set(findings.flatMap((f) => f.cves));
    if (nvdResults) {
      let added = 0;
      nvdResults.forEach((items, i) => {
        if (!items) return;
        sources.nvd = true;
        const { t } = cpeTargets[i];
        const top = items
          .filter((it) => !known.has(it.id) && (it.cvss ?? 0) >= 7)
          .sort((a, b) => Number(b.kev) - Number(a.kev) || (b.cvss ?? 0) - (a.cvss ?? 0))
          .slice(0, 6);
        for (const it of top) {
          if (added >= 18) break;
          known.add(it.id);
          added++;
          const play = (it.cwe && CWE_PLAYBOOK[it.cwe]) || GENERIC_PLAY;
          findings.push({
            id: `nvd-${it.id}`,
            title: `${it.id} en ${t.label} ${t.version}`,
            product: t.label,
            detectedVersion: t.version,
            cves: [it.id],
            cvss: it.cvss,
            severity: sevFromCvss(it.cvss),
            confidence: t.distroPatched ? 'probable' : 'confirmado',
            kev: Boolean(it.kev),
            cwe: it.cwe,
            attackVector: play.attack,
            mitigation: play.fix,
            detail: it.description,
            references: [`https://nvd.nist.gov/vuln/detail/${it.id}`],
            source: 'nvd',
          });
        }
      });
    }

    if (kev) {
      sources.kev = true;
      for (const f of findings) {
        for (const c of f.cves) {
          const e = kev.get(c.toUpperCase());
          if (e) {
            f.kev = true;
            f.kevRansomware = f.kevRansomware || e.ransomware;
            f.kevDateAdded = f.kevDateAdded || e.dateAdded;
          }
        }
      }
    }

    const allCves = [...new Set(findings.flatMap((f) => f.cves))];
    if (allCves.length > 0) {
      const epss = await withBudget(loadEpss(allCves), 5500);
      if (epss) {
        sources.epss = true;
        for (const f of findings) {
          const vals = f.cves.map((c) => epss.get(c.toUpperCase())).filter((v): v is number => typeof v === 'number');
          if (vals.length) f.epss = Math.max(...vals);
        }
      }
    }
  }

  // Un CVE en KEV con versión vulnerable sube a CRÍTICO: se está explotando ahora mismo
  for (const f of findings) {
    if (f.kev && f.confidence !== 'exposicion' && f.severity === 'ALTO') f.severity = 'CRÍTICO';
  }

  const sevRank: Record<CveSeverity, number> = { 'CRÍTICO': 4, 'ALTO': 3, 'MEDIO': 2, 'BAJO': 1 };
  const confRank: Record<CveConfidence, number> = { confirmado: 3, probable: 2, exposicion: 1 };
  findings.sort((a, b) =>
    Number(b.kev) - Number(a.kev) ||
    sevRank[b.severity] - sevRank[a.severity] ||
    confRank[b.confidence] - confRank[a.confidence] ||
    (b.epss ?? 0) - (a.epss ?? 0) ||
    (b.cvss ?? 0) - (a.cvss ?? 0)
  );

  const critical = findings.filter((f) => f.severity === 'CRÍTICO').length;
  const high = findings.filter((f) => f.severity === 'ALTO').length;
  const kevCount = findings.filter((f) => f.kev).length;
  const maxEpss = findings.reduce((m, f) => Math.max(m, f.epss ?? 0), 0);
  const riskLevel: CveSeverity = critical ? 'CRÍTICO' : high ? 'ALTO' : findings.some((f) => f.severity === 'MEDIO') ? 'MEDIO' : 'BAJO';

  const summary = findings.length === 0
    ? technologies.length === 0
      ? 'No se identificaron tecnologías con versión visible: la superficie de huella digital es mínima.'
      : 'Las tecnologías identificadas no coinciden con vulnerabilidades conocidas de alto impacto.'
    : `${findings.length} hallazgo(s) de inteligencia de amenazas${kevCount ? `, ${kevCount} con explotación activa confirmada por CISA (KEV)` : ''}${critical ? `, ${critical} crítico(s)` : ''}.`;

  return {
    technologies,
    findings,
    stats: { total: findings.length, critical, high, kevCount, maxEpss },
    sources,
    riskLevel,
    summary,
    generatedAt: new Date().toISOString(),
  };
}

/** Penalización de score: devuelve el tope máximo y la resta a aplicar. */
export function cveScoreImpact(r?: CveIntelResult): { cap: number; minus: number } {
  if (!r) return { cap: 100, minus: 0 };
  let cap = 100;
  let minus = 0;
  for (const f of r.findings) {
    if (f.confidence === 'confirmado') {
      if (f.kev) cap = Math.min(cap, 20);
      else if (f.severity === 'CRÍTICO') cap = Math.min(cap, 35);
      else if (f.severity === 'ALTO') minus += 5;
    } else if (f.confidence === 'probable') {
      if (f.kev || f.severity === 'CRÍTICO') minus += 10;
      else if (f.severity === 'ALTO') minus += 4;
    }
  }
  return { cap, minus: Math.min(minus, 30) };
}
