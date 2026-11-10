import type { MetadataRoute } from 'next';
import { site } from '@/data/site';

// Sitemap 1 URL (HANDOFF §8). Di staging tetap bisa diakses, tapi robots disallow.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
