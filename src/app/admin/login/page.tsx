// src/app/admin/login/page.tsx
//
// Halaman masuk admin. Server component murni: tidak ada state klien, cukup
// formulir yang mengirim ke server action `masuk`.
//
// Alasan galat dikirim lewat query string, bukan state komponen: server action
// yang memanggil `redirect()` tidak bisa sekaligus mengembalikan nilai ke
// halaman. Query string juga membuat galat tetap terbaca setelah refresh.

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { sudahMasuk } from '@/lib/admin-sesi';
import { marketplaceAktif } from '@/lib/mode';

import { masuk } from './aksi';

export const metadata: Metadata = {
  title: 'Masuk Admin | Peyek Bu Aviella',
  robots: { index: false, follow: false },
};

const PESAN: Record<string, string> = {
  '1': 'Username atau kata sandi salah.',
  laju: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
  konfigurasi: 'Panel admin belum dikonfigurasi di server ini.',
};

export default async function HalamanLogin({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string | string[] }>;
}) {
  // Panel admin tidak mengaku keberadaannya di produksi.
  if (!marketplaceAktif()) notFound();

  if (await sudahMasuk()) redirect('/admin');

  const { galat } = await searchParams;
  const kode = Array.isArray(galat) ? galat[0] : galat;
  const pesan = kode === undefined ? null : (PESAN[kode] ?? PESAN['1']);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-krem px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-redup">
          Peyek Bu Aviella
        </p>
        <h1 className="mb-1 font-judul text-3xl font-bold text-kakao">Masuk Admin</h1>
        <p className="mb-8 text-sm text-redup">Panel ini hanya untuk pemilik toko.</p>

        <form
          action={masuk}
          className="rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-6 shadow-sm"
        >
          <label className="mb-1 block text-sm font-medium text-kakao" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="mb-5 w-full rounded-xl border border-kraft-garis bg-krem px-4 py-3 text-kakao outline-none focus:border-cabai"
          />

          <label className="mb-1 block text-sm font-medium text-kakao" htmlFor="password">
            Kata sandi
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mb-6 w-full rounded-xl border border-kraft-garis bg-krem px-4 py-3 text-kakao outline-none focus:border-cabai"
          />

          {pesan !== null && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-cabai/30 bg-cabai/10 px-4 py-3 text-sm text-cabai-tua"
            >
              {pesan}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-cabai px-6 py-3 font-semibold text-kertas transition-colors hover:bg-cabai-tua"
          >
            Masuk
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-redup">
          <a className="underline underline-offset-4" href="/">
            Kembali ke toko
          </a>
        </p>
      </div>
    </main>
  );
}
