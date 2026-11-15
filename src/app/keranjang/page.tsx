// src/app/keranjang/page.tsx
//
// Keranjang disimpan di browser (localStorage), tetapi harga dan ketersediaan
// SELALU berasal dari katalog server pada setiap render halaman ini, jadi
// keranjang tidak pernah menyimpan harga yang bisa usang atau dipalsukan.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import HalamanToko from '@/components/HalamanToko';
import { getDb } from '@/lib/db/client';
import { keProdukToko } from '@/lib/keranjang';
import { marketplaceAktif } from '@/lib/mode';
import { daftarProdukTampil } from '@/lib/produk-repo';

import IsiKeranjang from './IsiKeranjang';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Keranjang | Peyek Bu Aviella',
  robots: { index: false, follow: false },
};

export default async function HalamanKeranjang() {
  if (!marketplaceAktif()) notFound();

  const katalog = (await daftarProdukTampil(getDb())).map(keProdukToko);

  return (
    <HalamanToko>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-6 font-judul text-3xl font-extrabold text-kakao">Keranjang</h1>
        <IsiKeranjang katalog={katalog} />
      </main>
    </HalamanToko>
  );
}
