import { site } from '@/data/site';
import { produk } from '@/data/products';
import { faq } from '@/data/faq';

// JSON-LD (HANDOFF §8). Aturan:
//  - Field yang null DIHILANGKAN, tidak dikirim sebagai string kosong.
//  - `Product` + `Offer` HANYA untuk produk yang `harga` terisi (bukan null).
//  - TANPA `aggregateRating` / `review` sampai ada ulasan asli.
//  - `FAQPage` dari src/data/faq.ts.
export default function JsonLd() {
  const data: Record<string, unknown>[] = [];

  // --- LocalBusiness ---
  const localBusiness: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.nama,
    url: site.url,
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
  const produkBerharga = produk.filter(
    (item): item is typeof item & { harga: number } => item.harga !== null,
  );
  if (produkBerharga.length > 0) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: produkBerharga.map((item, indeks) => ({
        '@type': 'ListItem',
        position: indeks + 1,
        item: {
          '@type': 'Product',
          name: item.nama,
          description: item.deskripsi_singkat,
          url: `${site.url}/#varian`,
          offers: {
            '@type': 'Offer',
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
      })),
    });
  }

  // --- FAQPage ---
  if (faq.length > 0) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.pertanyaan,
        acceptedAnswer: { '@type': 'Answer', text: item.jawaban },
      })),
    });
  }

  return (
    <>
      {data.map((blok, indeks) => (
        <script
          key={indeks}
          type="application/ld+json"
          // Blok ini kita bangun sendiri dari data statis, bukan dari input pengguna.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blok) }}
        />
      ))}
    </>
  );
}
