// src/lib/laporan.test.ts
//
// Tes Task 5: agregasi laporan penjualan menurut hari/bulan WIB.
//
// CATATAN PENTING soal WIB — rencana (baris 162) memuat dua contoh yang
// keliru hitung:
//
//     "2026-11-11T16:30:00Z masuk kunci 2026-11-12 (WIB)"
//
// 16:30 UTC + 7 jam = 23:30 pada tanggal yang SAMA (11 Nov), bukan 12 Nov.
// Rencana sendiri menuliskannya di baris 34: "dibayar sekitar 23:30 WIB /
// 16:30 UTC" — pasangan yang benar untuk UTC+7. Batas hari WIB yang
// sebenarnya adalah 17:00 UTC (= 00:00 WIB hari berikutnya), dan itulah yang
// diuji di sini. Memakai UTC+8 agar cocok dengan baris 162 akan menggeser
// omzet harian satu jam dan bertentangan dengan baris 25, 34, dan 158.

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import type { Client } from '@libsql/client';

import { bukaDb } from './db/client';
import { migrate } from './db/migrate';
import {
  agregasiPenjualan,
  ambilBarisLaporan,
  produkTerlaris,
  tanggalWib,
  type BarisLaporan,
} from './laporan';
import { buatPesanan, tandaiDibayar, batalkan } from './pesanan-repo';
import { simpanProduk, type ProdukDb } from './produk-repo';

/** Satu baris laporan; `items` hanya perlu nama & jumlah. */
function baris(dibayarPada: string, total: number, items: [string, number][] = []): BarisLaporan {
  return {
    dibayar_pada: dibayarPada,
    total,
    items: items.map(([nama, jumlah]) => ({ nama, jumlah })),
  };
}

describe('agregasiPenjualan', () => {
  it('daftar kosong menghasilkan array kosong', () => {
    assert.deepEqual(agregasiPenjualan([], 'hari'), []);
    assert.deepEqual(agregasiPenjualan([], 'bulan'), []);
  });

  it('23:30 WIB (16:30 UTC) masuk hari yang sama, bukan hari berikutnya', () => {
    // Ini contoh dari rencana baris 34: pesanan malam hari.
    const hasil = agregasiPenjualan([baris('2026-11-11T16:30:00.000Z', 50000)], 'hari');
    assert.deepEqual(hasil, [{ kunci: '2026-11-11', omzet: 50000, jumlahPesanan: 1 }]);
  });

  it('23:59:59 WIB masih hari yang sama', () => {
    const hasil = agregasiPenjualan([baris('2026-11-11T16:59:59.000Z', 1000)], 'hari');
    assert.equal(hasil[0].kunci, '2026-11-11');
  });

  it('00:00 WIB (17:00 UTC) sudah hari berikutnya', () => {
    const hasil = agregasiPenjualan(
      [baris('2026-11-11T17:00:00.000Z', 2000), baris('2026-11-12T17:00:00.000Z', 3000)],
      'hari',
    );
    assert.deepEqual(hasil, [
      { kunci: '2026-11-12', omzet: 2000, jumlahPesanan: 1 },
      { kunci: '2026-11-13', omzet: 3000, jumlahPesanan: 1 },
    ]);
  });

  it('20:00 WIB tetap tanggal yang sama', () => {
    // 13:00 UTC + 7 = 20:00 WIB tanggal sama.
    const hasil = agregasiPenjualan([baris('2026-11-11T13:00:00.000Z', 7000)], 'hari');
    assert.equal(hasil[0].kunci, '2026-11-11');
  });

  it('menggabungkan beberapa pesanan pada hari yang sama, urut naik', () => {
    const hasil = agregasiPenjualan(
      [
        baris('2026-11-13T03:00:00.000Z', 40000),
        baris('2026-11-11T03:00:00.000Z', 10000),
        baris('2026-11-11T05:00:00.000Z', 20000),
        baris('2026-11-12T03:00:00.000Z', 30000),
      ],
      'hari',
    );
    assert.deepEqual(hasil, [
      { kunci: '2026-11-11', omzet: 30000, jumlahPesanan: 2 },
      { kunci: '2026-11-12', omzet: 30000, jumlahPesanan: 1 },
      { kunci: '2026-11-13', omzet: 40000, jumlahPesanan: 1 },
    ]);
  });

  it('per bulan menggabungkan hari-hari dalam satu bulan WIB', () => {
    const hasil = agregasiPenjualan(
      [
        baris('2026-11-05T03:00:00.000Z', 10000),
        baris('2026-11-20T03:00:00.000Z', 20000),
        baris('2026-12-02T03:00:00.000Z', 30000),
      ],
      'bulan',
    );
    assert.deepEqual(hasil, [
      { kunci: '2026-11', omzet: 30000, jumlahPesanan: 2 },
      { kunci: '2026-12', omzet: 30000, jumlahPesanan: 1 },
    ]);
  });

  it('per bulan memakai bulan WIB, bukan bulan UTC', () => {
    // 31 Okt 17:00 UTC = 1 Nov 00:00 WIB → harus masuk November.
    const hasil = agregasiPenjualan([baris('2026-10-31T17:00:00.000Z', 15000)], 'bulan');
    assert.equal(hasil[0].kunci, '2026-11');
  });

  it('melewati batas tahun dengan benar', () => {
    const hasil = agregasiPenjualan(
      [baris('2026-12-31T17:00:00.000Z', 5000), baris('2026-12-31T16:00:00.000Z', 7000)],
      'hari',
    );
    assert.deepEqual(hasil, [
      { kunci: '2026-12-31', omzet: 7000, jumlahPesanan: 1 },
      { kunci: '2027-01-01', omzet: 5000, jumlahPesanan: 1 },
    ]);
  });

  it('baris dengan waktu rusak dilewati, bukan menghasilkan kunci NaN', () => {
    const hasil = agregasiPenjualan(
      [baris('bukan-tanggal', 1000), baris('2026-11-11T03:00:00.000Z', 2000)],
      'hari',
    );
    assert.deepEqual(hasil, [{ kunci: '2026-11-11', omzet: 2000, jumlahPesanan: 1 }]);
  });
});

describe('tanggalWib', () => {
  it('menggeser +7 jam, bukan +8', () => {
    assert.equal(tanggalWib('2026-11-11T16:30:00.000Z'), '2026-11-11');
    assert.equal(tanggalWib('2026-11-11T17:00:00.000Z'), '2026-11-12');
  });

  it('null untuk waktu rusak', () => {
    assert.equal(tanggalWib(''), null);
    assert.equal(tanggalWib('2026-13-45'), null);
  });
});

describe('produkTerlaris', () => {
  const barisContoh: BarisLaporan[] = [
    baris('2026-11-11T03:00:00.000Z', 10000, [
      ['Rempeyek Kacang', 2],
      ['Sambal Bawang', 1],
    ]),
    baris('2026-11-12T03:00:00.000Z', 20000, [
      ['Rempeyek Kacang', 3],
      ['Rempeyek Udang', 1],
    ]),
  ];

  it('daftar kosong menghasilkan array kosong', () => {
    assert.deepEqual(produkTerlaris([], 5), []);
  });

  it('menjumlahkan jumlah lintas pesanan', () => {
    assert.deepEqual(produkTerlaris(barisContoh, 5), [
      { nama: 'Rempeyek Kacang', jumlah: 5 },
      { nama: 'Rempeyek Udang', jumlah: 1 },
      { nama: 'Sambal Bawang', jumlah: 1 },
    ]);
  });

  it('menghormati batas', () => {
    assert.deepEqual(produkTerlaris(barisContoh, 2), [
      { nama: 'Rempeyek Kacang', jumlah: 5 },
      { nama: 'Rempeyek Udang', jumlah: 1 },
    ]);
  });

  it('batas 0 atau negatif menghasilkan array kosong', () => {
    assert.deepEqual(produkTerlaris(barisContoh, 0), []);
    assert.deepEqual(produkTerlaris(barisContoh, -3), []);
  });

  it('jumlah sama diurutkan menurut nama supaya hasilnya tetap', () => {
    const hasil = produkTerlaris(barisContoh, 5);
    assert.equal(hasil[1].nama, 'Rempeyek Udang');
    assert.equal(hasil[2].nama, 'Sambal Bawang');
  });
});

describe('ambilBarisLaporan', () => {
  let db: Client;
  let produk: ProdukDb;

  /** Membuat pesanan lalu (opsional) menandainya dibayar pada waktu tertentu. */
  async function pesanan(
    jumlah: number,
    dibayarPada: string | null,
  ): Promise<number> {
    const hasil = await buatPesanan(db, {
      nama: 'Budi Santoso',
      hp: '081234567890',
      alamat: 'Jl. Kaliurang KM 10 No. 5',
      provinsi: 'DI Yogyakarta',
      kota: 'Sleman',
      kodeOngkir: 'reguler',
      items: [{ produkId: produk.id, jumlah }],
    });
    assert.equal(hasil.ok, true);
    if (!hasil.ok) throw new Error('gagal menyiapkan pesanan');

    const cari = await db.execute({
      sql: 'SELECT id FROM pesanan WHERE nomor = ?',
      args: [hasil.data.nomor],
    });
    const id = Number(cari.rows[0].id);
    if (dibayarPada !== null) {
      const bayar = await tandaiDibayar(db, id, new Date(dibayarPada));
      assert.equal(bayar.ok, true);
    }
    return id;
  }

  before(async () => {
    db = bukaDb(':memory:');
    await migrate(db);
    produk = await simpanProduk(db, {
      nama: 'Rempeyek Kacang Tanah',
      kategori: 'rempeyek',
      deskripsi: 'Uji',
      harga: 15000,
      berat_gram: 250,
      gambar: [],
      status: 'tersedia',
      warna_isian: '#9A5B22',
    });

    // 23:30 WIB 11 Nov.
    await pesanan(1, '2026-11-11T16:30:00.000Z');
    // 00:00 WIB 12 Nov.
    await pesanan(2, '2026-11-11T17:00:00.000Z');
    // 23:59:59 WIB 12 Nov.
    await pesanan(3, '2026-11-12T16:59:59.000Z');
    // Belum dibayar → tidak masuk laporan.
    await pesanan(4, null);
    // Dibayar lalu dibatalkan → tidak masuk laporan.
    const batal = await pesanan(5, '2026-11-11T18:00:00.000Z');
    assert.equal((await batalkan(db, batal)).ok, true);
  });

  after(() => {
    db.close();
  });

  it('hanya memuat pesanan dibayar dalam rentang, bukan batal', async () => {
    const hasil = await ambilBarisLaporan(db, { dari: '2026-11-11', sampai: '2026-11-12' });
    assert.equal(hasil.length, 3);
    assert.ok(hasil.every((b) => b.total > 0));
  });

  it('menyertakan nama dan jumlah item dari database', async () => {
    const hasil = await ambilBarisLaporan(db, { dari: '2026-11-12', sampai: '2026-11-12' });
    assert.equal(hasil.length, 2);
    assert.deepEqual(hasil[0].items, [{ nama: 'Rempeyek Kacang Tanah', jumlah: 2 }]);
  });

  it('menghormati batas hari WIB pada kedua ujung rentang', async () => {
    const tanggal11 = await ambilBarisLaporan(db, { dari: '2026-11-11', sampai: '2026-11-11' });
    assert.equal(tanggal11.length, 1);
    assert.equal(tanggal11[0].dibayar_pada, '2026-11-11T16:30:00.000Z');
  });

  it('rentang tanpa data menghasilkan array kosong', async () => {
    assert.deepEqual(await ambilBarisLaporan(db, { dari: '2025-01-01', sampai: '2025-01-31' }), []);
  });

  it('hasilnya bisa langsung dipakai agregasi', async () => {
    const hasil = await ambilBarisLaporan(db, { dari: '2026-11-11', sampai: '2026-11-12' });
    const harian = agregasiPenjualan(hasil, 'hari');
    assert.deepEqual(harian.map((h) => h.kunci), ['2026-11-11', '2026-11-12']);
    assert.equal(harian[0].jumlahPesanan, 1);
    assert.equal(harian[1].jumlahPesanan, 2);

    // Harga 15.000/250 g dan ongkir 9.000 untuk 1 kg pertama:
    //   1 bungkus = 15.000 + 9.000 = 24.000
    //   2 bungkus = 30.000 + 9.000 = 39.000
    //   3 bungkus = 45.000 + 9.000 = 54.000
    assert.equal(harian[0].omzet, 24000);
    assert.equal(harian[1].omzet, 39000 + 54000);
  });
});
