import type { NextConfig } from 'next';

const isProduction = process.env.VERCEL_ENV === 'production';

const nextConfig: NextConfig = {
  // Sengaja TIDAK memakai `output: 'export'` (lihat HANDOFF §2): Fase 2 membutuhkan
  // route handler / server, dan `headers()` di bawah tidak didukung oleh static export.
  async headers() {
    // Halaman staging & preview tidak boleh terindeks Google.
    if (isProduction) return [];

    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
    ];
  },
};

export default nextConfig;
