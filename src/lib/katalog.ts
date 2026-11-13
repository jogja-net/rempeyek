// src/lib/katalog.ts
//
// Sumber tunggal katalog untuk halaman publik.
//
// Landing page harus tetap tampil walau Turso tidak bisa dijangkau (spec §89:
// "memakai data statis `src/data/products.ts` sebagai cadangan, bukan
// menampilkan error"). Karena itu fungsi ini tidak pernah melempar galat
// koneksi: kegagalan apa pun jatuh ke data statis.

import { produk as produkStatis } from '@/data/products';
import { sambal as sambalStatis } from '@/data/sambal';

import { getDb } from './db/client';
import { marketplaceAktif } from './mode';
import { daftarProdukTampil, type ProdukDb } from './produk-repo';

/**
 * Produk untuk katalog publik.
 *
 * - Marketplace aktif (bukan produksi + database ada): baca dari database.
 * - Selain itu, atau bila database gagal: petakan `src/data/products.ts` dan
 *   `src/data/sambal.ts` ke bentuk `ProdukDb`.
 *
 * ID data cadangan dibuat NEGATIF supaya tidak mungkin tertukar dengan ID
 * database. Harga/berat yang masih `null` jadi 0; nilai 0 tidak pernah dipakai
 * checkout karena checkout hanya berjalan saat marketplace aktif.
 */
export async function ambilProduk(): Promise<ProdukDb[]> {
  if (marketplaceAktif()) {
    try {
      const dariDb = await daftarProdukTampil(getDb());
      // Database kosong (belum di-seed) bukan alasan menampilkan halaman kosong:
      // pakai data statis supaya landing page tetap utuh.
      if (dariDb.length > 0) return dariDb;
    } catch (galat) {
      console.warn(
        'katalog: gagal membaca database, memakai data statis —',
        galat instanceof Error ? galat.message : galat,
      );
    }
  }

  return produkCadangan();
}

/** Memetakan data statis ke `ProdukDb` dengan id negatif. */
export function produkCadangan(): ProdukDb[] {
  const rempeyek: ProdukDb[] = produkStatis.map((p, i) => ({
    id: -(i + 1),
    slug: p.slug,
    nama: p.nama,
    kategori: 'rempeyek',
    deskripsi: p.deskripsi_singkat,
    harga: p.harga ?? 0,
    berat_gram: p.berat_gram ?? 0,
    gambar: p.gambar,
    status: p.status,
    warna_isian: p.warna_isian,
    diarsipkan: false,
  }));

  // Sambal ikut dipetakan karena tabel `produk` menyatukan kedua kategori
  // (spec §98). `ukuran` lama tidak setara gram, jadi beratnya 0 sampai diisi.
  const sambal: ProdukDb[] = sambalStatis.map((s, i) => ({
    id: -(rempeyek.length + i + 1),
    slug: s.slug,
    nama: s.nama,
    kategori: 'sambal',
    deskripsi: s.ukuran === null ? 'Sambal pelengkap.' : `Sambal pelengkap, ${s.ukuran}.`,
    harga: s.harga ?? 0,
    berat_gram: 0,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#B23A2E',
    diarsipkan: false,
  }));

  return [...rempeyek, ...sambal];
}
