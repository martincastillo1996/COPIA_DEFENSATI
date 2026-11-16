import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Seguridad y Hardening de Producción */
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  /* Opciones de rendimiento existentes */
  cacheComponents: false,
  partialPrefetching: false,

  /* Rewrites y Redirecciones Canónicas */
  async rewrites() {
    return [
      {
        source: '/scanner',
        destination: '/defensati',
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/soluciones',
        destination: '/',
        permanent: true,
      },
      {
        source: '/casos',
        destination: '/',
        permanent: true,
      },
      {
        source: '/metodologia',
        destination: '/',
        permanent: true,
      },
      {
        source: '/liderazgo',
        destination: '/',
        permanent: true,
      },
    ];
  },

  /* Hardening perimetral de cabeceras HTTP */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self' https://checkout.culqi.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.culqi.com https://js.culqi.com https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://checkout.culqi.com; img-src 'self' data: https: https://checkout.culqi.com; font-src 'self' data: https://checkout.culqi.com; connect-src 'self' https: https://api.culqi.com https://checkout.culqi.com; frame-src 'self' https://checkout.culqi.com https://challenges.cloudflare.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
          {
            // Política más estricta en modo "solo informe": no bloquea nada, solo registra en la
            // consola del navegador qué se rompería (sin 'unsafe-eval' y con connect-src cerrado).
            // Cuando la consola quede limpia en producción, se pasa a la política real de arriba.
            key: "Content-Security-Policy-Report-Only",
            value: "default-src 'self' https://checkout.culqi.com; script-src 'self' 'unsafe-inline' https://checkout.culqi.com https://js.culqi.com https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://checkout.culqi.com; img-src 'self' data: https:; font-src 'self' data: https://checkout.culqi.com; connect-src 'self' https://api.culqi.com https://checkout.culqi.com https://secure.culqi.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://cloudflareinsights.com https://ipapi.co; frame-src 'self' https://checkout.culqi.com https://challenges.cloudflare.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;