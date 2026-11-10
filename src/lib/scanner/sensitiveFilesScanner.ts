/**
 * Motor Perimetral de Detección de Fuga de Archivos Sensibles (DEFENSA TI Engine v1.3.0)
 * 
 * Sondeo HTTP ultraligero y no invasivo con AbortController (timeout de 1200ms).
 * Protegido contra falsos positivos de Single Page Applications (SPAs que devuelven HTML 200 en cualquier ruta).
 */

export interface SensitiveFileFinding {
  path: string;
  name: string;
  isExposed: boolean;
  severity: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  evidence?: string;
  description: string;
  remediation: string;
}

export interface SensitiveFilesResult {
  hasExposedFiles: boolean;
  criticalCount: number;
  findings: SensitiveFileFinding[];
}

interface ProbeConfig {
  path: string;
  name: string;
  severity: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  description: string;
  remediation: string;
  validator: (status: number, body: string, contentType: string) => boolean;
}

const PROBES: ProbeConfig[] = [
  {
    path: '/.env',
    name: 'Archivo de Variables de Entorno (.env)',
    severity: 'CRÍTICA',
    description: 'Expone directamente credenciales de bases de datos, claves de Stripe/APIs y secretos del sistema.',
    remediation: 'Bloquear acceso a archivos ocultos (.*) en el servidor web (Nginx: location ~ /\\. { deny all; }).',
    validator: (status, body, contentType) => {
      if (status !== 200 || contentType.includes('text/html')) return false;
      const lower = body.toLowerCase();
      return (
        lower.includes('db_') ||
        lower.includes('app_key') ||
        lower.includes('api_key') ||
        lower.includes('secret') ||
        lower.includes('database_url') ||
        lower.includes('password')
      );
    },
  },
  {
    path: '/.git/HEAD',
    name: 'Repositorio de Código Fuente (.git)',
    severity: 'CRÍTICA',
    description: 'El directorio .git completo está expuesto a descargas públicas, permitiendo clonar todo el código fuente.',
    remediation: 'Prohibir estrictamente el acceso a la carpeta .git en la configuración perimetral de Nginx/Apache o Cloudflare.',
    validator: (status, body, contentType) => {
      if (status !== 200 || contentType.includes('text/html')) return false;
      return body.startsWith('ref: refs/') || /^[0-9a-f]{40}/i.test(body.trim());
    },
  },
  {
    path: '/wp-config.php.bak',
    name: 'Respaldo de Configuración (wp-config.php.bak)',
    severity: 'CRÍTICA',
    description: 'Copia de seguridad olvidada que los navegadores descargan en texto plano revelando contraseñas.',
    remediation: 'Eliminar de inmediato cualquier archivo de respaldo (.bak, .old, .save, .zip) de la carpeta pública.',
    validator: (status, body, contentType) => {
      if (status !== 200 || contentType.includes('text/html')) return false;
      return body.includes('DB_PASSWORD') || body.includes('DB_USER') || body.includes('table_prefix');
    },
  },
  {
    path: '/xmlrpc.php',
    name: 'Endpoint XML-RPC de WordPress',
    severity: 'MEDIA',
    description: 'Interfaz activa vulnerable a ataques de fuerza bruta multicall y amplificación DDoS.',
    remediation: 'Desactivar XML-RPC si no se usa la app móvil de WordPress o bloquearlo mediante regla en Cloudflare WAF.',
    validator: (status, body) => {
      if (status !== 200 && status !== 405) return false;
      return body.includes('XML-RPC server accepts POST requests only');
    },
  },
  {
    path: '/phpinfo.php',
    name: 'Diagnóstico PHP Expuesto (phpinfo)',
    severity: 'ALTA',
    description: 'Revela la versión exacta de PHP, módulos, rutas del sistema de archivos y variables del entorno.',
    remediation: 'Eliminar el archivo phpinfo.php de inmediato de la raíz de producción.',
    validator: (status, body) => {
      if (status !== 200) return false;
      const lower = body.toLowerCase();
      return lower.includes('php version') && (lower.includes('configuration') || lower.includes('zend engine'));
    },
  },
];

export async function scanSensitiveFiles(baseUrl: string): Promise<SensitiveFilesResult> {
  const origin = baseUrl.replace(/\/+$/, '');
  const findings: SensitiveFileFinding[] = [];

  for (const probe of PROBES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1400);

      const targetUrl = `${origin}${probe.path}`;
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'DefensaTI-Perimetral-Probe/1.3.0 (+https://neuronalgravity.com/defensati)',
          'Accept': '*/*',
        },
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      // Leer solo los primeros 2 KB para no saturar memoria
      const text = await res.text();
      const sample = text.slice(0, 2048);

      const isExposed = probe.validator(res.status, sample, contentType);

      if (isExposed) {
        findings.push({
          path: probe.path,
          name: probe.name,
          isExposed: true,
          severity: probe.severity,
          evidence: `HTTP ${res.status} con firma confirmada en ${probe.path}`,
          description: probe.description,
          remediation: probe.remediation,
        });
      }
    } catch {
      // Si da timeout o error de red, se asume protegido/no accesible
    }
  }

  const criticalCount = findings.filter(f => f.severity === 'CRÍTICA' || f.severity === 'ALTA').length;

  return {
    hasExposedFiles: findings.length > 0,
    criticalCount,
    findings,
  };
}
