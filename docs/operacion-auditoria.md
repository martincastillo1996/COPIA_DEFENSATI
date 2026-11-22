# Manual de operación de la auditoría autorizada

Todos los comandos se ejecutan en el servidor, desde la carpeta de la app. Requiere Node 22.13 o superior.

## 1. Puesta en marcha (una vez)

```text
sudo bash scripts/install-audit-tools.sh          # nmap, testssl, Nuclei, ZAP
sudo bash scripts/install-internal-tools.sh       # Semgrep, Gitleaks, Trivy (revisión interna)
npm ci && npm run build && pm2 restart all
pm2 start scripts/audit-worker.mjs --name defensati-audit && pm2 save
```

Variables en `.env.local`: `ADMIN_TOKEN` (mínimo 16 caracteres), `PUBLIC_APP_URL`, y opcionales
`WPSCAN_API_TOKEN`, `HIBP_API_KEY`, `TELEGRAM_BOT_TOKEN`.

En un servidor de 1 a 2 GB de RAM usa `AUDIT_SERIAL=1` para que los motores corran uno a uno.
Con más memoria van en paralelo y comparten el ritmo de peticiones autorizado.

### Rastreo con navegador (aplicaciones de una sola página)

Un sitio en React, Vue o Angular casi no tiene HTML que rastrear: sus rutas de API aparecen al ejecutar el JavaScript.
El motor `browser` abre la aplicación en Chrome y registra a qué rutas llama y qué terceros carga.

```text
sudo INSTALL_CHROME=1 bash scripts/install-audit-tools.sh   # o CHROME_PATH con tu propio Chromium
AUDIT_BROWSER=1   # en .env.local; sin esto el motor figura como "desactivado"
```

Corre con la IP fijada, solo contra el mismo origen y solo con GET: las escrituras y los dominios de terceros se
bloquean, no hace clic ni rellena formularios. Aun así ejecuta el JavaScript del sitio auditado: déjalo solo
para sitios con autorización.

Antes de leer cada página espera a que termine de pintar (DOM sin cambios y bajada al final para las cargas
diferidas). Límite conocido: los enlaces que el JavaScript pinta más de unos 2,5 s después de cargar, sin ninguna
petición de red, o los que solo aparecen al hacer clic o pasar el ratón, no se ven.

## 2. Un cliente, de principio a fin

```text
npm run audit:cli -- new --domain cliente.pe --client "Cliente SAC" --signer "Nombre" --pdf aut.pdf --from 2026-12-01 --to 2026-12-31
npm run audit:cli -- verify <id>                  # tras publicar el TXT o el archivo
npm run audit:cli -- run cliente.pe               # encola la auditoría completa
npm run audit:cli -- jobs                         # progreso
npm run audit:cli -- report <id> --format html --out informe.html
npm run audit:cli -- portal <id>                  # enlace de solo lectura para el cliente
```

Opciones de `new`: `--active` (pruebas activas), `--staging` (entorno sin datos reales), `--internal`
(revisión de código y servidor), `--host` (más subdominios), `--ports`, `--rps`. Cada una debe constar en el PDF.

### Acceso a la API y a los informes

- **Claves por persona:** `user add --name Ana --role analyst` (opera auditorías) o `--role viewer` (solo lee). La clave se
  muestra una vez; en la base solo queda su hash. `user revoke <id>` la anula al instante. Úsala como `Authorization: Bearer dti_...`.
- `ADMIN_TOKEN` sigue existiendo para el monitor y los scripts; las acciones quedan registradas con su autor.
- **Informes de auditoría completa:** ya no se abren solo con el UUID. `share <id-informe> --hours 72` genera un enlace
  firmado y con caducidad (máximo 30 días); sin él, o sin una clave del personal, responden 404.
- **PDF para el cliente:** `report <id> --format pdf --out informe.pdf` (requiere Chrome, igual que el rastreo con navegador).

## 3. Después de la primera corrida

- **Validar lo probable:** `status`, `validate <hallazgo> --note "quién y cómo lo comprobó"`.
- **Marcar un falso positivo:** `status <hallazgo> false_positive --note "quién y por qué"`. No reaparece, y si un motor
  acumula demasiados, el informe lo marca como de baja prioridad.
- **Cuando el cliente corrige:** `retest cliente.pe` repite solo los motores de lo abierto. El cliente también puede
  pedirlo desde su portal (una vez cada 30 minutos). El re-test no descubre hallazgos nuevos: para eso, `run`.
- **Lo que no se puede re-probar solo** (sesión, código, Lynis): el comando lo lista como manual.

## 4. Vigilancia continua

```text
0 6 * * *   cd /ruta/app && npm run audit:cli -- watch >> data/watch.log 2>&1
30 6 * * *  cd /ruta/app && npm run audit:cli -- log --notify
```

`watch` compara DNS, certificado, puertos y cabeceras con la foto anterior de cada host autorizado y avisa de lo que
cambió (puerto nuevo, emisor de certificado, SPF o DMARC debilitados, cabeceras que desaparecen).
`log --notify` envía los hashes de las cadenas de auditoría fuera del servidor; guarda uno y compruébalo después con
`log --seen <hash>` para detectar que alguien recortó el registro.

## 5. Banco de pruebas

Mide qué detecta tu escáner y cuántos hallazgos sobran, en un laboratorio vulnerable **que tú controlas**
(OWASP Juice Shop, DVWA o WebGoat desplegados en tu propio servidor, con su dominio y una autorización a tu nombre).

```text
npm run audit:cli -- bench <id> --truth docs/bench/ejemplo-truth.json
```

Guía completa, con el laboratorio de Juice Shop ya preparado (`lab/`) y su verdad de referencia
(`docs/bench/juice-shop.truth.json`): [laboratorio.md](laboratorio.md). Con `--verify-lab` cada vulnerabilidad se comprueba contra
tu laboratorio antes de medir. Para otro laboratorio, parte de `docs/bench/ejemplo-truth.json`.
Usa el resultado para comparar versiones del escáner o motores entre sí. Esas cifras (detección, precisión, tiempo) son las que puedes enseñar a un cliente.

## 6. Parada

`stop <id>` detiene una autorización; `estop` detiene todo el sistema (también los trabajos en curso);
`estop-clear` lo reanuda.
