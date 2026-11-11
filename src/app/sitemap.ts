import type { MetadataRoute } from 'next';
import { SERVICE_PAGES } from '@/config/servicePages';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://neuronalgravity.com';
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/defensati`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/defensati/informe-ejemplo`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...SERVICE_PAGES.map((s) => ({
      url: `${baseUrl}/defensati/servicios/${s.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${baseUrl}/terminos`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/reclamaciones`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
