import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // El panel interno no se lista aquí (robots.txt es público y solo lo anunciaría);
        // ya lleva noindex en su propio layout.
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://neuronalgravity.com/sitemap.xml',
    host: 'https://neuronalgravity.com',
  };
}
