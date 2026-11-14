// src/lib/pesanan-repo.ts
//
// Repositori pesanan: satu-satunya tempat SQL tabel `pesanan` dan
// `item_pesanan` ditulis.
//
// Dua prinsip yang dijaga di sini (Review Focus 1 & 3):
//   1. Harga, nama, dan berat SELALU disalin dari database saat pesanan dibuat.
//      Angka dari browser tidak pernah dipakai untuk menghitung total.
//   2. Setiap perpindahan status memakai pembaruan kondisional
//      (`UPDATE ... WHERE id = ? AND status = ?`), sehingga klik ganda tidak
//      menghasilkan perubahan kedua.

import type { Client } from '@libsql/client';

import { hitungBeratTotal, hitungSubtotal } from './hitung';
import { buatNomorPesanan, buatResiDemo, normalisasiResi } from './kode';
import { cariOpsi } from './ongkir';
import { ambilProdukById } from './produk-repo';
import { bolehPindah, statusTampil, type StatusPesanan } from './status';

/** Hasil operasi yang bisa gagal karena aturan bisnis, bukan karena bug. */
export type Hasil<T> = { ok: true; data: T } | { ok: false; galat: string };

export type InputPesanan = {
  nama: string;
  hp: string;
  alamat: string;
  provinsi: string;
  kota: string;
  kodeOngkir: string;
  items: { produkId: number; jumlah: number }[];
};

export type ItemPesananDb = {
  id: number;
  pesananId: number;
  produkId: number;
  nama: string;
  harga: number;
  berat_gram: number;
  jumlah: number;
};

export type PesananLengkap = {
  id: number;
  nomor: string;
  nama: string;
  hp: string;
  alamat: string;
  provinsi: string;
  kota: string;
  kurir: string;
  layanan: string;
  ongkir: number;
  subtotal: number;
  total: number;
  status: StatusPesanan;
  resi: string | null;
  dibuat: string;
  dibayarPada: string | null;
  dikirimPada: string | null;
  selesaiPada: string | null;
  dibatalkanPada: string | null;
  items: ItemPesananDb[];
};

/** Pesanan pada daftar: statusnya sudah memperhitungkan kedaluwarsa. */
export type PesananTampil = Omit<PesananLengkap, 'status'> & {
  status: StatusPesanan | 'kedaluwarsa';
};

const KOLOM_PESANAN = `id, nomor, nama, hp, alamat, provinsi, kota, kurir, layanan, ongkir,
  subtotal, total, status, resi, dibuat, dibayar_pada, dikirim_pada, selesai_pada, dibatalkan_pada`;

const KOLOM_ITEM = `id, pesanan_id, produk_id, nama, harga, berat_gram, jumlah`;

type TanpaItems = Omit<PesananLengkap, 'items'>;

function kePesanan(baris: Record<string, unknown>): TanpaItems {
  return {
    id: Number(baris.id),
    nomor: String(baris.nomor),
    nama: String(baris.nama),
    hp: String(baris.hp),
    alamat: String(baris.alamat),
    provinsi: String(baris.provinsi),
    kota: String(baris.kota),
    kurir: String(baris.kurir),
    layanan: String(baris.layanan),
    ongkir: Number(baris.ongkir),
    subtotal: Number(baris.subtotal),
    total: Number(baris.total),
    status: keStatusPesanan(String(baris.status)),
    resi: baris.resi === null || baris.resi === undefined ? null : String(baris.resi),
    dibuat: String(baris.dibuat),
    dibayarPada: teksAtauNull(baris.dibayar_pada),
    dikirimPada: teksAtauNull(baris.dikirim_pada),
    selesaiPada: teksAtauNull(baris.selesai_pada),
    dibatalkanPada: teksAtauNull(baris.dibatalkan_pada),
  };
}

function keItem(baris: Record<string, unknown>): ItemPesananDb {
  return {
    id: Number(baris.id),
    pesananId: Number(baris.pesanan_id),
    produkId: Number(baris.produk_id),
    nama: String(baris.nama),
    harga: Number(baris.harga),
    berat_gram: Number(baris.berat_gram),
    jumlah: Number(baris.jumlah),
  };
}

function keStatusPesanan(nilai: string): StatusPesanan {
  if (
    nilai === 'dibayar' ||
    nilai === 'dikirim' ||
    nilai === 'selesai' ||
    nilai === 'batal'
  ) {
    return nilai;
  }
  return 'menunggu_pembayaran';
}

function teksAtauNull(nilai: unknown): string | null {
  return nilai === null || nilai === undefined ? null : String(nilai);
}

/**
 * Menormalkan nomor HP Indonesia ke bentuk `62...`.
 * Menerima `+62`, `62`, atau `0` di depan; spasi dan tanda hubung dibuang.
 *
 * @returns Nomor ternormalisasi, atau `null` bila tidak berbentuk HP Indonesia.
 */
function normalisasiHp(hp: string): string | null {
  const bersih = hp.replace(/[\s-]/g, '');
  if (!/^(\+62|62|0)8\d{7,12}$/.test(bersih)) return null;
  if (bersih.startsWith('+62')) return bersih.slice(1);
  if (bersih.startsWith('62')) return bersih;
  return `62${bersih.slice(1)}`;
}

/** Apakah galat berasal dari pelanggaran constraint UNIQUE? */
function galatUnik(galat: unknown): boolean {
  const pesan = galat instanceof Error ? galat.message : String(galat);
  return /UNIQUE constraint failed/i.test(pesan);
}

/**
 * Membuat pesanan tamu beserta itemnya dalam SATU transaksi.
 *
 * Semua harga, nama, dan berat dibaca ulang dari tabel `produk`; nilai dari
 * pemanggil hanya menentukan produk mana dan berapa banyak. Ongkir dihitung
 * dari total berat dan provinsi tujuan memakai `cariOpsi`.
 *
 * @param sekarang Waktu pembuatan pesanan (bisa dimajukan di tes).
 */
export async function buatPesanan(
  db: Client,
  input: InputPesanan,
  sekarang: Date = new Date(),
): Promise<Hasil<{ nomor: string; total: number }>> {
  const nama = input.nama.trim();
  if (nama.length < 2) return { ok: false, galat: 'nama minimal 2 karakter' };
  if (nama.length > 80) return { ok: false, galat: 'nama maksimal 80 karakter' };

  const hp = normalisasiHp(input.hp);
  if (hp === null) return { ok: false, galat: 'nomor HP tidak valid' };

  const alamat = input.alamat.trim();
  if (alamat.length < 10) return { ok: false, galat: 'alamat minimal 10 karakter' };

  const kota = input.kota.trim();
  if (kota === '') return { ok: false, galat: 'kota belum diisi' };

  if (input.items.length === 0) return { ok: false, galat: 'keranjang masih kosong' };

  const item: { produkId: number; nama: string; harga: number; berat_gram: number; jumlah: number }[] = [];

  for (const baris of input.items) {
    if (!Number.isInteger(baris.jumlah) || baris.jumlah < 1 || baris.jumlah > 99) {
      return { ok: false, galat: 'jumlah harus bilangan bulat 1 sampai 99' };
    }

    const produk = await ambilProdukById(db, baris.produkId);
    if (produk === null) return { ok: false, galat: 'produk tidak ditemukan' };
    if (produk.diarsipkan) {
      return { ok: false, galat: `produk ${produk.nama} sudah tidak dijual` };
    }
    if (produk.status === 'habis') {
      return { ok: false, galat: `produk ${produk.nama} sedang habis` };
    }

    item.push({
      produkId: produk.id,
      nama: produk.nama,
      harga: produk.harga,
      berat_gram: produk.berat_gram,
      jumlah: baris.jumlah,
    });
  }

  const subtotal = hitungSubtotal(item);
  const beratGram = hitungBeratTotal(item);

  let ongkir;
  try {
    ongkir = cariOpsi({ beratGram, provinsi: input.provinsi }, input.kodeOngkir);
  } catch {
    return { ok: false, galat: 'provinsi tidak dikenal' };
  }
  if (ongkir === null) return { ok: false, galat: 'pilihan ongkir tidak dikenal' };

  const total = subtotal + ongkir.tarif;
  const dibuat = sekarang.toISOString();

  // Nomor pesanan acak bisa (walau sangat jarang) bentrok di UNIQUE. Ulangi
  // dengan nomor baru alih-alih menggagalkan pesanan pembeli.
  for (let percobaan = 0; percobaan < 5; percobaan += 1) {
    const nomor = buatNomorPesanan();

    const pernyataan = [
      {
        sql: `INSERT INTO pesanan
                (nomor, nama, hp, alamat, provinsi, kota, kurir, layanan,
                 ongkir, subtotal, total, status, dibuat)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'menunggu_pembayaran', ?)`,
        args: [
          nomor,
          nama,
          hp,
          alamat,
          input.provinsi,
          kota,
          ongkir.kurir,
          ongkir.kode,
          ongkir.tarif,
          subtotal,
          total,
          dibuat,
        ],
      },
      ...item.map((i) => ({
        // Item dirujuk lewat nomor, bukan id: `db.batch` menjalankan semua
        // pernyataan dalam satu transaksi, jadi subquery ini melihat baris
        // pesanan yang baru saja disisipkan.
        sql: `INSERT INTO item_pesanan (pesanan_id, produk_id, nama, harga, berat_gram, jumlah)
              VALUES ((SELECT id FROM pesanan WHERE nomor = ?), ?, ?, ?, ?, ?)`,
        args: [nomor, i.produkId, i.nama, i.harga, i.berat_gram, i.jumlah],
      })),
    ];

    try {
      await db.batch(pernyataan, 'write');
      return { ok: true, data: { nomor, total } };
    } catch (galat) {
      if (!galatUnik(galat)) throw galat;
    }
  }

  return { ok: false, galat: 'gagal membuat nomor pesanan unik' };
}

/** Item untuk sekumpulan pesanan, satu query (menghindari N+1). */
async function itemUntuk(db: Client, ids: number[]): Promise<ItemPesananDb[]> {
  if (ids.length === 0) return [];
  const tanda = ids.map(() => '?').join(', ');
  const hasil = await db.execute({
    sql: `SELECT ${KOLOM_ITEM} FROM item_pesanan WHERE pesanan_id IN (${tanda}) ORDER BY id`,
    args: ids,
  });
  return hasil.rows.map((baris) => keItem(baris as Record<string, unknown>));
}

/** Satu pesanan lengkap dengan itemnya; `null` bila tidak ada. */
export async function ambilPesanan(db: Client, id: number): Promise<PesananLengkap | null> {
  const hasil = await db.execute({
    sql: `SELECT ${KOLOM_PESANAN} FROM pesanan WHERE id = ?`,
    args: [id],
  });
  const baris = hasil.rows[0];
  if (baris === undefined) return null;

  const pesanan = kePesanan(baris as Record<string, unknown>);
  const items = await itemUntuk(db, [pesanan.id]);
  return { ...pesanan, items };
}

/** Satu pesanan lengkap dicari lewat nomornya. */
export async function ambilPesananByNomor(
  db: Client,
  nomor: string,
): Promise<PesananLengkap | null> {
  const hasil = await db.execute({
    sql: `SELECT ${KOLOM_PESANAN} FROM pesanan WHERE nomor = ?`,
    args: [nomor],
  });
  const baris = hasil.rows[0];
  if (baris === undefined) return null;

  const pesanan = kePesanan(baris as Record<string, unknown>);
  const items = await itemUntuk(db, [pesanan.id]);
  return { ...pesanan, items };
}

/**
 * Daftar pesanan, terbaru lebih dulu.
 *
 * Status yang dikembalikan adalah status TAMPIL (`statusTampil`), jadi
 * `menunggu_pembayaran` yang lewat 24 jam muncul sebagai `'kedaluwarsa'`
 * tanpa mengubah isi database. Penyaringan memakai status tampil itu juga,
 * supaya tab "Menunggu pembayaran" tidak berisi pesanan kedaluwarsa.
 */
export async function daftarPesanan(
  db: Client,
  filter?: { status?: StatusPesanan | 'kedaluwarsa' },
  sekarang: Date = new Date(),
): Promise<PesananTampil[]> {
  const hasil = await db.execute(`SELECT ${KOLOM_PESANAN} FROM pesanan ORDER BY id DESC`);
  const dasar = hasil.rows.map((baris) => kePesanan(baris as Record<string, unknown>));

  const items = await itemUntuk(db, dasar.map((p) => p.id));

  const lengkap: PesananTampil[] = dasar.map((p) => ({
    ...p,
    status: statusTampil(p, sekarang),
    items: items.filter((i) => i.pesananId === p.id),
  }));

  if (filter?.status === undefined) return lengkap;
  const dicari = filter.status;
  return lengkap.filter((p) => p.status === dicari);
}

type KolomWaktu = 'dibayar_pada' | 'dikirim_pada' | 'selesai_pada' | 'dibatalkan_pada';

/** Status mentah dari database, tanpa memuat item. */
async function statusMentah(db: Client, id: number): Promise<StatusPesanan | null> {
  const hasil = await db.execute({ sql: 'SELECT status FROM pesanan WHERE id = ?', args: [id] });
  const baris = hasil.rows[0];
  return baris === undefined ? null : keStatusPesanan(String(baris.status));
}

/**
 * Perpindahan status generik.
 *
 * Urutannya penting: baca status, tolak bila transisinya tidak sah, lalu
 * `UPDATE ... WHERE id = ? AND status = ?` memakai status yang tadi dibaca.
 * Bila ada permintaan lain yang lebih dulu mengubah baris, `rowsAffected` = 0
 * dan perubahan kedua tidak terjadi (Review Focus 3).
 */
async function pindahStatus(
  db: Client,
  id: number,
  ke: StatusPesanan,
  kolomWaktu: KolomWaktu,
  sekarang: Date,
): Promise<Hasil<{ status: StatusPesanan }>> {
  const dari = await statusMentah(db, id);
  if (dari === null) return { ok: false, galat: 'pesanan tidak ditemukan' };
  if (!bolehPindah(dari, ke)) {
    return { ok: false, galat: `status ${dari} tidak bisa diubah menjadi ${ke}` };
  }

  const hasil = await db.execute({
    sql: `UPDATE pesanan SET status = ?, ${kolomWaktu} = ? WHERE id = ? AND status = ?`,
    args: [ke, sekarang.toISOString(), id, dari],
  });

  if (hasil.rowsAffected === 0) {
    return { ok: false, galat: 'status pesanan sudah berubah, muat ulang halaman' };
  }
  return { ok: true, data: { status: ke } };
}

/** menunggu_pembayaran → dibayar. Tetap boleh walau sudah lewat 24 jam. */
export async function tandaiDibayar(
  db: Client,
  id: number,
  sekarang: Date = new Date(),
): Promise<Hasil<{ status: StatusPesanan }>> {
  return pindahStatus(db, id, 'dibayar', 'dibayar_pada', sekarang);
}

/** menunggu_pembayaran atau dibayar → batal. */
export async function batalkan(
  db: Client,
  id: number,
  sekarang: Date = new Date(),
): Promise<Hasil<{ status: StatusPesanan }>> {
  return pindahStatus(db, id, 'batal', 'dibatalkan_pada', sekarang);
}

/** dikirim → selesai. */
export async function tandaiSelesai(
  db: Client,
  id: number,
  sekarang: Date = new Date(),
): Promise<Hasil<{ status: StatusPesanan }>> {
  return pindahStatus(db, id, 'selesai', 'selesai_pada', sekarang);
}

/**
 * dibayar → dikirim, sekaligus membuat nomor resi demo.
 *
 * `resi` punya constraint UNIQUE. Bila nomor acak kebetulan bentrok, ulangi
 * dengan nomor baru — jangan sampai pesanan gagal terkirim karena itu.
 */
export async function kirimDenganResi(
  db: Client,
  id: number,
  sekarang: Date = new Date(),
): Promise<Hasil<{ resi: string }>> {
  const dari = await statusMentah(db, id);
  if (dari === null) return { ok: false, galat: 'pesanan tidak ditemukan' };
  if (!bolehPindah(dari, 'dikirim')) {
    return { ok: false, galat: `status ${dari} tidak bisa diubah menjadi dikirim` };
  }

  for (let percobaan = 0; percobaan < 5; percobaan += 1) {
    const resi = buatResiDemo();
    try {
      const hasil = await db.execute({
        sql: `UPDATE pesanan
                 SET status = 'dikirim', resi = ?, dikirim_pada = ?
               WHERE id = ? AND status = ?`,
        args: [resi, sekarang.toISOString(), id, dari],
      });

      if (hasil.rowsAffected === 0) {
        return { ok: false, galat: 'status pesanan sudah berubah, muat ulang halaman' };
      }
      return { ok: true, data: { resi } };
    } catch (galat) {
      if (!galatUnik(galat)) throw galat;
    }
  }

  return { ok: false, galat: 'gagal membuat nomor resi unik' };
}

/**
 * Mencari pesanan lewat nomor resi, untuk halaman lacak publik.
 *
 * Sengaja TIDAK mengembalikan alamat, nomor HP, atau nama pembeli: siapa pun
 * yang tahu nomor resi boleh melihat status, bukan data pribadi (spec §21).
 */
export async function lacakByResi(
  db: Client,
  resiMentah: string,
): Promise<null | {
  resi: string;
  status: StatusPesanan;
  kurir: string;
  dikirimPada: string | null;
  ringkasan: { nama: string; jumlah: number }[];
}> {
  const resi = normalisasiResi(resiMentah);
  if (resi === '') return null;

  const hasil = await db.execute({
    sql: `SELECT ${KOLOM_PESANAN} FROM pesanan WHERE UPPER(TRIM(resi)) = ?`,
    args: [resi],
  });
  const baris = hasil.rows[0];
  if (baris === undefined) return null;

  const pesanan = kePesanan(baris as Record<string, unknown>);
  const items = await itemUntuk(db, [pesanan.id]);

  return {
    resi: pesanan.resi ?? resi,
    status: pesanan.status,
    kurir: pesanan.kurir,
    dikirimPada: pesanan.dikirimPada,
    ringkasan: items.map((i) => ({ nama: i.nama, jumlah: i.jumlah })),
  };
}



