// src/lib/mode.ts
//
// Satu-satunya saklar yang menentukan apakah fitur marketplace hidup.
//
// Dua syarat, keduanya wajib (Global Constraints):
//   1. Bukan produksi — demo tidak boleh tampil ke pembeli nyata.
//   2. Database dikonfigurasi — tanpa Turso tidak ada yang bisa ditampilkan.
//
// Dipanggil di setiap halaman/aksi marketplace. Sengaja membaca `env` sebagai
// argumen supaya bisa diuji tanpa menyentuh `process.env` global.

/** Tipe minimal lingkungan: cukup `Record` agar objek literal bisa dipakai di tes. */
export type Lingkungan = Record<string, string | undefined>;

/**
 * Apakah fitur marketplace (keranjang, checkout, admin, lacak) aktif?
 *
 * @param env Bawaan `process.env`. Di tes, kirim objek literal.
 */
export function marketplaceAktif(env: Lingkungan = process.env): boolean {
  if (env.VERCEL_ENV === 'production') return false;
  return (env.TURSO_DATABASE_URL ?? '').trim() !== '';
}
