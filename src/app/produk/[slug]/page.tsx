// src/app/produk/[slug]/page.tsx
//
// Halaman satu produk. Hanya ada saat marketplace aktif; di produksi, produk yang
// tidak ada, atau yang sudah diarsipkan, hasilnya 404.
//
// Tidak memuat klaim yang tidak ada di sumber lain: isinya nama, deskripsi, harga,
// berat, dan dua keterangan yang sama dengan landing page (digoreng tipis, dikemas
// setelah dingin).

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import HalamanToko from '@/components/HalamanToko';
import PeyekIllustration from '@/components/PeyekIllustration';
import TambahKeKeranjang from '@/components/TambahKeKeranjang';
import { site } from '@/data/site';
import { getDb } from '@/lib/db/client';
import { serialisasiJsonLd } from '@/lib/jsonld';
import { formatBerat, formatRupiah } from '@/lib/format';
import { marketplaceAktif } from '@/lib/mode';
import { ambilProdukBySlug, type ProdukDb } from '@/lib/produk-repo';

// Halaman dibuat saat pertama diminta lalu disegarkan tiap jam; admin juga memicu
// revalidatePath('/produk/[slug]') setiap kali produk diubah.
export const revalidate = 3600;

const LABEL_STATUS = { tersedia: 'Tersedia', po: 'Pre-order', habis: 'Habis' } as const;

async function muatProduk(slug: string): Promise<ProdukDb | null> {
  if (!marketplaceAktif()) return null;
  const produk = await ambilProdukBySlug(getDb(), slug);
  return produk === null || produk.diarsipkan ? null : produk;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const produk = await muatProduk(slug);
  if (produk === null) return { title: 'Produk tidak ditemukan' };

  // Judul ≤ 60 karakter: nama produk (mengandung kata kunci) + asal + nama usaha.
  const judul = `${produk.nama} dari ${site.kota ?? '[KOTA]'} | ${site.nama}`;
  const deskripsi = `${produk.deskripsi} Digoreng tipis, dikemas setelah dingin. ${formatRupiah(produk.harga)} per ${formatBerat(produk.berat_gram)}. Pesan lewat keranjang atau WhatsApp.`;
  const url = `/produk/${produk.slug}`;

  return {
    title: judul,
    description: deskripsi,
    alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'id_ID', url, siteName: site.nama, title: judul, description: deskripsi },
    twitter: { card: 'summary_large_image', title: judul, description: deskripsi },
  };
}

export default async function HalamanProduk({ params }: { params: Promise<{ slug: string }> }) {
  if (!marketplaceAktif()) notFound();

  const { slug } = await params;
  const produk = await muatProduk(slug);
  if (produk === null) notFound();

  const adaGambar = produk.gambar.length > 0;
  const url = `${site.url}/produk/${produk.slug}`;

  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: site.nama, item: site.url },
        { '@type': 'ListItem', position: 2, name: produk.nama, item: url },
      ],
    },
  ];
  if (produk.harga > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: produk.nama,
      description: produk.deskripsi,
      url,
      brand: { '@type': 'Brand', name: site.nama },
      ...(adaGambar ? { image: produk.gambar } : {}),
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: 'IDR',
        price: produk.harga,
        availability:
          produk.status === 'tersedia'
            ? 'https://schema.org/InStock'
            : produk.status === 'po'
              ? 'https://schema.org/PreOrder'
              : 'https://schema.org/OutOfStock',
      },
    });
  }

  return (
    <HalamanToko>
      {jsonLd.map((blok, indeks) => (
        <script
          key={indeks}
          type="application/ld+json"
          // Teks produk dari database: serialisasiJsonLd meng-escape "<" agar tidak menutup <script>.
          dangerouslySetInnerHTML={{ __html: serialisasiJsonLd(blok) }}
        />
      ))}

      <main className="mx-auto max-w-[1000px] px-6 py-10">
        <nav aria-label="Jejak halaman" className="mb-6 text-sm text-redup">
          <a href="/" className="underline underline-offset-4">
            {site.nama}
          </a>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{produk.nama}</span>
        </nav>

        <div className="grid items-start gap-10 md:grid-cols-2">
          <div className="pola-titik relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[28px] bg-kraft">
            {adaGambar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={produk.gambar[0]} alt={produk.nama} className="h-full w-full object-cover" />
            ) : (
              <>
                <PeyekIllustration warnaIsian={produk.warna_isian} className="h-[200px] w-[260px]" />
                <span className="absolute bottom-3 left-4 text-[12px] font-semibold text-redup">[FOTO ASLI]</span>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <span className="self-start rounded-full bg-kraft px-3.5 py-1.5 text-[14px] font-semibold text-redup">
              {LABEL_STATUS[produk.status]}
            </span>
            <h1 className="m-0 text-[clamp(32px,4.4vw,48px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
              {produk.nama}
            </h1>
            <p className="m-0 text-[18px] text-redup">{produk.deskripsi}</p>

            <p className="m-0">
              <span className="font-judul text-[32px] font-extrabold">{formatRupiah(produk.harga)}</span>{' '}
              <span className="text-redup">per {formatBerat(produk.berat_gram)}</span>
            </p>

            <div>
              <TambahKeKeranjang
                produkId={produk.id}
                nama={produk.nama}
                status={produk.status}
                className="inline-flex min-h-14 items-center rounded-full bg-cabai px-8 text-[17px] font-bold text-white hover:bg-cabai-tua disabled:cursor-not-allowed disabled:bg-kraft disabled:text-redup"
              />
            </div>

            <ul className="m-0 list-disc space-y-1 pl-5 text-redup">
              <li>Digoreng tipis satu per satu.</li>
              <li>Dikemas setelah benar-benar dingin supaya tetap kriuk sampai tujuan.</li>
              <li>Tanpa daftar akun: isi data pengiriman saat checkout.</li>
            </ul>

            <a href="/#varian" className="text-sm text-redup underline underline-offset-4">
              Lihat varian peyek lainnya
            </a>
          </div>
        </div>
      </main>
    </HalamanToko>
  );
}
