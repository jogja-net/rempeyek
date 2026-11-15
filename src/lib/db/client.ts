// src/lib/db/client.ts
//
// Satu-satunya tempat koneksi database dibuat. Semua modul data menerima
// `Client` sebagai argumen pertama supaya bisa diuji dengan SQLite dalam memori
// (`bukaDb(':memory:')`), sedangkan aplikasi memakai singleton dari `getDb()`.

import { createClient, type Client } from '@libsql/client';

/**
 * Membuat klien libSQL.
 *
 * @param url  URL database. Bawaan: `process.env.TURSO_DATABASE_URL`.
 *             `':memory:'` dipakai tes; `'file:local.db'` dipakai pengembangan lokal.
 * @param authToken Token Turso. Bawaan: `process.env.TURSO_AUTH_TOKEN`.
 *             Boleh kosong untuk `file:` dan `:memory:`.
 * @throws Error('TURSO_DATABASE_URL belum diisi') bila URL kosong.
 */
export function bukaDb(url?: string, authToken?: string): Client {
  const alamat = (url ?? process.env.TURSO_DATABASE_URL ?? '').trim();
  if (alamat === '') {
    throw new Error('TURSO_DATABASE_URL belum diisi');
  }

  const token = (authToken ?? process.env.TURSO_AUTH_TOKEN ?? '').trim();

  return createClient({
    url: alamat,
    ...(token === '' ? {} : { authToken: token }),
  });
}

let db: Client | null = null;

/**
 * Singleton malas: klien dibuat pada pemakaian pertama dan dipakai ulang.
 * Sengaja tanpa `Proxy` supaya bisa dipanggil dari server action mana pun
 * tanpa menyentuh koneksi saat modul diimpor.
 */
export function getDb(): Client {
  if (db === null) {
    db = bukaDb();
  }
  return db;
}
