// src/app/admin/pesanan/page.tsx
//
// Daftar pesanan: tabel dengan filter status (`?status=`), pencarian (`?q=`
// pada nomor/nama/HP), dan paginasi (`?hal=`).
// `requireAdmin()` wajib dipanggil di sini, bukan hanya di layout: layout dan
// halaman dirender paralel, jadi penjagaan di layout tidak menjamin halaman.

import type { Metadata } from 'next';

import JudulHalaman from '@/components/admin/JudulHalaman';
import LencanaStatus from '@/components/LencanaStatus';
import { dbAdmin, requireAdmin } from '@/lib/admin-sesi';
import { formatRupiah, formatWaktuWib } from '@/lib/format';
import { daftarPesanan } from '@/lib/pesanan-repo';
import { LABEL_STATUS, type StatusPesanan } from '@/lib/status';

export const metadata: Metadata = {
  title: 'Pesanan | Panel Admin',
  robots: { index: false, follow: false },
};

type StatusFilter = StatusPesanan | 'kedaluwarsa';

const URUTAN_FILTER: StatusFilter[] = [
  'menunggu_pembayaran',
  'kedaluwarsa',
  'dibayar',
  'dikirim',
  'selesai',
  'batal',
];

const PER_HALAMAN = 20;

const pertama = (nilai: string | string[] | undefined) => (Array.isArray(nilai) ? nilai[0] : nilai);

function href(p: { status?: StatusFilter; q?: string; hal?: number }): string {
  const u = new URLSearchParams();
  if (p.status !== undefined) u.set('status', p.status);
  if (p.q !== undefined && p.q !== '') u.set('q', p.q);
  if (p.hal !== undefined && p.hal > 1) u.set('hal', String(p.hal));
  const s = u.toString();
  return s === '' ? '/admin/pesanan' : `/admin/pesanan?${s}`;
}

export default async function HalamanPesanan({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; q?: string | string[]; hal?: string | string[] }>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const status = URUTAN_FILTER.find((s) => s === pertama(sp.status));
  const q = (pertama(sp.q) ?? '').trim().slice(0, 60);

  let pesanan = await daftarPesanan(dbAdmin(), status === undefined ? undefined : { status });
  if (q !== '') {
    const kata = q.toLowerCase();
    pesanan = pesanan.filter((p) => `${p.nomor} ${p.nama} ${p.hp}`.toLowerCase().includes(kata));
  }

  const jumlahHal = Math.max(1, Math.ceil(pesanan.length / PER_HALAMAN));
  const hal = Math.min(jumlahHal, Math.max(1, Number.parseInt(pertama(sp.hal) ?? '1', 10) || 1));
  const tampil = pesanan.slice((hal - 1) * PER_HALAMAN, hal * PER_HALAMAN);

  const tab = (tujuan: string, teks: string, aktif: boolean) => (
    <a
      key={tujuan}
      href={tujuan}
      aria-current={aktif ? 'page' : undefined}
      className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-sm md:py-1.5 ${
        aktif
          ? 'border-emas bg-emas/25 font-semibold text-kakao'
          : 'border-kraft-garis bg-kertas text-redup hover:bg-kraft/60'
      }`}
    >
      {teks}
    </a>
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">
      <JudulHalaman judul="Pesanan" deskripsi="Cari pesanan, lalu buka untuk menandai dibayar, mengirim, atau mencetak resi." />

      <form method="get" action="/admin/pesanan" className="mb-4 flex flex-wrap gap-2">
        {status !== undefined && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Cari nomor, nama, atau HP"
          aria-label="Cari pesanan"
          className="min-w-0 flex-1 rounded-xl border border-kraft-garis bg-kertas px-4 py-2.5 text-sm text-kakao sm:max-w-sm"
        />
        <button
          type="submit"
          className="rounded-xl bg-cabai px-5 py-2.5 text-sm font-semibold text-kertas transition-colors hover:bg-cabai-tua"
        >
          Cari
        </button>
      </form>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tab(href({ q }), 'Semua', status === undefined)}
        {URUTAN_FILTER.map((s) => tab(href({ status: s, q }), LABEL_STATUS[s], status === s))}
      </div>

      {tampil.length === 0 ? (
        <p className="rounded-2xl border border-kraft-garis bg-kertas p-8 text-center text-redup">
          {q !== '' || status !== undefined ? 'Tidak ada pesanan yang cocok.' : 'Belum ada pesanan.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-kraft-garis bg-kertas">
          <table className="w-full text-sm tabular-nums max-md:block">
            <thead className="bg-kraft/30 text-xs max-md:hidden">
              <tr className="border-b border-kraft-garis text-left text-redup">
                <th className="px-5 py-2.5 font-semibold">Nomor</th>
                <th className="px-5 py-2.5 font-semibold">Pembeli</th>
                <th className="px-5 py-2.5 font-semibold">Tanggal</th>
                <th className="px-5 py-2.5 text-right font-semibold">Total</th>
                <th className="px-5 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="max-md:block">
              {tampil.map((p) => (
                <tr key={p.id} className="border-b border-kraft-garis transition-colors duration-150 last:border-0 hover:bg-kraft/30 max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:gap-y-1 max-md:px-4 max-md:py-3">
                  <td className="whitespace-nowrap px-5 py-3 max-md:p-0 max-md:order-1 max-md:flex-1">
                    <a href={`/admin/pesanan/${p.id}`} className="font-semibold text-kakao underline-offset-4 hover:underline">
                      {p.nomor}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-kakao max-md:p-0 max-md:order-3 max-md:basis-full">{p.nama}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-redup max-md:p-0 max-md:order-4 max-md:flex-1 max-md:text-xs">{formatWaktuWib(p.dibuat)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-kakao max-md:p-0 max-md:order-2">
                    {formatRupiah(p.total)}
                  </td>
                  <td className="px-5 py-3 max-md:p-0 max-md:order-5">
                    <LencanaStatus status={p.status} admin />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {jumlahHal > 1 && (
        <nav aria-label="Halaman" className="mt-4 flex items-center justify-between text-sm text-redup">
          {hal > 1 ? <a href={href({ status, q, hal: hal - 1 })} className="inline-block py-2 underline underline-offset-4">← Sebelumnya</a> : <span />}
          <span>
            Halaman {hal} dari {jumlahHal} · {pesanan.length} pesanan
          </span>
          {hal < jumlahHal ? <a href={href({ status, q, hal: hal + 1 })} className="inline-block py-2 underline underline-offset-4">Berikutnya →</a> : <span />}
        </nav>
      )}
    </main>
  );
}
