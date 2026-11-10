/**
 * Matriz Canónica Oficial de Puertos de DEFENSA TI (Única fuente de verdad)
 * Sincronizada entre el motor perimetral, la API, la interfaz web y la documentación.
 * Este archivo no contiene dependencias de Node.js (net/dns) para ser seguro en cliente y servidor.
 */

export interface CanonicalPortItem {
  port: number;
  service: string;
  shortName: string;
  risk: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO';
  description: string;
}

export const CANONICAL_PORTS: CanonicalPortItem[] = [
  { port: 80, service: 'HTTP (Texto plano)', shortName: 'HTTP', risk: 'MEDIO', description: 'Debe forzar redirección estricta 301 hacia HTTPS.' },
  { port: 443, service: 'HTTPS (TLS Cifrado)', shortName: 'HTTPS', risk: 'BAJO', description: 'Canal de transporte cifrado estándar para la web.' },
  { port: 8080, service: 'HTTP-Alt / Dev', shortName: 'HTTP-Alt', risk: 'MEDIO', description: 'Puerto alternativo de backend sin filtrado perimetral.' },
  { port: 21, service: 'FTP', shortName: 'FTP', risk: 'CRÍTICO', description: 'Protocolo de transferencia sin cifrar expuesto a la red pública.' },
  { port: 22, service: 'SSH', shortName: 'SSH', risk: 'ALTO', description: 'Gestión de terminal remota expuesta a ataques de fuerza bruta.' },
  { port: 3306, service: 'MySQL Database', shortName: 'MySQL', risk: 'CRÍTICO', description: 'Motor de base de datos accesible de forma directa desde Internet.' },
  { port: 5432, service: 'PostgreSQL Database', shortName: 'PostgreSQL', risk: 'CRÍTICO', description: 'Base de datos PostgreSQL expuesta sin firewall perimetral.' },
  { port: 1433, service: 'Microsoft SQL Server', shortName: 'MSSQL', risk: 'CRÍTICO', description: 'Base de datos corporativa MSSQL expuesta a la red pública.' },
  { port: 6379, service: 'Redis (In-Memory)', shortName: 'Redis', risk: 'CRÍTICO', description: 'Almacén de sesiones y tokens en memoria accesible sin contraseña.' },
  { port: 3389, service: 'RDP Escritorio Remoto', shortName: 'RDP', risk: 'CRÍTICO', description: 'Acceso a escritorio Windows expuesto a ataques de Ransomware.' },
  { port: 445, service: 'SMB / NetBIOS', shortName: 'SMB', risk: 'CRÍTICO', description: 'Compartición de archivos Windows vulnerable a gusanos y malware.' },
  { port: 27017, service: 'MongoDB Database', shortName: 'MongoDB', risk: 'CRÍTICO', description: 'Base de datos NoSQL MongoDB expuesta directamente sin firewall perimetral.' },
];
