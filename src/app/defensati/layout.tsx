import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DEFENSA TI | Blindaje Web, Desinfección de WordPress y Ciberseguridad en Perú',
  description:
    'Protegemos y recuperamos tu página web de ataques, malware y caídas. Diagnóstico preliminar sin costo, desinfección forense con garantía de 30 días y comprobante formal con RUC 10704877850.',
  alternates: {
    canonical: 'https://neuronalgravity.com/defensati',
  },
  keywords: [
    'seguridad web peru',
    'desinfeccion wordpress lima',
    'blindaje web perimetral',
    'limpieza de malware wordpress',
    'quitar pantalla roja google',
    'proteccion waf cloudflare peru',
    'ciberseguridad pymes',
    'defensa ti',
    'neuronal gravity',
  ],
  openGraph: {
    title: 'DEFENSA TI | Blindaje Web y Desinfección de Sitios Hackeados',
    description:
      'Diagnóstico previo sin costo. Rescate de malware desde S/ 380, Blindaje + WAF por S/ 450 con garantía de 30 días por escrito y RUC 10704877850.',
    url: 'https://neuronalgravity.com/defensati',
    siteName: 'DEFENSA TI • Neuronal Gravity',
    locale: 'es_PE',
    type: 'website',
    images: [
      {
        url: 'https://neuronalgravity.com/martin-castillo-preview.jpg',
        width: 1200,
        height: 630,
        alt: 'DEFENSA TI • Blindaje y Ciberseguridad Web',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DEFENSA TI | Blindaje y Ciberseguridad Web',
    description:
      'Protegemos tu página web para reducir riesgos, prevenir ataques y mantener tu negocio operativo. Diagnóstico previo sin costo y garantía formal por escrito.',
    images: ['https://neuronalgravity.com/martin-castillo-preview.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['ProfessionalService', 'SecurityService'],
      '@id': 'https://neuronalgravity.com/defensati/#service',
      name: 'DEFENSA TI - Blindaje y Ciberseguridad Web',
      url: 'https://neuronalgravity.com/defensati',
      telephone: '+17856433991',
      priceRange: 'S/ 90 - S/ 550',
      currenciesAccepted: 'PEN',
      paymentAccepted: 'Yape, Plin, Transferencia Bancaria Directa',
      taxID: '10704877850',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lima',
        addressCountry: 'PE',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Perú',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:00',
          closes: '20:00',
        },
      ],
      founder: {
        '@type': 'Person',
        name: 'Martín Castillo',
        jobTitle: 'Especialista en Seguridad Web & Fundador',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Catálogo Oficial de Servicios de Ciberseguridad DEFENSA TI',
        itemListElement: [
          {
            '@type': 'Offer',
            name: 'Diagnóstico Gratuito Perimetral',
            price: '0',
            priceCurrency: 'PEN',
            description: 'Escáner pasivo no intrusivo de SSL/TLS, cabeceras y puertos.',
          },
          {
            '@type': 'Offer',
            name: 'Rescate / Limpieza de malware (Sitio Corporativo)',
            price: '380',
            priceCurrency: 'PEN',
            description: 'Desinfección forense completa de archivos y base de datos con respaldo previo y garantía de 30 días.',
          },
          {
            '@type': 'Offer',
            name: 'Rescate / Limpieza de malware (WooCommerce / Tienda Online)',
            price: '550',
            priceCurrency: 'PEN',
            description: 'Desinfección forense integral en e-commerce con saneamiento de plantillas, checkout y pasarelas de pago.',
          },
          {
            '@type': 'Offer',
            name: 'Blindaje + WAF Cloudflare (Paquete Unificado)',
            price: '450',
            priceCurrency: 'PEN',
            description: 'Cabeceras estrictas canónicas más Firewall perimetral WAF de Cloudflare contra bots y ataques DDoS.',
          },
          {
            '@type': 'Offer',
            name: 'Mantenimiento Mensual 24/7',
            price: '90',
            priceCurrency: 'PEN',
            description: 'Uptime checks continuos, alertas preventivas de SSL y soporte técnico directo sin permanencia.',
          },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://neuronalgravity.com/defensati/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cuáles son los plazos de entrega y el horario de atención técnica?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Atención técnica de Lunes a Sábado de 9:00 a 20:00 (Hora Perú, UTC-5). Diagnóstico preliminar en menos de 2 horas. Limpieza de WordPress habitual en 24 a 48 horas hábiles tras recibir accesos (hasta 2 a 4 días en casos complejos). Blindaje en 3 a 5 días hábiles. Protección WAF en 5 a 7 días hábiles. Monitoreo mensual activo 24/7.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Tienen acceso a mis datos bancarios o información confidencial de mis clientes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nunca. La intervención técnica se ejecuta estrictamente a nivel de archivos de servidor y base de datos técnica del CMS. Jamás solicitamos pasarelas de pago ni datos sensibles. Sin intermediarios ni juniors: yo mismo reviso tu web personalmente con total reserva.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cómo funciona la garantía de 30 días en el servicio de limpieza?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Si dentro de los 30 días calendario posteriores a la desinfección tu web vuelve a presentar la misma infección o puerta trasera remediada, nos encargamos de revisarla y desinfectarla nuevamente sin costo adicional.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Por qué mi proveedor de hosting suspendió mi web y no la repara por mí?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Los contratos de hosting estipulan que el mantenimiento del CMS y código es responsabilidad del cliente. Cuando un sitio aloja malware, el hosting lo suspende para proteger al resto del servidor. Nosotros desinfectamos el código para levantar la suspensión.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Emites comprobante de pago legal para mi empresa o negocio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. Emitimos Factura o Boleta electrónica formal conforme a ley peruana bajo RUC 10704877850 a nombre de Martín Castillo.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Existe algún contrato de permanencia forzosa en los planes de monitoreo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Cero permanencia. Los planes de monitoreo se pagan mes a mes de forma prepagada y puedes pausar o cancelar el servicio en cualquier momento con un simple mensaje a WhatsApp.',
          },
        },
      ],
    },
  ],
};

export default function DefensatiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Datos estructurados JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {children}
    </>
  );
}
