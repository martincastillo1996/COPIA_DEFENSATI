import * as net from 'net';
import { isPrivateOrLocalHost } from '@/lib/security/ssrfValidator';
import { CANONICAL_PORTS, CanonicalPortItem } from '@/config/ports';

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
 * 1. ZERO-WILDCARD: Solo se inspecciona esta lista cerrada de 12 puertos empresariales canónicos.
 * 2. IDENTIFICACIÓN DE SERVICIO Y VERSIÓN REAL (Banner Grabbing pasivo):
 *    Al abrir el socket TCP, captura el saludo inicial estándar del daemon (FTP Pure-FTPd,
 *    MySQL handshake version string, SSH OpenSSH banner) sin enviar comandos ni exploits.
 * 3. THROTTLING PERIMETRAL: Sondeo secuencial con espaciado de seguridad (35ms) para no saturar
 *    la red ni activar alertas de IDS/IPS.
 */
const ACTIVELY_PROBED_PORTS = new Set([80, 443, 8080, 21, 22, 3306, 5432, 1433, 6379, 3389, 445, 27017]);

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
      // Puertos que envían saludos no solicitados al conectarse (FTP, SSH, MySQL):
      if (port === 21 || port === 22 || port === 3306) {
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
        if (text.includes('Pure-FTPd') || text.includes('pure-ftpd') || text.includes('public_html')) {
          banner = 'Pure-FTPd';
        } else if (text.includes('vsftpd') || text.includes('vsFTPd')) {
          banner = 'vsftpd';
        } else if (text.includes('ProFTPD')) {
          banner = 'ProFTPD';
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
      }
      finish(true, banner);
    });

    socket.on('timeout', () => finish(false));
    socket.on('error', () => finish(false));

    socket.connect(port, host);
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  // 2. Inspección secuencial no invasiva con espaciado para evitar bloqueos por IDS
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

    const probe = await checkPortAndBanner(host, item.port);
    const isOpen = probe.isOpen;
    const banner = probe.banner;

    if (isOpen) {
      if (item.port === 443) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'BAJO' as const,
          description: 'Canal seguro HTTPS activo (Cifrado estándar para pagos y navegación).',
        });
      } else if (item.port === 80) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'MEDIO' as const,
          description: 'Servicio HTTP en texto plano activo sin canal seguro garantizado.',
        });
      } else if (item.port === 22 && isGitPlatform) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'BAJO' as const,
          description: 'Gestión de repositorios Git remotos mediante llave SSH pública autorizada.',
        });
      } else if (item.port === 22) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'ALTO' as const,
          description: banner
            ? `Terminal SSH expuesta a internet público (${banner}). Riesgo de ataque de fuerza bruta a credenciales.`
            : 'Terminal de administración SSH expuesta a internet público (riesgo de fuerza bruta).',
        });
      } else if (item.port === 21) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'CRÍTICO' as const,
          description: banner
            ? `Servidor FTP expuesto a internet público (${banner}). Transmite credenciales en texto plano sin cifrado.`
            : 'Protocolo FTP en texto plano expuesto a internet público (riesgo de fuga de contraseñas).',
        });
      } else if (item.port === 3306) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'CRÍTICO' as const,
          description: banner
            ? `Base de datos MySQL expuesta directamente (${banner}). Permite intentos de conexión remota desde cualquier IP.`
            : 'Motor de base de datos MySQL accesible directamente desde internet sin firewall.',
        });
      } else if (item.port === 5432) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'CRÍTICO' as const,
          description: banner
            ? `Base de datos PostgreSQL expuesta (${banner}) sin filtrado perimetral.`
            : 'Base de datos PostgreSQL expuesta directamente sin firewall perimetral.',
        });
      } else if (item.port === 1433) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'CRÍTICO' as const,
          description: 'Base de datos Microsoft SQL Server expuesta a la red pública (riesgo de volcado de datos).',
        });
      } else if (item.port === 6379) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'CRÍTICO' as const,
          description: 'Almacén en memoria Redis accesible directamente desde internet sin clave de paso.',
        });
      } else if (item.port === 3389) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'CRÍTICO' as const,
          description: 'Escritorio Remoto Windows (RDP) expuesto a internet público (Vector #1 de Ransomware).',
        });
      } else if (item.port === 445) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'CRÍTICO' as const,
          description: 'Compartición de archivos SMB expuesta a internet (Vulnerabilidad crítica tipo WannaCry).',
        });
      } else if (item.port === 27017) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'CRÍTICO' as const,
          description: 'Base de datos NoSQL MongoDB expuesta directamente desde internet sin firewall.',
        });
      } else if (item.port === 8080) {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: 'MEDIO' as const,
          description: 'Puerto alternativo de backend o desarrollo expuesto sin filtrado perimetral.',
        });
      } else {
        results.push({
          ...item,
          isOpen: true,
          banner,
          risk: item.risk,
          description: item.description,
        });
      }
    } else {
      results.push({
        ...item,
        isOpen: false,
        risk: 'BAJO' as const,
        description: 'Puerto cerrado o protegido correctamente tras firewall perimetral.',
      });
    }

    // Pausa técnica ligera (35ms) entre sockets para no activar alertas de flood en el destino
    await delay(35);
  }

  return results;
}
