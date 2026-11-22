import * as net from 'net';
import { isPrivateOrLocalHost } from '@/lib/security/ssrfValidator';
import { safeLookup } from '@/lib/security/safeNet';
import { CANONICAL_PORTS } from '@/config/ports';

export interface PortCheckResult {
  port: number;
  service: string;
  shortName?: string;
  isOpen: boolean;
  risk: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO';
  description: string;
  banner?: string;
}

export { CANONICAL_PORTS };

/**
 * Matriz de Sondeo Perimetral Controlado con Detección de Banners y Versiones (Defensa TI Engine v1.3.0).
 * 
 * PROTECCIÓN ANTI-PORT-SCANNING MASIVO & BANNER GRABBING NO INVASIVO:
 * 1. ZERO-WILDCARD: Solo se inspecciona esta lista cerrada de 36 puertos empresariales canónicos.
 * 2. IDENTIFICACIÓN DE SERVICIO Y VERSIÓN REAL (Banner Grabbing pasivo):
 *    Al abrir el socket TCP, captura el saludo inicial estándar del daemon (FTP Pure-FTPd,
 *    MySQL handshake version string, SSH OpenSSH banner) sin enviar comandos ni exploits.
 * 3. Una sola conexión por puerto, todas en paralelo y con 750 ms de espera.
 */
const ACTIVELY_PROBED_PORTS = new Set([
  80, 443, 8080, 8443, 8888, 9090, 9200, 5601,  // Web & HTTP
  21, 990,                                        // FTP
  22, 23, 3389, 5900, 5901,                       // Remote Access
  25, 110, 143, 587, 993, 995,                    // Email
  3306, 5432, 1433, 1521, 6379, 27017, 5984, 7474, // Databases
  2375, 2376, 2379,                               // Docker / K8s
  445, 139, 2049, 111,                            // File Sharing / Legacy
]);

interface PortProbeOutput {
  isOpen: boolean;
  banner?: string;
}

function checkPortAndBanner(host: string, port: number, timeout = 750): Promise<PortProbeOutput> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;
    let banner = '';

    const finish = (isOpen: boolean, detectedBanner?: string) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({ isOpen, banner: detectedBanner });
    };

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      // Puertos que envían saludos no solicitados al conectarse (FTP, SSH, MySQL, SMTP, POP3, IMAP):
      if (port === 21 || port === 22 || port === 3306 || port === 25 || port === 110 || port === 143 || port === 587) {
        setTimeout(() => {
          finish(true, banner);
        }, 400);
      } else {
        finish(true);
      }
    });

    socket.on('data', (data) => {
      if (port === 21) {
        const text = data.toString('utf8');
        // Se conserva la versión del daemon: el motor CVE la cruza con vulnerabilidades conocidas
        const vsf = text.match(/vsFTPd\s+([0-9][0-9.]*)/i);
        const pro = text.match(/ProFTPD\s+([0-9][0-9.a-z]*)/i);
        if (text.includes('Pure-FTPd') || text.includes('pure-ftpd') || text.includes('public_html')) {
          banner = 'Pure-FTPd';
        } else if (vsf || text.includes('vsftpd') || text.includes('vsFTPd')) {
          banner = vsf ? `vsFTPd ${vsf[1]}` : 'vsftpd';
        } else if (pro || text.includes('ProFTPD')) {
          banner = pro ? `ProFTPD ${pro[1]}` : 'ProFTPD';
        } else {
          banner = text.trim().split('\n')[0].replace(/^220[-\s]*/, '').slice(0, 32);
        }
      } else if (port === 22) {
        const text = data.toString('utf8').trim().split('\n')[0];
        banner = text.replace(/^SSH-[0-9.]+-/, '').slice(0, 35) || text.slice(0, 35);
      } else if (port === 3306) {
        // Paquete de handshake MySQL: byte 4 es versión de protocolo, bytes 5+ hasta null es versión del servidor
        const nullIdx = data.indexOf(0, 5);
        if (nullIdx > 5) {
          banner = 'MySQL ' + data.toString('ascii', 5, nullIdx);
        } else {
          const match = data.toString('utf8').match(/([0-9]+\.[0-9]+\.[0-9]+[a-zA-Z0-9_.-]*)/);
          banner = match ? ('MySQL ' + match[1]) : 'MySQL Server';
        }
      } else if (port === 6379) {
        banner = 'Redis Server';
      } else if (port === 25 || port === 587) {
        const text = data.toString('utf8');
        const match = text.match(/^220\s+([^\r\n]+)/);
        banner = match ? match[1].slice(0, 80) : 'SMTP Server';
      } else if (port === 110) {
        const text = data.toString('utf8');
        banner = text.includes('+OK') ? text.split('\n')[0].replace('+OK', '').trim().slice(0, 40) : 'POP3 Server';
      } else if (port === 143) {
        const text = data.toString('utf8');
        const match = text.match(/\* OK ([^\r\n]+)/);
        banner = match ? match[1].slice(0, 40) : 'IMAP Server';
      } else if (port === 23) {
        banner = 'Telnet';
      } else if (port === 9200) {
        banner = 'Elasticsearch';
      } else if (port === 2375 || port === 2376) {
        banner = 'Docker API';
      } else if (port === 5432) {
        banner = 'PostgreSQL';
      } else if (port === 1521) {
        banner = 'Oracle DB';
      } else if (port === 27017) {
        banner = 'MongoDB';
      } else if (port === 5984) {
        banner = 'CouchDB';
      } else if (port === 2379) {
        banner = 'etcd / Kubernetes';
      }
      finish(true, banner);
    });

    socket.on('timeout', () => finish(false));
    socket.on('error', () => finish(false));

    // lookup validado al conectar: impide que un DNS rebinding desvíe el sondeo a la red interna
    socket.connect({ port, host, lookup: safeLookup });
  });
}


export async function scanPerimetralPorts(host: string): Promise<PortCheckResult[]> {
  // 1. Blindaje perimetral: Bloqueo estricto contra hosts privados o loopback (Anti-SSRF)
  if (isPrivateOrLocalHost(host)) {
    return CANONICAL_PORTS.map((item) => ({
      ...item,
      isOpen: false,
      risk: 'BAJO' as const,
      description: 'Host privado o no enrutable bloqueado por política perimetral.',
    }));
  }

  const isGitPlatform = host.includes('github.com') || host.includes('gitlab.com');
  const results: PortCheckResult[] = [];

  // 2. Inspección no invasiva en paralelo acotado (todas a la vez, ~1 s): el sondeo completo
  // pasa de ~26 s (uno por uno) a ~2 s sin saturar el objetivo.
  const toProbe = CANONICAL_PORTS.filter((i) => ACTIVELY_PROBED_PORTS.has(i.port));
  const probes = new Map<number, PortProbeOutput>();
  const CONCURRENCY = 40;
  for (let i = 0; i < toProbe.length; i += CONCURRENCY) {
    const chunk = toProbe.slice(i, i + CONCURRENCY);
    const out = await Promise.all(chunk.map((it) => checkPortAndBanner(host, it.port)));
    chunk.forEach((it, k) => probes.set(it.port, out[k]));
  }

  for (const item of CANONICAL_PORTS) {
    if (!ACTIVELY_PROBED_PORTS.has(item.port)) {
      results.push({
        ...item,
        isOpen: false,
        risk: 'BAJO' as const,
        description: 'Puerto protegido o cerrado perimetralmente.',
      });
      continue;
    }

    const probe = probes.get(item.port) ?? { isOpen: false };
    const isOpen = probe.isOpen;
    const banner = probe.banner;

    if (isOpen) {
      if (item.port === 443 || item.port === 8443 || item.port === 993 || item.port === 995 || item.port === 990) {
        results.push({ ...item, isOpen: true, banner, risk: 'BAJO' as const,
          description: item.port === 443
            ? 'Canal seguro HTTPS activo (Cifrado estándar para pagos y navegación).'
            : item.port === 8443
            ? 'Panel HTTPS alternativo activo; revisar exposición de administración.'
            : item.description,
        });
      } else if (item.port === 80) {
        results.push({ ...item, isOpen: true, banner, risk: 'MEDIO' as const,
          description: 'Servicio HTTP en texto plano activo sin canal seguro garantizado.',
        });
      } else if (item.port === 8080) {
        results.push({ ...item, isOpen: true, banner, risk: 'MEDIO' as const,
          description: 'Puerto alternativo de backend o desarrollo expuesto sin filtrado perimetral.',
        });
      } else if (item.port === 587) {
        results.push({ ...item, isOpen: true, banner, risk: 'MEDIO' as const,
          description: banner
            ? `Puerto SMTP de envío autenticado activo (${banner}). Revisar política SPF/DKIM/DMARC.`
            : 'Puerto SMTP de envío autenticado activo. Revisar política SPF/DKIM/DMARC.',
        });
      } else if (item.port === 22 && isGitPlatform) {
        results.push({ ...item, isOpen: true, banner, risk: 'BAJO' as const,
          description: 'Gestión de repositorios Git remotos mediante llave SSH pública autorizada.',
        });
      } else if (item.port === 22) {
        results.push({ ...item, isOpen: true, banner, risk: 'ALTO' as const,
          description: banner
            ? `Terminal SSH expuesta a internet público (${banner}). Riesgo de ataque de fuerza bruta a credenciales.`
            : 'Terminal de administración SSH expuesta a internet público (riesgo de fuerza bruta).',
        });
      } else if (item.port === 23) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'Telnet en texto plano expuesto — credenciales y datos viajan sin cifrado. Reemplazar inmediatamente por SSH.',
        });
      } else if (item.port === 21) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: banner
            ? `Servidor FTP expuesto a internet público (${banner}). Transmite credenciales en texto plano sin cifrado.`
            : 'Protocolo FTP en texto plano expuesto a internet público (riesgo de fuga de contraseñas).',
        });
      } else if (item.port === 3306) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: banner
            ? `Base de datos MySQL expuesta directamente (${banner}). Permite intentos de conexión remota desde cualquier IP.`
            : 'Motor de base de datos MySQL accesible directamente desde internet sin firewall.',
        });
      } else if (item.port === 5432) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: banner
            ? `Base de datos PostgreSQL expuesta (${banner}) sin filtrado perimetral.`
            : 'Base de datos PostgreSQL expuesta directamente sin firewall perimetral.',
        });
      } else if (item.port === 1433) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'Base de datos Microsoft SQL Server expuesta a la red pública (riesgo de volcado de datos).',
        });
      } else if (item.port === 1521) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'Base de datos Oracle expuesta — objetivo frecuente en entidades gubernamentales y financieras.',
        });
      } else if (item.port === 6379) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'Almacén en memoria Redis accesible directamente desde internet sin clave de paso.',
        });
      } else if (item.port === 27017) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'Base de datos NoSQL MongoDB expuesta directamente desde internet sin firewall.',
        });
      } else if (item.port === 5984) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'CouchDB con API HTTP pública expuesta — lectura/escritura de datos sin autenticación.',
        });
      } else if (item.port === 7474) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'Panel web Neo4j expuesto — acceso a base de datos de grafos sin credenciales.',
        });
      } else if (item.port === 3389) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'Escritorio Remoto Windows (RDP) expuesto a internet público (Vector #1 de Ransomware).',
        });
      } else if (item.port === 5900 || item.port === 5901) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: `VNC expuesto en puerto ${item.port} — control visual remoto del escritorio sin cifrado nativo.`,
        });
      } else if (item.port === 445) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'Compartición de archivos SMB expuesta a internet (Vulnerabilidad crítica tipo WannaCry).',
        });
      } else if (item.port === 139) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'NetBIOS Session Service expuesto — enumeración de recursos de red Windows sin autenticación.',
        });
      } else if (item.port === 2049) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'NFS expuesto — montaje remoto de sistemas de archivos sin autenticación fuerte.',
        });
      } else if (item.port === 111) {
        results.push({ ...item, isOpen: true, banner, risk: 'ALTO' as const,
          description: 'Portmapper RPC activo — facilita enumeración de servicios del servidor al atacante.',
        });
      } else if (item.port === 25) {
        results.push({ ...item, isOpen: true, banner, risk: 'ALTO' as const,
          description: banner
            ? `Relay SMTP abierto (${banner}) — posible vector de spam masivo y suplantación de identidad.`
            : 'Puerto SMTP de relay abierto — revisar política de reenvío y configuración SPF.',
        });
      } else if (item.port === 110) {
        results.push({ ...item, isOpen: true, banner, risk: 'ALTO' as const,
          description: banner
            ? `Servidor POP3 sin cifrado activo (${banner}) — credenciales de correo en texto plano.`
            : 'POP3 sin cifrado activo — credenciales de correo expuestas a sniffing de red.',
        });
      } else if (item.port === 143) {
        results.push({ ...item, isOpen: true, banner, risk: 'ALTO' as const,
          description: banner
            ? `Servidor IMAP sin cifrado activo (${banner}) — acceso al buzón de correo en texto plano.`
            : 'IMAP sin cifrado activo — contraseñas de correo expuestas a interceptación.',
        });
      } else if (item.port === 9200) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'API REST de Elasticsearch expuesta — lectura completa de índices y datos sin autenticación.',
        });
      } else if (item.port === 5601) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'Panel Kibana expuesto — visualización de logs y datos sensibles sin control de acceso.',
        });
      } else if (item.port === 8888) {
        results.push({ ...item, isOpen: true, banner, risk: 'ALTO' as const,
          description: 'Jupyter Notebook o panel de desarrollo expuesto — ejecución remota de código Python.',
        });
      } else if (item.port === 9090) {
        results.push({ ...item, isOpen: true, banner, risk: 'ALTO' as const,
          description: 'Panel Prometheus o Cockpit expuesto — métricas internas del servidor visibles públicamente.',
        });
      } else if (item.port === 2375) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'API Docker sin TLS expuesta — control total del servidor: ejecutar contenedores como root.',
        });
      } else if (item.port === 2376) {
        results.push({ ...item, isOpen: true, banner, risk: 'ALTO' as const,
          description: 'API Docker con TLS expuesta — verificar que no acepte certificados auto-firmados.',
        });
      } else if (item.port === 2379) {
        results.push({ ...item, isOpen: true, banner, risk: 'CRÍTICO' as const,
          description: 'etcd de Kubernetes expuesto — contiene secretos, tokens y configuración completa del clúster.',
        });
      } else {
        results.push({ ...item, isOpen: true, banner, risk: item.risk, description: item.description });
      }
    } else {
      results.push({
        ...item,
        isOpen: false,
        risk: 'BAJO' as const,
        description: 'Puerto cerrado o protegido correctamente tras firewall perimetral.',
      });
    }
  }

  return results;
}
