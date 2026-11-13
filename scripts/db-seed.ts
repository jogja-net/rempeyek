/**
 * scripts/db-seed.ts — mengisi data contoh ke database demo.
 *
 * Aturan (Global Constraints):
 *   - MENOLAK jalan bila `VERCEL_ENV === 'production'`. Data contoh tidak boleh
 *     pernah masuk database produksi.
 *   - Hanya mengisi bila tabel `produk` masih kosong, supaya aman dijalankan
 *     berulang tanpa menggandakan baris.
 *   - Setiap deskripsi diberi label "(contoh demo)" agar pembeli tahu.
 *
 * Pemakaian:
 *   npx tsx scripts/db-seed.ts          # memakai TURSO_DATABASE_URL
 *   npx tsx scripts/db-seed.ts :memory: # uji cepat
 *
 * Di Vercel staging, jalankan dengan variabel dari berkas sementara
 * (JANGAN `vercel env pull` ke `.env.local`).
 */

import { bukaDb } from '../src/lib/db/client';
import { migrate } from '../src/lib/db/migrate';
import { daftarProdukAdmin, simpanProduk, type InputProduk } from '../src/lib/produk-repo';

/** Data contoh: 4 rempeyek + 2 sambal. Harga & berat bulat, jelas tiruan. */
const CONTOH: InputProduk[] = [
  {
    nama: 'Rempeyek Kacang Tanah',
    kategori: 'rempeyek',
    deskripsi: 'Varian klasik, kacang tanah di setiap keping. (contoh demo)',
    harga: 15000,
    berat_gram: 200,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#9A5B22',
  },
  {
    nama: 'Rempeyek Kacang Hijau',
    kategori: 'rempeyek',
    deskripsi: 'Kacang hijau utuh dalam adonan tipis. (contoh demo)',
    harga: 15000,
    berat_gram: 200,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#5F7A2E',
  },
  {
    nama: 'Rempeyek Teri',
    kategori: 'rempeyek',
    deskripsi: 'Teri nasi gurih, pas jadi lauk. (contoh demo)',
    harga: 20000,
    berat_gram: 200,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#6F767C',
  },
  {
    nama: 'Rempeyek Rebon',
    kategori: 'rempeyek',
    deskripsi: 'Udang rebon kering dengan aroma yang khas. (contoh demo)',
    harga: 20000,
    berat_gram: 200,
    gambar: [],
    status: 'po',
    warna_isian: '#C0613E',
  },
  {
    nama: 'Sambal Bawang',
    kategori: 'sambal',
    deskripsi: 'Sambal bawang pedas sedang. (contoh demo)',
    harga: 12000,
    berat_gram: 100,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#B23A2E',
  },
  {
    nama: 'Sambal Teri',
    kategori: 'sambal',
    deskripsi: 'Sambal teri pedas gurih. (contoh demo)',
    harga: 15000,
    berat_gram: 100,
    gambar: [],
    status: 'tersedia',
    warna_isian: '#A8332A',
  },
];

async function utama(): Promise<void> {
  if (process.env.VERCEL_ENV === 'production') {
    console.error('db-seed: DITOLAK — data contoh tidak boleh masuk produksi (VERCEL_ENV=production).');
    process.exit(1);
  }

  const url = process.argv[2] ?? process.env.TURSO_DATABASE_URL ?? '';
  if (url.trim() === '') {
    console.error('db-seed: TURSO_DATABASE_URL belum diisi.');
    process.exit(1);
  }

  const db = bukaDb(url);
  try {
    await migrate(db);

    const sudahAda = await daftarProdukAdmin(db);
    if (sudahAda.length > 0) {
      console.log(`db-seed: dilewati — tabel produk sudah berisi ${sudahAda.length} baris.`);
      return;
    }

    for (const produk of CONTOH) {
      await simpanProduk(db, produk);
    }
    console.log(`db-seed: ${CONTOH.length} produk contoh dimasukkan.`);
  } finally {
    db.close();
  }
}

utama().catch((galat: unknown) => {
  console.error('db-seed: gagal —', galat instanceof Error ? galat.message : galat);
  process.exit(1);
});
