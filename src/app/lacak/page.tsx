// src/app/lacak/page.tsx — Lacak Pesanan publik (spec §52, §76).

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import HalamanToko from '@/components/HalamanToko';
import { marketplaceAktif } from '@/lib/mode';

import FormLacak from './FormLacak';

export const metadata: Metadata = {
  title: 'Lacak Pesanan | Peyek Bu Aviella',
  robots: { index: false, follow: false },
};

export default function HalamanLacak() {
  if (!marketplaceAktif()) notFound();

  return (
    <HalamanToko>
      <main className="mx-auto max-w-xl px-6 py-10">
        <h1 className="mb-2 font-judul text-seksi font-extrabold text-kakao">Lacak pesanan</h1>
        <p className="mb-6 text-redup">
          Masukkan nomor resi yang Anda terima. Demi privasi, alamat dan nomor HP tidak ditampilkan.
        </p>
        <FormLacak />
      </main>
    </HalamanToko>
  );
}
