// src/lib/admin-auth.ts
//
// Dua primitif keamanan panel admin, keduanya murni `node:crypto`:
//
//   1. Kata sandi disimpan sebagai hash scrypt (`scrypt$<salt>$<hash>`) di
//      variabel lingkungan. Tidak ada kata sandi di database dan tidak ada
//      layar untuk menggantinya (spec §90: konfigurasi, bukan fitur admin).
//      JEBAKAN: di `.env.local`, tiap `$` WAJIB ditulis `\$` (Next memperluas
//      `$nama` sebagai variabel dan memotong hash jadi "scrypt"; kutip tidak
//      menolong). Di dashboard Vercel tempel apa adanya, tanpa `\`.
//   2. Sesi berupa token bertanda tangan HMAC, bukan cookie acak, supaya
//      server tidak perlu menyimpan daftar sesi — penting di Vercel yang
//      menjalankan banyak instans tanpa state bersama.
//
// Semua fungsi di sini mengembalikan `boolean` dan TIDAK melempar untuk
// masukan yang rusak. Salah konfigurasi harus tampil sebagai "ditolak",
// bukan sebagai halaman 500 yang membocorkan jejak tumpukan.

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/** Panjang digest scrypt dalam byte (parameter bawaan Node: 64). */
const PANJANG_HASH = 64;

/** Umur sesi bawaan: 12 jam. */
export const UMUR_SESI_MS = 12 * 60 * 60 * 1000;

/**
 * Membuat hash kata sandi siap tempel ke `ADMIN_PASSWORD_HASH`.
 *
 * @param password Kata sandi mentah.
 * @param saltHex  Salt heksadesimal; di tes diisi tetap agar hasilnya bisa
 *                 dibandingkan. Di produksi dibiarkan kosong (acak 16 byte).
 */
export function buatHashPassword(password: string, saltHex?: string): string {
  const salt = saltHex ?? randomBytes(16).toString('hex');
  const hash = scryptSync(password, Buffer.from(salt, 'hex'), PANJANG_HASH).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

/**
 * Membandingkan kata sandi dengan hash `scrypt$<saltHex>$<hashHex>`.
 *
 * @returns `false` untuk format rusak, salt bukan hex, atau digest yang
 *          panjangnya tidak wajar — tanpa melempar.
 */
export function verifikasiPassword(password: string, hashEnv: string): boolean {
  if (typeof password !== 'string' || typeof hashEnv !== 'string') return false;

  const bagian = hashEnv.split('$');
  if (bagian.length !== 3 || bagian[0] !== 'scrypt') return false;

  const [, saltHex, hashHex] = bagian;
  if (!/^[0-9a-f]+$/i.test(saltHex) || saltHex.length % 2 !== 0 || saltHex.length === 0) {
    return false;
  }
  if (!/^[0-9a-f]+$/i.test(hashHex) || hashHex.length !== PANJANG_HASH * 2) return false;

  let tersimpan: Buffer;
  let dihitung: Buffer;
  try {
    tersimpan = Buffer.from(hashHex, 'hex');
    dihitung = scryptSync(password, Buffer.from(saltHex, 'hex'), tersimpan.length);
  } catch {
    return false;
  }

  if (dihitung.length !== tersimpan.length) return false;
  return timingSafeEqual(dihitung, tersimpan);
}

/** Tanda tangan HMAC-SHA256 heksadesimal atas isi token. */
function tandaTangan(secret: string, isi: string): string {
  return createHmac('sha256', secret).update(isi).digest('hex');
}

/**
 * Membuat token sesi: `<terbitMs>.<umurMs>.<tandaTangan>`.
 *
 * Umur ikut ditandatangani, bukan ditanam di kode pembaca, supaya mengubah
 * umur sama mustahilnya dengan memalsukan tanda tangan.
 */
export function buatToken(
  secret: string,
  sekarangMs: number,
  umurMs: number = UMUR_SESI_MS,
): string {
  const isi = `${sekarangMs}.${umurMs}`;
  return `${isi}.${tandaTangan(secret, isi)}`;
}

/**
 * Apakah token sah pada waktu `sekarangMs`?
 *
 * Ditolak bila: tidak ada, bentuknya bukan tiga bagian, angka tidak valid,
 * tanda tangan tidak cocok, terbit di masa depan, atau umurnya sudah lewat.
 */
export function tokenSah(
  token: string | undefined,
  secret: string,
  sekarangMs: number,
): boolean {
  if (typeof token !== 'string' || token === '') return false;
  if (typeof secret !== 'string' || secret === '') return false;

  const bagian = token.split('.');
  if (bagian.length !== 3) return false;

  const [terbitTeks, umurTeks, tanda] = bagian;
  const terbit = Number(terbitTeks);
  const umur = Number(umurTeks);
  if (!Number.isInteger(terbit) || !Number.isInteger(umur)) return false;
  if (terbit <= 0 || umur <= 0) return false;

  const diharapkan = tandaTangan(secret, `${terbitTeks}.${umurTeks}`);
  if (/^[0-9a-f]+$/i.test(tanda) === false) return false;

  const diterima = Buffer.from(tanda, 'hex');
  const harapan = Buffer.from(diharapkan, 'hex');
  if (diterima.length !== harapan.length) return false;
  if (!timingSafeEqual(diterima, harapan)) return false;

  if (terbit > sekarangMs) return false;
  return sekarangMs - terbit <= umur;
}
