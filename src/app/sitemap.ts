import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
import { getDb } from '@/lib/db/client';
import { marketplaceAktif } from '@/lib/mode';
import { daftarProdukTampil } from '@/lib/produk-repo';

// Sitemap (HANDOFF §8). Di staging tetap bisa diakses, tapi robots disallow.
//
// Produksi (marketplace nonaktif): satu URL, persis seperti sebelumnya.
// Marketplace aktif: ditambah satu URL per produk yang tampil di katalog
// (yang diarsipkan tidak masuk). Bila database gagal dibaca, sitemap tetap
// valid dengan satu URL saja, bukan galat.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const daftar: MetadataRoute.Sitemap = [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];

  if (marketplaceAktif()) {
    try {
      const produk = await daftarProdukTampil(getDb());
      for (const p of produk) {
        daftar.push({
          url: `${site.url}/produk/${p.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    } catch (galat) {
      console.warn('sitemap: gagal membaca produk:', galat instanceof Error ? galat.message : galat);
    }
  }

  return daftar;
}
