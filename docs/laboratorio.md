# Laboratorio de pruebas (OWASP Juice Shop)

Sirve para medir tu escáner con cifras: cuánto detecta, con cuánta precisión y en cuánto tiempo.
Juice Shop es una aplicación vulnerable a propósito: **en un servidor aparte, sin tus datos, y apagada al terminar.**

## 1. Preparar el servidor del laboratorio

- Un VPS pequeño (1 GB basta) **distinto** del servidor de auditoría y de cualquier cosa tuya con datos.
- Un registro DNS `A`: `lab.tudominio.com` → IP del VPS.
- Firewall: abre 80 y 443 al mundo (Let's Encrypt los necesita) y 22 solo a tu IP.
- Docker y Docker Compose instalados.

```text
cd lab
cp .env.example .env     # LAB_DOMAIN, ALLOWED_IPS y JUICE_SHOP_TAG
docker compose up -d
```

`ALLOWED_IPS` debe incluir **la IP del servidor que audita** y la tuya: las demás reciben 403. Si falta la del
servidor de auditoría, todas las pruebas verán un 403 y la medición no valdrá nada.
Fija `JUICE_SHOP_TAG` a una versión concreta para poder comparar corridas entre sí.

## 2. Autorizarte a ti mismo

Aunque el laboratorio sea tuyo, usa el mismo camino que con un cliente: así pruebas la tubería real.

```text
npm run audit:cli -- new --domain lab.tudominio.com --client "Laboratorio" --signer "Tu nombre" --pdf aut-lab.pdf --from 2026-12-01 --to 2026-12-07 --active
npm run audit:cli -- verify <id>        # tras publicar el TXT en el DNS
npm run audit:cli -- run lab.tudominio.com
npm run audit:cli -- jobs
```

El PDF es la plantilla de `docs/autorizacion-auditoria.md` firmada por ti. `--active` activa ZAP activo.

## 3. Medir

```text
npm run audit:cli -- bench <id> --truth docs/bench/juice-shop.truth.json --verify-lab
```

`--verify-lab` hace un GET por cada vulnerabilidad de la verdad de referencia contra **tu** laboratorio y descarta las
que no existen en esa versión. Así la cifra no depende de lo que yo recuerde de Juice Shop.

Cómo leer el resultado:

| Clase | Qué esperar |
|---|---|
| Exposición visible desde fuera | Aquí se mide el escáner. Una vulnerabilidad sin detectar es un hueco que arreglar. |
| Exige pruebas activas | Solo la encuentran ZAP activo o pruebas con sesión; dependen de `--active`. |
| Lógica de negocio | Ninguna herramienta automática la encuentra sola: no cuenta como fallo, marca el límite. |

**Hallazgos sin explicar** son candidatos a falso positivo. Revísalos a mano: si no son reales, márcalos con
`status <hallazgo> false_positive --note "..."`; si lo son, añádelos a la verdad de referencia con su sonda.

## 4. Mejorar y repetir

1. Elige una vulnerabilidad de exposición que no se detectó.
2. Arregla o añade el detector, con una prueba.
3. `run` y `bench` de nuevo; compara con la corrida anterior.
4. Guarda las cifras con la fecha, la versión del escáner y el `JUICE_SHOP_TAG`.

Esas cifras sirven para comparar versiones del escáner entre sí. **No las presentes a un cliente como medida de calidad**
si ajustaste los detectores mirando este mismo laboratorio: para una cifra defendible, mide contra otro laboratorio y
fija la verdad de referencia antes de ver lo que encuentra el escáner (ver `docs/bench/resultados.md`).

## 5. Sin Docker: Juice Shop en tu máquina (solo para medir los motores)

Juice Shop publica versiones listas para cada versión de Node (`juice-shop-<ver>_node<N>_<sistema>`): descárgala del
repositorio oficial `juice-shop/juice-shop` (Releases), comprueba la suma SHA-256 que GitHub muestra junto al archivo y
extráela en una carpeta vacía. Se arranca **solo en 127.0.0.1** con el precargador de `lab/local-bind.cjs`:

```powershell
cd juice-shop_<ver>
$env:PORT = "3100"
$env:NODE_CONFIG = '{"challenges":{"safetyMode":"enabled"}}'
$env:NODE_OPTIONS = "--require C:/ruta/a/security-score/lab/local-bind.cjs"
node build/app
```

En otra terminal, desde este repositorio:

```text
npx tsx scripts/dev/lab-engines.mjs http://127.0.0.1:3100 --truth docs/bench/juice-shop.truth.json
```

El arnés ejecuta los motores propios contra el laboratorio y calcula el banco de pruebas. **Solo acepta 127.0.0.1 o
localhost** y no pasa por la autorización: para cualquier otro host usa el camino real (secciones 2 y 3).
Mide el rastreador, las rutas expuestas, la API y el navegador; nmap, testssl, Nuclei y ZAP solo corren en el servidor
de auditoría. Las cifras de cada medición se anotan en `docs/bench/resultados.md`.

## 6. Apagar

```text
cd lab && docker compose down -v
```

No lo dejes encendido: es una aplicación insegura expuesta a Internet, aunque solo acepte tus IP.
