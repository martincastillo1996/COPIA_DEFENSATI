# Despliegue en Ubuntu, copias y vuelta atrás

Todos los comandos son en el servidor, desde la carpeta de la app. Requiere Node 22.13 o superior.

## 0. Lo que cambia respecto a la versión que tienes en producción

Léelo antes de desplegar: algunas cosas dejan de comportarse como hoy.

- **Los enlaces a informes de auditoría completa que ya compartiste dejan de abrir** hasta que generes uno nuevo con
  `npm run audit:cli -- share <id-informe> --hours 72`. Los informes públicos no cambian.
- **Sin autorización verificada no hay auditoría completa.** Cada cliente que hoy se re-escanea en modo completo necesita
  `audit:cli new` + `verify`. El monitor, sin autorización, baja a modo básico y avisa.
- **El sello público ya no usa informes de auditoría completa.** Quien lo tenía por esa vía lo pierde; con su token firmado
  sigue valiendo.
- Las notas de dominios de grandes marcas bajan: ahora son medidas, no fijas.
- La búsqueda de buckets por nombre queda apagada (`ASM_BUCKET_DISCOVERY=1` la activa).
- `ADMIN_TOKEN` sigue funcionando; además existen claves por persona (`user add`).
- `/terminos` todavía dice "pasivo" y prohíbe la inyección: que tu abogado lo revise antes de vender pruebas activas.

## 1. Antes de desplegar

```text
npm run deploy:check                 # no sigas si hay algún FALLO
BACKUP_PASSPHRASE=... npm run backup -- create --notify
git rev-parse HEAD                   # anota este commit: es tu punto de vuelta atrás
pm2 list                             # anota qué procesos corren
```

`deploy:check` revisa Node, `ADMIN_TOKEN`, la base de auditoría, que las cadenas de registro sigan válidas, los secretos,
las herramientas instaladas, el disco y que exista una copia de menos de 26 horas.

## 2. Desplegar

```text
git pull
npm ci
npm run build
pm2 restart all
pm2 restart defensati-audit          # el worker de la cola
npm run deploy:check
```

La base se migra sola al arrancar (solo añade columnas y tablas; no borra nada).

**Pruebas de humo** (cambia el dominio):

```text
curl -sI https://tudominio.com/ | head -1                                              # 200
curl -s -o /dev/null -w "%{http_code}\n" https://tudominio.com/api/admin/jobs           # 401 sin clave
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $ADMIN_TOKEN" https://tudominio.com/api/admin/jobs   # 200
npm run audit:cli -- log                                                                # cadenas válidas
```

## 3. Copias de seguridad

Qué se copia: toda la carpeta `data/`. La base va como instantánea consistente (aunque el worker esté escribiendo),
junto con los registros encadenados, los secretos, los PDF de autorización, los informes y el estado del monitor.
`--with-env` añade `.env.local`. Todo cifrado con AES-256-GCM; sin la clave no se puede leer, y cualquier alteración se
detecta al descifrar.

```text
npm run backup -- create [--keep 14] [--no-reports] [--with-env] [--notify]
npm run backup -- verify backups/defensati-backup-AAAAMMDD-HHMMSS.dtibak
npm run backup -- restore backups/defensati-backup-AAAAMMDD-HHMMSS.dtibak --to /ruta/nueva
```

- `verify` restaura de verdad en una carpeta temporal y comprueba hashes, la integridad de la base, los recuentos y las
  cadenas. **Una copia sin verificar no es una copia**: hazlo al menos una vez al mes.
- `restore` nunca pisa datos vivos: exige una carpeta nueva y distinta de `data/`.
- `--notify` avisa por Telegram del resultado, y si la copia **falla**.

**La clave (`BACKUP_PASSPHRASE`) y las copias no deben estar solo en el mismo servidor.** Si el servidor cae, necesitas
poder leer la copia desde otro sitio: guarda la clave en tu gestor de contraseñas y copia `backups/` a otra máquina.

```text
# crontab -e   (BACKUP_PASSPHRASE debe estar en .env.local; los scripts lo cargan)
15 3 * * *  cd /ruta/app && npm run backup -- create --notify >> data/backup.log 2>&1
45 3 * * *  rsync -a /ruta/app/backups/ usuario@otro-servidor:/ruta/copias/
0 6 * * *   cd /ruta/app && npm run audit:cli -- watch >> data/watch.log 2>&1
30 6 * * *  cd /ruta/app && npm run audit:cli -- log --notify
0 7 * * 1   cd /ruta/app && npm run deploy:check >> data/deploy-check.log 2>&1
```

`backups/` está en `.gitignore`: nunca se sube al repositorio.

## 4. Volver atrás

**Caso A: la primera vez que despliegas esta versión.** El código anterior no usa `audit.db`, así que basta con volver:

```text
git checkout <commit anotado en el paso 1>
npm ci && npm run build && pm2 restart all
pm2 stop defensati-audit
```

`audit.db` y `data/` quedan intactos, y la autorización y los informes que hayas creado siguen ahí para cuando
vuelvas a desplegar.

**Caso B: ya tenías la versión de auditoría y una actualización dejó la base incompatible.** Las versiones anteriores
del módulo usaban un `INSERT` posicional en `findings` que falla con el esquema nuevo, así que no basta con volver al
código: hay que volver también a la base de antes del despliegue.

```text
pm2 stop all
npm run backup -- verify backups/<la copia del paso 1>
npm run backup -- restore backups/<la copia del paso 1> --to /ruta/restaurada
mv data data.antes && mv /ruta/restaurada data
git checkout <commit anotado> && npm ci && npm run build
pm2 start all
```

Se pierde lo escrito en la base después de esa copia. Si hay que conservarlo, exporta antes lo que necesites con
`npm run audit:cli -- findings <id> --json`.

## 5. Si algo falla

| Síntoma | Qué mirar |
|---|---|
| La auditoría completa responde 403 | `deploy:check` (Node, autorización) y `audit:cli list`: la autorización debe estar verificada y vigente |
| Un informe full da 404 | Es lo esperado sin enlace: `audit:cli share <id> --hours 72` |
| `deploy:check` marca una cadena alterada | No sigas: compara con el hash guardado fuera (`audit:cli log --seen <hash>`) y restaura la última copia buena |
| La copia falla | La clave (`BACKUP_PASSPHRASE`, mínimo 12 caracteres), el disco y que `tar` exista |
| No restauras en `data/` | Es a propósito: restaura en una carpeta nueva y muévela con la app detenida |
