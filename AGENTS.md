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
   - La oferta comercial de DEFENSA TI no vende parches a medias ni blindaje/WAF por separado. Se estructura en:
     1. **Diagnóstico gratuito:** Escáner pasivo de cabeceras, SSL y puertos (100% sin costo, gancho comercial para mostrar qué encontramos antes de que pagues).
     2. **Pack Todo Incluido (Oferta Insignia Llave en Mano):** "Rescate + Blindaje WAF Cloudflare + 3 meses de monitoreo 24/7 incluidos", con pago único de S/ 600 (Web Corporativa / Blog) o S/ 850 (E-commerce / Tienda Online con WooCommerce, Shopify o Wix). Incluye desinfección forense completa, cabeceras canónicas, Cloudflare WAF anti-bots, 3 meses de monitoreo con aviso a WhatsApp, garantía formal de 30 días y comprobante formal con RUC 10704877850 ("yo mismo reviso tu web").
     3. **Rescate de Emergencia Puntual:** Intervención urgente forense 24-48h para sitios caídos o infectados sin blindaje ni monitoreo extendido (S/ 450 – S/ 650 por emergencia, con garantía de 30 días).
     4. **Monitoreo y mantenimiento mensual:** Vigilancia continua tras vencer los 3 meses incluidos o para webs previamente saneadas (Plan Esencial S/ 49/mes y Plan Pro S/ 99/mes), sin permanencia forzosa.

