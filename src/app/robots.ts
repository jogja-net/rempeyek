import type { MetadataRoute } from 'next';
import { site } from '@/data/site';

// robots.txt (HANDOFF §8): staging & preview TIDAK boleh diindeks.
export default function robots(): MetadataRoute.Robots {
  const isProduksi = process.env.VERCEL_ENV === 'production';

  if (!isProduksi) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
