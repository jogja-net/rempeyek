// src/lib/hitung.test.ts
//
// Tes Task 2: aritmetika uang dan berat. Fungsi murni, tanpa database.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hitungBeratTotal, hitungSubtotal } from './hitung';

describe('hitungSubtotal', () => {
  it('menjumlahkan harga x jumlah', () => {
    assert.equal(
      hitungSubtotal([
        { harga: 15000, jumlah: 2 },
        { harga: 5000, jumlah: 1 },
      ]),
      35000,
    );
  });

  it('daftar kosong menghasilkan 0', () => {
    assert.equal(hitungSubtotal([]), 0);
  });
});

describe('hitungBeratTotal', () => {
  it('menjumlahkan berat_gram x jumlah', () => {
    assert.equal(hitungBeratTotal([{ berat_gram: 250, jumlah: 3 }]), 750);
  });

  it('daftar kosong menghasilkan 0', () => {
    assert.equal(hitungBeratTotal([]), 0);
  });
});
