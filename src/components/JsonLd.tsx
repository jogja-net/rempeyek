import { site } from '@/data/site';
import { serialisasiJsonLd } from '@/lib/jsonld';
import type { KatalogLanding } from '@/lib/katalog';

// JSON-LD (HANDOFF §8). Aturan:
//  - Field yang null DIHILANGKAN, tidak dikirim sebagai string kosong.
//  - `Product` + `Offer` HANYA untuk produk yang `harga` terisi (> 0).
//  - TANPA `aggregateRating` / `review` sampai ada ulasan asli.
//  - TANPA `FAQPage`: sejak Agustus 2023 Google hanya menampilkan rich result FAQ untuk
//    situs pemerintah dan kesehatan, jadi untuk toko ia tidak memberi manfaat. FAQ tetap
//    tampil sebagai teks di halaman.
export default function JsonLd({ katalog }: { katalog: KatalogLanding }) {
  const data: Record<string, unknown>[] = [];

  // --- LocalBusiness ---
  const localBusiness: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.nama,
    url: site.url,
    description:
      'Peyek kacang tanah, kacang hijau, teri, dan rebon buatan dapur rumah. Digoreng tipis, dikemas setelah dingin, dipesan lewat WhatsApp.',
  };
  if (site.whatsapp) localBusiness.telephone = `+${site.whatsapp}`;
  if (site.alamat) {
    localBusiness.address = {
      '@type': 'PostalAddress',
      streetAddress: site.alamat,
      ...(site.kota ? { addressLocality: site.kota } : {}),
      addressCountry: 'ID',
    };
  }
  if (site.jamLayanan) localBusiness.openingHours = site.jamLayanan;
  const sameAs = [
    site.instagram ? `https://instagram.com/${site.instagram}` : null,
    site.tiktok ? `https://tiktok.com/@${site.tiktok}` : null,
    site.shopee,
  ].filter((tautan): tautan is string => tautan !== null);
  if (sameAs.length > 0) localBusiness.sameAs = sameAs;
  data.push(localBusiness);

  // --- Product + Offer (hanya yang harganya sudah ada) ---
  const produkBerharga = katalog.peyek.filter(
    (item): item is typeof item & { harga: number } => item.harga !== null && item.harga > 0,
  );
  if (produkBerharga.length > 0) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: produkBerharga.map((item, indeks) => {
        // Halaman produk hanya ada saat marketplace aktif; selain itu menaut ke bagian katalog.
        const url = katalog.dariDb ? `${site.url}/produk/${item.slug}` : `${site.url}/#varian`;
        return {
          '@type': 'ListItem',
          position: indeks + 1,
          item: {
            '@type': 'Product',
            name: item.nama,
            description: item.deskripsi,
            url,
            brand: { '@type': 'Brand', name: site.nama },
            ...(item.gambar.length > 0 ? { image: item.gambar } : {}),
            offers: {
              '@type': 'Offer',
              url,
              priceCurrency: 'IDR',
              price: item.harga,
              availability:
                item.status === 'tersedia'
                  ? 'https://schema.org/InStock'
                  : item.status === 'po'
                    ? 'https://schema.org/PreOrder'
                    : 'https://schema.org/OutOfStock',
            },
          },
        };
      }),
    });
  }

  return (
    <>
      {data.map((blok, indeks) => (
        <script
          key={indeks}
          type="application/ld+json"
          // Teks katalog bisa berasal dari database (diisi admin): serialisasiJsonLd meng-escape "<".
          dangerouslySetInnerHTML={{ __html: serialisasiJsonLd(blok) }}
        />
      ))}
    </>
  );
}
