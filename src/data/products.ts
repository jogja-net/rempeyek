// src/data/products.ts
// Nama field sengaja disamakan dengan tabel `products` Lapakku supaya migrasi ke DB di Fase 2 lurus.

export type StatusProduk = 'tersedia' | 'po' | 'habis';

export interface Produk {
  slug: string;
  nama: string;
  deskripsi_singkat: string;
  harga: number | null; // null = belum diisi → tampil "Tanya harga"
  harga_coret?: number | null;
  berat_gram: number | null; // null → berat tidak ditampilkan
  gambar: string[]; // path di /public/produk/, kosong → ilustrasi peyek
  status: StatusProduk;
  warna_isian: string; // warna kacang/isi di ilustrasi placeholder
}

// DUMMY: harga & berat di bawah hanya sementara, ganti dengan data asli dari Bu Aviella.
export const produk: Produk[] = [
  {
    slug: 'peyek-kacang-tanah',
    nama: 'Peyek Kacang Tanah',
    deskripsi_singkat: 'Varian klasik, kacang tanah di setiap keping.',
    harga: 25000,
    berat_gram: 250,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#9A5B22',
  },
  {
    slug: 'peyek-kacang-hijau',
    nama: 'Peyek Kacang Hijau',
    deskripsi_singkat: 'Kacang hijau utuh dalam adonan tipis.',
    harga: 25000,
    berat_gram: 250,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#5F7A2E',
  },
  {
    slug: 'peyek-teri',
    nama: 'Peyek Teri',
    deskripsi_singkat: 'Teri nasi gurih, pas jadi lauk.',
    harga: 35000,
    berat_gram: 200,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#6F767C',
  },
  {
    slug: 'peyek-rebon',
    nama: 'Peyek Rebon',
    deskripsi_singkat: 'Udang rebon kering dengan aroma yang khas.',
    harga: 35000,
    berat_gram: 200,
    gambar: [],
    status: 'po',
    warna_isian: '#C0613E',
  },
];
// ASUMSI: daftar varian belum dikonfirmasi Bu Aviella.
