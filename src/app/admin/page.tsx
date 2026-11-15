// src/app/admin/page.tsx
//
// Dashboard admin gaya Lapakku: 4 kartu statistik, grafik omzet 14 hari, dan
// pesanan terbaru. Daftar pesanan lengkap ada di /admin/pesanan.
// `requireAdmin()` wajib dipanggil di sini: layout bukan penjaga.
//
// ponytail: "Stok Hampir Habis" Lapakku diganti "Produk habis / PO" karena
// skema kita belum punya stok. Tambahkan kolom stok bila nanti dibutuhkan.

import type { Metadata } from 'next';

import GrafikBatang from '@/components/admin/GrafikBatang';
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

  const kartu = [
    { judul: 'Omzet bulan ini', nilai: formatRupiah(omzetBulan), href: '/admin/laporan' },
    { judul: 'Pesanan hari ini', nilai: String(pesananHariIni), href: '/admin/pesanan' },
    { judul: 'Menunggu pembayaran', nilai: String(menunggu), href: '/admin/pesanan?status=menunggu_pembayaran' },
    { judul: 'Perlu dikirim', nilai: String(perluKirim), href: '/admin/pesanan?status=dibayar' },
    { judul: 'Produk habis / PO', nilai: String(produkHabis), href: '/admin/produk' },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 font-judul text-3xl font-bold text-kakao">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {kartu.map((k) => (
          <a
            key={k.judul}
            href={k.href}
            className="rounded-[var(--radius-kartu)] border border-kraft-garis border-l-4 border-l-emas bg-kertas p-5 transition-colors hover:border-cabai"
          >
            <p className="text-sm text-redup">{k.judul}</p>
            <p className="font-judul text-2xl font-bold text-kakao">{k.nilai}</p>
          </a>
        ))}
      </div>

      <section className="mb-8 rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-5">
        <h2 className="mb-4 font-judul text-lg font-bold text-kakao">Omzet {HARI_GRAFIK} hari terakhir</h2>
        <GrafikBatang data={grafik} />
      </section>

      <section className="rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-judul text-lg font-bold text-kakao">Pesanan terbaru</h2>
          <a href="/admin/pesanan" className="text-sm text-redup underline underline-offset-4">
            Lihat semua
          </a>
        </div>
        {pesanan.length === 0 ? (
          <p className="border-t border-kraft-garis px-5 py-8 text-center text-redup">Belum ada pesanan.</p>
        ) : (
          <ul className="border-t border-kraft-garis">
            {pesanan.slice(0, 5).map((p) => (
              <li key={p.id} className="border-b border-kraft-garis last:border-0">
                <a
                  href={`/admin/pesanan/${p.id}`}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 hover:bg-kraft/30"
                >
                  <span>
                    <span className="font-semibold text-kakao">{p.nomor}</span>
                    <span className="block text-sm text-redup">
                      {p.nama} · {formatWaktuWib(p.dibuat)}
                    </span>
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="font-semibold text-kakao">{formatRupiah(p.total)}</span>
                    <LencanaStatus status={p.status} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
