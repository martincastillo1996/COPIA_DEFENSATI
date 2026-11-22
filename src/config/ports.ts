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
  // ── Web & HTTP ──────────────────────────────────────────────────────────────
  { port: 80,   service: 'HTTP (Texto plano)',         shortName: 'HTTP',        risk: 'MEDIO',   description: 'Debe forzar redirección estricta 301 hacia HTTPS.' },
  { port: 443,  service: 'HTTPS (TLS Cifrado)',         shortName: 'HTTPS',       risk: 'BAJO',    description: 'Canal de transporte cifrado estándar para la web.' },
  { port: 8080, service: 'HTTP-Alt / Dev',              shortName: 'HTTP-Alt',    risk: 'MEDIO',   description: 'Puerto alternativo de backend sin filtrado perimetral.' },
  { port: 8443, service: 'HTTPS-Alt / Admin Panel',     shortName: 'HTTPS-Alt',   risk: 'MEDIO',   description: 'Panel de administración o backend seguro alternativo.' },
  { port: 8888, service: 'HTTP Dev / Jupyter Notebook', shortName: 'Jupyter',     risk: 'ALTO',    description: 'Notebook interactivo con ejecución de código expuesto a internet.' },
  { port: 9090, service: 'Prometheus / Cockpit',        shortName: 'Prometheus',  risk: 'ALTO',    description: 'Panel de métricas o administración de servidor Linux expuesto.' },
  { port: 9200, service: 'Elasticsearch REST API',      shortName: 'Elastic',     risk: 'CRÍTICO', description: 'Motor de búsqueda con datos indexados accesible sin autenticación.' },
  { port: 5601, service: 'Kibana Dashboard',            shortName: 'Kibana',      risk: 'CRÍTICO', description: 'Panel de visualización de logs con acceso a todos los índices.' },
  // ── FTP / File Transfer ──────────────────────────────────────────────────────
  { port: 21,   service: 'FTP',                         shortName: 'FTP',         risk: 'CRÍTICO', description: 'Protocolo de transferencia sin cifrar expuesto a la red pública.' },
  { port: 990,  service: 'FTPS (FTP over TLS)',         shortName: 'FTPS',        risk: 'MEDIO',   description: 'FTP cifrado; revisar configuración TLS y acceso anónimo.' },
  // ── Remote Access ────────────────────────────────────────────────────────────
  { port: 22,   service: 'SSH',                         shortName: 'SSH',         risk: 'ALTO',    description: 'Terminal remota expuesta a ataques de fuerza bruta.' },
  { port: 23,   service: 'Telnet (Sin cifrado)',         shortName: 'Telnet',      risk: 'CRÍTICO', description: 'Protocolo legacy en texto plano, sustituido por SSH. Vector crítico.' },
  { port: 3389, service: 'RDP Escritorio Remoto',       shortName: 'RDP',         risk: 'CRÍTICO', description: 'Acceso a escritorio Windows expuesto a ataques de Ransomware.' },
  { port: 5900, service: 'VNC Remote Desktop',          shortName: 'VNC',         risk: 'CRÍTICO', description: 'Control remoto de escritorio sin cifrado nativo (captura de pantalla).' },
  { port: 5901, service: 'VNC Display :1',              shortName: 'VNC-1',       risk: 'CRÍTICO', description: 'Segunda instancia VNC expuesta a conexiones no autorizadas.' },
  // ── Email ────────────────────────────────────────────────────────────────────
  { port: 25,   service: 'SMTP (Relay)',                 shortName: 'SMTP',        risk: 'ALTO',    description: 'Relay de correo abierto; vector de spam masivo y suplantación.' },
  { port: 110,  service: 'POP3 (Sin cifrado)',           shortName: 'POP3',        risk: 'ALTO',    description: 'Descarga de correo sin TLS; credenciales en texto plano.' },
  { port: 143,  service: 'IMAP (Sin cifrado)',           shortName: 'IMAP',        risk: 'ALTO',    description: 'Acceso a buzón sin cifrado; expuesto a sniffing de contraseñas.' },
  { port: 587,  service: 'SMTP Submission (Auth)',       shortName: 'SMTP-Sub',    risk: 'MEDIO',   description: 'Puerto de envío autenticado; revisar política SPF/DKIM.' },
  { port: 993,  service: 'IMAPS (IMAP cifrado)',         shortName: 'IMAPS',       risk: 'BAJO',    description: 'IMAP sobre TLS; verificar que no admita protocolos inseguros.' },
  { port: 995,  service: 'POP3S (POP3 cifrado)',         shortName: 'POP3S',       risk: 'BAJO',    description: 'POP3 sobre TLS; verificar configuración de cifrado.' },
  // ── Bases de Datos ────────────────────────────────────────────────────────────
  { port: 3306, service: 'MySQL Database',               shortName: 'MySQL',       risk: 'CRÍTICO', description: 'Motor de base de datos accesible de forma directa desde Internet.' },
  { port: 5432, service: 'PostgreSQL Database',          shortName: 'PostgreSQL',  risk: 'CRÍTICO', description: 'Base de datos PostgreSQL expuesta sin firewall perimetral.' },
  { port: 1433, service: 'Microsoft SQL Server',         shortName: 'MSSQL',       risk: 'CRÍTICO', description: 'Base de datos corporativa MSSQL expuesta a la red pública.' },
  { port: 1521, service: 'Oracle Database',              shortName: 'Oracle',      risk: 'CRÍTICO', description: 'Base de datos Oracle expuesta; objetivo frecuente en entidades gubernamentales.' },
  { port: 6379, service: 'Redis (In-Memory)',            shortName: 'Redis',       risk: 'CRÍTICO', description: 'Almacén de sesiones y tokens en memoria accesible sin contraseña.' },
  { port: 27017, service: 'MongoDB Database',            shortName: 'MongoDB',     risk: 'CRÍTICO', description: 'Base de datos NoSQL MongoDB expuesta directamente sin firewall.' },
  { port: 5984, service: 'CouchDB REST API',             shortName: 'CouchDB',     risk: 'CRÍTICO', description: 'Base de datos CouchDB con API HTTP pública sin autenticación.' },
  { port: 7474, service: 'Neo4j Graph Database',         shortName: 'Neo4j',       risk: 'CRÍTICO', description: 'Base de datos de grafos Neo4j accesible sin credenciales.' },
  // ── Contenedores / DevOps ────────────────────────────────────────────────────
  { port: 2375, service: 'Docker API (Sin TLS)',         shortName: 'Docker',      risk: 'CRÍTICO', description: 'API de Docker sin cifrado: control total del servidor en remoto.' },
  { port: 2376, service: 'Docker API (TLS)',             shortName: 'Docker-TLS',  risk: 'ALTO',    description: 'API Docker con TLS; verificar que no acepte certificados auto-firmados.' },
  { port: 2379, service: 'etcd (Kubernetes)',            shortName: 'etcd',        risk: 'CRÍTICO', description: 'Base de datos de configuración Kubernetes con secretos del clúster.' },
  // ── File Sharing / Legacy ────────────────────────────────────────────────────
  { port: 445,  service: 'SMB / NetBIOS',               shortName: 'SMB',         risk: 'CRÍTICO', description: 'Compartición de archivos Windows vulnerable a gusanos tipo WannaCry.' },
  { port: 139,  service: 'NetBIOS Session Service',      shortName: 'NetBIOS',     risk: 'CRÍTICO', description: 'Protocolo legacy de red Windows expuesto a enumeración y ataques.' },
  { port: 2049, service: 'NFS (Network File System)',    shortName: 'NFS',         risk: 'CRÍTICO', description: 'Montaje de sistemas de archivos remotos sin autenticación fuerte.' },
  { port: 111,  service: 'RPC / Portmapper',            shortName: 'RPC',         risk: 'ALTO',    description: 'Servicio de mapeo RPC; facilita enumeración de servicios del servidor.' },
];
