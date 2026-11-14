// src/lib/produk-validasi.ts
//
// Validasi formulir produk di server. Semua yang datang dari browser dianggap
// tidak dipercaya, termasuk `file.type` (bisa dipalsukan, tetapi hanya admin
// yang bisa mengunggah; pemeriksaan ini mencegah salah pilih berkas, bukan
// serangan). Murni: tidak menyentuh database maupun penyimpanan foto.

import type { ProdukDb } from './produk-repo';

/** 4 MB: batas badan permintaan fungsi Vercel (4,5 MB) dikurangi ruang formulir. */
export const BATAS_FOTO_BYTE = 4 * 1024 * 1024;

const TIPE_FOTO = ['image/jpeg', 'image/png', 'image/webp'] as const;
const KATEGORI: readonly string[] = ['rempeyek', 'sambal'];
const STATUS: readonly string[] = ['tersedia', 'po', 'habis'];

export type DataProduk = {
  nama: string;
  kategori: ProdukDb['kategori'];
  deskripsi: string;
  harga: number;
  berat_gram: number;
  status: ProdukDb['status'];
};

export type HasilValidasi =
  | { ok: true; data: DataProduk; foto: File | null }
  | { ok: false; galat: string };

function teks(fd: FormData, kolom: string): string {
  const nilai = fd.get(kolom);
  return typeof nilai === 'string' ? nilai.trim() : '';
}

/** Bilangan bulat tak negatif dalam rentang; "12.5", "-1", "1e3", "" ditolak. */
function bilanganBulat(mentah: string, min: number, maks: number): number | null {
  if (!/^\d+$/.test(mentah)) return null;
  const angka = Number(mentah);
  return angka >= min && angka <= maks ? angka : null;
}

export function validasiProduk(fd: FormData): HasilValidasi {
  const nama = teks(fd, 'nama');
  if (nama.length < 2 || nama.length > 80) {
    return { ok: false, galat: 'Nama produk harus 2–80 karakter.' };
  }

  const kategori = teks(fd, 'kategori');
  if (!KATEGORI.includes(kategori)) return { ok: false, galat: 'Kategori tidak valid.' };

  const status = teks(fd, 'status');
  if (!STATUS.includes(status)) return { ok: false, galat: 'Status tidak valid.' };

  const deskripsi = teks(fd, 'deskripsi');
  if (deskripsi.length > 1000) {
    return { ok: false, galat: 'Deskripsi maksimal 1000 karakter.' };
  }

  const harga = bilanganBulat(teks(fd, 'harga'), 0, 10_000_000);
  if (harga === null) {
    return { ok: false, galat: 'Harga harus bilangan bulat 0–10.000.000 (tanpa titik atau koma).' };
  }

  const berat = bilanganBulat(teks(fd, 'berat'), 1, 50_000);
  if (berat === null) {
    return { ok: false, galat: 'Berat harus bilangan bulat 1–50.000 gram.' };
  }

  // Input file yang tidak diisi tetap terkirim sebagai File kosong tanpa nama.
  const mentah = fd.get('foto');
  let foto: File | null = null;
  if (mentah instanceof File && mentah.size > 0) {
    if (!(TIPE_FOTO as readonly string[]).includes(mentah.type)) {
      return { ok: false, galat: 'Foto harus berformat JPEG, PNG, atau WebP.' };
    }
    if (mentah.size > BATAS_FOTO_BYTE) {
      return { ok: false, galat: 'Foto terlalu besar (maksimal 4 MB).' };
    }
    foto = mentah;
  }

  return {
    ok: true,
    data: {
      nama,
      kategori: kategori as DataProduk['kategori'],
      deskripsi,
      harga,
      berat_gram: berat,
      status: status as DataProduk['status'],
    },
    foto,
  };
}
