// src/lib/status.ts
//
// Mesin status pesanan. Satu sumber kebenaran untuk "boleh pindah ke mana",
// dipakai repositori pesanan (Task 4) dan tampilan admin (Task 7).

export type StatusPesanan = 'menunggu_pembayaran' | 'dibayar' | 'dikirim' | 'selesai' | 'batal';

/**
 * Transisi yang sah. Sengaja ditulis lengkap (bukan implisit dari urutan)
 * supaya mudah diaudit: tidak ada jalan balik, tidak ada lompatan.
 */
const TRANSISI: ReadonlyArray<readonly [StatusPesanan, StatusPesanan]> = [
  ['menunggu_pembayaran', 'dibayar'],
  ['menunggu_pembayaran', 'batal'],
  ['dibayar', 'dikirim'],
  ['dibayar', 'batal'],
  ['dikirim', 'selesai'],
];

/** Label berbahasa Indonesia untuk status (termasuk `kedaluwarsa`). */
export const LABEL_STATUS: Record<StatusPesanan | 'kedaluwarsa', string> = {
  menunggu_pembayaran: 'Menunggu pembayaran',
  kedaluwarsa: 'Kedaluwarsa',
  dibayar: 'Sudah dibayar',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  batal: 'Dibatalkan',
};

/** Apakah pesanan boleh berpindah dari `dari` ke `ke`? */
export function bolehPindah(dari: StatusPesanan, ke: StatusPesanan): boolean {
  return TRANSISI.some(([d, k]) => d === dari && k === ke);
}

/** Batas umur pesanan yang belum dibayar, dalam milidetik (24 jam). */
export const BATAS_KEDALUWARSA_MS = 24 * 60 * 60 * 1000;

/**
 * Status yang ditampilkan ke pengguna.
 *
 * `menunggu_pembayaran` yang berumur LEBIH DARI 24 jam tampil sebagai
 * `'kedaluwarsa'`. Status di database tidak diubah: pesanan tetap bisa
 * ditandai dibayar (Global Constraints). Tepat 24 jam belum kedaluwarsa.
 */
export function statusTampil(
  p: { status: StatusPesanan; dibuat: string },
  sekarang: Date,
): StatusPesanan | 'kedaluwarsa' {
  if (p.status !== 'menunggu_pembayaran') return p.status;

  const umur = sekarang.getTime() - new Date(p.dibuat).getTime();
  return umur > BATAS_KEDALUWARSA_MS ? 'kedaluwarsa' : 'menunggu_pembayaran';
}
