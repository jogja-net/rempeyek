// src/app/admin/laporan/page.tsx
//
// Laporan penjualan: harian/bulanan menurut WIB, total, dan 5 produk terlaris.
// Rentang dipilih lewat formulir GET (`?per=&dari=&sampai=`), jadi bisa
// dibagikan dan di-refresh. `requireAdmin()` dipanggil sendiri di sini.

import type { Metadata } from 'next';

import { dbAdmin, requireAdmin } from '@/lib/admin-sesi';
import { formatRupiah } from '@/lib/format';
import {
  agregasiPenjualan,
  ambilBarisLaporan,
  produkTerlaris,
  tanggalWib,
  type SatuanLaporan,
} from '@/lib/laporan';

export const metadata: Metadata = {
  title: 'Laporan | Panel Admin',
  robots: { index: false, follow: false },
};

const HARI_MS = 24 * 60 * 60 * 1000;
const MAKS_HARI = 366;
const BAWAAN_HARI = 30;

/** `YYYY-MM-DD` yang benar-benar ada di kalender (bukan 2026-02-31). */
function tanggalSah(teks: string | undefined): teks is string {
  if (teks === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(teks)) return false;
  const t = new Date(`${teks}T00:00:00Z`);
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === teks;
}

const keMs = (tgl: string) => new Date(`${tgl}T00:00:00Z`).getTime();
const keTanggal = (ms: number) => new Date(ms).toISOString().slice(0, 10);

function pertama(nilai: string | string[] | undefined): string | undefined {
  return Array.isArray(nilai) ? nilai[0] : nilai;
}

export default async function HalamanLaporan({
  searchParams,
}: {
  searchParams: Promise<{ per?: string | string[]; dari?: string | string[]; sampai?: string | string[] }>;
}) {
  await requireAdmin();

  const q = await searchParams;
  const per: SatuanLaporan = pertama(q.per) === 'bulan' ? 'bulan' : 'hari';

  // Bawaan: 30 hari terakhir menurut WIB, termasuk hari ini.
  const hariIni = tanggalWib(new Date().toISOString()) ?? keTanggal(Date.now());
  const bawaanDari = keTanggal(keMs(hariIni) - (BAWAAN_HARI - 1) * HARI_MS);

  let dari = pertama(q.dari);
  let sampai = pertama(q.sampai);
  let peringatan: string | null = null;

  if (!tanggalSah(dari) || !tanggalSah(sampai)) {
    if (dari !== undefined || sampai !== undefined) peringatan = 'Tanggal tidak valid; memakai 30 hari terakhir.';
    dari = bawaanDari;
    sampai = hariIni;
  } else if (keMs(dari) > keMs(sampai)) {
    peringatan = 'Tanggal awal setelah tanggal akhir; memakai 30 hari terakhir.';
    dari = bawaanDari;
    sampai = hariIni;
  } else if ((keMs(sampai) - keMs(dari)) / HARI_MS + 1 > MAKS_HARI) {
    peringatan = `Rentang maksimal ${MAKS_HARI} hari; memakai 30 hari terakhir.`;
    dari = bawaanDari;
    sampai = hariIni;
  }

  const baris = await ambilBarisLaporan(dbAdmin(), { dari, sampai });
  const tabel = agregasiPenjualan(baris, per);
  const terlaris = produkTerlaris(baris, 5);
  const totalOmzet = tabel.reduce((j, b) => j + b.omzet, 0);
  const totalPesanan = tabel.reduce((j, b) => j + b.jumlahPesanan, 0);

  const KOLOM = 'rounded-xl border border-kraft-garis bg-krem px-3 py-2 text-kakao';

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 font-judul text-3xl font-bold text-kakao">Laporan penjualan</h1>

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-4 rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-5"
      >
        <div>
          <label htmlFor="per" className="mb-1 block text-sm text-redup">
            Per
          </label>
          <select id="per" name="per" defaultValue={per} className={KOLOM}>
            <option value="hari">Harian</option>
            <option value="bulan">Bulanan</option>
          </select>
        </div>
        <div>
          <label htmlFor="dari" className="mb-1 block text-sm text-redup">
            Dari
          </label>
          <input id="dari" name="dari" type="date" defaultValue={dari} className={KOLOM} />
        </div>
        <div>
          <label htmlFor="sampai" className="mb-1 block text-sm text-redup">
            Sampai
          </label>
          <input id="sampai" name="sampai" type="date" defaultValue={sampai} className={KOLOM} />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-cabai px-5 py-2.5 text-sm font-semibold text-kertas transition-colors hover:bg-cabai-tua"
        >
          Tampilkan
        </button>
      </form>

      {peringatan !== null && (
        <p role="status" className="mb-6 rounded-xl border border-kraft-garis bg-kraft px-4 py-3 text-sm text-kakao">
          {peringatan}
        </p>
      )}

      <p className="mb-4 text-sm text-redup">
        Pesanan yang sudah dibayar dan tidak dibatalkan, zona waktu WIB. Omzet termasuk ongkir.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-5">
          <p className="text-sm text-redup">Total omzet</p>
          <p className="font-judul text-2xl font-bold text-kakao">{formatRupiah(totalOmzet)}</p>
        </div>
        <div className="rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-5">
          <p className="text-sm text-redup">Jumlah pesanan</p>
          <p className="font-judul text-2xl font-bold text-kakao">{totalPesanan}</p>
        </div>
      </div>

      {tabel.length === 0 ? (
        <p className="rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-8 text-center text-redup">
          Belum ada pesanan dibayar pada rentang ini.
        </p>
      ) : (
        <>
          <section className="mb-8 overflow-x-auto rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-kraft-garis text-left text-redup">
                  <th className="px-5 py-3 font-medium">{per === 'hari' ? 'Tanggal' : 'Bulan'}</th>
                  <th className="px-5 py-3 text-right font-medium">Pesanan</th>
                  <th className="px-5 py-3 text-right font-medium">Omzet</th>
                </tr>
              </thead>
              <tbody>
                {tabel.map((b) => (
                  <tr key={b.kunci} className="border-b border-kraft-garis last:border-0">
                    <td className="px-5 py-3 text-kakao">{b.kunci}</td>
                    <td className="px-5 py-3 text-right text-kakao">{b.jumlahPesanan}</td>
                    <td className="px-5 py-3 text-right text-kakao">{formatRupiah(b.omzet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-5">
            <h2 className="mb-3 font-judul text-lg font-bold text-kakao">5 produk terlaris</h2>
            <ol className="space-y-1 text-sm">
              {terlaris.map((t, i) => (
                <li key={t.nama} className="flex justify-between gap-4">
                  <span className="text-kakao">
                    {i + 1}. {t.nama}
                  </span>
                  <span className="text-redup">{t.jumlah} terjual</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </main>
  );
}
