// src/lib/pesanan-repo.test.ts
//
// Tes Task 4: repositori pesanan terhadap SQLite dalam memori.
//
// Fokus pada hal yang paling mahal kalau salah (Review Focus 1–3, 5):
//   - Total SELALU dihitung server dari harga di database, bukan dari browser.
//   - Harga yang sudah tersalin ke item_pesanan tidak ikut berubah saat harga
//     produk diubah (laporan lama harus tetap).
//   - Aksi ganda (bayar dua kali, kirim dua kali) tidak menghasilkan perubahan
//     kedua, dan resi pertama tidak pernah tertimpa.
//   - Halaman lacak tidak membocorkan alamat, HP, atau nama pembeli.

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import type { Client } from '@libsql/client';

import { bukaDb } from './db/client';
import { migrate } from './db/migrate';
import {
  ambilPesanan,
  ambilPesananByNomor,
  batalkan,
  buatPesanan,
  daftarPesanan,
  kirimDenganResi,
  lacakByResi,
  tandaiDibayar,
  tandaiSelesai,
  type InputPesanan,
} from './pesanan-repo';
import { simpanProduk, type ProdukDb } from './produk-repo';

/** Contoh pesanan valid; tes hanya menimpa field yang sedang diuji. */
function input(timpa: Partial<InputPesanan> = {}): InputPesanan {
  return {
    nama: 'Budi Santoso',
    hp: '0812-3456-7890',
    alamat: 'Jl. Kaliurang KM 10 No. 5',
    provinsi: 'DI Yogyakarta',
    kota: 'Sleman',
    kodeOngkir: 'reguler',
    items: [],
    ...timpa,
  };
}

describe('pesanan-repo', () => {
  let db: Client;
  let kacang: ProdukDb;
  let habis: ProdukDb;

  before(async () => {
    db = bukaDb(':memory:');
    await migrate(db);

    kacang = await simpanProduk(db, {
      nama: 'Rempeyek Kacang Tanah',
      kategori: 'rempeyek',
      deskripsi: 'Uji',
      harga: 15000,
      berat_gram: 250,
      gambar: [],
      status: 'tersedia',
      warna_isian: '#9A5B22',
    });

    habis = await simpanProduk(db, {
      nama: 'Rempeyek Habis',
      kategori: 'rempeyek',
      deskripsi: 'Uji',
      harga: 10000,
      berat_gram: 200,
      gambar: [],
      status: 'habis',
      warna_isian: '#000000',
    });
  });

  after(() => {
    db.close();
  });

  it('pesanan valid: subtotal, ongkir, total, status, nomor, dan HP ternormalisasi', async () => {
    const hasil = await buatPesanan(
      db,
      input({ items: [{ produkId: kacang.id, jumlah: 2 }] }),
    );
    assert.equal(hasil.ok, true);
    if (!hasil.ok) return;

    assert.match(hasil.data.nomor, /^RBA-/);
    assert.equal(hasil.data.total, 39000);

    const pesanan = await ambilPesananByNomor(db, hasil.data.nomor);
    assert.ok(pesanan);
    assert.equal(pesanan.subtotal, 30000);
    assert.equal(pesanan.ongkir, 9000);
    assert.equal(pesanan.total, 39000);
    assert.equal(pesanan.status, 'menunggu_pembayaran');
    assert.equal(pesanan.hp, '6281234567890');
    assert.equal(pesanan.kurir, 'Demo Express');
    assert.equal(pesanan.layanan, 'reguler');
    assert.equal(pesanan.items.length, 1);
    assert.equal(pesanan.items[0].harga, 15000);
    assert.equal(pesanan.items[0].nama, 'Rempeyek Kacang Tanah');
    assert.equal(pesanan.items[0].berat_gram, 250);
  });

  it('harga berubah sesudah form diisi: total memakai harga terbaru dari DB', async () => {
    const lama = await buatPesanan(db, input({ items: [{ produkId: kacang.id, jumlah: 1 }] }));
    assert.equal(lama.ok, true);
    if (!lama.ok) return;

    const sebelum = await ambilPesananByNomor(db, lama.data.nomor);
    assert.equal(sebelum?.total, 15000 + 9000);

    // Admin menaikkan harga setelah pembeli membuka form, sebelum submit.
    await simpanProduk(
      db,
      {
        nama: 'Rempeyek Kacang Tanah',
        kategori: 'rempeyek',
        deskripsi: 'Uji',
        harga: 20000,
        berat_gram: 250,
        gambar: [],
        status: 'tersedia',
        warna_isian: '#9A5B22',
      },
      kacang.id,
    );

    const baru = await buatPesanan(db, input({ items: [{ produkId: kacang.id, jumlah: 1 }] }));
    assert.equal(baru.ok, true);
    if (!baru.ok) return;
    assert.equal(baru.data.total, 20000 + 9000);

    // Pesanan lama TIDAK boleh ikut berubah.
    const sesudah = await ambilPesananByNomor(db, lama.data.nomor);
    assert.equal(sesudah?.subtotal, 15000);
    assert.equal(sesudah?.total, 24000);
    assert.equal(sesudah?.items[0].harga, 15000);

    // Kembalikan harga semula agar tes berikutnya tidak terpengaruh.
    await simpanProduk(
      db,
      {
        nama: 'Rempeyek Kacang Tanah',
        kategori: 'rempeyek',
        deskripsi: 'Uji',
        harga: 15000,
        berat_gram: 250,
        gambar: [],
        status: 'tersedia',
        warna_isian: '#9A5B22',
      },
      kacang.id,
    );
  });

  describe('penolakan', () => {
    const tolak: Array<[string, Partial<InputPesanan>]> = [
      ['jumlah 0', { items: [{ produkId: -1, jumlah: 0 }] }],
      ['jumlah -1', { items: [{ produkId: -1, jumlah: -1 }] }],
      ['jumlah 1,5', { items: [{ produkId: -1, jumlah: 1.5 }] }],
      ['jumlah 100', { items: [{ produkId: -1, jumlah: 100 }] }],
      ['items kosong', { items: [] }],
      ['provinsi Atlantis', { provinsi: 'Atlantis', items: [{ produkId: -1, jumlah: 1 }] }],
      ['kode ongkir xyz', { kodeOngkir: 'xyz', items: [{ produkId: -1, jumlah: 1 }] }],
      ['nama 1 huruf', { nama: 'B', items: [{ produkId: -1, jumlah: 1 }] }],
      ['HP 12345', { hp: '12345', items: [{ produkId: -1, jumlah: 1 }] }],
      ['alamat terlalu pendek', { alamat: 'Jl. A', items: [{ produkId: -1, jumlah: 1 }] }],
    ];

    for (const [nama, timpa] of tolak) {
      it(`menolak ${nama}`, async () => {
        // `produkId: -1` diganti produk asli oleh pemanggil di bawah.
        const isian = {
          ...timpa,
          items: (timpa.items ?? []).map((i) => ({ ...i, produkId: kacang.id })),
        };
        const hasil = await buatPesanan(db, input(isian));
        assert.equal(hasil.ok, false, `${nama} seharusnya ditolak`);
        if (!hasil.ok) assert.ok(hasil.galat.length > 0);
      });
    }

    it('menolak produk berstatus habis', async () => {
      const hasil = await buatPesanan(db, input({ items: [{ produkId: habis.id, jumlah: 1 }] }));
      assert.equal(hasil.ok, false);
    });

    it('menolak produk yang diarsipkan', async () => {
      const arsip = await simpanProduk(db, {
        nama: 'Produk Arsip',
        kategori: 'sambal',
        deskripsi: 'Uji',
        harga: 8000,
        berat_gram: 100,
        gambar: [],
        status: 'tersedia',
        warna_isian: '#000000',
      });
      await db.execute({ sql: 'UPDATE produk SET diarsipkan = 1 WHERE id = ?', args: [arsip.id] });

      const hasil = await buatPesanan(db, input({ items: [{ produkId: arsip.id, jumlah: 1 }] }));
      assert.equal(hasil.ok, false);
    });

    it('menolak produk yang tidak ada', async () => {
      const hasil = await buatPesanan(db, input({ items: [{ produkId: 99999, jumlah: 1 }] }));
      assert.equal(hasil.ok, false);
    });

    it('tidak menyimpan pesanan apa pun saat ditolak', async () => {
      const sebelum = await db.execute('SELECT COUNT(*) AS jumlah FROM pesanan');
      await buatPesanan(db, input({ items: [] }));
      const sesudah = await db.execute('SELECT COUNT(*) AS jumlah FROM pesanan');
      assert.equal(Number(sesudah.rows[0].jumlah), Number(sebelum.rows[0].jumlah));
    });
  });

  describe('transisi status', () => {
    /** Membuat pesanan baru dan mengembalikan id + nomornya. */
    async function pesananBaru(): Promise<{ id: number; nomor: string }> {
      const hasil = await buatPesanan(db, input({ items: [{ produkId: kacang.id, jumlah: 1 }] }));
      assert.equal(hasil.ok, true);
      if (!hasil.ok) throw new Error('gagal menyiapkan pesanan');
      const lengkap = await ambilPesananByNomor(db, hasil.data.nomor);
      assert.ok(lengkap);
      return { id: lengkap.id, nomor: lengkap.nomor };
    }

    it('tandaiDibayar dua kali: yang kedua ditolak', async () => {
      const { id } = await pesananBaru();

      const pertama = await tandaiDibayar(db, id);
      assert.equal(pertama.ok, true);

      const kedua = await tandaiDibayar(db, id);
      assert.equal(kedua.ok, false);

      const pesanan = await ambilPesanan(db, id);
      assert.equal(pesanan?.status, 'dibayar');
      assert.ok(pesanan?.dibayarPada);
    });

    it('kirimDenganResi ditolak bila belum dibayar', async () => {
      const { id } = await pesananBaru();
      const hasil = await kirimDenganResi(db, id);
      assert.equal(hasil.ok, false);
    });

    it('kirimDenganResi membuat resi DEMO- dan mengubah status ke dikirim', async () => {
      const { id } = await pesananBaru();
      await tandaiDibayar(db, id);

      const hasil = await kirimDenganResi(db, id);
      assert.equal(hasil.ok, true);
      if (!hasil.ok) return;
      assert.match(hasil.data.resi, /^DEMO-/);

      const pesanan = await ambilPesanan(db, id);
      assert.equal(pesanan?.status, 'dikirim');
      assert.equal(pesanan?.resi, hasil.data.resi);
      assert.ok(pesanan?.dikirimPada);
    });

    it('kirimDenganResi dua kali: yang kedua ditolak dan resi tidak berubah', async () => {
      const { id } = await pesananBaru();
      await tandaiDibayar(db, id);

      const pertama = await kirimDenganResi(db, id);
      assert.equal(pertama.ok, true);
      if (!pertama.ok) return;

      const kedua = await kirimDenganResi(db, id);
      assert.equal(kedua.ok, false);

      const pesanan = await ambilPesanan(db, id);
      assert.equal(pesanan?.resi, pertama.data.resi);
    });

    it('tandaiDibayar tetap boleh pada pesanan berumur 25 jam', async () => {
      const t0 = new Date('2026-11-12T00:00:00.000Z');
      const hasil = await buatPesanan(
        db,
        input({ items: [{ produkId: kacang.id, jumlah: 1 }] }),
        t0,
      );
      assert.equal(hasil.ok, true);
      if (!hasil.ok) return;

      const lengkap = await ambilPesananByNomor(db, hasil.data.nomor);
      assert.ok(lengkap);

      const bayar = await tandaiDibayar(db, lengkap.id, new Date(t0.getTime() + 25 * 60 * 60 * 1000));
      assert.equal(bayar.ok, true);
      assert.equal((await ambilPesanan(db, lengkap.id))?.status, 'dibayar');
    });

    it('batalkan dari dikirim ditolak', async () => {
      const { id } = await pesananBaru();
      await tandaiDibayar(db, id);
      await kirimDenganResi(db, id);

      const hasil = await batalkan(db, id);
      assert.equal(hasil.ok, false);
      assert.equal((await ambilPesanan(db, id))?.status, 'dikirim');
    });

    it('batalkan dari menunggu_pembayaran diterima', async () => {
      const { id } = await pesananBaru();
      const hasil = await batalkan(db, id);
      assert.equal(hasil.ok, true);

      const pesanan = await ambilPesanan(db, id);
      assert.equal(pesanan?.status, 'batal');
      assert.ok(pesanan?.dibatalkanPada);
    });

    it('tandaiSelesai hanya dari dikirim', async () => {
      const { id } = await pesananBaru();
      await tandaiDibayar(db, id);

      const terlaluAwal = await tandaiSelesai(db, id);
      assert.equal(terlaluAwal.ok, false);

      await kirimDenganResi(db, id);
      const selesai = await tandaiSelesai(db, id);
      assert.equal(selesai.ok, true);
      assert.equal((await ambilPesanan(db, id))?.status, 'selesai');
    });

    it('aksi pada id yang tidak ada ditolak, bukan melempar', async () => {
      assert.equal((await tandaiDibayar(db, 999999)).ok, false);
      assert.equal((await batalkan(db, 999999)).ok, false);
      assert.equal((await kirimDenganResi(db, 999999)).ok, false);
      assert.equal((await tandaiSelesai(db, 999999)).ok, false);
    });
  });

  describe('lacakByResi', () => {
    it('menemukan pesanan walau resi diketik kecil dan berspasi', async () => {
      const dibuat = await buatPesanan(db, input({ items: [{ produkId: kacang.id, jumlah: 2 }] }));
      assert.equal(dibuat.ok, true);
      if (!dibuat.ok) return;

      const lengkap = await ambilPesananByNomor(db, dibuat.data.nomor);
      assert.ok(lengkap);
      await tandaiDibayar(db, lengkap.id);
      const kirim = await kirimDenganResi(db, lengkap.id);
      assert.equal(kirim.ok, true);
      if (!kirim.ok) return;

      const berantakan = `  ${kirim.data.resi.toLowerCase()} `;
      const hasil = await lacakByResi(db, berantakan);
      assert.ok(hasil);
      assert.equal(hasil.resi, kirim.data.resi);
      assert.equal(hasil.status, 'dikirim');
      assert.equal(hasil.kurir, 'Demo Express');
      assert.ok(hasil.dikirimPada);
      assert.deepEqual(hasil.ringkasan, [{ nama: 'Rempeyek Kacang Tanah', jumlah: 2 }]);
    });

    it('resi tidak dikenal menghasilkan null', async () => {
      assert.equal(await lacakByResi(db, 'DEMO-TIDAKADA'), null);
    });

    it('hasil tidak memuat alamat, hp, atau nama pembeli', async () => {
      const dibuat = await buatPesanan(db, input({ items: [{ produkId: kacang.id, jumlah: 1 }] }));
      assert.equal(dibuat.ok, true);
      if (!dibuat.ok) return;

      const lengkap = await ambilPesananByNomor(db, dibuat.data.nomor);
      assert.ok(lengkap);
      await tandaiDibayar(db, lengkap.id);
      const kirim = await kirimDenganResi(db, lengkap.id);
      assert.equal(kirim.ok, true);
      if (!kirim.ok) return;

      const hasil = await lacakByResi(db, kirim.data.resi);
      assert.ok(hasil);
      const kunci = Object.keys(hasil);
      for (const terlarang of ['alamat', 'hp', 'nama']) {
        assert.ok(!kunci.includes(terlarang), `kunci ${terlarang} bocor`);
      }
    });
  });

  describe('daftarPesanan', () => {
    it('mengembalikan pesanan terbaru lebih dulu', async () => {
      const daftar = await daftarPesanan(db);
      assert.ok(daftar.length > 1);
      for (let i = 1; i < daftar.length; i += 1) {
        assert.ok(daftar[i - 1].id >= daftar[i].id, 'urutan harus menurun');
      }
    });

    it('menyaring berdasarkan status tampil', async () => {
      const batal = await daftarPesanan(db, { status: 'batal' });
      assert.ok(batal.length > 0);
      assert.ok(batal.every((p) => p.status === 'batal'));
    });

    it('menyaring kedaluwarsa memakai umur 24 jam', async () => {
      const t0 = new Date('2026-01-01T00:00:00.000Z');
      const dibuat = await buatPesanan(
        db,
        input({ items: [{ produkId: kacang.id, jumlah: 1 }] }),
        t0,
      );
      assert.equal(dibuat.ok, true);

      const belum = await daftarPesanan(db, { status: 'kedaluwarsa' }, t0);
      assert.equal(belum.length, 0);

      const sesudah = await daftarPesanan(
        db,
        { status: 'kedaluwarsa' },
        new Date(t0.getTime() + 25 * 60 * 60 * 1000),
      );
      assert.ok(sesudah.length > 0);
      assert.ok(sesudah.every((p) => p.status === 'kedaluwarsa'));
    });

    it('tanpa filter memakai status tampil, bukan status mentah', async () => {
      const t0 = new Date('2026-02-01T00:00:00.000Z');
      await buatPesanan(db, input({ items: [{ produkId: kacang.id, jumlah: 1 }] }), t0);

      const daftar = await daftarPesanan(db, undefined, new Date(t0.getTime() + 25 * 60 * 60 * 1000));
      const nomor = daftar.filter((p) => p.dibuat === t0.toISOString());
      assert.ok(nomor.length > 0);
      assert.equal(nomor[0].status, 'kedaluwarsa');
    });
  });
});
