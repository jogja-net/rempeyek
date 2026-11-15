// src/app/checkout/page.tsx
//
// Checkout tamu (tanpa akun). Katalog dan daftar provinsi berasal dari server;
// ongkir dan total dihitung ulang di server saat pesanan dibuat.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import HalamanToko from '@/components/HalamanToko';
import { getDb } from '@/lib/db/client';
import { keProdukToko } from '@/lib/keranjang';
import { marketplaceAktif } from '@/lib/mode';
import { PROVINSI } from '@/lib/ongkir';
import { daftarProdukTampil } from '@/lib/produk-repo';

import FormCheckout from './FormCheckout';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Checkout | Peyek Bu Aviella',
  robots: { index: false, follow: false },
};

export default async function HalamanCheckout() {
  if (!marketplaceAktif()) notFound();

  const katalog = (await daftarProdukTampil(getDb())).map(keProdukToko);
  const daftarProvinsi = Object.keys(PROVINSI).sort((a, b) => a.localeCompare(b, 'id'));

  return (
    <HalamanToko>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-6 font-judul text-3xl font-extrabold text-kakao">Checkout</h1>
        <FormCheckout katalog={katalog} daftarProvinsi={daftarProvinsi} />
      </main>
    </HalamanToko>
  );
}
