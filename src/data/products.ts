// src/data/products.ts
// Nama field sengaja disamakan dengan tabel `products` Lapakku supaya migrasi ke DB di Fase 2 lurus.

export type StatusProduk = 'tersedia' | 'po' | 'habis';

export interface Produk {
  slug: string;
  nama: string;
  deskripsi_singkat: string;
  harga: number | null; // null = belum diisi → tampil "[HARGA]"
  harga_coret?: number | null;
  berat_gram: number | null; // null → "[BERAT]"
  gambar: string[]; // path di /public/produk/, kosong → ilustrasi peyek
  status: StatusProduk;
  warna_isian: string; // warna kacang/isi di ilustrasi placeholder
}

export const produk: Produk[] = [
  {
    slug: 'rempeyek-kacang-tanah',
    nama: 'Rempeyek Kacang Tanah',
    deskripsi_singkat: 'Varian klasik, kacang tanah di setiap keping.',
    harga: null,
    berat_gram: null,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#9A5B22',
  },
  {
    slug: 'rempeyek-kacang-hijau',
    nama: 'Rempeyek Kacang Hijau',
    deskripsi_singkat: 'Kacang hijau utuh dalam adonan tipis.',
    harga: null,
    berat_gram: null,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#5F7A2E',
  },
  {
    slug: 'rempeyek-teri',
    nama: 'Rempeyek Teri',
    deskripsi_singkat: 'Teri nasi gurih, pas jadi lauk.',
    harga: null,
    berat_gram: null,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#6F767C',
  },
  {
    slug: 'rempeyek-rebon',
    nama: 'Rempeyek Rebon',
    deskripsi_singkat: 'Udang rebon kering dengan aroma yang khas.',
    harga: null,
    berat_gram: null,
    gambar: [],
    status: 'po',
    warna_isian: '#C0613E',
  },
];
// ASUMSI: daftar varian belum dikonfirmasi Bu Aviella.
