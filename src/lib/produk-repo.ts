// src/lib/produk-repo.ts
//
// Repositori produk: satu-satunya tempat SQL tabel `produk` ditulis.
//
// Semua fungsi menerima `db: Client` sebagai argumen pertama supaya bisa diuji
// dengan SQLite dalam memori (pola yang sama dengan `migrate()` di Task 1).

import type { Client } from '@libsql/client';

import { buatSlug } from './slug';

export type ProdukDb = {
  id: number;
  slug: string;
  nama: string;
  kategori: 'rempeyek' | 'sambal';
  deskripsi: string;
  harga: number;
  berat_gram: number;
  gambar: string[];
  status: 'tersedia' | 'po' | 'habis';
  warna_isian: string;
  diarsipkan: boolean;
};

/** Field yang diisi admin. `slug` diturunkan dari `nama` saat produk dibuat. */
export type InputProduk = Omit<ProdukDb, 'id' | 'slug' | 'diarsipkan'>;

/** Kolom yang dibaca, dalam urutan tetap supaya pemetaan baris konsisten. */
const KOLOM = `id, slug, nama, kategori, deskripsi, harga, berat_gram, gambar, status, warna_isian, diarsipkan`;

/**
 * Mengubah satu baris SQLite jadi `ProdukDb`.
 * `gambar` disimpan sebagai teks JSON; `diarsipkan` sebagai 0/1.
 */
function keProdukDb(baris: Record<string, unknown>): ProdukDb {
  return {
    id: Number(baris.id),
    slug: String(baris.slug),
    nama: String(baris.nama),
    kategori: String(baris.kategori) === 'sambal' ? 'sambal' : 'rempeyek',
    deskripsi: String(baris.deskripsi),
    harga: Number(baris.harga),
    berat_gram: Number(baris.berat_gram),
    gambar: bacaGambar(baris.gambar),
    status: keStatus(String(baris.status)),
    warna_isian: String(baris.warna_isian),
    diarsipkan: Number(baris.diarsipkan) === 1,
  };
}

function keStatus(nilai: string): ProdukDb['status'] {
  return nilai === 'po' || nilai === 'habis' ? nilai : 'tersedia';
}

/**
 * `gambar` adalah teks JSON. Baris rusak/kosong tidak boleh menjatuhkan
 * seluruh halaman katalog — anggap saja tidak ada gambar.
 */
function bacaGambar(nilai: unknown): string[] {
  if (typeof nilai !== 'string' || nilai.trim() === '') return [];
  try {
    const hasil: unknown = JSON.parse(nilai);
    return Array.isArray(hasil) ? hasil.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Produk yang tampil di katalog: belum diarsipkan, urut id menaik. */
export async function daftarProdukTampil(db: Client): Promise<ProdukDb[]> {
  const hasil = await db.execute(
    `SELECT ${KOLOM} FROM produk WHERE diarsipkan = 0 ORDER BY id`,
  );
  return hasil.rows.map((baris) => keProdukDb(baris as Record<string, unknown>));
}

/** Semua produk, termasuk yang diarsipkan. Untuk layar admin. */
export async function daftarProdukAdmin(db: Client): Promise<ProdukDb[]> {
  const hasil = await db.execute(`SELECT ${KOLOM} FROM produk ORDER BY id`);
  return hasil.rows.map((baris) => keProdukDb(baris as Record<string, unknown>));
}

export async function ambilProdukBySlug(db: Client, slug: string): Promise<ProdukDb | null> {
  const hasil = await db.execute({
    sql: `SELECT ${KOLOM} FROM produk WHERE slug = ?`,
    args: [slug],
  });
  const baris = hasil.rows[0];
  return baris === undefined ? null : keProdukDb(baris as Record<string, unknown>);
}

export async function ambilProdukById(db: Client, id: number): Promise<ProdukDb | null> {
  const hasil = await db.execute({
    sql: `SELECT ${KOLOM} FROM produk WHERE id = ?`,
    args: [id],
  });
  const baris = hasil.rows[0];
  return baris === undefined ? null : keProdukDb(baris as Record<string, unknown>);
}

/**
 * Membuat produk baru (tanpa `id`) atau mengubah yang sudah ada (dengan `id`).
 *
 * Slug hanya dibuat saat produk baru. Mengubah nama produk lama sengaja TIDAK
 * mengganti slug: URL yang sudah dibagikan dan tautan di sitemap harus tetap
 * hidup (spec §89 tentang kesegaran katalog).
 *
 * @returns Produk yang tersimpan, dibaca ulang dari database.
 */
export async function simpanProduk(
  db: Client,
  input: InputProduk,
  id?: number,
): Promise<ProdukDb> {
  const gambar = JSON.stringify(input.gambar);

  if (id !== undefined) {
    await db.execute({
      sql: `UPDATE produk
               SET nama = ?, kategori = ?, deskripsi = ?, harga = ?, berat_gram = ?,
                   gambar = ?, status = ?, warna_isian = ?
             WHERE id = ?`,
      args: [
        input.nama,
        input.kategori,
        input.deskripsi,
        input.harga,
        input.berat_gram,
        gambar,
        input.status,
        input.warna_isian,
        id,
      ],
    });
    const tersimpan = await ambilProdukById(db, id);
    if (tersimpan === null) {
      throw new Error('produk tidak ditemukan');
    }
    return tersimpan;
  }

  // Produk baru: cari slug bebas. Kalau dua admin menyimpan bersamaan, INSERT
  // kedua gagal di UNIQUE; ulangi dengan daftar slug terbaru alih-alih menyerah.
  for (let percobaan = 0; percobaan < 5; percobaan += 1) {
    const ada = await db.execute('SELECT slug FROM produk');
    const sudahAda = ada.rows.map((baris) => String(baris.slug));
    const slug = buatSlug(input.nama, sudahAda);

    try {
      const hasil = await db.execute({
        sql: `INSERT INTO produk
                (slug, nama, kategori, deskripsi, harga, berat_gram, gambar, status, warna_isian)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          slug,
          input.nama,
          input.kategori,
          input.deskripsi,
          input.harga,
          input.berat_gram,
          gambar,
          input.status,
          input.warna_isian,
        ],
      });
      const tersimpan = await ambilProdukById(db, Number(hasil.lastInsertRowid));
      if (tersimpan !== null) return tersimpan;
    } catch (galat) {
      if (!galatUnik(galat)) throw galat;
    }
  }

  throw new Error('gagal membuat slug unik untuk produk');
}

/** Apakah galat berasal dari pelanggaran constraint UNIQUE? */
function galatUnik(galat: unknown): boolean {
  const pesan = galat instanceof Error ? galat.message : String(galat);
  return /UNIQUE constraint failed/i.test(pesan);
}

/**
 * Menghapus produk, atau mengarsipkannya bila sudah pernah masuk pesanan.
 *
 * Baris produk tidak boleh hilang selama `item_pesanan` masih menunjuknya:
 * laporan penjualan membaca harga dan nama dari item pesanan, dan `produk_id`
 * di sana akan jadi rujukan mati.
 *
 * @returns `'dihapus'` bila baris benar-benar hilang, `'diarsipkan'` bila
 *          hanya ditandai (masih tampil di admin, tidak tampil di katalog).
 */
export async function hapusProduk(db: Client, id: number): Promise<'dihapus' | 'diarsipkan'> {
  const dipakai = await db.execute({
    sql: 'SELECT COUNT(*) AS jumlah FROM item_pesanan WHERE produk_id = ?',
    args: [id],
  });

  if (Number(dipakai.rows[0]?.jumlah ?? 0) > 0) {
    await db.execute({
      sql: 'UPDATE produk SET diarsipkan = 1 WHERE id = ?',
      args: [id],
    });
    return 'diarsipkan';
  }

  await db.execute({ sql: 'DELETE FROM produk WHERE id = ?', args: [id] });
  return 'dihapus';
}

