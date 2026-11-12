// src/lib/kode.test.ts
//
// Tes Task 2: pembuatan kode acak (nomor pesanan, resi demo) dan normalisasi resi.
//
// Alfabet sengaja membuang huruf/angka yang mudah tertukar saat dibaca manual:
// I, O, 0, 1. Jadi pola regex memakai `[A-HJ-NP-Z2-9]`.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buatKode, buatNomorPesanan, buatResiDemo, normalisasiResi } from './kode';

describe('kode', () => {
  it('buatResiDemo berawalan DEMO- dan 8 karakter aman-baca', () => {
    assert.match(buatResiDemo(), /^DEMO-[A-HJ-NP-Z2-9]{8}$/);
  });

  it('buatNomorPesanan berawalan RBA- dan 6 karakter aman-baca', () => {
    assert.match(buatNomorPesanan(), /^RBA-[A-HJ-NP-Z2-9]{6}$/);
  });

  it('normalisasiResi membuang spasi, merapikan huruf besar, dan menyisakan tanda hubung', () => {
    assert.equal(normalisasiResi('  demo-ab cd2345 '), 'DEMO-ABCD2345');
  });

  it('buatKode memakai alfabet yang diminta dan panjang yang diminta', () => {
    assert.match(buatKode('X-', 12), /^X-[A-HJ-NP-Z2-9]{12}$/);
  });

  it('buatKode memakai sumber acak yang diberikan', () => {
    // Semua byte 0 → semua indeks 0 → alfabet[0] = 'A'.
    const nol = (n: number) => new Uint8Array(n);
    assert.equal(buatKode('', 4, nol), 'AAAA');
  });

  it('1000 kode acak tidak ada yang kembar', () => {
    const kode = new Set<string>();
    for (let i = 0; i < 1000; i += 1) {
      kode.add(buatResiDemo());
    }
    assert.equal(kode.size, 1000);
  });
});
