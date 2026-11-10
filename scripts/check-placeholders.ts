/**
 * scripts/check-placeholders.ts — dijalankan otomatis oleh `prebuild`.
 *
 * Aturan (HANDOFF §4):
 *  - GAGAL (exit 1) HANYA jika VERCEL_ENV === 'production' dan data wajib masih null.
 *  - Preview / development tetap boleh build walau data masih placeholder.
 *
 * Tambahan (bukan dari HANDOFF, disetujui pemilik repo):
 *  - Di produksi, testimoni yang masih berisi contoh berlabel juga menggagalkan build,
 *    sesuai HANDOFF §7.8 ("jangan tampilkan placeholder di produksi") dan PRD §5 #9
 *    ("hanya testimoni asli, dengan izin").
 *
 * Dijalankan dengan: npx tsx scripts/check-placeholders.ts
 */

import { site } from '../src/data/site';
import { produk } from '../src/data/products';
import { testimoni } from '../src/data/testimoni';

interface Temuan {
  berkas: string;
  field: string;
  catatan: string;
}

const temuan: Temuan[] = [];

function wajibDiisi(nilai: unknown, berkas: string, field: string, catatan: string) {
  if (
    nilai === null ||
    nilai === undefined ||
    (typeof nilai === 'string' && nilai.trim() === '') ||
    (Array.isArray(nilai) && nilai.length === 0)
  ) {
    temuan.push({ berkas, field, catatan });
  }
}

// --- Data wajib menurut HANDOFF §4 ---
wajibDiisi(site.whatsapp, 'src/data/site.ts', 'whatsapp', 'nomor WA bisnis (env NEXT_PUBLIC_WA_NUMBER)');
wajibDiisi(site.kota, 'src/data/site.ts', 'kota', 'kota produksi');
wajibDiisi(site.alamat, 'src/data/site.ts', 'alamat', 'alamat lengkap (juga dipakai NAP Google Business Profile)');

for (const item of produk) {
  wajibDiisi(item.harga, 'src/data/products.ts', `${item.slug}.harga`, 'harga eceran');
  wajibDiisi(item.berat_gram, 'src/data/products.ts', `${item.slug}.berat_gram`, 'berat kemasan (gram)');
}

// --- Testimoni contoh tidak boleh ikut terbit ---
const masihContoh = testimoni.filter((item) => item.contoh);
if (masihContoh.length > 0) {
  temuan.push({
    berkas: 'src/data/testimoni.ts',
    field: `contoh (${masihContoh.length} entri)`,
    catatan: 'masih teks contoh — ganti dengan kutipan asli + izin Bu Aviella, lalu set `contoh: false`',
  });
}

// --- Laporan ---
const isProduksi = process.env.VERCEL_ENV === 'production';

if (temuan.length === 0) {
  console.log('check-placeholders: semua data wajib sudah terisi.');
  process.exit(0);
}

if (!isProduksi) {
  console.log(
    `check-placeholders: ${temuan.length} data masih placeholder — DILEWATI karena VERCEL_ENV="${process.env.VERCEL_ENV ?? 'undefined'}" (bukan production).`,
  );
  for (const t of temuan) {
    console.log(`  - ${t.berkas} → ${t.field}: ${t.catatan}`);
  }
  process.exit(0);
}

console.error('check-placeholders: BUILD PRODUKSI DIGAGALKAN. Data berikut masih kosong:');
for (const t of temuan) {
  console.error(`  - ${t.berkas} → ${t.field}: ${t.catatan}`);
}
console.error(
  '\nLengkapi data di atas (atau ubah menjadi testimoni asli), lalu jalankan build lagi.',
);
process.exit(1);
