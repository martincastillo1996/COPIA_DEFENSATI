import { P } from '@/config/catalog';

/**
 * Páginas de servicio de DEFENSA TI (/defensati/servicios/[slug]).
 * Precios y alcances tomados del Catálogo Oficial (AGENTS.md, regla 7). Cualquier cambio de
 * precio debe hacerse primero en el catálogo oficial y luego reflejarse aquí.
 */
export interface ServicePrice {
  label: string;
  price: string;
}

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServicePage {
  slug: string;
  /** Nombre corto para menús y enlaces cruzados */
  shortName: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  signsTitle: string;
  signs: string[];
  includes: string[];
  prices: ServicePrice[];
  paymentTerms: string;
  deliveryTime?: string;
  guarantee?: string;
  faqs: ServiceFaq[];
  whatsappMessage: string;
}

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: 'limpieza-malware-wordpress',
    shortName: 'Limpieza de malware',
    metaTitle: `Limpieza de Malware en WordPress y WooCommerce en Perú | Desde ${P.rescateCorporativo} | DEFENSA TI`,
    metaDescription:
      `Desinfectamos tu web hackeada: retiro de virus y malware, desbloqueo con el hosting y retiro de la pantalla roja de Google. Respaldo previo y garantía de 30 días. Desde ${P.rescateCorporativo}.`,
    h1: 'Limpieza de malware y rescate de páginas web infectadas',
    intro:
      'Si tu web redirige a sitios de apuestas, muestra la pantalla roja de Google o fue suspendida por el hosting, la desinfectamos a fondo: archivos y base de datos, con respaldo previo y garantía de 30 días por escrito.',
    signsTitle: 'Señales de que tu web está infectada',
    signs: [
      'Google muestra una pantalla roja de "sitio engañoso" al entrar a tu web.',
      'Tus visitantes son redirigidos a páginas de apuestas, spam o descargas.',
      'El hosting suspendió tu cuenta por malware o consumo anormal.',
      'Aparecieron usuarios administradores que nadie de tu equipo creó.',
    ],
    includes: [
      'Respaldo integral de archivos y base de datos antes de intervenir',
      'Eliminación de virus, malware, scripts de spam y webshells',
      'Depuración de la base de datos y retiro de administradores no autorizados',
      'Gestión del desbloqueo con el hosting',
      'Retiro de la pantalla roja de Google',
      'Informe de entrega: qué se encontró, qué se corrigió y qué quedó pendiente',
    ],
    prices: [
      { label: 'Sitio corporativo', price: P.rescateCorporativo },
      { label: 'WooCommerce / Tienda online', price: P.rescateTienda },
    ],
    paymentTerms: 'Pago único • 50% al iniciar y 50% al entregar verificado',
    deliveryTime: '24 a 48 horas',
    guarantee:
      'Garantía de 30 días por escrito: si tu web se vuelve a infectar por la misma causa remediada, la limpiamos de nuevo sin costo. No cubre plugins piratas o vulnerables, contraseñas débiles ni modificaciones posteriores de terceros.',
    faqs: [
      {
        q: '¿Pierdo mi contenido o mis pedidos durante la limpieza?',
        a: 'No. Antes de tocar nada hacemos un respaldo integral de archivos y base de datos, y la desinfección conserva tu contenido, productos y pedidos.',
      },
      {
        q: '¿Qué necesitan para empezar?',
        a: 'Los accesos al hosting (cPanel, SFTP o SSH) y al administrador del sitio. El plazo empieza a contar cuando los accesos están operativos.',
      },
      {
        q: '¿Qué pasa si se vuelve a infectar?',
        a: 'Si ocurre dentro de los 30 días por la misma causa que remediamos, la volvemos a limpiar sin costo. Para prevenir nuevas vías de ataque recomendamos sumar el Blindaje + WAF Cloudflare.',
      },
    ],
    whatsappMessage:
      'Hola Martín, mi web tiene malware o fue suspendida y necesito el servicio de Rescate / Limpieza de malware. ¿Podemos empezar hoy?',
  },
  {
    slug: 'blindaje-waf-cloudflare',
    shortName: 'Blindaje + WAF Cloudflare',
    metaTitle: `Blindaje Web + WAF Cloudflare en Perú | ${P.blindajeWaf} pago único | DEFENSA TI`,
    metaDescription:
      `Cabeceras de seguridad estrictas (HSTS, CSP, X-Frame) y firewall WAF de Cloudflare activo contra bots, scrapers y ataques DDoS. Paquete unificado por ${P.blindajeWaf}, pago único.`,
    h1: 'Blindaje web con cabeceras de seguridad y WAF de Cloudflare',
    intro:
      'Cerramos las puertas que usan los atacantes automáticos: configuramos las cabeceras de seguridad de tu sitio y ponemos un firewall perimetral delante de tu web, en un solo paquete.',
    signsTitle: 'Cuándo necesitas el blindaje',
    signs: [
      'Tu web obtuvo una nota baja en el diagnóstico gratuito de DEFENSA TI.',
      'Recibes tráfico de bots, intentos de acceso o formularios de spam.',
      'Acabas de limpiar una infección y no quieres que se repita.',
      'Vendes en línea y tu pasarela de pago te exige un sitio seguro.',
    ],
    includes: [
      'Cabeceras canónicas estrictas: HSTS, Content-Security-Policy y X-Frame-Options',
      'Firewall perimetral WAF de Cloudflare activo',
      'Reglas contra bots, scrapers y ataques DDoS',
      'Re-escaneo de verificación con la nueva calificación de seguridad',
    ],
    prices: [{ label: 'Paquete unificado (cabeceras + WAF)', price: P.blindajeWaf }],
    paymentTerms: 'Pago único • 50% al iniciar y 50% al entregar verificado',
    deliveryTime: '3 a 5 días hábiles',
    guarantee:
      'Si no logramos elevar la calificación de seguridad perimetral de tu web, te devolvemos el pago.',
    faqs: [
      {
        q: '¿Puedo contratar solo las cabeceras o solo el WAF?',
        a: 'No se venden por separado. Las cabeceras protegen el navegador del visitante y el WAF filtra el tráfico antes de que llegue a tu servidor: funcionan como un solo blindaje.',
      },
      {
        q: '¿Mi web se cae durante la configuración?',
        a: 'No. Los cambios se aplican de forma progresiva y se verifican antes de dejarlos activos.',
      },
    ],
    whatsappMessage:
      `Hola Martín, quiero el Blindaje + WAF Cloudflare (${P.blindajeWaf}) para mi página web. ¿Qué necesitas para empezar?`,
  },
  {
    slug: 'mantenimiento-web-mensual',
    shortName: 'Mantenimiento mensual',
    metaTitle: `Mantenimiento y Monitoreo Web Mensual en Perú | Desde ${P.mantenimientoBasico} al mes | DEFENSA TI`,
    metaDescription:
      `Vigilancia continua de tu web: monitoreo de uptime, alerta de vencimiento SSL, reporte mensual y soporte. Sin permanencia forzosa. Sitios corporativos ${P.mantenimientoBasico}/mes, tiendas ${P.mantenimientoTiendas}/mes.`,
    h1: 'Mantenimiento mensual y vigilancia continua de tu web',
    intro:
      'Nos enteramos antes que tus clientes si tu web se cae o si tu certificado SSL está por vencer. Vigilancia continua 24/7, reporte mensual y soporte directo, sin contratos de permanencia.',
    signsTitle: 'Para quién es',
    signs: [
      'Tu web es tu canal de ventas o de contacto y no puede estar caída sin que lo sepas.',
      'Ya te pasó que el certificado SSL venció y el navegador marcó tu sitio como "no seguro".',
      'No tienes un equipo técnico propio que revise tu web.',
    ],
    includes: [
      'Básico: comprobación de uptime cada 15 minutos',
      'Básico: alerta de vencimiento SSL, reporte mensual y 40 minutos de soporte',
      'Tiendas Online: comprobación de uptime cada 5 minutos',
      'Tiendas Online: alerta prioritaria a WhatsApp y re-escaneos semanales',
      'Tiendas Online: 90 minutos de soporte prioritario',
    ],
    prices: [
      { label: 'Mantenimiento Básico (sitios corporativos)', price: `${P.mantenimientoBasico} / mes` },
      { label: 'Mantenimiento Tiendas Online (soporte prioritario)', price: `${P.mantenimientoTiendas} / mes` },
    ],
    paymentTerms: 'Pago mensual • Sin permanencia forzosa',
    faqs: [
      {
        q: '¿Hay contrato mínimo?',
        a: 'No. El servicio es mes a mes y puedes cancelarlo cuando quieras.',
      },
      {
        q: '¿El mantenimiento incluye la limpieza si me hackean?',
        a: `No. La desinfección tras una infección se cotiza aparte con la tarifa de Rescate / Limpieza de malware (${P.rescateCorporativo} sitio corporativo, ${P.rescateTienda} tienda online).`,
      },
    ],
    whatsappMessage:
      'Hola Martín, me interesa el Mantenimiento mensual para mi web. ¿Me explicas cuál plan me conviene?',
  },
  {
    slug: 'blindaje-correo-spf-dkim-dmarc',
    shortName: 'Blindaje de correo',
    metaTitle: `Configuración SPF, DKIM y DMARC en Perú | Blindaje de Correo ${P.correoSpfDkimDmarc} | DEFENSA TI`,
    metaDescription:
      `Evita que tus correos caigan en spam en Gmail y Outlook y que suplanten tu dominio. Configuración de SPF, DKIM y DMARC por ${P.correoSpfDkimDmarc}, pago único.`,
    h1: 'Blindaje de correo y anti-spam: SPF, DKIM y DMARC',
    intro:
      'Configuramos los tres registros que Gmail y Outlook revisan para confiar en tu dominio, de modo que tus correos lleguen a la bandeja de entrada y nadie pueda enviar mensajes haciéndose pasar por tu empresa.',
    signsTitle: 'Señales de que lo necesitas',
    signs: [
      'Tus cotizaciones o facturas llegan a la carpeta de spam de tus clientes.',
      'Alguien recibió un correo falso que aparentaba venir de tu dominio.',
      'El diagnóstico de DEFENSA TI marcó tu dominio sin SPF o sin DMARC.',
    ],
    includes: [
      'Configuración del registro SPF',
      'Configuración de la firma DKIM',
      'Configuración de la política DMARC',
      'Verificación de entrega y de protección contra suplantación',
    ],
    prices: [{ label: 'Blindaje de correo y anti-spam', price: P.correoSpfDkimDmarc }],
    paymentTerms: 'Pago único',
    faqs: [
      {
        q: '¿Qué necesitan para configurarlo?',
        a: 'Acceso al panel donde se administran los DNS de tu dominio (por ejemplo Cloudflare o tu proveedor de hosting) y saber con qué servicio envías tus correos.',
      },
      {
        q: '¿Sirve si uso Google Workspace o Microsoft 365?',
        a: 'Sí. SPF, DKIM y DMARC se configuran en los DNS de tu dominio sea cual sea tu proveedor de correo.',
      },
    ],
    whatsappMessage:
      `Hola Martín, quiero el Blindaje de Correo (SPF, DKIM y DMARC) por ${P.correoSpfDkimDmarc} para mi dominio.`,
  },
  {
    slug: 'migracion-hosting-segura',
    shortName: 'Migración de hosting',
    metaTitle: `Migración de Hosting sin Caída en Perú | Desde ${P.migracionCorporativa} | DEFENSA TI`,
    metaDescription:
      `Trasladamos tu web o tienda online a otro hosting sin caída: respaldo, traslado y saneamiento perimetral. Web corporativa ${P.migracionCorporativa}, tienda e-commerce ${P.migracionTienda}.`,
    h1: 'Migración limpia y segura de hosting, sin caída',
    intro:
      'Cambiamos tu web de proveedor sin que tus clientes lo noten: respaldamos todo, trasladamos el sitio y lo dejamos saneado en su nuevo servidor.',
    signsTitle: 'Cuándo conviene migrar',
    signs: [
      'Tu hosting actual es lento o se cae con frecuencia.',
      'Tu proveedor te suspende la cuenta o no te da soporte.',
      'Quieres cambiar de proveedor pero temes perder ventas o correos durante el traslado.',
    ],
    includes: [
      'Respaldo completo de archivos y base de datos',
      'Traslado sin caída (zero-downtime)',
      'Saneamiento perimetral del sitio en el nuevo hosting',
      'Verificación de funcionamiento tras el cambio',
    ],
    prices: [
      { label: 'Web corporativa', price: P.migracionCorporativa },
      { label: 'Tienda e-commerce', price: P.migracionTienda },
    ],
    paymentTerms: 'Pago único',
    faqs: [
      {
        q: '¿El precio incluye el nuevo hosting?',
        a: 'No. El plan de hosting lo contratas tú directamente con el proveedor que elijas; nuestro servicio es el traslado y el saneamiento.',
      },
      {
        q: '¿Qué accesos necesitan?',
        a: 'Los accesos al hosting de origen, al de destino y al panel de DNS del dominio.',
      },
    ],
    whatsappMessage:
      'Hola Martín, necesito migrar mi web a otro hosting sin que se caiga. ¿Me ayudas con la Migración Segura?',
  },
  {
    slug: 'optimizacion-velocidad-web-wpo',
    shortName: 'Velocidad web (WPO)',
    metaTitle: `Optimización de Velocidad Web (WPO) y Core Web Vitals en Perú | Desde ${P.wpoCorporativo} | DEFENSA TI`,
    metaDescription:
      `Aceleramos tu web: caché Edge de Cloudflare, compresión Brotli y aceleración móvil para mejorar tus Core Web Vitals. Web corporativa ${P.wpoCorporativo}, tienda e-commerce ${P.wpoTienda}.`,
    h1: 'Optimización de velocidad web (WPO) y Core Web Vitals',
    intro:
      'Una web lenta pierde visitas antes de mostrar tu oferta. Optimizamos la carga con caché en el borde de la red, compresión y ajustes específicos para móviles.',
    signsTitle: 'Señales de que tu web necesita optimización',
    signs: [
      'Tu web tarda varios segundos en cargar desde el celular.',
      'Google Search Console reporta Core Web Vitals deficientes.',
      'Pagas publicidad y los visitantes se van antes de que cargue la página.',
    ],
    includes: [
      'Caché Edge de Cloudflare',
      'Compresión Brotli',
      'Aceleración de la carga en móviles',
      'Medición de Core Web Vitals antes y después',
    ],
    prices: [
      { label: 'Web corporativa', price: P.wpoCorporativo },
      { label: 'Tienda e-commerce', price: P.wpoTienda },
    ],
    paymentTerms: 'Pago único',
    faqs: [
      {
        q: '¿Cambia el diseño de mi web?',
        a: 'No. La optimización actúa sobre cómo se entrega y se carga el sitio, no sobre su diseño ni su contenido.',
      },
      {
        q: '¿Cómo sé que mejoró?',
        a: 'Te entregamos la medición de Core Web Vitals de antes y de después de la optimización.',
      },
    ],
    whatsappMessage:
      'Hola Martín, mi web carga lento y quiero la Optimización de Velocidad (WPO). ¿Puedes revisarla?',
  },
  {
    slug: 'adecuacion-ley-29733-proteccion-datos',
    shortName: 'Adecuación Ley 29733',
    metaTitle: `Adecuación Web a la Ley 29733 de Protección de Datos (ANPDP) | Desde ${P.legalBasica} | DEFENSA TI`,
    metaDescription:
      `Adecuamos tu web a la Ley N° 29733: banner de cookies activo, políticas a medida y cláusulas de consentimiento. Adecuación básica ${P.legalBasica}, integral ${P.legalIntegral}.`,
    h1: 'Adecuación legal de tu web a la Ley N° 29733 (ANPDP Perú)',
    intro:
      'Si tu web recoge datos personales con formularios, cookies o un carrito de compras, debe cumplir la Ley de Protección de Datos Personales. Implementamos en tu sitio los elementos que la norma exige.',
    signsTitle: 'Tu web necesita adecuación si',
    signs: [
      'Tiene formularios de contacto, registro o compra sin cláusula de consentimiento.',
      'Usa cookies de analítica o publicidad sin un banner que permita aceptarlas o rechazarlas.',
      'No tiene política de privacidad, o es una plantilla copiada de otro sitio.',
    ],
    includes: [
      'Banner de cookies activo',
      'Políticas a medida para tu negocio',
      'Cláusulas de consentimiento en formularios',
    ],
    prices: [
      { label: 'Adecuación básica', price: P.legalBasica },
      { label: 'Adecuación integral', price: P.legalIntegral },
    ],
    paymentTerms: 'Pago único',
    faqs: [
      {
        q: '¿Esto reemplaza la asesoría de un abogado?',
        a: 'No. Es una adecuación técnica del sitio web: implementamos el banner, las políticas y las cláusulas. Para obligaciones legales fuera de la web, como la inscripción de bancos de datos, consulta con tu asesor legal.',
      },
      {
        q: '¿Cuál es la diferencia entre la básica y la integral?',
        a: 'Depende de cuántos formularios, cookies y flujos de datos tenga tu web. Lo definimos contigo tras revisar tu sitio, antes de que pagues.',
      },
    ],
    whatsappMessage:
      'Hola Martín, quiero adecuar mi web a la Ley 29733 de protección de datos. ¿Qué plan necesito?',
  },
  {
    slug: 'auditoria-pasarelas-de-pago',
    shortName: 'Auditoría de pasarelas',
    metaTitle: `Auditoría Técnica de Pasarelas de Pago (Niubiz, Culqi, Izipay) | ${P.auditoriaPasarelas} | DEFENSA TI`,
    metaDescription:
      `Revisión forense del checkout de tu tienda: Niubiz, Culqi, Izipay, MercadoPago o Stripe contra Magecart y manipulación de datos. ${P.auditoriaPasarelas}, pago único.`,
    h1: 'Auditoría técnica de pasarelas de pago y checkout',
    intro:
      'Revisamos el punto más sensible de tu tienda: la página donde tus clientes ingresan su tarjeta. Buscamos scripts que roban datos (Magecart) y manipulación del flujo de pago.',
    signsTitle: 'Cuándo auditar tu checkout',
    signs: [
      'Tus clientes reportan cargos no reconocidos después de comprarte.',
      'Tu pasarela retuvo fondos o te pidió revisar la seguridad de tu sitio.',
      'Tu tienda tuvo una infección y no sabes si el checkout fue alterado.',
    ],
    includes: [
      'Revisión forense del checkout',
      'Cobertura de Niubiz, Culqi, Izipay, MercadoPago o Stripe',
      'Detección de skimmers tipo Magecart',
      'Detección de manipulación de datos en el flujo de pago',
    ],
    prices: [{ label: 'Auditoría técnica de pasarela de pago', price: P.auditoriaPasarelas }],
    paymentTerms: 'Pago único',
    faqs: [
      {
        q: '¿Necesitan acceso a los datos de las tarjetas?',
        a: 'No. La auditoría revisa el código y el comportamiento del checkout; no accedemos a datos de tarjetas de tus clientes.',
      },
      {
        q: '¿Es una certificación PCI-DSS?',
        a: 'No. Es una revisión técnica del checkout de tu tienda. La certificación PCI-DSS es un proceso distinto que emiten entidades autorizadas.',
      },
    ],
    whatsappMessage:
      `Hola Martín, quiero la Auditoría Técnica de Pasarela de Pago (${P.auditoriaPasarelas}) para el checkout de mi tienda.`,
  },
];

export function getServicePage(slug: string): ServicePage | undefined {
  return SERVICE_PAGES.find((s) => s.slug === slug);
}
