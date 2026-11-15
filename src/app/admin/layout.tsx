// src/app/admin/layout.tsx
//
// Kerangka panel admin gaya Lapakku: pita demo + sidebar kiri (HP: menu lipat).
//
// Layout BUKAN penjaga akses. Layout dan halaman dirender paralel, jadi setiap
// halaman admin tetap wajib memanggil `requireAdmin()` sendiri. Di sini
// `sudahMasuk()` hanya menentukan apakah navigasi ditampilkan, supaya halaman
// login tetap bersih.

import { notFound } from 'next/navigation';

import MenuAdmin from '@/components/admin/MenuAdmin';
import PitaDemo from '@/components/PitaDemo';
import { sudahMasuk } from '@/lib/admin-sesi';
import { marketplaceAktif } from '@/lib/mode';

import { keluar } from './aksi';

const TOMBOL_KELUAR =
  'w-full rounded-lg px-3 py-2 text-left text-sm text-redup transition-colors hover:bg-kraft/60';

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  if (!marketplaceAktif()) notFound();

  const masuk = await sudahMasuk();
  if (!masuk) {
    return (
      <>
        <PitaDemo />
        {children}
      </>
    );
  }

  return (
    <>
      <PitaDemo />

      {/* HP: bar atas + menu lipat (<details> bawaan browser, tanpa JS). */}
      <details className="border-b border-kraft-garis bg-kertas md:hidden print:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 font-judul font-bold text-kakao">
          Admin Peyek Bu Aviella <span aria-hidden="true">☰</span>
        </summary>
        <div className="space-y-3 border-t border-kraft-garis px-4 py-4">
          <MenuAdmin />
          <form action={keluar}>
            <button type="submit" className={TOMBOL_KELUAR}>
              Keluar
            </button>
          </form>
        </div>
      </details>

      <div className="md:flex">
        <aside className="hidden w-60 shrink-0 border-r border-kraft-garis bg-kertas md:sticky md:top-0 md:block md:h-screen md:self-start print:hidden">
          <div className="flex h-full flex-col px-4 py-6">
            <p className="mb-6 px-3 font-judul text-lg font-bold text-kakao">
              Peyek Bu Aviella
              <span className="block text-xs font-medium text-redup">Panel admin</span>
            </p>
            <MenuAdmin />
            <form action={keluar} className="mt-auto border-t border-kraft-garis pt-4">
              <button type="submit" className={TOMBOL_KELUAR}>
                Keluar
              </button>
            </form>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}
