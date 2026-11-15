// src/lib/keranjang.ts
//
// Logika keranjang yang murni (tanpa React, tanpa localStorage, tanpa
// database), supaya mudah diuji dan dipakai ulang di klien maupun server.
//
// Keranjang hanya menyimpan { produkId, jumlah }. Harga, nama, dan berat TIDAK
// disimpan: selalu diambil dari katalog server saat ditampilkan, dan dihitung
// ulang lagi saat pesanan dibuat (Global Constraints).

import type { ProdukDb } from './produk-repo';

export type ItemKeranjang = { produkId: number; jumlah: number };

/** Kunci `localStorage`. Naikkan versinya bila bentuk data berubah. */
export const KUNCI_KERANJANG = 'keranjang-v1';

/** Batas jumlah per produk; sama dengan batas di `buatPesanan`. */
export const MAKS_JUMLAH = 99;

/** Batas jenis produk dalam satu keranjang (mencegah isi raksasa dari storage). */
const MAKS_JENIS = 50;

const idSah = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n > 0;
const jumlahSah = (n: unknown): n is number =>
  typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= MAKS_JUMLAH;

/**
 * Menambah `n` buah produk; produk yang sama digabung, maksimum 99.
 * Masukan tidak valid dikembalikan apa adanya (tidak melempar).
 */
export function tambah(k: ItemKeranjang[], produkId: number, n = 1): ItemKeranjang[] {
  if (!idSah(produkId) || !Number.isInteger(n) || n < 1) return k;

  const ada = k.find((i) => i.produkId === produkId);
  if (ada === undefined) {
    return [...k, { produkId, jumlah: Math.min(n, MAKS_JUMLAH) }];
  }
  return k.map((i) =>
    i.produkId === produkId ? { ...i, jumlah: Math.min(i.jumlah + n, MAKS_JUMLAH) } : i,
  );
}

/** Mengganti jumlah; 0 atau negatif menghapus. Bukan bilangan bulat diabaikan. */
export function ubahJumlah(k: ItemKeranjang[], produkId: number, jumlah: number): ItemKeranjang[] {
  if (!Number.isInteger(jumlah)) return k;
  if (jumlah <= 0) return k.filter((i) => i.produkId !== produkId);
  return k.map((i) =>
    i.produkId === produkId ? { ...i, jumlah: Math.min(jumlah, MAKS_JUMLAH) } : i,
  );
}

/**
 * Membaca keranjang dari teks mentah (isi `localStorage` atau kolom formulir).
 *
 * Isi dianggap tidak dipercaya: JSON rusak atau bukan array → `[]`; item yang
 * tidak valid dibuang, yang valid dipertahankan; produk kembar digabung; kolom
 * asing (mis. `harga` yang disusupkan) dibuang.
 */
export function bacaKeranjang(mentah: string | null): ItemKeranjang[] {
  if (mentah === null || mentah === '') return [];

  let data: unknown;
  try {
    data = JSON.parse(mentah);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  let hasil: ItemKeranjang[] = [];
  for (const butir of data) {
    if (typeof butir !== 'object' || butir === null) continue;
    const { produkId, jumlah } = butir as Record<string, unknown>;
    if (!idSah(produkId) || !jumlahSah(jumlah)) continue;
    hasil = tambah(hasil, produkId, jumlah);
    if (hasil.length >= MAKS_JENIS) break;
  }
  return hasil;
}

/** Total kuantitas, untuk lencana ikon keranjang. */
export function jumlahBarang(k: ItemKeranjang[]): number {
  return k.reduce((jumlah, i) => jumlah + i.jumlah, 0);
}

/** Bagian produk yang boleh sampai ke browser (tanpa kolom internal). */
export type ProdukToko = Pick<ProdukDb, 'id' | 'slug' | 'nama' | 'harga' | 'berat_gram' | 'status'> & {
  gambar: string | null;
};

export function keProdukToko(p: ProdukDb): ProdukToko {
  return {
    id: p.id,
    slug: p.slug,
    nama: p.nama,
    harga: p.harga,
    berat_gram: p.berat_gram,
    status: p.status,
    gambar: p.gambar[0] ?? null,
  };
}

export type BarisRingkas = {
  produkId: number;
  jumlah: number;
  /** `null` bila produk sudah tidak ada di katalog (diarsipkan/dihapus). */
  produk: ProdukToko | null;
  /** Bisa dipesan: ada di katalog dan tidak habis. Pre-order tetap bisa. */
  tersedia: boolean;
  subtotal: number;
};

export type RingkasanKeranjang = {
  baris: BarisRingkas[];
  /** Hanya item yang tersedia. */
  subtotal: number;
  beratGram: number;
  /** Ada item yang tidak bisa dipesan; checkout harus menunggu item dibuang. */
  adaMasalah: boolean;
};

/**
 * Menggabungkan keranjang dengan katalog dari server. Item yang tidak
 * tersedia ditandai, tidak ikut dihitung, dan membuat `adaMasalah` bernilai true.
 */
export function ringkasKeranjang(k: ItemKeranjang[], katalog: ProdukToko[]): RingkasanKeranjang {
  const baris: BarisRingkas[] = k.map((i) => {
    const produk = katalog.find((p) => p.id === i.produkId) ?? null;
    const tersedia = produk !== null && produk.status !== 'habis';
    return {
      produkId: i.produkId,
      jumlah: i.jumlah,
      produk,
      tersedia,
      subtotal: tersedia ? produk.harga * i.jumlah : 0,
    };
  });

  return {
    baris,
    subtotal: baris.reduce((j, b) => j + b.subtotal, 0),
    beratGram: baris.reduce((j, b) => (b.tersedia && b.produk ? j + b.produk.berat_gram * b.jumlah : j), 0),
    adaMasalah: baris.some((b) => !b.tersedia),
  };
}
