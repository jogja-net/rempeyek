// src/lib/ongkir.test.ts
//
// Tes Task 2: tarif ongkir tiruan per zona.
//
// Aturan (rencana Task 2):
//   - Dihitung per kg, dibulatkan ke ATAS, minimum 1 kg.
//   - Tarif reguler zona 1..5 = 9000, 12000, 18000, 24000, 35000.
//   - hemat = 0,8 x reguler; kilat = 1,5 x reguler; keduanya dibulatkan ke 100 terdekat.
//   - Estimasi: kilat "1-2 hari", reguler "2-4 hari", hemat "4-7 hari".
//   - Nama kurir mengandung "Demo".
//   - Provinsi tak dikenal → Error('provinsi tidak dikenal').

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cariOpsi, hitungOngkir, PROVINSI } from './ongkir';

describe('PROVINSI', () => {
  it('memuat 38 provinsi Indonesia', () => {
    assert.equal(Object.keys(PROVINSI).length, 38);
  });

  it('memetakan zona dengan benar untuk contoh kunci', () => {
    assert.equal(PROVINSI['DI Yogyakarta'], 1);
    assert.equal(PROVINSI['Jawa Tengah'], 1);
    assert.equal(PROVINSI['Jawa Barat'], 2);
    assert.equal(PROVINSI['Bali'], 2);
    assert.equal(PROVINSI['Sumatera Utara'], 3);
    assert.equal(PROVINSI['Nusa Tenggara Barat'], 3);
    assert.equal(PROVINSI['Kalimantan Timur'], 4);
    assert.equal(PROVINSI['Sulawesi Selatan'], 4);
    assert.equal(PROVINSI['Nusa Tenggara Timur'], 5);
    assert.equal(PROVINSI['Maluku'], 5);
    assert.equal(PROVINSI['Papua'], 5);
  });

  it('semua zona bernilai 1..5', () => {
    for (const [nama, zona] of Object.entries(PROVINSI)) {
      assert.ok([1, 2, 3, 4, 5].includes(zona), `zona ${nama} tidak sah: ${zona}`);
    }
  });
});

describe('hitungOngkir', () => {
  it('1000 g ke DI Yogyakarta: reguler 9000, hemat 7200, kilat 13500', () => {
    const opsi = hitungOngkir({ beratGram: 1000, provinsi: 'DI Yogyakarta' });
    const byKode = Object.fromEntries(opsi.map((o) => [o.kode, o]));
    assert.equal(byKode.reguler.tarif, 9000);
    assert.equal(byKode.hemat.tarif, 7200);
    assert.equal(byKode.kilat.tarif, 13500);
  });

  it('1001 g dibulatkan ke 2 kg → reguler 18000', () => {
    const opsi = hitungOngkir({ beratGram: 1001, provinsi: 'DI Yogyakarta' });
    assert.equal(cariOpsi({ beratGram: 1001, provinsi: 'DI Yogyakarta' }, 'reguler')?.tarif, 18000);
    assert.ok(opsi.length > 0);
  });

  it('0 g diperlakukan 1 kg', () => {
    assert.equal(cariOpsi({ beratGram: 0, provinsi: 'DI Yogyakarta' }, 'reguler')?.tarif, 9000);
  });

  it('estimasi sesuai kode layanan', () => {
    const opsi = hitungOngkir({ beratGram: 1000, provinsi: 'DI Yogyakarta' });
    assert.equal(cariOpsi({ beratGram: 1000, provinsi: 'DI Yogyakarta' }, 'kilat')?.estimasi, '1-2 hari');
    assert.equal(cariOpsi({ beratGram: 1000, provinsi: 'DI Yogyakarta' }, 'reguler')?.estimasi, '2-4 hari');
    assert.equal(cariOpsi({ beratGram: 1000, provinsi: 'DI Yogyakarta' }, 'hemat')?.estimasi, '4-7 hari');
    assert.equal(opsi.length, 3);
  });

  it('nama kurir mengandung "Demo"', () => {
    for (const o of hitungOngkir({ beratGram: 1000, provinsi: 'DI Yogyakarta' })) {
      assert.match(o.kurir, /Demo/);
    }
  });

  it('tarif reguler zona 1..5 sesuai tabel', () => {
    const harapan: Array<[string, number]> = [
      ['DI Yogyakarta', 9000],
      ['Jawa Barat', 12000],
      ['Sumatera Utara', 18000],
      ['Kalimantan Timur', 24000],
      ['Papua', 35000],
    ];
    for (const [provinsi, tarif] of harapan) {
      assert.equal(cariOpsi({ beratGram: 1000, provinsi }, 'reguler')?.tarif, tarif, provinsi);
    }
  });

  it('provinsi tidak dikenal melempar Error', () => {
    assert.throws(() => hitungOngkir({ beratGram: 1000, provinsi: 'Atlantis' }), /provinsi tidak dikenal/);
  });

  it('cariOpsi mengembalikan null untuk kode yang tidak ada', () => {
    assert.equal(cariOpsi({ beratGram: 1000, provinsi: 'DI Yogyakarta' }, 'xyz'), null);
  });
});
