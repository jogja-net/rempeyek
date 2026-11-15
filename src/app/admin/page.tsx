// src/app/admin/page.tsx
//
// Dashboard admin gaya Lapakku. Satu panel gelap (omzet + grafik) jadi titik
// fokus; di sebelahnya daftar "Perlu tindakan" yang bisa diklik; di bawahnya
// pesanan terbaru. Daftar pesanan lengkap ada di /admin/pesanan.
// `requireAdmin()` wajib dipanggil di sini: layout bukan penjaga.
//
// ponytail: "Stok Hampir Habis" Lapakku diganti "Produk habis / PO" karena
// skema kita belum punya stok. Tambahkan kolom stok bila nanti dibutuhkan.

import type { Metadata } from 'next';

import GrafikBatang from '@/components/admin/GrafikBatang';
import Ikon, { type NamaIkon } from '@/components/admin/Ikon';
import JudulHalaman from '@/components/admin/JudulHalaman';
import LencanaStatus from '@/components/LencanaStatus';
import { dbAdmin, requireAdmin } from '@/lib/admin-sesi';
import { formatRupiah, formatWaktuWib } from '@/lib/format';
import { agregasiPenjualan, ambilBarisLaporan, tanggalWib } from '@/lib/laporan';
import { daftarPesanan } from '@/lib/pesanan-repo';
import { daftarProdukAdmin } from '@/lib/produk-repo';

export const metadata: Metadata = {
  title: 'Dashboard | Panel Admin',
  robots: { index: false, follow: false },
};

const HARI_MS = 24 * 60 * 60 * 1000;
const HARI_GRAFIK = 14;
const keTanggal = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export default async function Dashboard() {
  await requireAdmin();
  const db = dbAdmin();

  const hariIni = tanggalWib(new Date().toISOString()) ?? keTanggal(Date.now());
  const awalBulan = `${hariIni.slice(0, 8)}01`;
  const awalGrafik = keTanggal(new Date(`${hariIni}T00:00:00Z`).getTime() - (HARI_GRAFIK - 1) * HARI_MS);

  const [pesanan, produk, barisBulan, barisGrafik] = await Promise.all([
    daftarPesanan(db),
    daftarProdukAdmin(db),
    ambilBarisLaporan(db, { dari: awalBulan, sampai: hariIni }),
    ambilBarisLaporan(db, { dari: awalGrafik, sampai: hariIni }),
  ]);

  const omzetBulan = barisBulan.reduce((j, b) => j + b.total, 0);
  const pesananHariIni = pesanan.filter((p) => tanggalWib(p.dibuat) === hariIni).length;
  const menunggu = pesanan.filter((p) => p.status === 'menunggu_pembayaran').length;
  const perluKirim = pesanan.filter((p) => p.status === 'dibayar').length;
  const produkHabis = produk.filter((p) => !p.diarsipkan && p.status !== 'tersedia').length;

  const perHari = new Map(agregasiPenjualan(barisGrafik, 'hari').map((b) => [b.kunci, b.omzet]));
  const grafik = Array.from({ length: HARI_GRAFIK }, (_, i) => {
    const tgl = keTanggal(new Date(`${awalGrafik}T00:00:00Z`).getTime() + i * HARI_MS);
    return { label: tgl.slice(5).replace('-', '/'), nilai: perHari.get(tgl) ?? 0 };
  });

  const tindakan: { teks: string; jumlah: number; href: string; ikon: NamaIkon }[] = [
    { teks: 'Menunggu bayar', jumlah: menunggu, href: '/admin/pesanan?status=menunggu_pembayaran', ikon: 'waktu' },
    { teks: 'Perlu dikirim', jumlah: perluKirim, href: '/admin/pesanan?status=dibayar', ikon: 'kirim' },
    { teks: 'Produk habis / PO', jumlah: produkHabis, href: '/admin/produk', ikon: 'produk' },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <JudulHalaman judul="Dashboard" deskripsi="Ringkasan penjualan dan hal yang perlu Anda tangani." />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl bg-kakao p-6 text-kertas lg:col-span-2">
          <p className="text-sm text-redup-terang">Omzet bulan ini</p>
          <p className="mb-1 font-judul text-4xl font-extrabold tabular-nums">{formatRupiah(omzetBulan)}</p>
          <p className="mb-6 text-sm text-redup-terang">
            {pesananHariIni === 0 ? 'Belum ada pesanan masuk hari ini' : `${pesananHariIni} pesanan masuk hari ini`}
          </p>
          <GrafikBatang data={grafik} gelap />
        </section>

        <section className="rounded-2xl border border-kraft-garis bg-kertas p-2">
          <h2 className="px-3 pb-1 pt-3 font-judul text-base font-bold text-kakao">Perlu tindakan</h2>
          <ul>
            {tindakan.map((t) => (
              <li key={t.teks}>
                <a
                  href={t.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-150 hover:bg-kraft/40"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-kraft/60 text-redup">
                    <Ikon nama={t.ikon} />
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-kakao">{t.teks}</span>
                  <span
                    className={`min-w-7 rounded-full px-2 py-0.5 text-center text-sm font-bold tabular-nums ${
                      t.jumlah > 0 ? 'bg-emas text-kakao' : 'bg-kraft/60 text-redup'
                    }`}
                  >
                    {t.jumlah}
                  </span>
                  <Ikon nama="kanan" className="h-4 w-4 text-redup/60" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-kraft-garis bg-kertas">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-judul text-base font-bold text-kakao">Pesanan terbaru</h2>
          <a href="/admin/pesanan" className="text-sm text-redup underline underline-offset-4 hover:text-kakao">
            Lihat semua pesanan
          </a>
        </div>
        {pesanan.length === 0 ? (
          <p className="border-t border-kraft-garis px-5 py-10 text-center text-sm text-redup">
            Belum ada pesanan. Pesanan dari pembeli akan muncul di sini.
          </p>
        ) : (
          <div className="overflow-x-auto border-t border-kraft-garis">
            <table className="w-full text-sm tabular-nums">
              <thead className="bg-kraft/30 text-xs">
                <tr className="text-left text-redup">
                  <th className="px-5 py-2.5 font-semibold">Nomor</th>
                  <th className="px-5 py-2.5 font-semibold">Pembeli</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Total</th>
                  <th className="px-5 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {pesanan.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-t border-kraft-garis transition-colors duration-150 hover:bg-kraft/30">
                    <td className="whitespace-nowrap px-5 py-3">
                      <a href={`/admin/pesanan/${p.id}`} className="font-semibold text-kakao underline-offset-4 hover:underline">
                        {p.nomor}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-kakao">
                      {p.nama}
                      <span className="block text-xs text-redup">{formatWaktuWib(p.dibuat)}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-kakao">{formatRupiah(p.total)}</td>
                    <td className="px-5 py-3">
                      <LencanaStatus status={p.status} admin />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
