# Resultados del banco de pruebas

Registro de cada medición real, para poder comparar versiones del escáner entre sí.

> **Cómo leer estas cifras.** Son una prueba de regresión, no una medida de calidad que puedas vender.
> La verdad de referencia y los detectores se ajustaron mirando este mismo laboratorio, sin laboratorio de
> validación aparte, así que el resultado es optimista. Para tener una cifra defendible hace falta medir contra un
> laboratorio que no se haya usado para ajustar nada (por ejemplo DVWA o WebGoat) y con la verdad de referencia fijada
> **antes** de ver lo que encuentra el escáner.

## 2026-11-22 · OWASP Juice Shop 20.4.0 (local)

**Entorno:** Juice Shop `20.4.0_node26_win32_x64` (descarga oficial, suma SHA-256 verificada), en `127.0.0.1:3100`,
sin Docker. Se pidió el modo seguro (`safetyMode: enabled`) pero **no se comprobó que se aplicara**: la aplicación no lo
confirma en su registro. Arnés: `npx tsx scripts/dev/lab-engines.mjs http://127.0.0.1:3100 --truth docs/bench/juice-shop.truth.json`.

**Qué se midió:** los motores rastreador, rutas expuestas, API y navegador.
**Qué NO se midió:** nmap, testssl, Nuclei y ZAP (no hay Docker ni esas herramientas aquí), así que la clase
"exige pruebas activas" quedó en 0 por falta de motor, no por un límite del escáner. Tampoco pasó por la tubería
completa (autorización, cola): esas puertas rechazan localhost a propósito.

### Resultado de la última corrida (medición 3)

| Clase | Detectadas | Total |
|---|---|---|
| Exposición visible desde fuera | 6 | 7 |
| Exige pruebas activas | 0 | 2 (sin motor para medirlas) |
| Lógica de negocio | 0 | 3 (no automatizable) |

Hallazgos sin explicar: 0. Tiempo total: 28 s, de los que 27 s son del navegador.

**Por qué esa precisión no demuestra nada todavía:** la verdad de referencia incluye dos fugas de administración
(`application-configuration` y `application-version`) que se añadieron **después** de ver que el escáner las había
encontrado. Con esa verdad ampliada, 0 hallazgos quedan sin explicar casi por construcción. Tampoco es comparable con la
primera medición (29% de precisión): en esa, la verdad tenía otras entradas y el denominador era distinto.

### Lo que sí aportó esta medición: 4 fallos reales corregidos

Se encontraron al correr los motores contra una aplicación real y no con pruebas sintéticas:

1. **Respuestas truncadas.** Juice Shop declara `Content-Length: 11320` y envía 11308 bytes. Node lo marca `aborted`
   y el cliente descartaba la respuesta entera, incluido el listado de `/ftp`. Ahora conserva lo recibido y la marca
   como truncada; el rastreo, la API y WordPress quedan en "parcial" y nunca dan un hallazgo por corregido.
2. **Navegador con conexión permanente.** Con WebSocket la red nunca queda en reposo: `networkidle` agotaba 20 s y
   descartaba la página (0 páginas). Ahora espera a que el DOM termine de pintar.
3. **Falsos positivos de la SPA.** `/orders` es una ruta de la interfaz que devuelve el HTML de la aplicación con 200, y
   `/rest/user/whoami` devuelve `{"user":{}}`. Ya no cuentan como datos expuestos.
4. **Redirección.** `/api-docs` responde 301 hacia `/api-docs/`; se añadió la variante con barra.

### Por motor

| Motor | Hallazgos | Vulnerabilidades verificadas que detecta |
|---|---|---|
| Rutas expuestas | 3 | 3 (`/metrics`, `/api-docs/`, listado de `/ftp/`) |
| Rastreador | 4 | 2 (listado de `/ftp`, `robots.txt` anuncia `/ftp`) |
| Navegador | 3 | 2 (`application-configuration` y `application-version`, que el análisis estático del JavaScript no ve) |
| API (JS estático) | 1 | 0 |

Que el navegador vea 2 fugas que el análisis estático no ve es un resultado de esta corrida; con un solo laboratorio
no se puede generalizar.

### Límites

- La única exposición sin detectar es `/encryptionkeys/`: nadie la enlaza y ninguna lista genérica incluiría ese nombre.
  Se deja así a propósito: añadirla sería ajustar el escáner al examen.
- Un solo laboratorio y una sola versión. No se ejecutó ninguna herramienta comercial: no hay comparación con otros
  escáneres.
- La verdad de referencia está verificada contra esta versión de Juice Shop; con otra versión, `--verify-lab`
  descartará lo que no exista.
