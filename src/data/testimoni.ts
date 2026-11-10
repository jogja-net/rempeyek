// src/data/testimoni.ts
//
// PENTING — BACA SEBELUM MENGISI.
//
// HANDOFF §7.8: "Testimoni — sembunyikan seluruh section jika array testimoni kosong
// (jangan tampilkan placeholder di produksi)."
// PRD §5 #9: "Testimoni | Hanya testimoni asli, dengan izin."
//
// Isi di bawah ini adalah CONTOH BERLABEL untuk keperluan review staging.
// Setiap entri wajib memiliki `contoh: true` selama belum ada kutipan asli, supaya
// kartunya menampilkan label peringatan dan tidak pernah tampak seperti testimoni asli.
//
// CARA MENGGANTI DENGAN TESTIMONI ASLI:
//   1. Minta izin Bu Aviella untuk memakai kutipan chat WA pembeli.
//   2. Ganti `kutipan`, `nama`, `kota` dengan isi aslinya.
//   3. Ubah `contoh: true` → `contoh: false` (atau hapus field `contoh`).
//   4. Commit → Vercel auto-deploy.
//
// Pada saat produksi, `scripts/check-placeholders.ts` akan menggagalkan build kalau
// masih ada entri dengan `contoh: true`.

export interface Testimoni {
  id: string;
  kutipan: string;
  nama: string;
  kota: string;
  produk?: string;
  /** true = teks contoh, belum ada testimoni asli. Kartu akan diberi label peringatan. */
  contoh: true | false;
}

export const testimoni: Testimoni[] = [
  {
    id: 'contoh-1',
    kutipan:
      'Contoh tampilan: di sini nanti berisi kutipan asli dari chat WhatsApp pembeli, ditulis apa adanya sesuai kalimat pembeli.',
    nama: '[NAMA PEMBELI]',
    kota: '[KOTA]',
    produk: 'Rempeyek Kacang Tanah',
    contoh: true,
  },
  {
    id: 'contoh-2',
    kutipan:
      'Contoh tampilan: kutipan kedua bisa diambil dari screenshot chat WA, tetap dengan izin pembeli. Panjang idealnya 1–3 baris.',
    nama: '[NAMA PEMBELI]',
    kota: '[KOTA]',
    produk: 'Rempeyek Teri',
    contoh: true,
  },
];
