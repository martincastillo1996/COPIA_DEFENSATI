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
}

export { CANONICAL_PORTS };

/**
 * Matriz de Sondeo Perimetral Controlado (Defensa TI Engine v1.2.5).
 * 
 * PROTECCIÓN ANTI-PORT-SCANNING MASIVO:
 * 1. ZERO-WILDCARD: Solo se inspecciona esta lista cerrada de 6 puertos empresariales canónicos.
 *    Bajo ninguna circunstancia se ejecutan escaneos de rangos amplios (ej. 1-65535).
 * 2. SONDEO NON-INVASIVE LIGERO: Solo abre un socket TCP mínimo para verificar estado SYN/ACK.
 *    No se envían payloads, comandos ni intentos de fuerza bruta; el socket se destruye
 *    inmediatamente al responder o dar timeout.
 * 3. THROTTLING PERIMETRAL: Sondeo secuencial con espaciado de seguridad (35ms) para no saturar
 *    la red ni activar alertas falsas de IDS/IPS (Fail2ban, ModSecurity, Cloudflare) en el destino.
 */
const ACTIVELY_PROBED_PORTS = new Set([80, 443, 8080, 21, 22, 3306]);

function checkPort(host: string, port: number, timeout = 650): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

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

    const isOpen = await checkPort(host, item.port);

    if (isOpen) {
      if (item.port === 443) {
        results.push({
          ...item,
          isOpen: true,
          risk: 'BAJO' as const,
          description: 'Canal seguro HTTPS activo (Cifrado estándar para pagos y navegación).',
        });
      } else if (item.port === 80) {
        results.push({
          ...item,
          isOpen: true,
          risk: 'MEDIO' as const,
          description: 'Servicio HTTP en texto plano activo sin canal seguro garantizado.',
        });
      } else if (item.port === 22 && isGitPlatform) {
        results.push({
          ...item,
          isOpen: true,
          risk: 'BAJO' as const,
          description: 'Gestión de repositorios Git remotos mediante llave SSH pública autorizada.',
        });
      } else if (item.port === 22) {
        results.push({
          ...item,
          isOpen: true,
          risk: 'ALTO' as const,
          description: 'Terminal de administración SSH expuesta a internet público (riesgo de fuerza bruta).',
        });
      } else if (item.port === 21) {
        results.push({
          ...item,
          isOpen: true,
          risk: 'CRÍTICO' as const,
          description: 'Protocolo FTP en texto plano expuesto a internet público (riesgo de fuga de contraseñas).',
        });
      } else if (item.port === 3306) {
        results.push({
          ...item,
          isOpen: true,
          risk: 'CRÍTICO' as const,
          description: 'Motor de base de datos MySQL accesible directamente desde internet sin firewall.',
        });
      } else if (item.port === 8080) {
        results.push({
          ...item,
          isOpen: true,
          risk: 'MEDIO' as const,
          description: 'Puerto alternativo de backend o desarrollo expuesto sin filtrado perimetral.',
        });
      } else {
        results.push({
          ...item,
          isOpen: true,
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
