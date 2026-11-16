# Política de Seguridad de DEFENSA TI

La seguridad es el núcleo fundamental de este proyecto. Agradecemos la colaboración de la comunidad y de investigadores de seguridad para mantener segura la plataforma.

## Versiones Soportadas

| Versión | Soportada          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Vectores Defensivos Implementados

* **Hardening Anti-SSRF Exhaustivo:**
  * **IPv4:** Bloqueo estricto de subredes privadas RFC 1918 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), Loopback (`127.0.0.0/8`), Cloud Metadata (`169.254.169.254`), CGNAT (`100.64.0.0/10`), Multicast (`224.0.0.0/4`) y Broadcast (`255.255.255.255/32`).
  * **IPv6:** Bloqueo de Loopback (`::1`), Indefinido (`::`), ULA RFC 4193 (`fc00::/7`), Link-Local (`fe80::/10`), IPv4-mapped IPv6 (`::ffff:0:0/96`) y Translation (`64:ff9b::/96`).
  * **Parsing Anti-Evasión:** Conversión canónica contra bypass por octal, hexadecimal, entero dword de 32 bits y notaciones cortas.
* **Inspección de Redirecciones (Anti-DNS Rebinding):**
  * Validación estricta de la cabecera `Location` en saltos `301`, `302`, `307` y `308`.
  * Restricción estricta de esquemas a solo `http:` y `https:`.
  * Re-resolución DNS en cada salto antes de conectar para neutralizar desvíos maliciosos hacia IPs internas.
* **Dos Modos de Auditoría (público y completo):**
  * **Público (escáner gratuito):** revisión básica equivalente a una visita normal al sitio: cabeceras HTTP, certificado TLS, registros DNS (SPF/DMARC) y análisis de la portada. No sondea puertos ni busca archivos sensibles.
  * **Completo (solo con token de administración):** añade sondeo TCP de la matriz cerrada de 12 puertos (`80`, `443`, `8080`, `21`, `22`, `3306`, `5432`, `1433`, `6379`, `3389`, `445`, `27017`) con lectura de banners, y búsqueda de archivos sensibles expuestos (`/.env`, `/.git/HEAD`, respaldos, `phpmyadmin`). Es sondeo activo: se ejecuta únicamente sobre dominios de clientes con autorización escrita.
  * Cero pruebas de inyección, fuerza bruta o denegación de servicio (DDoS) en ambos modos.
* **Conexiones Salientes Validadas al Conectar:**
  * Toda conexión hacia un destino indicado por el visitante (HTTP, TLS, TCP) valida la IP resuelta en el propio socket (`safeLookup`), no en una comprobación previa, para cerrar la ventana de DNS rebinding.
  * Las descargas tienen tiempo total acotado y tope de bytes; las redirecciones se validan una a una.
* **Marco Legal y Declaración de Titularidad:**
  * En cumplimiento de la **Ley N° 30096 (Ley de Delitos Informáticos del Perú)**, toda auditoría requiere que el usuario declare bajo juramento ser propietario o contar con autorización formal del titular del dominio.

## Reporte de Vulnerabilidades

Si descubres una posible vulnerabilidad de seguridad, por favor **no abras un issue público**. 

Envía un reporte detallado con los pasos de reproducción a:
* **Correo de Seguridad:** [contacto@neuronalgravity.com](mailto:contacto@neuronalgravity.com)
* **Contacto Directo:** Martin Castillo

Responderemos dentro de un plazo de 24 a 48 horas con el plan de remediación correspondiente.
