// src/app/admin/layout.tsx
//
// Kerangka panel admin: pita demo + navigasi.
//
// Layout BUKAN penjaga akses. Layout dan halaman dirender paralel, jadi setiap
// halaman admin tetap wajib memanggil `requireAdmin()` sendiri. Di sini
// `sudahMasuk()` hanya menentukan apakah navigasi ditampilkan, supaya halaman
// login tetap bersih.

import { notFound } from 'next/navigation';

import PitaDemo from '@/components/PitaDemo';
import { sudahMasuk } from '@/lib/admin-sesi';
import { marketplaceAktif } from '@/lib/mode';

import { keluar } from './aksi';

const MENU = [
  { href: '/admin', teks: 'Pesanan' },
  { href: '/admin/produk', teks: 'Produk' },
  { href: '/admin/laporan', teks: 'Laporan' },
] as const;

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  if (!marketplaceAktif()) notFound();

  const masuk = await sudahMasuk();

  return (
    <>
      <PitaDemo />
      {masuk && (
        <nav
          aria-label="Menu admin"
          className="border-b border-kraft-garis bg-kertas print:hidden"
        >
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 text-sm">
            <span className="font-judul font-bold text-kakao">Admin</span>
            {MENU.map((m) => (
              <a key={m.href} href={m.href} className="text-redup underline-offset-4 hover:underline">
                {m.teks}
              </a>
            ))}
            <form action={keluar} className="ml-auto">
              <button type="submit" className="text-redup underline underline-offset-4">
                Keluar
              </button>
            </form>
          </div>
        </nav>
      )}
      {children}
    </>
  );
}
