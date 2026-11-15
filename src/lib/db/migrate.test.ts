// src/lib/db/migrate.test.ts
//
// Tes Task 1: skema dasar marketplace terhadap SQLite dalam memori.
// Dijalankan dengan `npm test` (tsx --test, node:test).

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import type { Client } from '@libsql/client';

import { bukaDb } from './client';
import { migrate } from './migrate';

describe('migrate', () => {
  let db: Client;

  before(async () => {
    db = bukaDb(':memory:');
    await migrate(db);
  });

  after(() => {
    db.close();
  });

  it('idempoten: dipanggil dua kali tidak melempar', async () => {
    await assert.doesNotReject(() => migrate(db));
  });

  it('sqlite_master memuat empat tabel marketplace', async () => {
    const hasil = await db.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );
    const nama = hasil.rows.map((baris) => String(baris.name));
    for (const tabel of ['produk', 'pesanan', 'item_pesanan', 'batas_laju']) {
      assert.ok(nama.includes(tabel), `tabel ${tabel} tidak ada (ada: ${nama.join(', ')})`);
    }
  });

  it('indeks (kunci, waktu) pada batas_laju ada', async () => {
    const hasil = await db.execute(
      "SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'batas_laju'",
    );
    const nama = hasil.rows.map((baris) => String(baris.name));
    assert.ok(
      nama.some((n) => n.includes('kunci') && n.includes('waktu')),
      `indeks (kunci, waktu) tidak ada (ada: ${nama.join(', ')})`,
    );
  });

  it('produk dengan harga -1 ditolak oleh CHECK', async () => {
    await assert.rejects(() =>
      db.execute({
        sql: `INSERT INTO produk (slug, nama, kategori, deskripsi, harga, berat_gram)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: ['uji-harga-negatif', 'Uji', 'rempeyek', 'Uji', -1, 250],
      }),
    );
  });

  it('produk valid bisa disimpan dan nilai default terisi', async () => {
    await db.execute({
      sql: `INSERT INTO produk (slug, nama, kategori, deskripsi, harga, berat_gram)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: ['uji-valid', 'Uji Valid', 'rempeyek', 'Uji', 15000, 250],
    });
    const hasil = await db.execute(
      "SELECT gambar, status, warna_isian, diarsipkan FROM produk WHERE slug = 'uji-valid'",
    );
    const baris = hasil.rows[0];
    assert.equal(String(baris.gambar), '[]');
    assert.equal(String(baris.status), 'tersedia');
    assert.equal(String(baris.warna_isian), '#9A5B22');
    assert.equal(Number(baris.diarsipkan), 0);
  });

  it('kategori di luar enum ditolak oleh CHECK', async () => {
    await assert.rejects(() =>
      db.execute({
        sql: `INSERT INTO produk (slug, nama, kategori, deskripsi, harga, berat_gram)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: ['uji-kategori', 'Uji', 'kerupuk', 'Uji', 15000, 250],
      }),
    );
  });

  it('jumlah item pesanan dibatasi 1..99', async () => {
    const pesanan = await db.execute({
      sql: `INSERT INTO pesanan
              (nomor, nama, hp, alamat, provinsi, kota, kurir, layanan, ongkir, subtotal, total, status, dibuat)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'RBA-TES001',
        'Uji',
        '6281234567890',
        'Jl. Uji Nomor 1',
        'DI Yogyakarta',
        'Sleman',
        'Demo Kurir',
        'reguler',
        9000,
        15000,
        24000,
        'menunggu_pembayaran',
        new Date().toISOString(),
      ],
    });

    for (const jumlah of [0, 100]) {
      await assert.rejects(
        () =>
          db.execute({
            sql: `INSERT INTO item_pesanan (pesanan_id, produk_id, nama, harga, berat_gram, jumlah)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [Number(pesanan.lastInsertRowid), 1, 'Uji', 15000, 250, jumlah],
          }),
        `jumlah ${jumlah} seharusnya ditolak`,
      );
    }
  });

  it('status pesanan di luar enum ditolak oleh CHECK', async () => {
    await assert.rejects(() =>
      db.execute({
        sql: `INSERT INTO pesanan
                (nomor, nama, hp, alamat, provinsi, kota, kurir, layanan, ongkir, subtotal, total, status, dibuat)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'RBA-TES002',
          'Uji',
          '6281234567890',
          'Jl. Uji Nomor 1',
          'DI Yogyakarta',
          'Sleman',
          'Demo Kurir',
          'reguler',
          9000,
          15000,
          24000,
          'entah',
          new Date().toISOString(),
        ],
      }),
    );
  });
});
