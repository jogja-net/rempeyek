// src/lib/produk-validasi.test.ts
//
// Tes Task 8: validasi formulir produk di server. Masukan datang dari browser
// dan tidak dipercaya; harga yang lolos di sini langsung masuk database.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BATAS_FOTO_BYTE, validasiProduk } from './produk-validasi';

/** Formulir valid; tes hanya menimpa kolom yang sedang diuji. */
function form(timpa: Record<string, string | File> = {}): FormData {
  const dasar: Record<string, string | File> = {
    nama: 'Rempeyek Kacang Tanah',
    kategori: 'rempeyek',
    deskripsi: 'Renyah dan gurih.',
    harga: '15000',
    berat: '200',
    status: 'tersedia',
    ...timpa,
  };
  const fd = new FormData();
  for (const [k, v] of Object.entries(dasar)) fd.set(k, v);
  return fd;
}

function foto(tipe: string, byte: number, nama = 'foto.jpg'): File {
  return new File([new Uint8Array(byte)], nama, { type: tipe });
}

describe('validasiProduk', () => {
  it('menerima formulir valid dan merapikan spasi', () => {
    const h = validasiProduk(form({ nama: '  Rempeyek Teri  ' }));
    assert.ok(h.ok);
    assert.equal(h.data.nama, 'Rempeyek Teri');
    assert.equal(h.data.harga, 15000);
    assert.equal(h.data.berat_gram, 200);
    assert.equal(h.foto, null);
  });

  it('menolak nama di luar 2–80 karakter', () => {
    assert.equal(validasiProduk(form({ nama: 'A' })).ok, false);
    assert.equal(validasiProduk(form({ nama: '   ' })).ok, false);
    assert.equal(validasiProduk(form({ nama: 'x'.repeat(81) })).ok, false);
    assert.equal(validasiProduk(form({ nama: 'x'.repeat(80) })).ok, true);
  });

  it('menolak harga yang bukan bilangan bulat 0–10.000.000', () => {
    for (const harga of ['', '-1', '12.5', '12,5', '1e3', 'abc', '10000001', ' ']) {
      assert.equal(validasiProduk(form({ harga })).ok, false, `harga "${harga}"`);
    }
    assert.equal(validasiProduk(form({ harga: '0' })).ok, true);
    assert.equal(validasiProduk(form({ harga: '10000000' })).ok, true);
  });

  it('menolak berat yang bukan bilangan bulat 1–50.000', () => {
    for (const berat of ['', '0', '-5', '1.5', 'abc', '50001']) {
      assert.equal(validasiProduk(form({ berat })).ok, false, `berat "${berat}"`);
    }
    assert.equal(validasiProduk(form({ berat: '1' })).ok, true);
    assert.equal(validasiProduk(form({ berat: '50000' })).ok, true);
  });

  it('menolak kategori dan status di luar enum', () => {
    assert.equal(validasiProduk(form({ kategori: 'minuman' })).ok, false);
    assert.equal(validasiProduk(form({ status: 'diskon' })).ok, false);
    assert.equal(validasiProduk(form({ kategori: 'sambal', status: 'po' })).ok, true);
  });

  it('menolak deskripsi lebih dari 1000 karakter', () => {
    assert.equal(validasiProduk(form({ deskripsi: 'x'.repeat(1001) })).ok, false);
    assert.equal(validasiProduk(form({ deskripsi: '' })).ok, true);
  });

  it('kolom hilang ditolak, bukan melempar', () => {
    const fd = new FormData();
    assert.equal(validasiProduk(fd).ok, false);
  });

  it('tanpa foto atau berkas kosong dari input file → foto null', () => {
    const tanpa = validasiProduk(form());
    assert.ok(tanpa.ok);
    assert.equal(tanpa.foto, null);
    const kosong = validasiProduk(form({ foto: new File([], '', { type: 'application/octet-stream' }) }));
    assert.ok(kosong.ok);
    assert.equal(kosong.foto, null);
  });

  it('menerima jpeg, png, webp sampai 4 MB', () => {
    for (const tipe of ['image/jpeg', 'image/png', 'image/webp']) {
      const h = validasiProduk(form({ foto: foto(tipe, 1000) }));
      assert.ok(h.ok, tipe);
      assert.equal(h.foto?.type, tipe);
    }
    assert.equal(validasiProduk(form({ foto: foto('image/png', BATAS_FOTO_BYTE) })).ok, true);
  });

  it('menolak foto bertipe lain atau lebih dari 4 MB', () => {
    for (const tipe of ['image/gif', 'image/svg+xml', 'application/pdf', 'text/html']) {
      assert.equal(validasiProduk(form({ foto: foto(tipe, 1000) })).ok, false, tipe);
    }
    assert.equal(validasiProduk(form({ foto: foto('image/jpeg', BATAS_FOTO_BYTE + 1) })).ok, false);
  });
});
