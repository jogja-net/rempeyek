// src/lib/hitung.ts
//
// Aritmetika pesanan sebagai fungsi murni. Tidak ada pembulatan tersembunyi
// dan tidak ada I/O: semua masukan datang dari pemanggil (idealnya dari DB),
// supaya harga dari browser tidak pernah dipercaya (Global Constraints).

/** Subtotal = Σ harga × jumlah. Rupiah bulat. */
export function hitungSubtotal(items: { harga: number; jumlah: number }[]): number {
  return items.reduce((total, item) => total + item.harga * item.jumlah, 0);
}

/**
 * Berat total = Σ berat_gram × jumlah, dalam gram.
 * Dipakai apa adanya oleh `hitungOngkir`, yang membulatkan ke kg di sana.
 */
export function hitungBeratTotal(items: { berat_gram: number; jumlah: number }[]): number {
  return items.reduce((total, item) => total + item.berat_gram * item.jumlah, 0);
}
