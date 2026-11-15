// src/lib/mode.ts
//
// Satu-satunya saklar yang menentukan apakah fitur marketplace hidup.
//
// Syarat: database dikonfigurasi — tanpa Turso tidak ada yang bisa ditampilkan.
// (Dulu ada syarat kedua "bukan produksi"; dicabut atas keputusan pemilik
// 15 Nov 2026 supaya marketplace hidup di produksi. Pita tetap tampil
// selama ongkir masih tarif tiruan per zona.)
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
  return (env.TURSO_DATABASE_URL ?? '').trim() !== '';
}

/**
 * Boleh diindeks mesin pencari? Hanya di produksi DAN bila `INDEKS_SITUS=ya`.
 * Selama demo atau data masih contoh, biarkan `INDEKS_SITUS` kosong. Set ke
 * `ya` di Vercel (Production) saat toko resmi dibuka untuk pembeli.
 */
export function bolehDiindeks(env: Lingkungan = process.env): boolean {
  return env.VERCEL_ENV === 'production' && (env.INDEKS_SITUS ?? '').trim() === 'ya';
}
