// src/lib/laporan.ts
//
// Laporan penjualan: pengelompokan dilakukan di JavaScript, bukan SQL.
//
// Alasan: SQLite tidak punya fungsi zona waktu, dan `dibayar_pada` disimpan
// sebagai teks ISO-8601 UTC. Menggeser 7 jam di JS membuat aturan WIB bisa
// diuji langsung tanpa bergantung pada `TZ` mesin yang menjalankan tes.
//
// Omzet = Σ `total` pesanan, TERMASUK ongkir (keputusan rencana Task 5).
// Pesanan `batal` tidak pernah masuk laporan, dan laporan dihitung menurut
// tanggal PEMBAYARAN, bukan tanggal pesanan (spec §93).

import type { Client } from '@libsql/client';

/** Selisih WIB terhadap UTC: 7 jam. */
export const OFFSET_WIB_MS = 7 * 60 * 60 * 1000;

const SEHARI_MS = 24 * 60 * 60 * 1000;

export type BarisLaporan = {
  dibayar_pada: string;
  total: number;
  items: { nama: string; jumlah: number }[];
};

export type BarisAgregat = {
  kunci: string;
  omzet: number;
  jumlahPesanan: number;
};

export type SatuanLaporan = 'hari' | 'bulan';

/**
 * Tanggal WIB (`YYYY-MM-DD`) dari sebuah waktu ISO UTC.
 *
 * Caranya: geser waktu sebesar +7 jam, lalu baca bagian UTC-nya. Karena hasil
 * geseran sudah "berdiri di jam dinding WIB", `toISOString()` langsung
 * memberikan tanggal WIB tanpa perlu pustaka zona waktu.
 *
 * @returns `null` bila teks waktunya tidak bisa diurai.
 */
export function tanggalWib(iso: string): string | null {
  const waktu = new Date(iso).getTime();
  if (Number.isNaN(waktu)) return null;
  return new Date(waktu + OFFSET_WIB_MS).toISOString().slice(0, 10);
}

/**
 * Kunci pengelompokan menurut WIB: `YYYY-MM-DD` untuk `'hari'`,
 * `YYYY-MM` untuk `'bulan'`.
 */
export function kunciWib(iso: string, per: SatuanLaporan): string | null {
  const tanggal = tanggalWib(iso);
  if (tanggal === null) return null;
  return per === 'hari' ? tanggal : tanggal.slice(0, 7);
}

/**
 * Menjumlahkan omzet dan jumlah pesanan per hari atau per bulan WIB.
 *
 * Hasil selalu urut naik menurut kunci. Baris dengan waktu rusak dilewati
 * supaya satu baris cacat tidak menggagalkan seluruh laporan.
 */
export function agregasiPenjualan(baris: BarisLaporan[], per: SatuanLaporan): BarisAgregat[] {
  const peta = new Map<string, BarisAgregat>();

  for (const b of baris) {
    const kunci = kunciWib(b.dibayar_pada, per);
    if (kunci === null) continue;

    const ada = peta.get(kunci);
    if (ada === undefined) {
      peta.set(kunci, { kunci, omzet: b.total, jumlahPesanan: 1 });
    } else {
      ada.omzet += b.total;
      ada.jumlahPesanan += 1;
    }
  }

  return [...peta.values()].sort((a, b) => (a.kunci < b.kunci ? -1 : a.kunci > b.kunci ? 1 : 0));
}

/**
 * Produk terlaris menurut jumlah bungkus, dijumlahkan lintas pesanan.
 *
 * Nama yang sama digabung (nama disalin ke `item_pesanan`, jadi produk yang
 * sudah diganti namanya tetap muncul sebagai dua baris — itu memang yang
 * terjadi pada riwayat). Urutan: jumlah turun, lalu nama naik agar hasil
 * stabil saat jumlahnya sama.
 */
export function produkTerlaris(
  baris: BarisLaporan[],
  batas: number,
): { nama: string; jumlah: number }[] {
  if (batas <= 0) return [];

  const peta = new Map<string, number>();
  for (const b of baris) {
    for (const item of b.items) {
      peta.set(item.nama, (peta.get(item.nama) ?? 0) + item.jumlah);
    }
  }

  return [...peta.entries()]
    .map(([nama, jumlah]) => ({ nama, jumlah }))
    .sort((a, b) => (b.jumlah - a.jumlah) || a.nama.localeCompare(b.nama, 'id'))
    .slice(0, batas);
}

/** Awal hari WIB `YYYY-MM-DD` sebagai epoch milidetik (00:00 WIB). */
function awalHariWib(tanggal: string): number {
  const [tahun, bulan, hari] = tanggal.split('-').map(Number);
  return Date.UTC(tahun, bulan - 1, hari) - OFFSET_WIB_MS;
}

/**
 * Baris laporan untuk rentang tanggal WIB, inklusif di kedua ujung.
 *
 * Hanya pesanan yang sudah dibayar dan tidak dibatalkan. Transisi
 * `dibayar → batal` sengaja menyisakan `dibayar_pada`, jadi status yang
 * diperiksa di sini penting: uang yang dikembalikan tidak boleh dihitung
 * sebagai omzet.
 *
 * @param rentang `dari`/`sampai` dalam bentuk `YYYY-MM-DD` menurut WIB.
 */
export async function ambilBarisLaporan(
  db: Client,
  rentang: { dari: string; sampai: string },
): Promise<BarisLaporan[]> {
  const awal = awalHariWib(rentang.dari);
  const akhir = awalHariWib(rentang.sampai) + SEHARI_MS;

  const hasil = await db.execute({
    sql: `SELECT id, dibayar_pada, total
            FROM pesanan
           WHERE status <> 'batal'
             AND dibayar_pada IS NOT NULL
             AND dibayar_pada >= ?
             AND dibayar_pada < ?
           ORDER BY dibayar_pada ASC, id ASC`,
    args: [new Date(awal).toISOString(), new Date(akhir).toISOString()],
  });

  const pesanan = hasil.rows.map((baris) => ({
    id: Number(baris.id),
    dibayar_pada: String(baris.dibayar_pada),
    total: Number(baris.total),
  }));

  if (pesanan.length === 0) return [];

  const tanda = pesanan.map(() => '?').join(', ');
  const item = await db.execute({
    sql: `SELECT pesanan_id, nama, jumlah
            FROM item_pesanan
           WHERE pesanan_id IN (${tanda})
           ORDER BY id ASC`,
    args: pesanan.map((p) => p.id),
  });

  const perPesanan = new Map<number, { nama: string; jumlah: number }[]>();
  for (const baris of item.rows) {
    const id = Number(baris.pesanan_id);
    const daftar = perPesanan.get(id) ?? [];
    daftar.push({ nama: String(baris.nama), jumlah: Number(baris.jumlah) });
    perPesanan.set(id, daftar);
  }

  return pesanan.map((p) => ({
    dibayar_pada: p.dibayar_pada,
    total: p.total,
    items: perPesanan.get(p.id) ?? [],
  }));
}
