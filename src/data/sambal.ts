// src/data/sambal.ts
// Lini kedua (pelengkap). Section hanya dirender kalau site.tampilkanSambal = true.

export interface Sambal {
  slug: string;
  nama: string;
  ukuran: string | null; // null → tidak ditampilkan
  harga: number | null; // null → "Tanya harga lewat WhatsApp"
}

export const sambal: Sambal[] = [
  { slug: 'sambal-bawang', nama: 'Sambal Bawang', ukuran: null, harga: null },
  { slug: 'sambal-teri', nama: 'Sambal Teri', ukuran: null, harga: null },
];
// ASUMSI: varian & ukuran sambal belum dikonfirmasi Bu Aviella.
