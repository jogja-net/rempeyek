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

// DUMMY: tiga testimoni di bawah hanya gambaran tampilan. HAPUS/ganti dengan testimoni asli + izin sebelum dipakai sungguhan.
export const testimoni: Testimoni[] = [
  {
    id: 'dummy-1',
    kutipan: 'Renyah banget dan gurih, kacangnya banyak. Sekali coba langsung pesan lagi buat oleh-oleh.',
    nama: 'Ibu Rina',
    kota: 'Yogyakarta',
    produk: 'Peyek Kacang Tanah',
    contoh: false,
  },
  {
    id: 'dummy-2',
    kutipan: 'Pengiriman cepat, kemasannya rapi dan tidak ada yang remuk. Peyek terinya wangi dan nggak berminyak.',
    nama: 'Bapak Dimas',
    kota: 'Sleman',
    produk: 'Peyek Teri',
    contoh: false,
  },
  {
    id: 'dummy-3',
    kutipan: 'Cocok buat teman makan nasi. Anak-anak suka yang kacang hijau, habis dalam sehari.',
    nama: 'Ibu Wulan',
    kota: 'Bantul',
    produk: 'Peyek Kacang Hijau',
    contoh: false,
  },
];
