# DEFENSA TI - Worker de Monitoreo Continuo y Diff Engine (DigitalOcean)

Worker autónomo diseñado para ejecutarse mediante `cron` en un Droplet Linux de DigitalOcean (Ubuntu 22.04 / 24.04 LTS).

---

## Características Principales

1. **Control Estricto de Concurrencia (Máx 3 en paralelo):**
   - Procesa los dominios activos de `monitored_domains` en lotes de **máximo 3 dominios concurrentes** para no saturar memoria RAM ni CPU de droplets de 1 vCPU / 1GB RAM ($4 - $6/mes).
2. **Defensas Anti-SSRF:**
   - Bloqueo de rangos privados RFC 1918 en resolución DNS inicial y tras cualquier redirección HTTP 301/302.
3. **Diff Engine de Regresiones:**
   - Detecta y alerta ante:
     - Caída de puntaje mayor o igual a 5 puntos (`score_drop >= 5`).
     - Certificado SSL próximo a expirar (`ssl_days_left <= 15`).
     - Eliminación o degradación de registros `SPF` o `DMARC` (ej. `p=reject` a `p=none`).
     - Cambio inesperado en la IP resuelta (`server_ip`).
4. **Despacho Multicanal:**
   - Correo electrónico transaccional vía Resend.
   - Webhooks para Slack, Microsoft Teams o Discord.
   - Registro inmutable en la tabla `alerts_log`.

---

## Variables de Entorno Requeridas (`.env`)

```bash
# Supabase / PostgreSQL (opcional si usas fallback local)
NEXT_PUBLIC_SUPABASE_URL=https://tuid.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Alertas vía Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
DEFAULT_ALERT_EMAIL=contacto@neuronalgravity.com
ALERT_FROM_EMAIL=alertas@neuronalgravity.com

# Webhooks (Opcional)
SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/...
```

---

## Ejecución Manual de Prueba

```bash
# Desde la raíz del proyecto
npx tsx worker/index.ts
```

---

## Configuración en DigitalOcean Droplet

### Opción A: Programación mediante `crontab` (Recomendada)

Ejecutar cada 1 hora (o cada 15 minutos):

```bash
crontab -e
```

Añadir la siguiente línea al crontab de Linux:

```cron
# Monitoreo continuo cada hora en el minuto 0
0 * * * * cd /var/www/security-score && /usr/bin/npx tsx worker/index.ts >> /var/log/defensati-worker.log 2>&1
```

O para escaneos diarios a las 02:00 AM UTC:

```cron
0 2 * * * cd /var/www/security-score && /usr/bin/npx tsx worker/index.ts >> /var/log/defensati-worker.log 2>&1
```

### Opción B: Servicio `systemd` y Timer de Linux

1. Crear el archivo de servicio `/etc/systemd/system/defensati-worker.service`:

```ini
[Unit]
Description=DEFENSA TI Continuous Monitoring Worker
After=network.target

[Service]
Type=oneshot
User=root
WorkingDirectory=/var/www/security-score
EnvironmentFile=/var/www/security-score/.env
ExecStart=/usr/bin/npx tsx worker/index.ts
StandardOutput=journal
StandardError=journal
```

2. Crear el timer `/etc/systemd/system/defensati-worker.timer`:

```ini
[Unit]
Description=Run DEFENSA TI Worker every hour

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
```

3. Activar el timer:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now defensati-worker.timer
```
