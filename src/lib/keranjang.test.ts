// src/lib/keranjang.test.ts
//
// Tes Task 9: logika keranjang murni. Isi `localStorage` dianggap tidak
// dipercaya (bisa rusak, diedit, atau berasal dari versi lama), jadi
// `bacaKeranjang` harus selalu menghasilkan daftar yang aman dipakai.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bacaKeranjang,
  jumlahBarang,
  ringkasKeranjang,
  tambah,
  ubahJumlah,
  type ProdukToko,
} from './keranjang';

const produk = (id: number, timpa: Partial<ProdukToko> = {}): ProdukToko => ({
  id,
  slug: `produk-${id}`,
  nama: `Produk ${id}`,
  harga: 10_000,
  berat_gram: 200,
  status: 'tersedia',
  gambar: null,
  ...timpa,
});

describe('tambah', () => {
  it('menjumlahkan produk yang sama', () => {
    const k = tambah(tambah([], 1), 1);
    assert.deepEqual(k, [{ produkId: 1, jumlah: 2 }]);
  });

  it('menambah beberapa sekaligus dan menjaga produk lain', () => {
    const k = tambah([{ produkId: 2, jumlah: 1 }], 1, 3);
    assert.deepEqual(k, [
      { produkId: 2, jumlah: 1 },
      { produkId: 1, jumlah: 3 },
    ]);
  });

  it('dibatasi 99 per produk', () => {
    assert.equal(tambah([{ produkId: 1, jumlah: 98 }], 1, 5)[0].jumlah, 99);
    assert.equal(tambah([], 1, 500)[0].jumlah, 99);
  });

  it('tidak mengubah daftar asli', () => {
    const asli = [{ produkId: 1, jumlah: 1 }];
    tambah(asli, 1);
    assert.deepEqual(asli, [{ produkId: 1, jumlah: 1 }]);
  });

  it('mengabaikan produk atau jumlah yang tidak valid', () => {
    assert.deepEqual(tambah([], 0), []);
    assert.deepEqual(tambah([], -3), []);
    assert.deepEqual(tambah([], 1.5), []);
    assert.deepEqual(tambah([], 1, 0), []);
    assert.deepEqual(tambah([], 1, -2), []);
    assert.deepEqual(tambah([], 1, 1.5), []);
  });
});

describe('ubahJumlah', () => {
  const k = [
    { produkId: 1, jumlah: 2 },
    { produkId: 2, jumlah: 5 },
  ];

  it('mengganti jumlah produk yang dipilih saja', () => {
    assert.deepEqual(ubahJumlah(k, 2, 7), [
      { produkId: 1, jumlah: 2 },
      { produkId: 2, jumlah: 7 },
    ]);
  });

  it('jumlah 0 atau negatif menghapus produk', () => {
    assert.deepEqual(ubahJumlah(k, 1, 0), [{ produkId: 2, jumlah: 5 }]);
    assert.deepEqual(ubahJumlah(k, 1, -1), [{ produkId: 2, jumlah: 5 }]);
  });

  it('dibatasi 99 dan mengabaikan nilai bukan bilangan bulat', () => {
    assert.equal(ubahJumlah(k, 1, 1000)[0].jumlah, 99);
    assert.deepEqual(ubahJumlah(k, 1, 1.5), k);
    assert.deepEqual(ubahJumlah(k, 1, Number.NaN), k);
  });

  it('produk yang tidak ada tidak mengubah apa pun', () => {
    assert.deepEqual(ubahJumlah(k, 99, 3), k);
  });
});

describe('bacaKeranjang', () => {
  it('JSON rusak, null, dan bukan array → []', () => {
    assert.deepEqual(bacaKeranjang('{rusak'), []);
    assert.deepEqual(bacaKeranjang(null), []);
    assert.deepEqual(bacaKeranjang(''), []);
    assert.deepEqual(bacaKeranjang('{"produkId":1,"jumlah":1}'), []);
    assert.deepEqual(bacaKeranjang('"teks"'), []);
    assert.deepEqual(bacaKeranjang('42'), []);
  });

  it('item bermuatan tidak valid dibuang', () => {
    assert.deepEqual(bacaKeranjang('[{"produkId":"a","jumlah":-5}]'), []);
    assert.deepEqual(bacaKeranjang('[null, 3, "x", {}]'), []);
    assert.deepEqual(bacaKeranjang('[{"produkId":1,"jumlah":0}]'), []);
    assert.deepEqual(bacaKeranjang('[{"produkId":1,"jumlah":100}]'), []);
    assert.deepEqual(bacaKeranjang('[{"produkId":1.5,"jumlah":1}]'), []);
    assert.deepEqual(bacaKeranjang('[{"produkId":-1,"jumlah":1}]'), []);
  });

  it('menyimpan item valid walau ada yang tidak valid di sampingnya', () => {
    const k = bacaKeranjang('[{"produkId":1,"jumlah":2},{"produkId":"a","jumlah":1},{"produkId":3,"jumlah":4}]');
    assert.deepEqual(k, [
      { produkId: 1, jumlah: 2 },
      { produkId: 3, jumlah: 4 },
    ]);
  });

  it('menggabungkan produk yang sama dan membuang kolom asing', () => {
    const k = bacaKeranjang('[{"produkId":1,"jumlah":2,"harga":1},{"produkId":1,"jumlah":3}]');
    assert.deepEqual(k, [{ produkId: 1, jumlah: 5 }]);
  });

  it('membatasi jumlah jenis produk (cegah isi raksasa)', () => {
    const banyak = JSON.stringify(Array.from({ length: 500 }, (_, i) => ({ produkId: i + 1, jumlah: 1 })));
    assert.ok(bacaKeranjang(banyak).length <= 50);
  });
});

describe('jumlahBarang', () => {
  it('menjumlahkan seluruh kuantitas', () => {
    assert.equal(jumlahBarang([]), 0);
    assert.equal(jumlahBarang([{ produkId: 1, jumlah: 2 }, { produkId: 2, jumlah: 3 }]), 5);
  });
});

describe('ringkasKeranjang', () => {
  const katalog = [produk(1), produk(2, { harga: 20_000, berat_gram: 100 }), produk(3, { status: 'habis' }), produk(4, { status: 'po' })];

  it('menghitung subtotal dan berat dari katalog server, bukan dari keranjang', () => {
    const r = ringkasKeranjang(
      [
        { produkId: 1, jumlah: 2 },
        { produkId: 2, jumlah: 3 },
      ],
      katalog,
    );
    assert.equal(r.subtotal, 2 * 10_000 + 3 * 20_000);
    assert.equal(r.beratGram, 2 * 200 + 3 * 100);
    assert.equal(r.adaMasalah, false);
    assert.equal(r.baris[1].subtotal, 60_000);
  });

  it('produk yang tidak ada di katalog (diarsipkan/dihapus) ditandai dan tidak dihitung', () => {
    const r = ringkasKeranjang(
      [
        { produkId: 1, jumlah: 1 },
        { produkId: 99, jumlah: 5 },
      ],
      katalog,
    );
    assert.equal(r.baris[1].produk, null);
    assert.equal(r.baris[1].tersedia, false);
    assert.equal(r.subtotal, 10_000);
    assert.equal(r.adaMasalah, true);
  });

  it('produk habis tidak tersedia, pre-order tetap bisa dipesan', () => {
    const r = ringkasKeranjang(
      [
        { produkId: 3, jumlah: 1 },
        { produkId: 4, jumlah: 2 },
      ],
      katalog,
    );
    assert.equal(r.baris[0].tersedia, false);
    assert.equal(r.baris[1].tersedia, true);
    assert.equal(r.subtotal, 20_000);
    assert.equal(r.adaMasalah, true);
  });

  it('keranjang kosong → nol dan tanpa masalah', () => {
    const r = ringkasKeranjang([], katalog);
    assert.deepEqual([r.subtotal, r.beratGram, r.adaMasalah, r.baris.length], [0, 0, false, 0]);
  });
});
