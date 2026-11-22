// Informe experto: cómo se ataca cada hallazgo, cómo se encadenan y cómo defenderse.
// Solo reorganiza lo medido: no crea hallazgos y no sube la confianza de ninguno.
import { db, getEngagement } from './store.mjs';
import { buildExecutive, executiveMarkdown, levelText } from './executive.mjs';

const RANK = /** @type {Record<string, number>} */ ({ 'CRÍTICO': 4, ALTO: 3, MEDIO: 2, BAJO: 1 });
const ENGINE_LABEL = /** @type {Record<string, string>} */ ({
  perimeter: 'Perímetro', webapp: 'Aplicación web', surface: 'Superficie de ataque', nuclei: 'Nuclei', files: 'Archivos sensibles',
  cve: 'CVE por cabeceras', 'cve-services': 'CVE por servicios', nmap: 'nmap', testssl: 'testssl', crawler: 'Rastreador', 'crawler-auth': 'Rastreador con sesión',
  idor: 'Control de acceso (2 cuentas)', 'zap-baseline': 'ZAP pasivo', 'zap-active': 'ZAP activo', 'zap-auth': 'ZAP con sesión', api: 'API (OpenAPI)', browser: 'Navegador (SPA)',
  wordpress: 'WordPress', semgrep: 'Semgrep (código)', gitleaks: 'Gitleaks (secretos)', trivy: 'Trivy (dependencias)', lynis: 'Lynis (servidor)', hibp: 'Credenciales filtradas',
});

/**
 * Conocimiento por tipo de hallazgo. `tags` son capacidades que el hallazgo da a un atacante y
 * sirven para encadenar rutas.
 * @typedef {{ id: string, test: RegExp, tags: string[], attack: string, impact: string, mitre: string[],
 *   h24: string[], d7: string[], d30: string[], retest: string }} Rule
 * @type {Rule[]}
 */
export const RULES = [
  { id: 'container-api', test: /(tcp\/(2375|2376|2379))\b|docker.*(api|daemon)|etcd/i, tags: ['container_api', 'rce'],
    attack: 'La API de Docker o etcd responde desde Internet. Quien llegue a ella crea un contenedor que monta el disco del servidor y obtiene control total como root; con etcd lee todos los secretos del clúster.',
    impact: 'Toma completa del servidor y de lo que corre en él.', mitre: ['T1610', 'T1190'],
    h24: ['Cerrar 2375, 2376 y 2379 en el firewall del proveedor y en ufw/iptables.', 'Asumir el servidor comprometido: revisar contenedores, usuarios y tareas cron desconocidos.'],
    d7: ['Hacer que Docker escuche solo por socket local o por TLS mutuo detrás de VPN.', 'Rotar todas las credenciales y secretos que viven en ese host.'],
    d30: ['Alerta automática si estos puertos vuelven a abrirse.'], retest: 'nmap -Pn -p 2375,2376,2379 <host> debe mostrar closed o filtered.' },
  { id: 'db-exposed', test: /(tcp\/(3306|5432|1433|1521|6379|27017|5984|7474|9200|5601|11211))\b|puerto (3306|5432|1433|1521|6379|27017|5984|7474|9200|5601|11211)\b/i, tags: ['db_exposed'],
    attack: 'El motor de base de datos acepta conexiones desde Internet. Los bots prueban contraseñas por defecto y credenciales filtradas, y Redis, MongoDB y Elasticsearch suelen estar abiertos sin contraseña: se descargan, borran o cifran los datos con una nota de extorsión.',
    impact: 'Robo, alteración o secuestro de los datos de clientes.', mitre: ['T1190', 'T1078', 'T1486'],
    h24: ['Bloquear el puerto de base de datos en el firewall del proveedor y en el servidor.', 'Cambiar las contraseñas de la base de datos: pudieron probarlas.'],
    d7: ['Enlazar el motor a 127.0.0.1 o a una red privada y acceder por VPN o túnel SSH.', 'Revisar los registros de autenticación de los últimos 30 días.', 'Crear un usuario de aplicación con los privilegios mínimos.'],
    d30: ['Cifrar copias de seguridad y probar su restauración.', 'Regla de firewall como código y alerta si el puerto reaparece.'], retest: 'nmap -Pn -p <puerto> <host> debe mostrar closed o filtered.' },
  { id: 'remote-access', test: /tcp\/(22|23|3389|5900|5901)\b|rdp|telnet|\bvnc\b/i, tags: ['remote_access'],
    attack: 'Acceso remoto abierto a Internet: se prueban contraseñas filtradas y por fuerza bruta. RDP y VNC son la entrada habitual de los ransomware; Telnet viaja en texto plano.',
    impact: 'Control del equipo y base para moverse por la red interna.', mitre: ['T1133', 'T1110', 'T1078'],
    h24: ['Restringir el puerto a las IP de la oficina o cerrarlo.', 'Desactivar Telnet y VNC sin túnel.'],
    d7: ['Acceso solo por VPN con MFA. SSH con llaves, sin contraseña ni root (PasswordAuthentication no, PermitRootLogin no).', 'Instalar fail2ban o equivalente.'],
    d30: ['Bastión o Zero Trust para el acceso administrativo.', 'Registro y alerta de inicios de sesión remotos.'], retest: 'nmap -Pn -p 22,3389 <host> debe mostrar closed o filtered desde Internet.' },
  { id: 'lateral', test: /tcp\/(445|139|2049|111)\b|\bsmb\b|netbios|\bnfs\b/i, tags: ['lateral', 'remote_access'],
    attack: 'Servicios de compartición de archivos expuestos. SMB ha sido el vehículo de gusanos como WannaCry; NFS permite montar discos sin credenciales si está mal exportado.',
    impact: 'Propagación automática y lectura o cifrado de archivos.', mitre: ['T1021.002', 'T1190'],
    h24: ['Bloquear 445, 139, 2049 y 111 en el firewall perimetral.'], d7: ['Aplicar parches del sistema operativo y desactivar SMBv1.', 'Revisar exportaciones NFS y recursos compartidos.'],
    d30: ['Segmentar la red: los servidores públicos no deben ver los equipos internos.'], retest: 'nmap -Pn -p 445,139,2049,111 <host> debe mostrar closed o filtered.' },
  { id: 'ftp', test: /tcp\/(21|990)\b|\bftp\b/i, tags: ['remote_access'],
    attack: 'FTP envía usuario y contraseña en claro y se ataca con fuerza bruta. Una cuenta comprometida sirve para subir una webshell.',
    impact: 'Modificación del sitio y puerta trasera permanente.', mitre: ['T1133', 'T1105', 'T1505.003'],
    h24: ['Cerrar el puerto 21 si no se usa y cambiar las contraseñas de las cuentas FTP.'], d7: ['Migrar a SFTP o FTPS y restringir por IP.', 'Buscar archivos PHP recientes que no reconozcas.'],
    d30: ['Despliegue por Git o CI en lugar de FTP.'], retest: 'nmap -Pn -p 21 <host> debe mostrar closed o filtered.' },
  { id: 'secret-files', test: /archivo sensible expuesto|\.env\b|\.git\b|backup|respaldo|\.sql\b|cwe-538/i, tags: ['secrets', 'source_code'],
    attack: 'Un archivo de configuración, repositorio o copia de seguridad se descarga con una simple petición. Contiene claves de base de datos, de correo y de APIs, o el código fuente completo con su historial.',
    impact: 'Acceso directo a la infraestructura sin explotar ninguna vulnerabilidad.', mitre: ['T1552.001', 'T1213'],
    h24: ['Retirar el archivo del directorio público y bloquear su ruta en el servidor web.', 'Rotar TODAS las claves y contraseñas que contenía: pueden estar ya copiadas.'],
    d7: ['Revisar logs de acceso para saber si alguien lo descargó y desde dónde.', 'Denegar archivos ocultos y de copia en el servidor web (location ~ /\\. { deny all; }).'],
    d30: ['Gestor de secretos en lugar de archivos .env en producción.', 'Despliegues que nunca incluyan .git ni copias.'], retest: 'La URL del archivo debe responder 404 o 403.' },
  { id: 'secrets-in-code', test: /secret|credencial|clave de api|api.?key|token/i, tags: ['secrets'],
    attack: 'Hay claves o tokens al alcance de cualquiera que lea el código público o el repositorio. Se reutilizan de inmediato contra el servicio al que pertenecen.',
    impact: 'Uso no autorizado de servicios de pago, nube, correo o bases de datos.', mitre: ['T1552.001', 'T1078'],
    h24: ['Revocar y reemplazar la clave expuesta en el proveedor.'], d7: ['Revisar el uso de esa clave en el panel del proveedor.', 'Mover los secretos al servidor: variables de entorno o gestor de secretos.'],
    d30: ['Escaneo de secretos en CI (Gitleaks) y pre-commit.'], retest: 'La clave anterior debe estar revocada y el código no debe contenerla.' },
  { id: 'takeover', test: /takeover|subdominio colgante|dangling/i, tags: ['takeover'],
    attack: 'Un subdominio apunta a un servicio cloud ya borrado. El atacante lo reclama y sirve contenido bajo el dominio legítimo: phishing creíble y robo de cookies.',
    impact: 'Suplantación de la marca y robo de sesiones.', mitre: ['T1584.001', 'T1566'],
    h24: ['Eliminar el registro DNS colgante.'], d7: ['Inventariar todos los registros DNS y retirar los que no usa nadie.'], d30: ['Alerta de subdominios nuevos y revisión mensual del DNS.'],
    retest: 'El subdominio no debe resolver a un recurso reclamable.' },
  { id: 'mail-spoof', test: /dmarc|\bspf\b|dkim|mta-sts/i, tags: ['mail_spoof'],
    attack: 'Sin SPF, DKIM y DMARC en modo estricto cualquiera envía correos que parecen venir del dominio. Es la base del fraude al gerente y del phishing a clientes.',
    impact: 'Fraude por correo y daño a la reputación del dominio.', mitre: ['T1566', 'T1656'],
    h24: ['Publicar SPF y un DMARC p=none con informes (rua) para ver quién envía en nombre del dominio.'], d7: ['Configurar DKIM y pasar DMARC a quarantine.'],
    d30: ['DMARC p=reject y MTA-STS.'], retest: 'dig TXT _dmarc.<dominio> debe mostrar p=quarantine o reject.' },
  { id: 'user-enum', test: /enumeraci[óo]n de usuarios|wp-json\/wp\/v2\/users|author=\d/i, tags: ['user_enum'],
    attack: 'La web lista los nombres de usuario reales. El atacante prueba contraseñas filtradas solo contra cuentas que existen.',
    impact: 'Facilita fuerza bruta y phishing dirigido.', mitre: ['T1087', 'T1110'],
    h24: ['Bloquear /wp-json/wp/v2/users y ?author= para visitantes anónimos.'], d7: ['Límite de intentos de login y MFA en cuentas administradoras.'], d30: ['Nombres de usuario de login distintos del nombre público.'],
    retest: 'GET /wp-json/wp/v2/users debe devolver 401 o 403.' },
  { id: 'admin-panel', test: /panel|phpmyadmin|actuator|depurador|debug|console|jenkins|administraci[óo]n|wp-login|xmlrpc/i, tags: ['admin_panel'],
    attack: 'Un panel administrativo o de depuración es accesible desde Internet. Se prueban credenciales por defecto, filtradas o por fuerza bruta; algunos paneles ejecutan comandos.',
    impact: 'Control de la aplicación y a veces del servidor.', mitre: ['T1190', 'T1078', 'T1110'],
    h24: ['Restringir el panel por IP o ponerlo detrás de VPN.'], d7: ['MFA, límite de intentos y contraseñas únicas.', 'Desactivar xmlrpc.php y consolas de depuración en producción.'],
    d30: ['Panel en una red interna, no en el mismo dominio público.'], retest: 'La URL del panel no debe ser alcanzable desde una IP no autorizada.' },
  { id: 'xss', test: /xss|cross.?site scripting|cwe-79\b/i, tags: ['xss'],
    attack: 'Se inyecta JavaScript que corre en el navegador de otros usuarios con los permisos de su sesión: roba cookies, actúa en su nombre o redirige a páginas falsas.',
    impact: 'Robo de sesiones de clientes y administradores.', mitre: ['T1189', 'T1539'],
    h24: ['Codificar la salida donde se refleja el dato.'], d7: ['Content-Security-Policy estricta y cookies HttpOnly.', 'Revisar todos los puntos de entrada similares.'], d30: ['Motor de plantillas con codificación automática y pruebas SAST en CI.'],
    retest: 'Repetir la petición de la evidencia: el texto debe salir codificado.' },
  { id: 'sqli', test: /sql ?injection|inyecci[óo]n sql|\bsqli\b|cwe-89\b/i, tags: ['sqli', 'db_access'],
    attack: 'Datos del usuario llegan a una consulta de base de datos sin parametrizar. El atacante lee, modifica o borra tablas y a veces ejecuta comandos en el servidor.',
    impact: 'Fuga total de datos y posible control del servidor.', mitre: ['T1190'],
    h24: ['Poner un WAF con reglas SQLi mientras se corrige.', 'Revisar el registro de accesos buscando esa ruta.'], d7: ['Consultas parametrizadas en todo el código; usuario de BD con privilegios mínimos.'],
    d30: ['Revisión de código y SAST en CI.'], retest: 'La carga de prueba debe devolver error controlado y no cambiar la respuesta.' },
  { id: 'broken-access', test: /idor|control de acceso|acceso a objetos|sin credenciales|cwe-(639|284|306|862|863)\b/i, tags: ['broken_access'],
    attack: 'El servidor no comprueba si quien pide el dato tiene derecho a verlo. Cambiar un identificador en la URL o llamar a la API sin sesión basta para leer información ajena.',
    impact: 'Lectura masiva de datos de otros clientes.', mitre: ['T1190', 'T1213'],
    h24: ['Exigir autenticación en el endpoint afectado o retirarlo.'], d7: ['Verificar en el servidor que el recurso pertenece al usuario en cada petición.', 'Identificadores no secuenciales (UUID).'],
    d30: ['Pruebas automáticas de autorización con dos cuentas en CI.'], retest: 'La petición sin sesión debe dar 401/403; con otra cuenta, 403/404.' },
  { id: 'cors', test: /\bcors\b/i, tags: ['cors_open'],
    attack: 'CORS permisivo deja que una página de un tercero lea respuestas autenticadas del sitio desde el navegador de la víctima.',
    impact: 'Lectura de datos privados con la sesión del usuario.', mitre: ['T1189'],
    h24: ['Sustituir el origen reflejado o * por una lista fija de orígenes.'], d7: ['No permitir credenciales con orígenes comodín.'], d30: ['Prueba CORS automática en CI.'], retest: 'Origin: https://evil.example no debe reflejarse en Access-Control-Allow-Origin.' },
  { id: 'cookies', test: /cookie/i, tags: ['cookie_weak'],
    attack: 'Cookies de sesión sin HttpOnly, Secure o SameSite se leen con un XSS, viajan por redes sin cifrar o se envían en ataques CSRF.',
    impact: 'Robo o abuso de sesiones.', mitre: ['T1539'],
    h24: ['Añadir Secure; HttpOnly; SameSite=Lax a las cookies de sesión.'], d7: ['Rotar el identificador de sesión al iniciar sesión.'], d30: ['Duración de sesión corta y cierre global.'], retest: 'Set-Cookie debe incluir Secure, HttpOnly y SameSite.' },
  { id: 'tls', test: /\btls\b|\bssl\b|certificad|cipher|cifrado|hsts|heartbleed|poodle|\brobot\b|\bbeast\b|sweet32|logjam/i, tags: ['tls_weak'],
    attack: 'Protocolos o cifrados obsoletos y la falta de HSTS permiten degradar la conexión o interceptarla en redes no confiables (wifi público, proveedor).',
    impact: 'Lectura o alteración del tráfico y de las sesiones.', mitre: ['T1557'],
    h24: ['Renovar o corregir el certificado si está vencido o inválido.'], d7: ['Solo TLS 1.2 y 1.3 con cifrados modernos.', 'Activar HSTS.'], d30: ['HSTS con preload y monitoreo de caducidad.'], retest: 'testssl <host>:443 no debe mostrar el problema.' },
  { id: 'headers', test: /content-security-policy|\bcsp\b|x-frame|clickjacking|x-content-type|referrer-policy|permissions-policy|cabecera/i, tags: ['no_csp'],
    attack: 'Sin estas cabeceras el navegador no frena inyecciones de scripts, incrustación en páginas falsas (clickjacking) ni el adivinado de tipos de archivo.',
    impact: 'Agrava XSS y facilita el fraude con páginas espejo.', mitre: ['T1189'],
    h24: ['Añadir X-Frame-Options o frame-ancestors, X-Content-Type-Options y Referrer-Policy.'], d7: ['CSP en modo report-only y luego en modo estricto.'], d30: ['CSP con nonces y sin unsafe-inline.'], retest: 'curl -I <url> debe mostrar las cabeceras.' },
  { id: 'wp-plugin', test: /wordpress: .*(plugin|tema)/i, tags: ['known_vuln', 'wp_plugin'],
    attack: 'Los plugins y temas desactualizados son la entrada más habitual a WordPress: hay escáneres automáticos que buscan miles de sitios con la versión vulnerable el día que se publica el fallo.',
    impact: 'Subida de webshells, redirecciones de spam y robo de datos.', mitre: ['T1190', 'T1505.003'],
    h24: ['Actualizar o desactivar el componente afectado.'], d7: ['Hacer una copia previa y actualizar todos los plugins y temas.', 'Eliminar los que no se usan.'], d30: ['Actualizaciones automáticas de seguridad y monitoreo semanal.'],
    retest: 'La versión instalada debe ser igual o posterior a la corregida.' },
  { id: 'known-vuln', test: /cve-\d{4}-\d+|vulnerabilidad|nuclei|trivy|desactualizad/i, tags: ['known_vuln'],
    attack: 'El componente tiene una vulnerabilidad pública. Existen exploits y escáneres automáticos; las explotadas activamente (CISA KEV) se atacan en masa a las pocas horas.',
    impact: 'Según el fallo: ejecución de código, fuga de datos o denegación de servicio.', mitre: ['T1190', 'T1195.001'],
    h24: ['Aplicar el parche del proveedor, o desactivar el componente si no existe.'], d7: ['Inventariar el resto del software y su versión.', 'Mitigación temporal en el WAF si no se puede parchear ya.'],
    d30: ['Actualizaciones automáticas y revisión semanal de vulnerabilidades.'], retest: 'La versión visible o el escaneo no debe mostrar el CVE.' },
  { id: 'code-flaw', test: /semgrep|inyecci[óo]n|deserializ|path traversal|ssrf|command injection/i, tags: ['code_flaw'],
    attack: 'Un patrón inseguro en el código fuente permite que datos controlados por el usuario lleguen a una función peligrosa (consulta, comando, archivo o petición interna).',
    impact: 'Depende del patrón: lectura de datos, ejecución de comandos o acceso a la red interna.', mitre: ['T1190'],
    h24: ['Confirmar a mano si el flujo es alcanzable desde Internet.'], d7: ['Corregir con la API segura del framework (consultas parametrizadas, rutas normalizadas, listas permitidas).'],
    d30: ['Semgrep en CI con bloqueo de merge.'], retest: 'Semgrep no debe reportar la regla en ese archivo.' },
  { id: 'hardening', test: /lynis|hardening|endurec/i, tags: ['hardening'],
    attack: 'Configuraciones débiles del sistema operativo multiplican el daño de cualquier otra falla: permisos amplios, servicios innecesarios, sin auditoría.',
    impact: 'Escalada de privilegios y persistencia tras un primer acceso.', mitre: ['T1068', 'T1548'],
    h24: [], d7: ['Aplicar las recomendaciones de Lynis de severidad alta.'], d30: ['Línea base de endurecimiento (CIS) y auditoría programada.'], retest: 'lynis audit system y comparar el índice de hardening.' },
  { id: 'creds-leaked', test: /filtraci[óo]n|credenciales de \d+ cuentas|breach/i, tags: ['creds_leaked'],
    attack: 'Las contraseñas de cuentas del dominio aparecen en filtraciones públicas. Se prueban de forma automática contra el correo, el panel y la VPN de la empresa (credential stuffing).',
    impact: 'Acceso con cuentas legítimas, difícil de distinguir de un uso normal.', mitre: ['T1078', 'T1110.004'],
    h24: ['Forzar el cambio de contraseña de las cuentas afectadas.'], d7: ['MFA obligatorio en correo, panel y VPN.', 'Bloquear contraseñas conocidas como filtradas.'], d30: ['Gestor de contraseñas corporativo y formación anti-phishing.'], retest: 'Las cuentas afectadas deben haber cambiado la contraseña y tener MFA.' },
  { id: 'misconfig', test: /misconfig|configuraci[óo]n|dockerfile|kubernetes|terraform/i, tags: ['misconfig'],
    attack: 'Una configuración insegura de infraestructura (contenedores con privilegios, almacenamiento público) facilita el acceso o la escalada tras cualquier otra falla.',
    impact: 'Mayor alcance de un incidente.', mitre: ['T1610', 'T1530'],
    h24: [], d7: ['Aplicar la resolución indicada en cada control.'], d30: ['Escaneo de infraestructura como código en CI.'], retest: 'Trivy config no debe reportar el control.' },
];

/** Correcciones listas para pegar, por tipo de hallazgo. Ejemplos que se adaptan al entorno: se prueban primero en staging. */
export const SNIPPETS = {
  "db-exposed": { name: "Cerrar la base de datos expuesta", items: [
    { label: "Firewall (ufw): sustituye <puerto>", code: "sudo ufw deny <puerto>/tcp\nsudo ufw status numbered" },
    { label: "MySQL / MariaDB (my.cnf)", code: "[mysqld]\nbind-address = 127.0.0.1" },
    { label: "PostgreSQL (postgresql.conf)", code: "listen_addresses = 'localhost'" },
    { label: "Redis (redis.conf)", code: "bind 127.0.0.1 -::1\nprotected-mode yes\nrequirepass <contraseña-larga-y-única>" } ] },
  "remote-access": { name: "Cerrar el acceso remoto", items: [
    { label: "Solo desde la oficina (ufw)", code: "sudo ufw allow from <IP-oficina> to any port 22 proto tcp\nsudo ufw deny 22/tcp\nsudo ufw deny 3389/tcp" },
    { label: "SSH con llaves (/etc/ssh/sshd_config)", code: "PasswordAuthentication no\nPermitRootLogin no\nMaxAuthTries 3" } ] },
  "lateral": { name: "Cerrar archivos compartidos", items: [
    { label: "Firewall (ufw)", code: "sudo ufw deny 445/tcp\nsudo ufw deny 139/tcp\nsudo ufw deny 2049/tcp\nsudo ufw deny 111/tcp" } ] },
  "ftp": { name: "Cerrar FTP", items: [
    { label: "Firewall (ufw)", code: "sudo ufw deny 21/tcp" } ] },
  "secret-files": { name: "Bloquear archivos ocultos y copias", items: [
    { label: "nginx", code: "location ~ /\\.(?!well-known) { deny all; }\nlocation ~* \\.(sql|bak|old|zip|tar|gz|env)$ { deny all; }" },
    { label: "Apache (.htaccess)", code: "<FilesMatch \"(^\\.|\\.(sql|bak|old|zip|tar|gz|env)$)\">\n  Require all denied\n</FilesMatch>" } ] },
  "admin-panel": { name: "Restringir el panel de administración", items: [
    { label: "nginx (WordPress): deja pasar admin-ajax.php", code: "location ~ ^/wp-admin/(?!admin-ajax\\.php) {\n  allow <IP-oficina>;\n  deny all;\n}" },
    { label: "nginx: desactivar xmlrpc.php", code: "location = /xmlrpc.php { deny all; }" } ] },
  "user-enum": { name: "Ocultar los nombres de usuario", items: [
    { label: "nginx", code: "location ~ ^/wp-json/wp/v2/users { return 403; }\nif ($arg_author) { return 403; }" } ] },
  "cors": { name: "Restringir CORS", items: [
    { label: "nginx: una lista fija en lugar de reflejar el origen", code: "add_header Access-Control-Allow-Origin \"https://app.tudominio.com\" always;" } ] },
  "cookies": { name: "Proteger las cookies de sesión", items: [
    { label: "PHP (php.ini)", code: "session.cookie_secure = 1\nsession.cookie_httponly = 1\nsession.cookie_samesite = Lax" },
    { label: "nginx como proxy (1.19.3 o superior)", code: "proxy_cookie_flags ~ secure httponly samesite=lax;" } ] },
  "tls": { name: "Endurecer TLS", items: [
    { label: "nginx", code: "ssl_protocols TLSv1.2 TLSv1.3;\nssl_prefer_server_ciphers off;\nadd_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;" },
    { label: "Apache", code: "SSLProtocol -all +TLSv1.2 +TLSv1.3\nHeader always set Strict-Transport-Security \"max-age=31536000; includeSubDomains\"" } ] },
  "headers": { name: "Cabeceras de seguridad", items: [
    { label: "nginx", code: "add_header X-Frame-Options \"SAMEORIGIN\" always;\nadd_header X-Content-Type-Options \"nosniff\" always;\nadd_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\nadd_header Permissions-Policy \"geolocation=(), camera=(), microphone=()\" always;" },
    { label: "Apache", code: "Header always set X-Frame-Options \"SAMEORIGIN\"\nHeader always set X-Content-Type-Options \"nosniff\"\nHeader always set Referrer-Policy \"strict-origin-when-cross-origin\"\nHeader always set Permissions-Policy \"geolocation=(), camera=(), microphone=()\"" },
    { label: "Cloudflare", code: "Rules → Transform Rules → Modify Response Header: añade las mismas cabeceras a todas las respuestas." } ] },
  "xss": { name: "Política de contenido (empieza en modo informe)", items: [
    { label: "nginx", code: "add_header Content-Security-Policy-Report-Only \"default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'\" always;" } ] },
  "sqli": { name: "Consultas parametrizadas", items: [
    { label: "PHP (PDO)", code: "$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');\n$stmt->execute(['email' => $email]);" },
    { label: "Node.js (pg)", code: "await db.query('SELECT * FROM users WHERE email = $1', [email]);" } ] },
  "broken-access": { name: "Comprobar la propiedad en el servidor", items: [
    { label: "Pseudocódigo", code: "const order = await Orders.find(id);\nif (!order || order.userId !== session.userId) return res.status(404).end();" } ] },
  "mail-spoof": { name: "Registros DNS de correo (ajusta al proveedor)", items: [
    { label: "DNS", code: "@        TXT  \"v=spf1 include:_spf.google.com -all\"\n_dmarc   TXT  \"v=DMARC1; p=quarantine; rua=mailto:dmarc@tudominio.com\"" } ] },
  "takeover": { name: "Subdominio colgante", items: [
    { label: "Comprobar y eliminar", code: "dig CNAME subdominio.tudominio.com +short\n# Si apunta a un servicio que ya no usas, borra el registro CNAME en el panel DNS" } ] },
  "wp-plugin": { name: "Actualizar WordPress", items: [
    { label: "WP-CLI", code: "wp plugin update --all\nwp theme update --all\nwp plugin deactivate <plugin-abandonado>" } ] },
  "known-vuln": { name: "Parchear el componente", items: [
    { label: "Debian / Ubuntu", code: "sudo apt update && sudo apt install --only-upgrade <paquete>\napt list --upgradable" } ] },
};

/**
 * Precisión de cada motor según lo que tú revisaste a mano (validados frente a falsos positivos).
 * Con 5 revisiones o más y menos del 50% de aciertos, sus hallazgos sin confirmar pierden prioridad.
 */
export function engineQuality() {
  const rows = db().prepare("SELECT engine, status, validated FROM findings WHERE validated=1 OR status='false_positive'").all();
  /** @type {Map<string, { tp: number, fp: number }>} */
  const m = new Map();
  for (const r of rows) {
    const c = m.get(r.engine) || { tp: 0, fp: 0 };
    if (r.status === 'false_positive') c.fp++;
    else c.tp++;
    m.set(r.engine, c);
  }
  return new Map([...m].map(([engine, c]) => {
    const reviewed = c.tp + c.fp;
    const precision = c.tp / reviewed;
    return [engine, { reviewed, precision, trusted: reviewed >= 5, low: reviewed >= 5 && precision < 0.5 }];
  }));
}

const GENERIC = /** @type {Omit<Rule,'id'|'test'|'tags'>} */ ({
  attack: 'Debilidad que reduce la seguridad de la aplicación o del servidor y que un atacante usa como paso previo a otros ataques.',
  impact: 'Depende del contexto: valorar con el responsable del sistema.', mitre: ['T1190'],
  h24: [], d7: [], d30: ['Incluir la corrección en el ciclo de mantenimiento.'], retest: 'Repetir la auditoría y comprobar que el hallazgo ya no aparece.',
});

/**
 * Rutas de ataque: combinaciones de capacidades que, juntas, permiten un resultado mayor.
 * Un paso con `tag` solo cuenta como comprobado si lo respalda un hallazgo confirmado o validado a mano.
 * @type {{ id: string, title: string, needs: string[], any?: string[], steps: { text: string, tag?: string }[], impact: string, mitre: string[] }[]}
 */
export const PATHS = [
  { id: 'secrets-to-db', title: 'De un archivo filtrado a la base de datos', needs: ['secrets', 'db_exposed'], impact: 'Descarga o secuestro de todos los datos.', mitre: ['T1552.001', 'T1078', 'T1486'],
    steps: [{ text: 'Descargar el archivo expuesto', tag: 'secrets' }, { text: 'Extraer la credencial de base de datos' }, { text: 'Conectarse al puerto de base de datos abierto', tag: 'db_exposed' }, { text: 'Autenticarse con esa credencial' }, { text: 'Copiar o cifrar las tablas' }] },
  { id: 'code-to-exploit', title: 'Código fuente expuesto acelera la explotación', needs: ['source_code', 'known_vuln'], impact: 'Ejecución de código con el exploit exacto para la versión.', mitre: ['T1593.003', 'T1190'],
    steps: [{ text: 'Descargar código o historial expuesto', tag: 'source_code' }, { text: 'Identificar la versión y las rutas internas' }, { text: 'Usar el exploit público del componente vulnerable', tag: 'known_vuln' }, { text: 'Obtener ejecución de comandos' }] },
  { id: 'xss-session', title: 'Robo de sesión mediante XSS', needs: ['xss', 'cookie_weak'], impact: 'Acceso a cuentas de clientes y administradores.', mitre: ['T1189', 'T1539'],
    steps: [{ text: 'Enviar a la víctima un enlace con el script', tag: 'xss' }, { text: 'Leer la cookie de sesión sin HttpOnly', tag: 'cookie_weak' }, { text: 'Entrar con la sesión robada' }] },
  { id: 'takeover-phishing', title: 'Phishing creíble con un subdominio propio', needs: ['takeover', 'mail_spoof'], impact: 'Fraude a clientes y proveedores con la marca real.', mitre: ['T1584.001', 'T1566'],
    steps: [{ text: 'Reclamar el subdominio colgante', tag: 'takeover' }, { text: 'Publicar una página de acceso falsa en ese subdominio' }, { text: 'Enviar correos que pasan por el dominio real', tag: 'mail_spoof' }, { text: 'Recoger credenciales o pagos' }] },
  { id: 'enum-phishing', title: 'Phishing dirigido a cuentas reales', needs: ['mail_spoof', 'user_enum'], impact: 'Compromiso de una cuenta con privilegios.', mitre: ['T1087', 'T1566'],
    steps: [{ text: 'Listar los usuarios reales del sitio', tag: 'user_enum' }, { text: 'Suplantar el correo del dominio', tag: 'mail_spoof' }, { text: 'Pedir la contraseña a quien tiene permisos' }] },
  { id: 'enum-admin-brute', title: 'Fuerza bruta contra el panel con usuarios válidos', needs: ['user_enum', 'admin_panel'], impact: 'Control del panel de administración.', mitre: ['T1087', 'T1110'],
    steps: [{ text: 'Obtener nombres de usuario válidos', tag: 'user_enum' }, { text: 'Probar contraseñas filtradas contra el panel', tag: 'admin_panel' }, { text: 'Entrar al panel y subir código' }] },
  { id: 'rce-lateral', title: 'Ejecución remota y movimiento lateral', needs: ['rce'], any: ['lateral', 'remote_access', 'db_exposed'], impact: 'Compromiso de varios sistemas desde el servidor público.', mitre: ['T1190', 'T1021'],
    steps: [{ text: 'Explotar el componente con ejecución remota', tag: 'rce' }, { text: 'Usar los servicios internos expuestos' }, { text: 'Extenderse a otros equipos' }] },
  { id: 'container-takeover', title: 'Toma directa del servidor por la API de contenedores', needs: ['container_api'], impact: 'Control total como root, sin credenciales.', mitre: ['T1610'],
    steps: [{ text: 'Conectarse a la API abierta', tag: 'container_api' }, { text: 'Crear un contenedor que monte el disco del host' }, { text: 'Leer secretos y persistir' }] },
  { id: 'creds-reuse', title: 'Reutilización de credenciales filtradas', needs: ['creds_leaked'], any: ['admin_panel', 'remote_access', 'broken_access'], impact: 'Acceso con cuentas legítimas.', mitre: ['T1078', 'T1110.004'],
    steps: [{ text: 'Tomar contraseñas de filtraciones públicas', tag: 'creds_leaked' }, { text: 'Probarlas en los accesos expuestos' }, { text: 'Entrar sin generar alertas de ataque' }] },
  { id: 'repo-secrets', title: 'Secretos en el repositorio reutilizados en producción', needs: ['secrets_repo'], impact: 'Acceso a servicios de nube, pagos o bases de datos.', mitre: ['T1552.001', 'T1078'],
    steps: [{ text: 'Leer el repositorio o su historial', tag: 'secrets_repo' }, { text: 'Probar la clave contra el proveedor real' }, { text: 'Usar el servicio con los permisos de esa clave' }] },
  { id: 'open-data', title: 'Lectura masiva de datos sin autenticación', needs: ['broken_access'], impact: 'Fuga de datos de clientes.', mitre: ['T1190', 'T1213'],
    steps: [{ text: 'Llamar al endpoint sin sesión o con otro identificador', tag: 'broken_access' }, { text: 'Recorrer los identificadores y descargar todo' }] },
];

const isConfirmed = (/** @type {any} */ f) => f.validated || f.confidence === 'confirmado';

/**
 * El mismo hallazgo visto por varios motores se muestra una vez: con la confianza más alta y quién más lo vio.
 * @param {ReturnType<typeof enrich>[]} list
 */
function dedupe(list) {
  const conf = /** @type {Record<string, number>} */ ({ confirmado: 3, probable: 2, informativo: 1 });
  /** @type {Map<string, any>} */
  const by = new Map();
  for (const f of list) {
    const k = `${f.host}|${f.title}`;
    const prev = by.get(k);
    if (!prev) { by.set(k, f); continue; }
    const keep = (conf[f.confidence] || 0) > (conf[prev.confidence] || 0) ? f : prev;
    const other = keep === f ? prev : f;
    keep.alsoFoundBy = [...new Set([...(keep.alsoFoundBy || []), ...(other.alsoFoundBy || []), other.motor])];
    by.set(k, keep);
  }
  return [...by.values()];
}

/** @param {any} f */
function describe(f) {
  // La evidencia no decide el tipo: es texto del sitio auditado y mete ruido
  const text = `${f.title} ${f.cwe || ''} ${f.engine}`;
  const hits = RULES.filter((r) => r.test.test(text));
  // El motor manda para los que tienen su propia regla; el resto, por texto
  const byEngine = f.engine === 'gitleaks' ? RULES.find((r) => r.id === 'secrets-in-code')
    : f.engine === 'wordpress' && /plugin|tema/i.test(f.title) ? RULES.find((r) => r.id === 'wp-plugin')
    : f.engine === 'lynis' ? RULES.find((r) => r.id === 'hardening')
    : f.engine === 'hibp' ? RULES.find((r) => r.id === 'creds-leaked')
    : f.engine === 'semgrep' && !hits.length ? RULES.find((r) => r.id === 'code-flaw')
    : f.engine === 'trivy' && /misconfig|configuraci/i.test(f.title) ? RULES.find((r) => r.id === 'misconfig')
    : undefined;
  const primary = byEngine || hits[0];
  const tags = new Set(hits.flatMap((r) => r.tags));
  for (const t of byEngine?.tags || []) tags.add(t);
  if (f.engine === 'gitleaks') { tags.add('secrets_repo'); tags.add('secrets'); }
  if (f.engine === 'api') tags.add('broken_access');
  if (f.engine === 'semgrep') { if (/cwe-89\b/i.test(f.cwe || '')) tags.add('sqli'); if (/cwe-79\b/i.test(f.cwe || '')) tags.add('xss'); }
  if (/\.map\b|source ?map/i.test(text)) tags.add('source_code');
  if (/ejecuci[óo]n remota|\brce\b|remote code/i.test(text) && RANK[f.severity] >= 3) tags.add('rce');
  const kb = primary || GENERIC;
  return { rule: primary?.id || 'generico', tags: [...tags], kb };
}

/** @param {any} row */
function enrich(row, quality = new Map()) {
  const { rule, tags, kb } = describe(row);
  const q = quality.get(row.engine);
  const confirmed = isConfirmed(row);
  const kev = /\bKEV\b/.test(row.evidence || '');
  return {
    id: row.id, host: row.host, engine: row.engine, motor: ENGINE_LABEL[row.engine] || row.engine,
    title: row.title, severity: row.severity, confidence: row.validated ? 'confirmado' : row.confidence,
    validated: Boolean(row.validated), validatedNote: row.validated_note || undefined, needsValidation: !confirmed,
    status: row.status, note: row.note || undefined, cwe: row.cwe || undefined, cvss: row.cvss ?? undefined, kev,
    evidence: row.evidence || undefined, reproduction: row.reproduction || undefined,
    attack: row.attack || kb.attack, impact: kb.impact, mitre: kb.mitre, tags, rule,
    fix: row.fix || undefined, defense: { h24: kb.h24, d7: kb.d7, d30: kb.d30 }, retest: kb.retest,
    firstSeen: row.first_seen, lastSeen: row.last_seen,
    engineQuality: q?.trusted ? { precision: q.precision, reviewed: q.reviewed, low: q.low } : undefined,
  };
}

/** @param {ReturnType<typeof enrich>[]} list */
export function buildPaths(list) {
  const open = list.filter((f) => f.status !== 'verified');
  const byTag = (/** @type {string} */ t) => open.filter((f) => f.tags.includes(t));
  const out = [];
  for (const p of PATHS) {
    if (!p.needs.every((t) => byTag(t).length)) continue;
    if (p.any && !p.any.some((t) => byTag(t).length)) continue;
    const used = new Map();
    const steps = p.steps.map((s) => {
      const hit = s.tag ? byTag(s.tag) : [];
      for (const f of hit) used.set(f.id, f);
      const state = !s.tag ? 'supuesto' : hit.some((f) => !f.needsValidation) ? 'comprobado' : 'por validar';
      return { text: s.text, state, evidence: hit.slice(0, 3).map((f) => f.title) };
    });
    for (const t of p.any || []) for (const f of byTag(t)) used.set(f.id, f);
    const findings = [...used.values()];
    out.push({
      id: p.id, title: p.title, impact: p.impact, mitre: p.mitre, steps,
      severity: findings.reduce((m, f) => (RANK[f.severity] > RANK[m] ? f.severity : m), /** @type {string} */ ('BAJO')),
      allProven: steps.filter((s) => s.state !== 'supuesto').every((s) => s.state === 'comprobado'),
      findings: findings.map((f) => f.id),
    });
  }
  return out.sort((a, b) => RANK[b.severity] - RANK[a.severity] || Number(b.allProven) - Number(a.allProven));
}

const MANUAL = [
  'Manipulación de precios, cantidades y cupones en el carrito (valores que llegan del navegador).',
  'Saltarse el pago: webhooks de la pasarela sin firma, estados de pedido editables.',
  'Acceso a pedidos, facturas y perfiles ajenos cambiando identificadores, con dos cuentas reales.',
  'Recuperación de contraseña: token predecible, sin caducidad o que revela si el correo existe.',
  'MFA: códigos reutilizables, pasos que se pueden saltar o endpoints sin verificar.',
  'Subida de archivos: extensión, contenido y que no se ejecute en el servidor.',
  'Límites de intentos en inicio de sesión, registro, códigos y API.',
  'Roles: acciones de administrador alcanzables con un usuario normal.',
  'Condiciones de carrera: doble canje de cupón o de saldo.',
  'Datos de más en las respuestas de la API (campos internos que la pantalla no muestra).',
];

/** @param {string} engagementId */
export function buildReport(engagementId) {
  const e = getEngagement(engagementId);
  const rows = db().prepare('SELECT * FROM findings WHERE engagement=?').all(engagementId);
  const quality = engineQuality();
  const all = rows.map((r) => enrich(r, quality));
  const open = dedupe(all.filter((f) => f.status !== 'verified' && f.status !== 'false_positive'));
  const priority = (/** @type {any} */ f) => RANK[f.severity] * 10 + (f.kev ? 5 : 0) + (f.needsValidation ? 0 : 2) + (f.tags.includes('rce') ? 1 : 0) - (f.engineQuality?.low && f.needsValidation ? 3 : 0);
  open.sort((a, b) => priority(b) - priority(a));

  const jobs = db().prepare('SELECT host,status,engines,finished,only_engines FROM jobs WHERE engagement=? ORDER BY created DESC LIMIT 20').all(engagementId);
  /** @type {Record<string, { status: string, detail?: string, count: number }>} */
  const engines = {};
  for (const j of [...jobs].reverse()) {
    if (!j.engines) continue;
    for (const [k, v] of Object.entries(JSON.parse(j.engines))) engines[k] = /** @type {any} */ (v);
  }
  const notRun = Object.entries(engines).filter(([, v]) => v.status !== 'ok' && v.status !== 'skipped').map(([k, v]) => ({ engine: ENGINE_LABEL[k] || k, status: v.status, detail: v.detail }));

  /** @type {Map<string, { action: string, covers: Set<string> }>} */
  const plan = { h24: new Map(), d7: new Map(), d30: new Map() };
  const put = (/** @type {'h24'|'d7'|'d30'} */ h, /** @type {string} */ action, /** @type {any} */ f) => {
    if (!action) return;
    const m = /** @type {Map<string, any>} */ (plan[h]);
    if (!m.has(action)) m.set(action, { action, covers: new Set() });
    m.get(action).covers.add(f.id);
  };
  for (const f of open.filter((x) => x.status !== 'accepted')) {
    const urgent = RANK[f.severity] >= 3;
    for (const a of f.defense.h24) put(urgent ? 'h24' : 'd7', a, f);
    for (const a of f.defense.d7) put(urgent || RANK[f.severity] === 2 ? 'd7' : 'd30', a, f);
    for (const a of f.defense.d30) put('d30', a, f);
    if (f.fix) put(urgent ? 'h24' : RANK[f.severity] === 2 ? 'd7' : 'd30', f.fix, f);
  }
  const flat = (/** @type {Map<string, any>} */ m) => [...m.values()].map((x) => ({ action: x.action, covers: x.covers.size })).sort((a, b) => b.covers - a.covers);

  const counts = { 'CRÍTICO': 0, ALTO: 0, MEDIO: 0, BAJO: 0 };
  for (const f of open) if (f.status !== 'accepted') counts[/** @type {keyof typeof counts} */ (f.severity)]++;

  const report = {
    generatedAt: new Date().toISOString(),
    engagement: { id: e.id, domain: e.domain, client: e.client, hosts: e.hosts, starts: e.starts, ends: e.ends, active: Boolean(e.active), staging: Boolean(e.staging), internal: Boolean(e.internal) },
    summary: { counts, open: open.filter((f) => f.status !== 'accepted').length, resolved: all.filter((f) => f.status === 'verified').length, falsePositives: all.filter((f) => f.status === 'false_positive').length, accepted: open.filter((f) => f.status === 'accepted').length,
      needsValidation: open.filter((f) => f.needsValidation).length, actively: open.filter((f) => f.kev).length },
    coverage: { engines: Object.entries(engines).map(([k, v]) => ({ engine: ENGINE_LABEL[k] || k, status: v.status, findings: v.count, detail: v.detail })), notRun, retest: Boolean(jobs[0]?.only_engines) },
    findings: open,
    paths: buildPaths(all),
    plan: { h24: flat(plan.h24), d7: flat(plan.d7), d30: flat(plan.d30) },
    manual: MANUAL,
    snippets: [...open.filter((f) => f.status !== 'accepted').reduce((m, f) => {
      const s = /** @type {any} */ (SNIPPETS)[f.rule];
      if (s) m.set(f.rule, { rule: f.rule, name: s.name, items: s.items, covers: (m.get(f.rule)?.covers || 0) + 1 });
      return m;
    }, /** @type {Map<string, any>} */ (new Map())).values()],
    quality: [...quality].map(([engine, q]) => ({ engine: ENGINE_LABEL[engine] || engine, ...q })).sort((a, b) => a.precision - b.precision),
    limits: [
      'Las herramientas automáticas no entienden la lógica de negocio: la lista de revisión manual es parte del trabajo y no se cubre con este informe.',
      'Un hallazgo "probable" no está probado: hay que validarlo a mano antes de tratarlo como un hecho.',
      'Las rutas de ataque son hipótesis de cómo se encadenan los hallazgos: los pasos "supuesto" no se probaron ni se probarán sin permiso expreso.',
      'La ausencia de hallazgos en un motor no demuestra que no existan fallos, solo que ese motor no encontró ninguno en lo que alcanzó.',
      'Los motores que no corrieron o terminaron parcialmente figuran en la cobertura.',
    ],
  };
  return { ...report, executive: buildExecutive(report) };
}

const LEVEL_COLOR = /** @type {Record<string,string>} */ ({ 'CRÍTICO': '#b3261e', ALTO: '#c2570c', MEDIO: '#9a7b00', BAJO: '#476582', 'SIN HALLAZGOS': '#476582', 'NO CONCLUYENTE': '#555555' });
const date = (/** @type {number} */ t) => new Date(t - 5 * 3600000).toISOString().slice(0, 10);

/** @param {ReturnType<typeof buildReport>} r */
export function toMarkdown(r) {
  const e = r.engagement;
  const L = [];
  L.push(`# Informe de auditoría de seguridad: ${e.domain}`, '', `Cliente: **${e.client}** · Ventana autorizada: ${date(e.starts)} a ${date(e.ends)} · Generado: ${r.generatedAt.slice(0, 10)}`, '',
    `Alcance: ${e.hosts.join(', ')}. Pruebas activas: ${e.active ? 'autorizadas' : 'no'}. Revisión interna: ${e.internal ? 'autorizada' : 'no'}.`, '');
  L.push(executiveMarkdown(r.executive));
  const c = r.summary.counts;
  L.push('## Detalle de los números', '', `- Críticos: **${c['CRÍTICO']}** · Altos: **${c.ALTO}** · Medios: **${c.MEDIO}** · Bajos: **${c.BAJO}**`,
    `- Pendientes de validar a mano: ${r.summary.needsValidation}. Explotados activamente según CISA KEV: ${r.summary.actively}. Corregidos y verificados: ${r.summary.resolved}.`, '');
  if (r.coverage.retest) L.push('> El último trabajo fue un re-test: comprobó solo lo que estaba abierto y no descubre hallazgos nuevos.', '');
  if (r.coverage.notRun.length) {
    L.push('## Cobertura incompleta', '');
    for (const n of r.coverage.notRun) L.push(`- ${n.engine}: ${n.status}${n.detail ? ` (${n.detail})` : ''}`);
    L.push('');
  }
  if (r.paths.length) {
    L.push('## Cómo podrían atacarlos (rutas encadenadas)', '');
    for (const p of r.paths) {
      L.push(`### ${p.title} [${p.severity}]${p.allProven ? '' : ' (hay pasos sin comprobar)'}`, '');
      p.steps.forEach((s, i) => L.push(`${i + 1}. ${s.text} (${s.state})${s.evidence.length ? `: ${s.evidence.join('; ')}` : ''}`));
      L.push('', `Impacto: ${p.impact} MITRE: ${p.mitre.join(', ')}.`, '');
    }
  }
  L.push('## Plan de defensa', '');
  for (const [k, name] of /** @type {[keyof typeof r.plan, string][]} */ ([['h24', 'En las próximas 24 horas'], ['d7', 'En 7 días'], ['d30', 'En 30 días']])) {
    L.push(`### ${name}`, '');
    if (!r.plan[k].length) L.push('- Sin acciones.');
    for (const a of r.plan[k]) L.push(`- ${a.action}${a.covers > 1 ? ` (cubre ${a.covers} hallazgos)` : ''}`);
    L.push('');
  }
  if (r.snippets.length) {
    L.push('## Correcciones listas para pegar', '', 'Ejemplos que se adaptan a tu entorno: pruébalos primero en staging.', '');
    for (const s of r.snippets) {
      L.push(`### ${s.name}${s.covers > 1 ? ` (cubre ${s.covers} hallazgos)` : ''}`, '');
      for (const it of s.items) L.push(`**${it.label}**`, '', '```', it.code, '```', '');
    }
  }
  const reviewed = r.quality.filter((q) => q.trusted);
  if (reviewed.length) {
    L.push('## Calidad de los motores (según tus validaciones)', '', '| Motor | Revisados | Aciertos |', '|---|---|---|');
    for (const q of reviewed) L.push(`| ${q.engine} | ${q.reviewed} | ${Math.round(q.precision * 100)}%${q.low ? ' (baja prioridad)' : ''} |`);
    L.push('');
  }
  L.push('## Hallazgos', '');
  for (const f of r.findings) {
    L.push(`### [${f.severity}] ${f.title}`, '', `- Motor: ${f.motor} · Confianza: ${f.confidence}${f.needsValidation ? ' (validar a mano)' : f.validated ? ' (validado)' : ''} · Estado: ${f.status}${f.cwe ? ` · ${f.cwe}` : ''}${f.cvss ? ` · CVSS ${f.cvss}` : ''}${f.kev ? ' · explotado activamente (KEV)' : ''}`,
      `- Host: ${f.host}`, `- Cómo se ataca: ${f.attack}`, `- Impacto: ${f.impact}`, `- MITRE ATT&CK: ${f.mitre.join(', ')}`);
    if (f.evidence) L.push(`- Evidencia: ${f.evidence}`);
    if (f.reproduction) L.push(`- Reproducir: ${f.reproduction}`);
    if (f.fix) L.push(`- Corrección: ${f.fix}`);
    L.push(`- Re-test: ${f.retest}`, '');
  }
  L.push('## Revisión manual pendiente (lógica de negocio)', '', ...r.manual.map((m) => `- [ ] ${m}`), '', '## Límites de este informe', '', ...r.limits.map((m) => `- ${m}`), '');
  return L.join('\n');
}

/** @param {unknown} s */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => /** @type {Record<string,string>} */ ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

/** HTML autónomo para imprimir a PDF. Todo texto de la evidencia se escapa: viene del sitio auditado. */
/** @param {ReturnType<typeof buildReport>} r */
export function toHtml(r) {
  const e = r.engagement;
  const col = /** @type {Record<string,string>} */ ({ 'CRÍTICO': '#b3261e', ALTO: '#c2570c', MEDIO: '#9a7b00', BAJO: '#476582' });
  const li = (/** @type {string[]} */ a) => `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const c = r.summary.counts;
  const x = r.executive;
  const executiveHtml = `<h2>Resumen para gerencia</h2><p><b style="color:${LEVEL_COLOR[x.level]}">${esc(levelText(x.level))}</b> · fiabilidad de las pruebas: ${esc(x.reliability)}</p><p>${esc(x.headline)}</p>${x.coverageNote ? `<div class="warn">${esc(x.coverageNote)}</div>` : ''}${x.priorities.length ? `<p><b>Lo primero que hay que atender</b></p><ol>${x.priorities.map((p) => `<li>${esc(p.title)} (${esc(p.severity)})${p.needsValidation ? ' · por confirmar' : ''}: ${esc(p.impact)} → ${esc(p.action)}</li>`).join('')}</ol>` : ''}<p><b>Próximos pasos</b></p>${li(x.nextSteps)}`;
  const snippetsHtml = r.snippets.length ? `<h2>Correcciones listas para pegar</h2><p>Ejemplos que se adaptan a tu entorno: pruébalos primero en staging.</p>${r.snippets.map((s) => `<h3>${esc(s.name)}</h3>${s.items.map((it) => `<p><b>${esc(it.label)}</b></p><pre><code>${esc(it.code)}</code></pre>`).join('')}`).join('')}` : '';
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>Informe de seguridad ${esc(e.domain)}</title><style>
body{font:14px/1.5 system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}h1{font-size:1.6rem}h2{border-bottom:2px solid #ddd;padding-bottom:.2rem;margin-top:2rem}
.f{border:1px solid #ddd;border-left:6px solid #888;padding:.6rem 1rem;margin:.8rem 0;break-inside:avoid}.tag{font-weight:700}code{background:#f3f3f3;padding:0 .2rem;word-break:break-all}
.kpi span{display:inline-block;margin-right:1rem;font-weight:700}.warn{background:#fff6e0;padding:.5rem 1rem;border-radius:4px}pre{background:#f3f3f3;padding:.5rem;white-space:pre-wrap;word-break:break-word}h2,h3{break-after:avoid}@page{size:A4}@media print{body{margin:0}}</style></head><body>
<h1>Informe de auditoría de seguridad: ${esc(e.domain)}</h1>
<p>Cliente: <b>${esc(e.client)}</b> · Ventana autorizada: ${date(e.starts)} a ${date(e.ends)} · Generado: ${esc(r.generatedAt.slice(0, 10))}<br>Alcance: ${esc(e.hosts.join(', '))}</p>
${executiveHtml}<h2>Detalle de los números</h2><p class="kpi"><span style="color:${col['CRÍTICO']}">Críticos ${c['CRÍTICO']}</span><span style="color:${col.ALTO}">Altos ${c.ALTO}</span><span style="color:${col.MEDIO}">Medios ${c.MEDIO}</span><span style="color:${col.BAJO}">Bajos ${c.BAJO}</span></p>
<p>Por validar a mano: ${r.summary.needsValidation}. Explotados activamente (CISA KEV): ${r.summary.actively}. Corregidos y verificados: ${r.summary.resolved}.</p>
${r.coverage.notRun.length ? `<div class="warn"><b>Cobertura incompleta</b>${li(r.coverage.notRun.map((n) => `${n.engine}: ${n.status}${n.detail ? ` (${n.detail})` : ''}`))}</div>` : ''}
${r.paths.length ? `<h2>Cómo podrían atacarlos</h2>${r.paths.map((p) => `<div class="f" style="border-left-color:${col[p.severity]}"><span class="tag">${esc(p.title)}</span> [${esc(p.severity)}]${p.allProven ? '' : ' · hay pasos sin comprobar'}<ol>${p.steps.map((s) => `<li>${esc(s.text)} <i>(${esc(s.state)})</i></li>`).join('')}</ol><p>Impacto: ${esc(p.impact)} · MITRE: ${esc(p.mitre.join(', '))}</p></div>`).join('')}` : ''}
<h2>Plan de defensa</h2>${[['En las próximas 24 horas', r.plan.h24], ['En 7 días', r.plan.d7], ['En 30 días', r.plan.d30]].map(([t, a]) => `<h3>${t}</h3>${li(/** @type {any[]} */ (a).map((x) => x.action))}`).join('')}
${snippetsHtml}<h2>Hallazgos</h2>${r.findings.map((f) => `<div class="f" style="border-left-color:${col[f.severity]}"><span class="tag">[${esc(f.severity)}] ${esc(f.title)}</span>
<br><small>${esc(f.motor)} · confianza ${esc(f.confidence)}${f.needsValidation ? ' (validar a mano)' : ''} · ${esc(f.status)}${f.cwe ? ` · ${esc(f.cwe)}` : ''}${f.kev ? ' · explotado activamente' : ''}</small>
<p><b>Cómo se ataca:</b> ${esc(f.attack)}<br><b>Impacto:</b> ${esc(f.impact)}<br><b>MITRE:</b> ${esc(f.mitre.join(', '))}</p>
${f.evidence ? `<p><b>Evidencia:</b> <code>${esc(f.evidence)}</code></p>` : ''}${f.fix ? `<p><b>Corrección:</b> ${esc(f.fix)}</p>` : ''}<p><b>Re-test:</b> ${esc(f.retest)}</p></div>`).join('')}
<h2>Revisión manual pendiente</h2>${li(r.manual)}<h2>Límites de este informe</h2>${li(r.limits)}</body></html>`;
}

/**
 * Resumen de UNA página (A4). Todo texto está recortado y la hoja tiene una altura máxima: nunca pasa de una página.
 * @param {ReturnType<typeof buildReport>} r
 */
export function toSummaryHtml(r) {
  const e = r.engagement;
  const x = r.executive;
  const n = x.numbers;
  const li = (/** @type {string[]} */ list) => `<ul>${list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  const box = (/** @type {string} */ label, /** @type {number} */ v, /** @type {string} */ color) => `<div class="k" style="border-top-color:${color}"><b>${v}</b><span>${label}</span></div>`;
  const plan = r.plan.h24.slice(0, 3);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>Resumen de seguridad ${esc(e.domain)}</title><style>
@page{size:A4;margin:0}html,body{margin:0;background:#fff}
body{font:12px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;color:#1a1a1a}
.page{box-sizing:border-box;width:210mm;height:296mm;padding:13mm 14mm;overflow:hidden;margin:0 auto}
header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #1a1a1a;padding-bottom:6px}
header h1{font-size:17px;margin:0}header small{color:#555}
.badge{display:inline-block;margin:12px 0 4px;padding:6px 14px;color:#fff;font-weight:800;font-size:18px;letter-spacing:.02em}
.head{font-size:14px;font-weight:600;margin:6px 0 10px}
.warn{background:#fff6e0;border-left:4px solid #c2570c;padding:6px 10px;margin:8px 0}
.kpi{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin:10px 0 12px}
.k{border:1px solid #ddd;border-top:4px solid #888;padding:6px;text-align:center}.k b{display:block;font-size:20px}.k span{font-size:10px;color:#555}
h2{font-size:12.5px;margin:12px 0 4px;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #ccc;padding-bottom:2px}
ol,ul{margin:4px 0 0;padding-left:18px}li{margin:0 0 4px}
footer{margin-top:10px;color:#666;font-size:10px;border-top:1px solid #ddd;padding-top:5px}
</style></head><body><div class="page">
<header><h1>Resumen de seguridad · ${esc(e.domain)}</h1><small>${esc(e.client)} · ${esc(r.generatedAt.slice(0, 10))} · DEFENSA TI</small></header>
<div class="badge" style="background:${LEVEL_COLOR[x.level]}">${esc(levelText(x.level).toUpperCase())}</div>
<div><small>Fiabilidad de las pruebas: ${esc(x.reliability)}</small></div>
<p class="head">${esc(x.headline)}</p>
${x.coverageNote ? `<div class="warn">${esc(x.coverageNote)}</div>` : ''}${x.retestNote ? `<div class="warn">${esc(x.retestNote)}</div>` : ''}
<div class="kpi">${box('Críticos', n.critical, '#b3261e')}${box('Altos', n.high, '#c2570c')}${box('Medios', n.medium, '#9a7b00')}${box('Bajos', n.low, '#476582')}${box('Por confirmar', n.toValidate, '#888')}${box('Corregidos', n.resolved, '#2e7d32')}</div>
${x.priorities.length ? `<h2>Lo primero que hay que atender</h2><ol>${x.priorities.map((p) => `<li><b>${esc(p.title)}</b> (${esc(p.severity)})${p.needsValidation ? ' · por confirmar' : ''}<br>${esc(p.impact)}<br><i>Qué hacer:</i> ${esc(p.action)}</li>`).join('')}</ol>` : ''}
${x.chains.length ? `<h2>Cómo podrían atacarte (comprobado)</h2><ul>${x.chains.map((c) => `<li><b>${esc(c.title)}</b>: ${esc(c.impact)}</li>`).join('')}</ul>` : ''}
${plan.length ? `<h2>Plan para las próximas 24 horas</h2><ul>${plan.map((a) => `<li>${esc(a.action.length > 170 ? a.action.slice(0, 169) + '…' : a.action)}</li>`).join('')}</ul>` : ''}
<h2>Próximos pasos</h2>${li(x.nextSteps)}
<footer>${x.limits.map((l) => esc(l)).join(' ')}</footer>
</div></body></html>`;
}
