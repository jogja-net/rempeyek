// src/app/admin/layout.tsx
//
// Kerangka panel admin gaya Lapakku: pita demo + sidebar kiri (HP: menu lipat).
//
// Layout BUKAN penjaga akses. Layout dan halaman dirender paralel, jadi setiap
// halaman admin tetap wajib memanggil `requireAdmin()` sendiri. Di sini
// `sudahMasuk()` hanya menentukan apakah navigasi ditampilkan, supaya halaman
// login tetap bersih.

import { notFound } from 'next/navigation';

import Ikon from '@/components/admin/Ikon';
import MenuAdmin from '@/components/admin/MenuAdmin';
import PitaDemo from '@/components/PitaDemo';
import { sudahMasuk } from '@/lib/admin-sesi';
import { marketplaceAktif } from '@/lib/mode';

import { keluar } from './aksi';

const TAUTAN_BAWAH =
  'flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm text-redup transition-colors duration-150 hover:bg-kraft/60 hover:text-kakao';

function Merek() {
  return (
    <span className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-emas font-judul text-lg font-extrabold text-kakao">
        P
      </span>
      <span className="font-judul font-bold leading-tight text-kakao">
        Peyek Bu Aviella
        <span className="block font-badan text-xs font-medium text-redup">Panel admin</span>
      </span>
    </span>
  );
}

function TautanBawah() {
  return (
    <div className="space-y-0.5">
      <a href="/" target="_blank" rel="noopener" className={TAUTAN_BAWAH}>
        <Ikon nama="toko" />
        Lihat toko
      </a>
      <form action={keluar}>
        <button type="submit" className={TAUTAN_BAWAH}>
          <Ikon nama="keluar" />
          Keluar
        </button>
      </form>
    </div>
  );
}

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
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
          <Merek />
          <span aria-hidden="true" className="text-xl text-redup">
            ☰
          </span>
        </summary>
        <div className="space-y-4 border-t border-kraft-garis px-3 py-4">
          <MenuAdmin />
          <TautanBawah />
        </div>
      </details>

      <div className="md:flex">
        <aside className="hidden w-64 shrink-0 border-r border-kraft-garis bg-kertas md:sticky md:top-0 md:block md:h-screen md:self-start print:hidden">
          <div className="flex h-full flex-col px-4 py-6">
            <div className="mb-8 px-1">
              <Merek />
            </div>
            <MenuAdmin />
            <div className="mt-auto border-t border-kraft-garis pt-4">
              <TautanBawah />
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}
