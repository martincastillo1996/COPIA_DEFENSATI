<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Reglas Obligatorias de UX/UI & High-Conversion (Neuronal Gravity)

1. **Integridad de Texto y Cero Truncamientos (No `line-clamp` abusivo):**
   - Nunca truncar títulos, botones, badges o etiquetas con `line-clamp-1` o `text-ellipsis` si cortan palabras de valor comercial (ej. "Automatización de Facturas y..."). Los textos deben verse completos, elegantes y responsivos con `whitespace-normal` y `leading-snug`.
2. **Mentalidad Full-Stack de Conversión y Ventas:**
   - Cada sección debe eliminar fricción: mostrar garantías claras (piloto sin riesgo, NDA confidencial, soporte directo), casos con ROI cuantificable y propuesta de valor superior a agencias tradicionales.
3. **Estándar Apple Pro Dark Glass:**
   - Alta legibilidad con contrastes nítidos (`#141416`, `#0e1118`, `#38bdf8`), micro-interacciones suaves, badges interactivos y estados activos/hover claros en móvil y escritorio.
4. **Despliegues Simultáneos Obligatorios (DigitalOcean + Vercel):**
   - Ambos entornos deben reflejar la misma versión:
     * `neuronalgravity.com` en DigitalOcean (`159.203.80.121`) con Cloudflare.
     * `security-score-seven.vercel.app` en Vercel (se despliega con push a `main`).
   - El comando para actualizar DigitalOcean en su carpeta activa es:
     `cd /var/www/app && git pull origin main && npm run build && pm2 restart all`
5. **Regla de Identidad de Marca (Logotipo Neuronal Gravity vs. DEFENSA TI):**
   - **Páginas de Neuronal Gravity (Portada, Términos, Reclamaciones, Soluciones, etc.):** Deben utilizar de forma estricta y obligatoria el logotipo oficial `NeuronalGravityBrandLogo` con el badge `NG` (fondo oscuro `#0a0d14` con borde y aura gradiente azul/violeta/celeste `from-[#0071e3] via-[#7928ca] to-[#38bdf8]`), el título en negrita `NEURONAL GRAVITY` y el subtítulo `Soluciones Tecnológicas • RUC 10704877850`.
   - **Página y subpáginas de DEFENSA TI (`/defensati`, escáner, etc.):** Utilizan el icono de **escudo de seguridad** (`ShieldCheck`) correspondiente al producto de ciberseguridad perimetral.
   - Respuestas concisas, en español y directas.

6. **Protocolo Obligatorio para Auditorías, Informes y Limpieza de Webs a Clientes:**
   - Cada vez que el usuario solicite auditar una web o generar un informe/PDF con resultados para un cliente (especialmente en servicios de limpieza de páginas infectadas o remediación), DEBE quedar documentado de forma obligatoria y estructurada:
     1. **Qué se encontró:** Detalle de virus, malware, redirecciones maliciosas, fallas de cabeceras, puertos expuestos o vulnerabilidades detectadas.
     2. **Qué se corrigió:** Acciones exactas de desinfección, parches perimetrales y cabeceras aplicadas.
     3. **Qué quedó pendiente:** Tareas fuera del alcance o dependientes del cliente (ej. actualización de plugins con licencias vencidas).
     4. **Qué respaldos se realizaron:** Copia de seguridad integral de archivos y base de datos previa a la intervención.
     5. **Qué responsabilidad se asume:** Alcance técnico directo sobre la desinfección y blindaje perimetral implementado.
     6. **Qué garantías se ofrecen y cuáles no:** Garantía de 30 días si la web se vuelve a infectar por la misma causa remediada; exclusión de garantía ante instalación de plugins piratas/vulnerables, contraseñas débiles o modificaciones de terceros posteriores.

7. **Catálogo Oficial de Servicios Comercializados por DEFENSA TI:**
   - La oferta comercial de DEFENSA TI se compone de estos servicios oficiales con precios transparentes en Soles:
     1. **Diagnóstico gratuito:** Escáner pasivo de cabeceras, SSL y puertos (100% sin costo, gancho comercial para mostrar qué encontramos antes de que pagues).
     2. **Rescate / Limpieza de malware:** Desinfección forense profunda de archivos y base de datos con respaldo previo, retiro de virus/malware, desbloqueo con el hosting, retiro de pantalla roja de Google y garantía de 30 días ("yo mismo reviso tu web"):
        - Sitio Corporativo: S/ 380 (pago único).
        - WooCommerce / Tienda Online: S/ 550 (pago único).
     3. **Blindaje + WAF Cloudflare (Paquete Unificado):** S/ 450 (pago único). Cabeceras canónicas estrictas (HSTS, CSP, X-Frame) más Firewall perimetral WAF activo contra bots, scrapers y ataques DDoS (no se venden cabeceras por separado).
     4. **Mantenimiento mensual:** Vigilancia continua 24/7 sin permanencia forzosa:
        - Mantenimiento Básico (sitios corporativos): S/ 90/mes (uptime cada 15 min, alerta SSL, reporte mensual y soporte de 40 min).
        - Mantenimiento Tiendas Online (soporte prioritario): S/ 180/mes (uptime cada 5 min, alerta prioritaria a WhatsApp, re-escaneos semanales y soporte prioritario de 90 min).
     5. **Servicios Complementarios & Upsells Inmediatos (Alta Demanda):**
        - **Blindaje de Correo & Anti-Spam (SPF, DKIM, DMARC):** S/ 190 (pago único). Evita caída en spam de Gmail/Outlook y suplantación de identidad.
        - **Migración Limpia y Segura de Hosting (Zero-Downtime):** S/ 290 (web corporativa) / S/ 450 (tienda e-commerce). Respaldo, traslado sin caída y saneamiento perimetral.
        - **Optimización de Velocidad Web (WPO) + Core Web Vitals:** S/ 320 (web corporativa) / S/ 480 (tienda e-commerce). Caché Edge Cloudflare, compresión Brotli y aceleración móvil.
        - **Adecuación Legal Web (Ley N° 29733 - ANPDP Perú):** S/ 350 (básica) / S/ 500 (integral). Banner de cookies activo, políticas a medida y cláusulas de consentimiento para evitar multas del MINJUS.
        - **Auditoría Técnica de Pasarelas de Pago:** S/ 420 (pago único). Revisión forense de checkout, Niubiz, Culqi, Izipay, MercadoPago o Stripe contra Magecart y manipulación de datos.

