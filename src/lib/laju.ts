// src/lib/laju.ts
//
// Pembatas laju sederhana berbasis tabel `batas_laju` (Task 1).
//
// Dipakai untuk pencarian resi dan percobaan login admin (Task 6). Tidak ada
// state di memori: catatan disimpan di database supaya batas tetap berlaku
// walau proses serverless berganti-ganti (setiap instans punya memori sendiri).

import type { Client } from '@libsql/client';

/**
 * Mencatat satu percobaan bila masih di bawah batas.
 *
 * Alur: bersihkan catatan yang lebih tua dari jendela, hitung yang tersisa,
 * lalu catat percobaan ini hanya jika masih ada kuota.
 *
 * @param kunci        Pembeda kuota, mis. `'lacak:<ip>'` atau `'login:<ip>'`.
 * @param maks         Jumlah percobaan maksimum dalam satu jendela.
 * @param jendelaDetik Panjang jendela dalam detik.
 * @param sekarangMs   Waktu sekarang (epoch ms) — argumen supaya bisa diuji.
 * @returns `true` bila percobaan ini boleh dilanjutkan dan sudah dicatat,
 *          `false` bila kuota habis (tidak dicatat).
 */
export async function cekBatas(
  db: Client,
  kunci: string,
  maks: number,
  jendelaDetik: number,
  sekarangMs: number,
): Promise<boolean> {
  const batasAwal = sekarangMs - jendelaDetik * 1000;

  // Buang catatan lama supaya tabel tidak tumbuh tanpa henti.
  await db.execute({
    sql: 'DELETE FROM batas_laju WHERE kunci = ? AND waktu <= ?',
    args: [kunci, batasAwal],
  });

  const terpakai = await db.execute({
    sql: 'SELECT COUNT(*) AS jumlah FROM batas_laju WHERE kunci = ?',
    args: [kunci],
  });

  if (Number(terpakai.rows[0]?.jumlah ?? 0) >= maks) {
    return false;
  }

  await db.execute({
    sql: 'INSERT INTO batas_laju (kunci, waktu) VALUES (?, ?)',
    args: [kunci, sekarangMs],
  });

  return true;
}
