// src/lib/kode.ts
//
// Pembuat kode acak untuk nomor pesanan dan resi demo.
//
// Alfabet sengaja membuang I, O, 0, dan 1 supaya nomor tidak salah dibaca saat
// pelanggan menyebutkannya lewat telepon atau WhatsApp.

import { randomBytes } from 'node:crypto';

const ALFABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Membuat kode acak berawalan teks.
 *
 * @param awalan  Teks tetap di depan kode, mis. `'RBA-'`.
 * @param panjang Jumlah karakter acak (tidak termasuk awalan).
 * @param acak    Sumber byte acak. Bawaan `crypto.randomBytes`; bisa diganti
 *                di tes supaya hasilnya deterministik.
 */
export function buatKode(awalan: string, panjang: number, acak: (n: number) => Uint8Array = randomBytes): string {
  const bytes = acak(panjang);
  let hasil = awalan;
  for (let i = 0; i < panjang; i += 1) {
    // 256 % 32 === 0, jadi `% 32` tidak bias ke karakter awal.
    hasil += ALFABET[bytes[i] % ALFABET.length];
  }
  return hasil;
}

/** Nomor pesanan untuk pembeli, mis. `RBA-K7M2QP`. */
export function buatNomorPesanan(): string {
  return buatKode('RBA-', 6);
}

/** Nomor resi tiruan untuk mode demo, mis. `DEMO-AB3D9XYZ`. */
export function buatResiDemo(): string {
  return buatKode('DEMO-', 8);
}

/**
 * Menormalkan resi yang diketik pembeli agar tetap ketemu:
 * spasi dibuang, huruf dinaikkan. Tanda hubung dipertahankan.
 *
 * Contoh: `'  demo-ab cd2345 '` → `'DEMO-ABCD2345'`.
 */
export function normalisasiResi(s: string): string {
  return s.trim().replace(/\s+/g, '').toUpperCase();
}
