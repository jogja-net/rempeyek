import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
import { bolehDiindeks } from '@/lib/mode';

// robots.txt (HANDOFF §8): staging, preview, dan produksi masa demo TIDAK boleh diindeks.
export default function robots(): MetadataRoute.Robots {
  if (!bolehDiindeks()) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
