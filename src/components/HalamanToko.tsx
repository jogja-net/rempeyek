// src/components/HalamanToko.tsx
//
// Kerangka halaman pembeli marketplace (keranjang, checkout, konfirmasi,
// lacak): pita demo + bilah atas sederhana. Header landing tidak dipakai
// karena tautan-tautannya berupa anchor `#varian` yang hanya ada di `/`.
//
// Penjaga `marketplaceAktif()` ada di tiap halaman, bukan di sini: halaman
// harus 404 SEBELUM menyentuh database.

import { site } from '@/data/site';

import IkonKeranjang from './IkonKeranjang';
import PitaDemo from './PitaDemo';

export default function HalamanToko({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PitaDemo />
      <header className="border-b border-kraft-garis bg-krem">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-6 py-3">
          <a href="/" className="font-judul text-lead font-extrabold tracking-[-0.01em] whitespace-nowrap text-kakao no-underline">
            {site.nama}
          </a>
          <nav aria-label="Navigasi toko" className="flex items-center gap-4 text-isi font-semibold">
            <a href="/lacak" className="text-kakao no-underline hover:underline">
              Lacak pesanan
            </a>
            <IkonKeranjang />
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}
