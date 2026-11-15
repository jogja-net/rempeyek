// src/lib/db/schema.ts
//
// Skema marketplace sebagai string SQL. Ditulis sebagai satu string (dipisah
// pernyataan) supaya mudah diaudit dan dipakai driver Turso untuk Supabase-nanti.
//
// Konvensi:
//  - Uang: integer rupiah bulat.
//  - Waktu: teks ISO-8601 UTC.
//  - Semua statement idempoten (`IF NOT EXISTS`).

export const SQL_SKEMA = `
CREATE TABLE IF NOT EXISTS produk (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT    UNIQUE NOT NULL,
  nama          TEXT    NOT NULL,
  kategori      TEXT    NOT NULL CHECK (kategori IN ('rempeyek', 'sambal')),
  deskripsi     TEXT    NOT NULL,
  harga         INTEGER NOT NULL CHECK (harga >= 0),
  berat_gram    INTEGER NOT NULL CHECK (berat_gram > 0),
  gambar        TEXT    NOT NULL DEFAULT '[]',
  status        TEXT    NOT NULL DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'po', 'habis')),
  warna_isian   TEXT    NOT NULL DEFAULT '#9A5B22',
  diarsipkan    INTEGER NOT NULL DEFAULT 0 CHECK (diarsipkan IN (0, 1)),
  dibuat        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS pesanan (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor            TEXT    UNIQUE NOT NULL,
  nama             TEXT    NOT NULL,
  hp               TEXT    NOT NULL,
  alamat           TEXT    NOT NULL,
  provinsi         TEXT    NOT NULL,
  kota             TEXT    NOT NULL,
  kurir            TEXT    NOT NULL,
  layanan          TEXT    NOT NULL,
  ongkir           INTEGER NOT NULL CHECK (ongkir >= 0),
  subtotal         INTEGER NOT NULL CHECK (subtotal >= 0),
  total            INTEGER NOT NULL CHECK (total >= 0),
  status           TEXT    NOT NULL DEFAULT 'menunggu_pembayaran'
                     CHECK (status IN ('menunggu_pembayaran', 'dibayar', 'dikirim', 'selesai', 'batal')),
  resi             TEXT    UNIQUE,
  dibuat           TEXT    NOT NULL,
  dibayar_pada     TEXT,
  dikirim_pada     TEXT,
  selesai_pada     TEXT,
  dibatalkan_pada  TEXT
);

CREATE TABLE IF NOT EXISTS item_pesanan (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  pesanan_id  INTEGER NOT NULL REFERENCES pesanan (id),
  produk_id   INTEGER NOT NULL,
  nama        TEXT    NOT NULL,
  harga       INTEGER NOT NULL CHECK (harga >= 0),
  berat_gram  INTEGER NOT NULL CHECK (berat_gram > 0),
  jumlah      INTEGER NOT NULL CHECK (jumlah BETWEEN 1 AND 99)
);

CREATE INDEX IF NOT EXISTS idx_item_pesanan_pesanan
  ON item_pesanan (pesanan_id);

CREATE TABLE IF NOT EXISTS batas_laju (
  kunci  TEXT    NOT NULL,
  waktu  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_batas_laju_kunci_waktu
  ON batas_laju (kunci, waktu);

CREATE INDEX IF NOT EXISTS idx_pesanan_status
  ON pesanan (status);

CREATE INDEX IF NOT EXISTS idx_pesanan_dibayar_pada
  ON pesanan (dibayar_pada);
`;

/**
 * Daftar pernyataan individual. `migrate()` memakai ini agar satu pernyataan
 * gagal tidak mengaburkan pernyataan lain di dalam log driver.
 */
export const PERNYATAAN_SKEMA: string[] = SQL_SKEMA.split(';')
  .map((bagian) => bagian.trim())
  .filter((bagian) => bagian !== '');
