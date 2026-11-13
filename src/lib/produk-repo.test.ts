// src/lib/produk-repo.test.ts
//
// Tes Task 3: repositori produk terhadap SQLite dalam memori.
//
// Dua perilaku yang paling mudah salah dan paling mahal akibatnya:
//   1. Slug harus unik walau nama produk sama — `UNIQUE` di skema akan
//      menggagalkan insert, bukan sekadar menimpa.
//   2. Menghapus produk yang pernah dipesan TIDAK boleh menghapus barisnya,
//      karena `item_pesanan` menyimpan riwayat dan laporan penjualan
//      (spec §66: harga & nama disalin ke item supaya laporan lama tidak berubah).

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import type { Client } from '@libsql/client';

import { bukaDb } from './db/client';
import { migrate } from './db/migrate';
import {
  ambilProdukBySlug,
  daftarProdukAdmin,
  daftarProdukTampil,
  hapusProduk,
  simpanProduk,
  type ProdukDb,
} from './produk-repo';

type InputProduk = Omit<ProdukDb, 'id' | 'slug' | 'diarsipkan'>;

/** Contoh produk valid; tes hanya menimpa field yang sedang diuji. */
function contoh(timpa: Partial<InputProduk> = {}): InputProduk {
  return {
    nama: 'Rempeyek Kacang Tanah',
    kategori: 'rempeyek',
    deskripsi: 'Varian klasik.',
    harga: 15000,
    berat_gram: 250,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#9A5B22',
    ...timpa,
  };
}

describe('produk-repo', () => {
  let db: Client;

  before(async () => {
    db = bukaDb(':memory:');
    await migrate(db);
  });

  after(() => {
    db.close();
  });

  it('simpanProduk membuat slug dari nama', async () => {
    const p = await simpanProduk(db, contoh({ nama: 'Rempeyek Kacang Hijau' }));
    assert.equal(p.slug, 'rempeyek-kacang-hijau');
    assert.equal(p.harga, 15000);
    assert.equal(p.diarsipkan, false);
  });

  it('nama sama dua kali menghasilkan slug x lalu x-2', async () => {
    const a = await simpanProduk(db, contoh({ nama: 'Produk Kembar' }));
    const b = await simpanProduk(db, contoh({ nama: 'Produk Kembar' }));
    assert.equal(a.slug, 'produk-kembar');
    assert.equal(b.slug, 'produk-kembar-2');
    assert.notEqual(a.id, b.id);
  });

  it('mengubah harga tidak mengganti slug', async () => {
    const awal = await simpanProduk(db, contoh({ nama: 'Produk Ubah Harga', harga: 10000 }));
    const ubah = await simpanProduk(db, contoh({ nama: 'Produk Ubah Harga', harga: 20000 }), awal.id);
    assert.equal(ubah.slug, awal.slug);
    assert.equal(ubah.harga, 20000);
    assert.equal(ubah.id, awal.id);
  });

  it('ambilProdukBySlug mengembalikan produk atau null', async () => {
    const p = await simpanProduk(db, contoh({ nama: 'Produk Dicari' }));
    const ketemu = await ambilProdukBySlug(db, p.slug);
    assert.equal(ketemu?.id, p.id);
    assert.equal(await ambilProdukBySlug(db, 'tidak-ada'), null);
  });

  it('gambar disimpan dan dibaca kembali sebagai array', async () => {
    const p = await simpanProduk(
      db,
      contoh({ nama: 'Produk Bergambar', gambar: ['/produk/a.jpg', '/produk/b.jpg'] }),
    );
    const ketemu = await ambilProdukBySlug(db, p.slug);
    assert.deepEqual(ketemu?.gambar, ['/produk/a.jpg', '/produk/b.jpg']);
  });

  it('hapusProduk menghapus baris bila belum pernah dipesan', async () => {
    const p = await simpanProduk(db, contoh({ nama: 'Produk Sekali Pakai' }));
    assert.equal(await hapusProduk(db, p.id), 'dihapus');
    assert.equal(await ambilProdukBySlug(db, p.slug), null);
  });

  it('hapusProduk mengarsipkan bila produk ada di item_pesanan', async () => {
    const p = await simpanProduk(db, contoh({ nama: 'Produk Riwayat' }));

    const pesanan = await db.execute({
      sql: `INSERT INTO pesanan
              (nomor, nama, hp, alamat, provinsi, kota, kurir, layanan, ongkir, subtotal, total, status, dibuat)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'RBA-ARSIP1',
        'Uji',
        '6281234567890',
        'Jl. Uji Nomor 1',
        'DI Yogyakarta',
        'Sleman',
        'Demo Express',
        'reguler',
        9000,
        15000,
        24000,
        'selesai',
        new Date().toISOString(),
      ],
    });
    await db.execute({
      sql: `INSERT INTO item_pesanan (pesanan_id, produk_id, nama, harga, berat_gram, jumlah)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [Number(pesanan.lastInsertRowid), p.id, p.nama, p.harga, p.berat_gram, 1],
    });

    assert.equal(await hapusProduk(db, p.id), 'diarsipkan');

    const masihAda = await ambilProdukBySlug(db, p.slug);
    assert.equal(masihAda?.id, p.id);
    assert.equal(masihAda?.diarsipkan, true);
  });

  it('daftarProdukTampil menyembunyikan yang diarsipkan', async () => {
    const tampil = await daftarProdukTampil(db);
    const semua = await daftarProdukAdmin(db);

    assert.ok(tampil.every((p) => p.diarsipkan === false));
    assert.ok(semua.length > tampil.length, 'produk terarsip seharusnya ada di daftar admin');
    assert.ok(semua.some((p) => p.diarsipkan));
  });

  it('daftarProdukTampil dan daftarProdukAdmin urut id menaik', async () => {
    const tampil = await daftarProdukTampil(db);
    const ids = tampil.map((p) => p.id);
    assert.deepEqual(ids, [...ids].sort((a, b) => a - b));

    const semua = await daftarProdukAdmin(db);
    const semuaIds = semua.map((p) => p.id);
    assert.deepEqual(semuaIds, [...semuaIds].sort((a, b) => a - b));
  });
});
