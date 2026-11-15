// src/app/pesanan/[nomor]/page.tsx
//
// Konfirmasi pesanan + instruksi transfer. Halaman ini publik (siapa pun yang
// tahu nomornya bisa membukanya), jadi HANYA menampilkan nama dan isi pesanan:
// tidak ada alamat maupun nomor HP. Nomor pesanan pendek, jadi pembukaan
// halaman dibatasi lajunya agar tidak bisa ditebak beruntun.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import HalamanToko from '@/components/HalamanToko';
import KosongkanKeranjang from '@/components/KosongkanKeranjang';
import LencanaStatus from '@/components/LencanaStatus';
import { site } from '@/data/site';
import { getDb } from '@/lib/db/client';
import { formatRupiah } from '@/lib/format';
import { alamatIp } from '@/lib/ip';
import { cekBatas } from '@/lib/laju';
import { marketplaceAktif } from '@/lib/mode';
import { ambilPesananByNomor } from '@/lib/pesanan-repo';
import { statusTampil } from '@/lib/status';
import { buildWaLink, pesan } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pesanan | Peyek Bu Aviella',
  robots: { index: false, follow: false },
};

export default async function HalamanPesanan({
  params,
  searchParams,
}: {
  params: Promise<{ nomor: string }>;
  searchParams: Promise<{ baru?: string | string[] }>;
}) {
  if (!marketplaceAktif()) notFound();

  const { nomor: nomorMentah } = await params;
  const nomor = nomorMentah.toUpperCase();
  if (!/^RBA-[A-Z0-9]{4,10}$/.test(nomor)) notFound();

  const db = getDb();
  const boleh = await cekBatas(db, `pesanan:${await alamatIp()}`, 30, 60, Date.now());
  if (!boleh) notFound();

  const pesanan = await ambilPesananByNomor(db, nomor);
  if (pesanan === null) notFound();

  const { baru } = await searchParams;
  const barusan = (Array.isArray(baru) ? baru[0] : baru) === '1';
  const tampil = statusTampil(pesanan, new Date());
  const menunggu = pesanan.status === 'menunggu_pembayaran';

  const linkBukti = buildWaLink(site.whatsapp, pesan.bukti(pesanan.nomor, pesanan.total, site.rekening.atasNama));

  return (
    <HalamanToko>
      <KosongkanKeranjang aktif={barusan} />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="mb-1 text-ket font-semibold uppercase tracking-[0.15em] text-redup">
          {barusan ? 'Pesanan diterima' : 'Pesanan'}
        </p>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="font-judul text-seksi font-extrabold text-kakao">{pesanan.nomor}</h1>
          <LencanaStatus status={tampil} />
        </div>

        {menunggu && (
          <section className="mb-6 rounded-[var(--radius-kartu)] border-2 border-emas bg-kertas p-6">
            <h2 className="mb-2 font-judul text-lead font-bold text-kakao">Langkah berikutnya: transfer</h2>
            <p className="mb-3 text-isi text-redup">
              Transfer tepat sejumlah total di bawah ini, lalu kirim bukti transfernya lewat WhatsApp.
              Pesanan yang belum dibayar lebih dari 24 jam bisa dianggap kedaluwarsa, tetapi tetap
              bisa diproses bila Anda menghubungi kami.
            </p>
            <dl className="mb-4 space-y-1 rounded-xl bg-krem p-4 text-isi">
              <div className="flex justify-between gap-4">
                <dt className="text-redup">Bank</dt>
                <dd className="font-semibold text-kakao">{site.rekening.bank}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-redup">Nomor rekening</dt>
                <dd className="font-mono font-semibold text-kakao">{site.rekening.nomor}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-redup">Atas nama</dt>
                <dd className="font-semibold text-kakao">{site.rekening.atasNama}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-kraft-garis pt-2 text-isi">
                <dt className="font-semibold text-kakao">Total transfer</dt>
                <dd className="whitespace-nowrap font-bold text-kakao">{formatRupiah(pesanan.total)}</dd>
              </div>
            </dl>
            <a
              href={linkBukti}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-cabai px-6 font-bold text-white no-underline hover:bg-cabai-tua"
            >
              Kirim bukti via WhatsApp
            </a>
            <p className="mt-3 text-ket text-redup">
              Ini mode demo: rekening di atas contoh, jangan transfer uang sungguhan.
            </p>
          </section>
        )}

        {!menunggu && pesanan.resi !== null && (
          <p className="mb-6 rounded-xl border border-kraft-garis bg-kertas px-4 py-3 text-isi text-kakao">
            Nomor resi: <span className="font-mono font-bold">{pesanan.resi}</span> ·{' '}
            <a href="/lacak" className="underline underline-offset-4">
              Lacak pesanan
            </a>
          </p>
        )}

        <section className="mb-6 rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-6">
          <h2 className="mb-1 font-judul text-lead font-bold text-kakao">Rincian</h2>
          <p className="mb-3 text-ket text-redup">Atas nama {pesanan.nama}</p>
          <ul className="divide-y divide-kraft-garis text-isi">
            {pesanan.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-2">
                <span className="text-kakao">
                  {i.nama} <span className="text-redup">× {i.jumlah}</span>
                </span>
                <span className="whitespace-nowrap text-kakao">{formatRupiah(i.harga * i.jumlah)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-kraft-garis pt-4 text-isi">
            <div className="flex justify-between">
              <dt className="text-redup">Subtotal</dt>
              <dd className="whitespace-nowrap text-kakao">{formatRupiah(pesanan.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-redup">
                Ongkir ({pesanan.kurir}, {pesanan.layanan})
              </dt>
              <dd className="whitespace-nowrap text-kakao">{formatRupiah(pesanan.ongkir)}</dd>
            </div>
            <div className="flex justify-between text-isi font-bold">
              <dt className="text-kakao">Total</dt>
              <dd className="whitespace-nowrap text-kakao">{formatRupiah(pesanan.total)}</dd>
            </div>
          </dl>
        </section>

        <p className="text-isi text-redup">
          Simpan nomor pesanan <span className="font-mono font-semibold text-kakao">{pesanan.nomor}</span>.
          Setelah barang dikirim, Anda bisa melacaknya di{' '}
          <a href="/lacak" className="underline underline-offset-4">
            halaman Lacak Pesanan
          </a>{' '}
          memakai nomor resi.
        </p>
      </main>
    </HalamanToko>
  );
}
