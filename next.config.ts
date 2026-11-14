import type { NextConfig } from 'next';

const isProduction = process.env.VERCEL_ENV === 'production';

const nextConfig: NextConfig = {
  // Sengaja TIDAK memakai `output: 'export'` (lihat HANDOFF §2): Fase 2 membutuhkan
  // route handler / server, dan `headers()` di bawah tidak didukung oleh static export.

  // Foto produk (maks 4 MB, Task 8) diunggah lewat server action, yang secara
  // bawaan menolak badan permintaan di atas 1 MB. 5 MB = foto 4 MB + kolom formulir.
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
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
