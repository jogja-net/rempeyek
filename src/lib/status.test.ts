// src/lib/status.test.ts
//
// Tes Task 2: mesin status pesanan.
//
// Aturan (Global Constraints):
//   menunggu_pembayaran → dibayar → dikirim → selesai
//   batal hanya dari menunggu_pembayaran atau dibayar.
// Tidak ada jalan balik, tidak ada lompatan.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bolehPindah, statusTampil, type StatusPesanan } from './status';

const SEMUA: StatusPesanan[] = [
  'menunggu_pembayaran',
  'dibayar',
  'dikirim',
  'selesai',
  'batal',
];

/** Tabel transisi yang sah, ditulis apa adanya supaya mudah diaudit. */
const SAH: ReadonlyArray<[StatusPesanan, StatusPesanan]> = [
  ['menunggu_pembayaran', 'dibayar'],
  ['menunggu_pembayaran', 'batal'],
  ['dibayar', 'dikirim'],
  ['dibayar', 'batal'],
  ['dikirim', 'selesai'],
];

describe('bolehPindah', () => {
  for (const dari of SEMUA) {
    for (const ke of SEMUA) {
      const diharapkan = SAH.some(([d, k]) => d === dari && k === ke);
      it(`${dari} → ${ke} = ${diharapkan}`, () => {
        assert.equal(bolehPindah(dari, ke), diharapkan);
      });
    }
  }
});

describe('statusTampil', () => {
  const dibuat = '2026-11-12T00:00:00.000Z';
  const tepat24Jam = new Date('2026-11-13T00:00:00.000Z');
  const lewat1Detik = new Date('2026-11-13T00:00:01.000Z');

  it('menunggu_pembayaran berumur 24 jam + 1 detik tampil kedaluwarsa', () => {
    assert.equal(statusTampil({ status: 'menunggu_pembayaran', dibuat }, lewat1Detik), 'kedaluwarsa');
  });

  it('tepat 24 jam masih menunggu_pembayaran (batas tidak inklusif)', () => {
    assert.equal(statusTampil({ status: 'menunggu_pembayaran', dibuat }, tepat24Jam), 'menunggu_pembayaran');
  });

  it('menunggu_pembayaran yang belum 24 jam tetap menunggu_pembayaran', () => {
    assert.equal(
      statusTampil({ status: 'menunggu_pembayaran', dibuat }, new Date('2026-11-12T23:59:59.000Z')),
      'menunggu_pembayaran',
    );
  });

  it('status lain tidak pernah berubah jadi kedaluwarsa', () => {
    const jauh = new Date('2027-01-01T00:00:00.000Z');
    for (const status of ['dibayar', 'dikirim', 'selesai', 'batal'] as const) {
      assert.equal(statusTampil({ status, dibuat }, jauh), status);
    }
  });
});
