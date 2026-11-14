// src/app/admin/page.tsx
//
// HALAMAN SEMENTARA untuk Task 6. Tujuannya hanya membuat alur "login berhasil
// → /admin" bisa diverifikasi. Task 7 mengganti berkas ini dengan daftar
// pesanan sungguhan.
//
// `requireAdmin()` wajib dipanggil di sini, bukan hanya di layout: layout dan
// halaman dirender paralel, jadi penjagaan di layout tidak menjamin halaman.

import type { Metadata } from 'next';

import { requireAdmin } from '@/lib/admin-sesi';

export const metadata: Metadata = {
  title: 'Panel Admin — Rempeyek Bu Aviella',
  robots: { index: false, follow: false },
};

export default async function HalamanAdmin() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-redup">Panel Admin</p>
      <h1 className="mb-3 font-judul text-3xl font-bold text-kakao">Sudah masuk</h1>
      <p className="text-redup">
        Daftar pesanan, produk, dan laporan dipasang pada task berikutnya.
      </p>
    </main>
  );
}
