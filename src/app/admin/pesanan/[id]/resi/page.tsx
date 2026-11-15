// src/app/admin/pesanan/[id]/resi/page.tsx
//
// Label resi siap cetak. Hanya ada untuk pesanan yang sudah dikirim/selesai;
// selain itu 404 (tidak ada resi untuk dicetak, dan tidak mengaku apa pun).
// Saat dicetak, navigasi dan pita demo disembunyikan (`print:hidden`).

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import TombolCetak from '@/components/TombolCetak';
import { site } from '@/data/site';
import { dbAdmin, requireAdmin } from '@/lib/admin-sesi';
import { formatBerat, formatWaktuWib } from '@/lib/format';
import { hitungBeratTotal } from '@/lib/hitung';
import { ambilPesanan } from '@/lib/pesanan-repo';

export const metadata: Metadata = {
  title: 'Resi | Panel Admin',
  robots: { index: false, follow: false },
};

export default async function HalamanResi({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id: idTeks } = await params;
  if (!/^\d+$/.test(idTeks)) notFound();

  const pesanan = await ambilPesanan(dbAdmin(), Number(idTeks));
  if (
    pesanan === null ||
    pesanan.resi === null ||
    (pesanan.status !== 'dikirim' && pesanan.status !== 'selesai')
  ) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-md px-6 py-8 print:max-w-none print:p-0">
      {/* @page tidak bisa ditulis lewat utilitas Tailwind. */}
      <style>{'@page { margin: 10mm; }'}</style>

      <div className="mb-4 flex items-center justify-between print:hidden">
        <a href={`/admin/pesanan/${pesanan.id}`} className="text-sm text-redup underline underline-offset-4">
          ← Kembali
        </a>
        <TombolCetak />
      </div>

      <article className="w-full max-w-[100mm] break-inside-avoid border-2 border-kakao bg-white p-4 text-kakao print:mx-0">
        <header className="mb-3 flex items-baseline justify-between border-b-2 border-kakao pb-2">
          <strong className="font-judul text-lg">{pesanan.kurir}</strong>
          <span className="text-xs">{pesanan.layanan}</span>
        </header>

        <p className="text-xs uppercase tracking-widest">Nomor resi</p>
        <p className="mb-3 break-all font-mono text-2xl font-bold tracking-wider">{pesanan.resi}</p>

        <section className="mb-3 border-t border-kakao pt-2">
          <p className="text-xs uppercase tracking-widest">Penerima</p>
          <p className="font-bold">{pesanan.nama}</p>
          <p className="text-sm">{pesanan.hp}</p>
          <p className="text-sm">{pesanan.alamat}</p>
          <p className="text-sm font-semibold">
            {pesanan.kota}, {pesanan.provinsi}
          </p>
        </section>

        <section className="mb-3 border-t border-kakao pt-2">
          <p className="text-xs uppercase tracking-widest">Pengirim</p>
          <p className="text-sm font-semibold">{site.nama}</p>
          {site.alamat !== null && <p className="text-xs">{site.alamat}</p>}
        </section>

        <section className="mb-3 border-t border-kakao pt-2">
          <p className="text-xs uppercase tracking-widest">
            Isi paket · {formatBerat(hitungBeratTotal(pesanan.items))}
          </p>
          <ul className="text-sm">
            {pesanan.items.map((i) => (
              <li key={i.id}>
                {i.nama} × {i.jumlah}
              </li>
            ))}
          </ul>
        </section>

        <footer className="border-t border-kakao pt-2 text-xs">
          <p>
            Pesanan {pesanan.nomor} · dikirim {formatWaktuWib(pesanan.dikirimPada)}
          </p>
          <p className="mt-1 font-semibold">RESI DEMO: bukan resi ekspedisi sungguhan</p>
        </footer>
      </article>
    </main>
  );
}
